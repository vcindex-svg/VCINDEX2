import { useState } from "react";
import ParticleBackground from "@/components/ui/ParticleBackground";
import HeroSection3D from "@/components/landing/HeroSection3D";
import PricingSection from "@/components/landing/PricingSection";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SquishyButton from "@/components/ui/SquishyButton";
import TrendingSection from "@/components/landing/TrendingSection";
import ToolModal from "@/components/marketplace/ToolModal";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Globe, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";

const FEATURES = [
  {
    icon: Globe,
    title: "Browse Without Signing Up",
    desc: "Any visitor can explore thousands of AI-built tools, no account required.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: Zap,
    title: "Built by Vibe Coders",
    desc: "Every tool is crafted by indie builders using AI — authentic, creative, and cutting-edge.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: Shield,
    title: "Curated & Approved",
    desc: "Every listing is reviewed before going live. Quality over quantity, always.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
];

export default function Home() {
  const [selectedTool, setSelectedTool] = useState(null);

  return (
    <div className="relative min-h-screen font-space">
      <ParticleBackground />
      {selectedTool && <ToolModal tool={selectedTool} onClose={() => setSelectedTool(null)} />}
      <div className="relative z-10">
        <HeroSection3D />

        {/* Features */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-primary/10 border-primary/30 text-primary border mb-4 font-mono text-xs uppercase tracking-wider">
                Why VibeMarket
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                The future of <span className="gradient-text">indie tools</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <ScrollReveal key={f.title} delay={i * 0.12} direction="up">
                  <div className={`glass rounded-xl border ${f.border} p-6 flex flex-col gap-3 h-full`}>
                    <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center`}>
                      <f.icon className={`w-5 h-5 ${f.color}`} />
                    </div>
                    <h3 className="font-semibold text-foreground">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Trending */}
        <TrendingSection onToolClick={setSelectedTool} />

        {/* CTA Banner */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal direction="up" delay={0.05}>
              <div className="animated-border-wrap">
                <div className="rounded-xl bg-surface p-8 text-center flex flex-col gap-4 items-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Ready to list your vibe-coded creation?
                  </h2>
                  <p className="text-muted-foreground">
                    Join the marketplace. Start from $7/month.
                  </p>
                  <a href={createPageUrl("CreatorSignup")}>
                    <SquishyButton variant="primary">
                      Start Listing <ArrowRight className="w-4 h-4" />
                    </SquishyButton>
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <PricingSection />
      </div>
    </div>
  );
}