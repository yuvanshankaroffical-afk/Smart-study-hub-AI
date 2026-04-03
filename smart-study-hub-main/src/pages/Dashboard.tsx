import { motion } from "framer-motion";
import { FileText, TrendingUp, Clock, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: notes = [], isLoading } = useNotes();

  const completedNotes = notes.filter(n => n.status === "completed");
  const recentNotes = notes.slice(0, 3);
  const userName = user?.user_metadata?.full_name || "Student";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold">Welcome back, {userName} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's your study overview</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div className="p-5 rounded-3xl bg-card border border-border/50 hover-lift" initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <div className="flex items-center justify-between mb-3">
            <FileText className="h-5 w-5 text-primary" />
            <TrendingUp className="h-3 w-3 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : completedNotes.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Notes</div>
        </motion.div>
        <motion.div className="p-5 rounded-3xl bg-card border border-border/50 hover-lift" initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <div className="flex items-center justify-between mb-3">
            <Clock className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : notes.filter(n => n.status === "processing").length}</div>
          <div className="text-xs text-muted-foreground mt-1">Processing</div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-1 p-6 rounded-3xl bg-card border border-border/50" initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button className="w-full rounded-2xl justify-start gap-2" onClick={() => navigate("/upload")}>
              <Upload className="h-4 w-4" /> Upload New Notes
            </Button>
            <Button variant="outline" className="w-full rounded-2xl justify-start gap-2" onClick={() => navigate("/my-notes")}>
              <FileText className="h-4 w-4" /> My Notes
            </Button>
          </div>
        </motion.div>

        <motion.div className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border/50" initial="hidden" animate="visible" variants={fadeUp} custom={6}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Notes</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/my-notes")} className="text-primary text-xs">View All</Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : recentNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notes yet. Upload some study material to get started!</p>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/notes-viewer?id=${n.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(n.tags || []).slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
