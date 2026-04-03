import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Check, FileText, Lightbulb, Layers, HelpCircle, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { useNote } from "@/hooks/useNotes";

function FlashcardItem({ card, index }: { card: { q: string; a: string }; index: number }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div
      className="relative cursor-pointer group"
      style={{ perspective: 1000 }}
      onClick={() => setFlipped(!flipped)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="relative h-36 rounded-2xl transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
        <div className="absolute inset-0 rounded-2xl border border-border/40 bg-gradient-to-br from-primary/5 to-accent/5 p-5 flex flex-col justify-between" style={{ backfaceVisibility: "hidden" }}>
          <p className="text-sm font-medium text-foreground leading-relaxed">{card.q}</p>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">tap to reveal</span>
        </div>
        <div className="absolute inset-0 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-primary/10 p-5 flex flex-col justify-between" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <p className="text-sm font-semibold text-accent">{card.a}</p>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">tap to flip back</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function NotesViewer() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get("id");
  const { data: note, isLoading } = useNote(noteId);

  const handleCopy = () => {
    if (note?.summary) {
      navigator.clipboard.writeText(note.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabMeta: Record<string, { icon: React.ReactNode; label: string }> = {
    summary: { icon: <Lightbulb className="h-3.5 w-3.5" />, label: "Summary" },
    keypoints: { icon: <FileText className="h-3.5 w-3.5" />, label: "Key Points" },
    flashcards: { icon: <Layers className="h-3.5 w-3.5" />, label: "Flashcards" },
    questions: { icon: <HelpCircle className="h-3.5 w-3.5" />, label: "Questions" },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Note not found</p>
      </div>
    );
  }

  const isProcessing = note.status === "processing";
  const keyPoints = (note.key_points as string[]) || [];
  const flashcards = (note.flashcards as { q: string; a: string }[]) || [];
  const questions = (note.questions as { q: string; a: string }[]) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
              isProcessing
                ? "bg-yellow-500/15 text-yellow-500 border-yellow-500/20"
                : note.status === "failed"
                ? "bg-destructive/15 text-destructive border-destructive/20"
                : "bg-accent/15 text-accent border-accent/20"
            }`}>
              {isProcessing && <Loader2 className="h-3 w-3 animate-spin" />}
              {isProcessing ? "Processing" : note.status === "failed" ? "Failed" : "AI Generated"}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{note.title}</h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
            {note.marks} Marks <ChevronRight className="h-3 w-3" /> {note.explanation_style} Style
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs border-border/50" onClick={handleCopy} disabled={isProcessing}>
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs border-border/50" disabled={isProcessing}>
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </motion.div>

      {isProcessing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 space-y-4"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">AI is generating your notes...</p>
          <p className="text-xs text-muted-foreground/60">This usually takes 10-30 seconds</p>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Original Content */}
          <motion.div
            className="lg:col-span-2 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="px-5 py-4 border-b border-border/30 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source Material</span>
            </div>
            <div className="p-5">
              <p className="text-sm text-muted-foreground leading-[1.8] tracking-wide">
                {note.source_text?.substring(0, 1000) || "No source text available"}
                {(note.source_text?.length || 0) > 1000 && "..."}
              </p>
            </div>
          </motion.div>

          {/* Generated Notes */}
          <motion.div
            className="lg:col-span-3 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="px-5 py-3 border-b border-border/30">
                <TabsList className="bg-transparent p-0 h-auto gap-1">
                  {Object.entries(tabMeta).map(([key, { icon, label }]) => (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none border-0 transition-colors"
                    >
                      {icon}
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="p-5">
                <AnimatePresence mode="wait">
                  <TabsContent value="summary" className="mt-0">
                    <motion.div key="summary" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                      {(note.summary || "").split("\n").map((line, i) => {
                        if (!line.trim()) return null;
                        if (line.startsWith("•") || line.startsWith("-")) {
                          return (
                            <div key={i} className="flex items-start gap-2.5 ml-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                              <span className="text-sm text-muted-foreground leading-relaxed">{line.replace(/^[•-]\s*/, "")}</span>
                            </div>
                          );
                        }
                        if (line.match(/^\d\./)) {
                          return (
                            <div key={i} className="flex items-start gap-2.5 ml-1">
                              <span className="h-5 w-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{line[0]}</span>
                              <span className="text-sm text-muted-foreground leading-relaxed">{line.replace(/^\d\.\s*/, "")}</span>
                            </div>
                          );
                        }
                        const isHeading = line.endsWith(":");
                        return (
                          <p key={i} className={isHeading ? "text-sm font-semibold text-foreground pt-3" : "text-sm text-muted-foreground leading-relaxed"}>
                            {line}
                          </p>
                        );
                      })}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="keypoints" className="mt-0">
                    <motion.ul key="keypoints" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                      {keyPoints.map((p, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/20 hover:border-primary/20 transition-colors"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                          <span className="text-sm text-muted-foreground leading-relaxed pt-0.5">{typeof p === "string" ? p : (p as any).text || JSON.stringify(p)}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </TabsContent>

                  <TabsContent value="flashcards" className="mt-0">
                    <motion.div key="flashcards" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid sm:grid-cols-2 gap-3">
                      {flashcards.length > 0 ? (
                        flashcards.map((f, i) => <FlashcardItem key={i} card={f} index={i} />)
                      ) : (
                        <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No flashcards generated. Enable flashcards in generation options.</p>
                      )}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="questions" className="mt-0">
                    <motion.div key="questions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                      {questions.map((q, i) => (
                        <motion.div
                          key={i}
                          className="rounded-xl border border-border/30 overflow-hidden"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                        >
                          <div className="px-4 py-3 bg-muted/20">
                            <p className="text-sm font-medium text-foreground flex items-start gap-2">
                              <span className="text-primary font-bold text-xs mt-0.5">Q{i + 1}</span>
                              {q.q}
                            </p>
                          </div>
                          <div className="px-4 py-3 border-t border-border/20">
                            <p className="text-sm text-green-500 flex items-start gap-2">
                              <span className="font-bold text-xs mt-0.5">A</span>
                              {q.a}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </div>
            </Tabs>
          </motion.div>
        </div>
      )}

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
