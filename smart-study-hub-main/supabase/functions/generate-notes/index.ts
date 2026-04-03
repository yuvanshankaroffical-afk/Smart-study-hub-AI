import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const body = await req.json();
    const {
      noteId,
      sourceText,
      language = "auto",
      marks = "5",
      explanationStyle = "exam",
      includeFlashcards = false,
    } = body;

    if (!noteId || !sourceText) {
      return new Response(
        JSON.stringify({ error: "noteId and sourceText are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build prompt based on user options
    const marksInstruction =
      marks === "2"
        ? "Keep answers brief, suitable for 2-mark exam answers."
        : marks === "5"
        ? "Give moderately detailed answers suitable for 5-mark exam questions."
        : marks === "10"
        ? "Provide comprehensive, detailed answers suitable for 10-mark exam questions."
        : "Provide very detailed, thorough explanations.";

    const styleInstruction =
      explanationStyle === "exam"
        ? "Format as exam-ready answers with proper structure."
        : explanationStyle === "simple"
        ? "Explain in simple, easy-to-understand language."
        : explanationStyle === "detailed"
        ? "Give very detailed explanations with examples."
        : "Use concise bullet points.";

    const langInstruction =
      language !== "auto" ? `Respond in ${language} language.` : "";

    const flashcardInstruction = includeFlashcards
      ? 'Also generate 5-8 flashcards as JSON array with "q" and "a" fields.'
      : "";

    const systemPrompt = `You are a study assistant AI. Generate structured study notes from the provided material.
${marksInstruction}
${styleInstruction}
${langInstruction}

You MUST respond with valid JSON only, no markdown. The JSON must have this structure:
{
  "title": "A short descriptive title for the notes",
  "summary": "A comprehensive summary of the material",
  "keyPoints": ["point 1", "point 2", ...],
  "questions": [{"q": "question text", "a": "answer text"}, ...],
  "flashcards": [{"q": "front of card", "a": "back of card"}, ...],
  "tags": ["tag1", "tag2"]
}

Generate 3-5 questions with answers. ${flashcardInstruction}
If flashcards are not requested, return an empty array for flashcards.
Generate 3-5 relevant tags.`;

    // Call Lovable AI
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: sourceText },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errText);
      throw new Error(`AI API returned ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("AI returned invalid JSON");
    }

    // Update the note in the database
    const { error: updateError } = await supabase
      .from("notes")
      .update({
        title: parsed.title || "Untitled Notes",
        summary: parsed.summary || "",
        key_points: parsed.keyPoints || [],
        flashcards: parsed.flashcards || [],
        questions: parsed.questions || [],
        tags: parsed.tags || [],
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("DB update error:", updateError);
      throw new Error("Failed to update note");
    }

    return new Response(
      JSON.stringify({ success: true, noteId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
