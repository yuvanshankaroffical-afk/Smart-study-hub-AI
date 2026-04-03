import { motion } from "framer-motion";
import { BookOpen, Upload, Brain, Layers, Sparkles, ArrowRight, Zap, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Upload, title: "Upload Anything", desc: "PDF, DOCX, TXT, URLs — we handle it all" },
  { icon: Sparkles, title: "AI Summaries", desc: "Get concise, structured notes instantly" },
  { icon: Brain, title: "Smart Quizzes", desc: "Auto-generated questions to test your knowledge" },
  { icon: Layers, title: "Flashcards", desc: "Flip-card revision for active recall" },
];

const stats = [
  { value: "50K+", label: "Notes Generated" },
  { value: "12K+", label: "Students" },
  { value: "98%", label: "Satisfaction" },
  { value: "4.9★", label: "Rating" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-strong">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">StudyAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
            <Button size="sm" className="rounded-2xl" onClick={() => navigate("/auth")}>
              Get Started <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        
        <div className="container relative text-center max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-3 w-3" /> AI-Powered Study Assistant
            </span>
          </motion.div>
          
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            Generate Smart Study Notes{" "}
            <span className="gradient-text">Instantly</span>
          </motion.h1>
          
          <motion.p
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-8"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            Upload your materials and let AI create summaries, flashcards, and quizzes.
            Study smarter, not harder.
          </motion.p>
          
          <motion.div className="flex justify-center gap-3" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <Button size="lg" className="rounded-2xl px-8 glow-primary" onClick={() => navigate("/dashboard")}>
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-2xl px-8" onClick={() => navigate("/upload")}>
              Try Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/50">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="text-center"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
            >
              <div className="text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything you need to study effectively</h2>
            <p className="text-muted-foreground">Powerful tools powered by AI to transform how you learn</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="p-6 rounded-3xl bg-card border border-border/50 hover-lift cursor-pointer group"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Loved by students worldwide</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Alex M.", text: "This tool saved me hours of study time. The AI summaries are incredibly accurate." },
              { name: "Sarah K.", text: "The flashcard feature is amazing for exam prep. I improved my grades significantly!" },
              { name: "James R.", text: "Quiz mode helps me identify weak areas. Best study tool I've ever used." },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                className="p-6 rounded-3xl bg-card border border-border/50"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-warning text-warning" />)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {t.name[0]}
                  </div>
                  <span className="text-sm font-medium">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container text-center max-w-2xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl font-bold mb-4">Ready to study smarter?</h2>
            <p className="text-muted-foreground mb-8">Join thousands of students already using StudyAI</p>
            <Button size="lg" className="rounded-2xl px-8 glow-primary" onClick={() => navigate("/dashboard")}>
              Start for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg gradient-primary flex items-center justify-center">
              <BookOpen className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">StudyAI</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 StudyAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
