import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Link, Youtube, X, Sparkles, Settings2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useCreateNote } from "@/hooks/useNotes";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const createNote = useCreateNote();

  // Generation options
  const [language, setLanguage] = useState("auto");
  const [marks, setMarks] = useState("5");
  const [explanationStyle, setExplanationStyle] = useState("exam");
  const [includeDiagram, setIncludeDiagram] = useState(false);
  const [generateFlashcards, setGenerateFlashcards] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const hasContent = files.length > 0 || text.length > 0 || url.length > 0;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    let sourceText = text;

    // If files are uploaded, read their content
    if (files.length > 0 && !sourceText) {
      try {
        const fileContents = await Promise.all(
          files.map(file => file.text())
        );
        sourceText = fileContents.join("\n\n");
      } catch {
        toast.error("Failed to read file contents");
        return;
      }
    }

    // If URL provided and no text
    if (url && !sourceText) {
      sourceText = `Please generate notes from this URL: ${url}`;
    }

    if (!sourceText) {
      toast.error("Please provide some content");
      return;
    }

    // Upload files to storage if any
    let filePath: string | undefined;
    if (files.length > 0) {
      const file = files[0];
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("study-materials")
        .upload(path, file);
      if (!error) filePath = path;
    }

    try {
      const note = await createNote.mutateAsync({
        sourceText,
        sourceUrl: url || undefined,
        sourceFilePath: filePath,
        language,
        marks,
        explanationStyle,
        includeDiagram,
        generateFlashcards,
      });

      toast.success("Notes are being generated!");
      navigate(`/notes-viewer?id=${note.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate notes");
    }
  };

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const marksLabel = marks === "2" ? "2 Marks" : marks === "5" ? "5 Marks" : marks === "10" ? "10 Marks" : "Detailed";
  const styleLabel = explanationStyle === "exam" ? "Exam Answer" : explanationStyle === "simple" ? "Simple" : explanationStyle === "detailed" ? "Detailed" : "Bullet Points";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Upload Your Study Material</h1>
        <p className="text-muted-foreground mt-1">Upload files, paste text, or enter a URL to generate smart notes</p>
      </motion.div>

      {/* Drag & Drop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
          dragOver ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <p className="font-medium mb-1">Drop files here or click to browse</p>
        <p className="text-sm text-muted-foreground">Supports PDF, DOCX, TXT — Max 10MB</p>
      </motion.div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/50">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Text Input */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <label className="text-sm font-medium mb-2 block">Or paste your text</label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your study material here..."
          className="rounded-2xl min-h-[120px] bg-card border-border/50"
        />
      </motion.div>

      {/* URL Input */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <label className="text-sm font-medium mb-2 block">Or enter a URL / YouTube link</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com or YouTube URL"
              className="pl-9 rounded-2xl bg-card border-border/50"
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-2xl shrink-0">
            <Youtube className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Generation Options */}
      <AnimatePresence>
        {hasContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-primary" />
                  Generation Options
                </h3>
                <Dialog open={optionsOpen} onOpenChange={setOptionsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Customize</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Generation Options</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 pt-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Language</label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto Detect</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">Hindi</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Marks / Answer Length</label>
                        <Select value={marks} onValueChange={setMarks}>
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 Marks</SelectItem>
                            <SelectItem value="5">5 Marks</SelectItem>
                            <SelectItem value="10">10 Marks</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Explanation Style</label>
                        <Select value={explanationStyle} onValueChange={setExplanationStyle}>
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exam">Exam Answer</SelectItem>
                            <SelectItem value="simple">Simple</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                            <SelectItem value="bullets">Bullet Points</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Include Diagram</label>
                        <Switch checked={includeDiagram} onCheckedChange={setIncludeDiagram} />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Generate Flashcards</label>
                        <Switch checked={generateFlashcards} onCheckedChange={setGenerateFlashcards} />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                  {language === "auto" ? "Auto Detect" : language.toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">{marksLabel}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">{styleLabel}</span>
                {includeDiagram && <span className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-medium">Diagrams</span>}
                {generateFlashcards && <span className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-medium">Flashcards</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      {createNote.isPending && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Generating notes...</span>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <Progress value={60} className="h-2 rounded-full animate-pulse" />
        </div>
      )}

      {/* Generate Button */}
      <Button
        size="lg"
        className="w-full rounded-2xl glow-primary"
        disabled={createNote.isPending || !hasContent}
        onClick={handleGenerate}
      >
        {createNote.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        {createNote.isPending ? "Generating..." : "Generate Smart Notes"}
      </Button>
    </div>
  );
}
