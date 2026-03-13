import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye, ThumbsUp, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const variants = {
  enter: (dir) => ({ rotateY: dir * 80, opacity: 0, scale: 0.88, z: -60 }),
  center: { rotateY: 0, opacity: 1, scale: 1, z: 0 },
  exit: (dir) => ({ rotateY: dir * -80, opacity: 0, scale: 0.88, z: -60 }),
};

export default function ToolSwapCard({ tools }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  if (!tools || tools.length === 0) return null;

  const tool = tools[index];
  const ctr = (tool.views || 0) > 0 ? (((tool.upvotes || 0) / tool.views) * 100).toFixed(1) : "0.0";

  const go = (dir) => {
    setDirection(dir);
    setIndex((i) => (i + dir + tools.length) % tools.length);
  };

  return (
    <div className="relative mb-6" style={{ perspective: "1200px" }}>
      {/* Stack ghost cards */}
      <div className="absolute inset-x-6 -bottom-1 top-3 glass rounded-xl border border-border/25 opacity-40" />
      <div className="absolute inset-x-10 -bottom-2 top-5 glass rounded-xl border border-border/15 opacity-25" />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="glass rounded-xl border border-primary/30 p-6 relative overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-1">Analytics Card</p>
              <h3 className="text-xl font-bold gradient-text truncate max-w-[220px]">{tool.name}</h3>
            </div>
            <Badge className={
              tool.status === "approved"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 border"
                : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 border"
            }>
              {tool.status === "approved" ? "Live" : tool.status || "pending"}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: Eye,        label: "Views",   value: (tool.views   || 0).toLocaleString(), color: "text-cyan-400",    bg: "bg-cyan-500/10"    },
              { icon: ThumbsUp,   label: "Upvotes", value: tool.upvotes  || 0,                   color: "text-violet-400",  bg: "bg-violet-500/10"  },
              { icon: TrendingUp, label: "CTR",     value: `${ctr}%`,                            color: "text-emerald-400", bg: "bg-emerald-500/10" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-3 ${s.bg} border border-white/[0.04] text-center`}>
                <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1.5`} />
                <p className={`text-lg font-bold ${s.color} leading-none`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Sparkline-style bar */}
          <div className="w-full bg-border/30 rounded-full h-1.5 mb-5 overflow-hidden">
            <motion.div
              className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((tool.views || 0) / 500 * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            />
          </div>

          {/* Navigation */}
          {tools.length > 1 && (
            <div className="flex items-center justify-between">
              <button onClick={() => go(-1)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Prev
              </button>
              <div className="flex gap-1.5">
                {tools.map((_, i) => (
                  <button key={i}
                    onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                    className={`rounded-full transition-all duration-200 ${i === index ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-border hover:bg-muted-foreground"}`}
                  />
                ))}
              </div>
              <button onClick={() => go(1)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                Next <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}