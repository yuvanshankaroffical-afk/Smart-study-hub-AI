import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Trash2, Download, Grid3X3, List, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotes, useDeleteNote } from "@/hooks/useNotes";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

export default function MyNotesPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const { data: notes = [], isLoading } = useNotes();
  const deleteNote = useDeleteNote();
  const navigate = useNavigate();

  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    deleteNote.mutate(id, {
      onSuccess: () => toast.success("Note deleted"),
      onError: () => toast.error("Failed to delete note"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Notes</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} notes saved</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." className="pl-9 rounded-2xl bg-card border-border/50 w-60" />
          </div>
          <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" className="rounded-xl" onClick={() => setView("grid")}><Grid3X3 className="h-4 w-4" /></Button>
          <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" className="rounded-xl" onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">{notes.length === 0 ? "No notes yet. Upload some study material!" : "No notes found"}</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note, i) => (
            <motion.div
              key={note.id}
              className="p-5 rounded-3xl bg-card border border-border/50 hover-lift group cursor-pointer"
              initial="hidden" animate="visible" variants={fadeUp} custom={i}
              onClick={() => navigate(`/notes-viewer?id=${note.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"><Download className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => handleDelete(note.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1 hover:text-primary transition-colors">{note.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{new Date(note.created_at).toLocaleDateString()}</p>
              <div className="flex gap-1 flex-wrap">
                {(note.tags || []).map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>)}
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  note.status === "completed" ? "bg-green-500/10 text-green-500" :
                  note.status === "processing" ? "bg-yellow-500/10 text-yellow-500" :
                  "bg-destructive/10 text-destructive"
                }`}>{note.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((note, i) => (
            <motion.div
              key={note.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 hover:bg-secondary/30 transition-colors group cursor-pointer"
              initial="hidden" animate="visible" variants={fadeUp} custom={i}
              onClick={() => navigate(`/notes-viewer?id=${note.id}`)}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{note.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                {(note.tags || []).map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary hidden sm:inline">{t}</span>)}
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100"><Download className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive opacity-0 group-hover:opacity-100" onClick={() => handleDelete(note.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
