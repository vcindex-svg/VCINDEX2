import db from '@/api/base44Client';

import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Zap, Tag, Clock, ChevronUp, Star, Bookmark, TrendingUp } from "lucide-react";
import TiltCard from "@/components/ui/TiltCard";

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

// Trending score helper (same formula as TrendingSection)
function trendScore(tool) {
  const now = Date.now();
  const created = new Date(tool.created_at).getTime();
  const ageMs = now - created;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const recencyBonus = ageMs < sevenDaysMs ? 1.6 : 1;
  return ((tool.upvotes || 0) * 3 + (tool.views || 0) * 0.8 + (tool.review_count || 0) * 2) * recencyBonus;
}

export default function ToolCard({ tool, onClick, userUpvotedIds = [], onUpvote, savedToolIds = [], onSaveToggle }) {
  const c = CATEGORY_COLORS[tool.category] || CATEGORY_COLORS["ai-ml"];
  const [upvotes, setUpvotes] = useState(tool.upvotes || 0);
  const [upvoted, setUpvoted] = useState(userUpvotedIds.includes(tool.id));
  const [saved, setSaved] = useState(savedToolIds.includes(tool.id));
  const [savingInProgress, setSavingInProgress] = useState(false);
  const isTrending = trendScore(tool) > 10;

  useEffect(() => {
    setUpvoted(userUpvotedIds.includes(tool.id));
  }, [userUpvotedIds, tool.id]);

  useEffect(() => {
    setSaved(savedToolIds.includes(tool.id));
  }, [savedToolIds, tool.id]);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (savingInProgress) return;
    setSavingInProgress(true);
    if (saved) {
      onSaveToggle?.(tool.id, false);
      setSaved(false);
    } else {
      await db.entities.SavedTool.create({ tool_id: tool.id });
      setSaved(true);
      onSaveToggle?.(tool.id, true);
    }
    setSavingInProgress(false);
  };

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (upvoted) return;
    const newCount = upvotes + 1;
    setUpvotes(newCount);
    setUpvoted(true);
    await Promise.all([
      db.entities.Tool.update(tool.id, { upvotes: newCount }),
      db.entities.Upvote.create({ tool_id: tool.id }),
    ]);
    if (onUpvote) onUpvote(tool.id);
  };

  const priceLabel = () => {
    if (tool.pricing_model === "free" || tool.pricing_model === "open-source") return "Free";
    if (tool.pricing_model === "freemium") return "Freemium";
    if (tool.price) return `$${tool.price}`;
    return "Paid";
  };

  return (
    <TiltCard className="w-full" intensity={8}>
      <div onClick={onClick} className="glass rounded-xl border border-border group relative overflow-hidden flex flex-col cursor-pointer h-full" style={{ transition: "border-color 0.3s, box-shadow 0.3s" }}>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top left, rgba(124,58,237,0.08), transparent 60%)" }} />

        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1">
          {tool.featured && (
            <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0 text-[10px] font-mono uppercase tracking-wider">
              <Zap className="w-2.5 h-2.5 mr-1" /> Featured
            </Badge>
          )}
          {isTrending && !tool.featured && (
            <Badge className="bg-orange-500/20 border-orange-500/30 text-orange-400 border text-[10px] font-mono uppercase tracking-wider">
              <TrendingUp className="w-2.5 h-2.5 mr-1" /> Hot
            </Badge>
          )}
        </div>
        {/* Save button */}
        <button
          onClick={handleSave}
          className={`absolute top-3 left-3 z-10 w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${saved ? "bg-primary/20 border-primary/50 text-primary" : "bg-black/40 border-white/10 text-white/60 hover:border-primary/40 hover:text-primary"}`}
          title={saved ? "Remove from library" : "Save to library"}
        >
          <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-primary" : ""}`} />
        </button>

        <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
          {tool.image_url ? (
            <img src={tool.image_url} alt={tool.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-900/40 to-cyan-900/20 flex items-center justify-center">
              <span className="text-4xl font-mono font-bold text-primary/30 select-none">{tool.name?.[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>

        <div className="flex-1 p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${c.bg} ${c.border} ${c.text} border text-[10px] uppercase tracking-wide font-mono`}>
              {tool.category}
            </Badge>
            {tool.subcategory && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/50">
                {tool.subcategory}
              </Badge>
            )}
          </div>

          <h3 className="font-semibold text-foreground text-base leading-snug group-hover:gradient-text transition-all line-clamp-1">{tool.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 flex-1">{tool.tagline || tool.description}</p>

          {/* Rating row */}
          {tool.avg_rating > 0 && (
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs text-amber-400 font-mono font-semibold">{tool.avg_rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground/60">({tool.review_count || 0})</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-border/50 mt-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${tool.pricing_model === "free" || tool.pricing_model === "open-source" ? "text-emerald-400" : "text-foreground"}`}>
                {priceLabel()}
              </span>
              {tool.has_discount && tool.discount_percentage && (
                <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 border text-[10px]">
                  <Tag className="w-2.5 h-2.5 mr-1" /> -{tool.discount_percentage}%
                </Badge>
              )}
              {tool.has_free_trial && (
                <Badge className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 border text-[10px]">
                  <Clock className="w-2.5 h-2.5 mr-1" />
                  {tool.free_trial_days ? `${tool.free_trial_days}d trial` : "Free trial"}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleUpvote}
                className={`flex items-center gap-1 text-xs rounded-md px-2 py-1 border transition-all ${
                  upvoted
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/40 text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                <ChevronUp className="w-3 h-3" />
                <span className="font-mono">{upvotes}</span>
              </button>
              <span className="text-xs text-muted-foreground font-mono">View →</span>
            </div>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}