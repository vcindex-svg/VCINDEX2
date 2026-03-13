import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { ArrowRight, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center text-center px-4 overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Built by vibers, for everyone
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6">
          <span className="text-foreground">Discover</span>{" "}
          <span className="gradient-text">AI-Powered</span>
          <br />
          <span className="text-foreground">Tools by Vibe Coders</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          The curated marketplace for next-gen tools, apps, and systems — built with AI, discovered by humans. 
          No sign-up required to browse.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a href={createPageUrl("Marketplace")}>
            <Button className="bg-primary hover:bg-primary/90 glow-purple text-white px-8 py-3 text-base h-auto">
              Explore Tools <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
          <a href={createPageUrl("CreatorSignup")}>
            <Button variant="outline" className="border-border/60 hover:border-primary/50 text-foreground px-8 py-3 text-base h-auto">
              <Zap className="w-4 h-4 mr-2 text-primary" /> List Your Tool
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-16 flex-wrap">
          {[
            { label: "Tools Listed", value: "500+" },
            { label: "Categories", value: "10" },
            { label: "Vibe Coders", value: "120+" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}