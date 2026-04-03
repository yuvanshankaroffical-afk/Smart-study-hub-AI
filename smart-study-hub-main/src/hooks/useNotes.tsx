import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  source_text: string | null;
  source_url: string | null;
  source_file_path: string | null;
  summary: string | null;
  key_points: { q?: string; a?: string }[] | string[];
  flashcards: { q: string; a: string }[];
  questions: { q: string; a: string }[];
  language: string;
  marks: string;
  explanation_style: string;
  include_diagram: boolean;
  generate_flashcards: boolean;
  status: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export function useNotes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user,
  });
}

export function useNote(noteId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["note", noteId],
    queryFn: async () => {
      if (!noteId) return null;
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single();
      if (error) throw error;
      return data as Note;
    },
    enabled: !!user && !!noteId,
    refetchInterval: (query) => {
      const note = query.state.data as Note | null | undefined;
      return note?.status === "processing" ? 2000 : false;
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      sourceText: string;
      sourceUrl?: string;
      sourceFilePath?: string;
      language: string;
      marks: string;
      explanationStyle: string;
      includeDiagram: boolean;
      generateFlashcards: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // 1. Create the note record
      const { data: note, error: insertError } = await supabase
        .from("notes")
        .insert({
          user_id: user.id,
          title: "Generating...",
          source_text: params.sourceText,
          source_url: params.sourceUrl || null,
          source_file_path: params.sourceFilePath || null,
          language: params.language,
          marks: params.marks,
          explanation_style: params.explanationStyle,
          include_diagram: params.includeDiagram,
          generate_flashcards: params.generateFlashcards,
          status: "processing",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Invoke edge function to generate notes
      const { error: fnError } = await supabase.functions.invoke("generate-notes", {
        body: {
          noteId: note.id,
          sourceText: params.sourceText,
          language: params.language,
          marks: params.marks,
          explanationStyle: params.explanationStyle,
          includeFlashcards: params.generateFlashcards,
        },
      });

      if (fnError) {
        // Mark note as failed
        await supabase.from("notes").update({ status: "failed" }).eq("id", note.id);
        throw fnError;
      }

      return note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
