import db from '@/api/base44Client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, Tag, Clock, Zap, Globe, User, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ToolReviews from "@/components/marketplace/ToolReviews";
import ToolQA from "@/components/marketplace/ToolQA";
import { createPageUrl } from "@/utils";

const CATEGORY_COLORS = {
  "productivity":  { bg: "bg-cyan-500/10",    border: "border-cyan-500/30",   text: "text-cyan-400" },
  "ai-ml":         { bg: "bg-violet-500/10",  border: "border-violet-500/30", text: "text-violet-400" },
  "dev-tools":     { bg: "bg-blue-500/10",    border: "border-blue-500/30",   text: "text-blue-400" },
  "design":        { bg: "bg-pink-500/10",    border: "border-pink-500/30",   text: "text-pink-400" },
  "marketing":     { bg: "bg-amber-500/10",   border: "border-amber-500/30",  text: "text-amber-400" },
  "finance":       { bg: "bg-green-500/10",   border: "border-green-500/30",  text: "text-green-400" },
  "education":     { bg: "bg-indigo-500/10",  border: "border-indigo-500/30", text: "text-indigo-400" },
  "automation":    { bg: "bg-purple-500/10",  border: "border-purple-500/30", text: "text-purple-400" },
  "communication": { bg: "bg-yellow-500/10",  border: "border-yellow-500/30", text: "text-yellow-400" },
  "security":      { bg: "bg-red-500/10",     border: "border-red-500/30",    text: "text-red-400" },
};

export default function ToolModal({ tool, onClose, savedToolIds = [], onSaveToggle }) {
  const c = CATEGORY_COLORS[tool?.category] || CATEGORY_COLORS["ai-ml"];
  const [saved, setSaved] = useState(savedToolIds.includes(tool?.id));
  const [savingInProgress, setSavingInProgress] = useState(false);

  useEffect(() => {
    setSaved(savedToolIds.includes(tool?.id));
  }, [savedToolIds, tool?.id]);

  const handleSave = async () => {
    if (savingInProgress) return;
    setSavingInProgress(true);
    const isAuth = await db.auth.isAuthenticated();
    if (!isAuth) { db.auth.redirectToLogin(window.location.href); return; }
    if (saved) {
      setSaved(false);
      onSaveToggle?.(tool.id, false);
    } else {
      await db.entities.SavedTool.create({ tool_id: tool.id });
      setSaved(true);
      onSaveToggle?.(tool.id, true);
    }
    setSavingInProgress(false);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!tool) return null;

  const priceLabel = () => {
    if (tool.pricing_model === "free" || tool.pricing_model === "open-source") return "Free";
    if (tool.pricing_model === "freemium") return "Freemium";
    if (tool.price) return `$${tool.price}`;
    return "Paid";
  };

  const isFree = tool.pricing_model === "free" || tool.pricing_model === "open-source";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" />

        {/* Bubble */}
        <motion.div
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden border border-primary/25"
          style={{
            background: "rgba(12,10,24,0.96)",
            boxShadow: "0 0 80px rgba(124,58,237,0.25), 0 40px 80px rgba(0,0,0,0.6)",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
          initial={{ scale: 0.75, opacity: 0, y: 60 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow line top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg glass border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Image */}
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/7" }}>
            {tool.image_url ? (
              <img src={tool.image_url} alt={tool.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-900/50 to-cyan-900/30 flex items-center justify-center">
                <span className="text-7xl font-mono font-bold text-primary/20 select-none">{tool.name?.[0]}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,10,24,0.95)] via-[rgba(12,10,24,0.3)] to-transparent" />

            {/* Featured badge */}
            {tool.featured && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0 font-mono text-xs uppercase tracking-wider">
                  <Zap className="w-3 h-3 mr-1" /> Featured
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col gap-4">
            {/* Category badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${c.bg} ${c.border} ${c.text} border text-[11px] uppercase tracking-wide font-mono`}>
                {tool.category}
              </Badge>
              {tool.subcategory && (
                <Badge variant="outline" className="text-[11px] text-muted-foreground border-border/50">
                  {tool.subcategory}
                </Badge>
              )}
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold gradient-text">{tool.name}</h2>
              {tool.tagline && (
                <p className="text-muted-foreground mt-1 text-base">{tool.tagline}</p>
              )}
            </div>

            {/* Description */}
            {tool.description && (
              <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/30 pl-4">
                {tool.description}
              </p>
            )}

            {/* Pricing section */}
            <div className="rounded-xl border border-border/50 bg-white/[0.02] p-4 flex flex-wrap items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Price</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${isFree ? "text-emerald-400" : "text-foreground"}`}>
                    {priceLabel()}
                  </span>
                  {tool.has_discount && tool.original_price && (
                    <span className="text-sm text-muted-foreground line-through">${tool.original_price}</span>
                  )}
                </div>
              </div>

              {tool.has_discount && tool.discount_percentage && (
                <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 border text-sm px-3 py-1">
                  <Tag className="w-3 h-3 mr-1.5" /> {tool.discount_percentage}% OFF
                </Badge>
              )}

              {tool.has_free_trial && (
                <Badge className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 border text-sm px-3 py-1">
                  <Clock className="w-3 h-3 mr-1.5" />
                  {tool.free_trial_days ? `${tool.free_trial_days}-day free trial` : "Free trial available"}
                </Badge>
              )}
            </div>

            {/* Creator */}
            {tool.created_by && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <User className="w-3.5 h-3.5" />
                <span>Listed by</span>
                <a
                  href={createPageUrl("CreatorProfile") + `?creator=${encodeURIComponent(tool.created_by)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary hover:underline"
                >
                  @{tool.created_by.split("@")[0]}
                </a>
                <span className="text-border">·</span>
                <Globe className="w-3.5 h-3.5" />
                <span className="truncate text-foreground/50">{tool.link}</span>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-2 mt-2">
              <a href={tool.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 glow-purple text-white py-3 h-auto text-base font-semibold gap-2">
                  Visit Tool <ArrowUpRight className="w-4 h-4" />
                </Button>
              </a>
              <Button
                variant="outline"
                onClick={handleSave}
                className={`border-border/60 py-3 h-auto px-4 transition-all ${saved ? "bg-primary/10 border-primary/40 text-primary" : "text-muted-foreground hover:text-primary hover:border-primary/40"}`}
                title={saved ? "Remove from library" : "Save to library"}
              >
                <Bookmark className={`w-5 h-5 ${saved ? "fill-primary" : ""}`} />
              </Button>
            </div>

            {/* Reviews */}
            <ToolReviews toolId={tool.id} />

            {/* Divider */}
            <div className="border-t border-border/30" />

            {/* Q&A */}
            <ToolQA toolId={tool.id} toolCreator={tool.created_by} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}