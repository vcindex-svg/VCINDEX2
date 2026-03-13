import db from '@/api/base44Client';

import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, ChevronUp, Star, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
// Calculate trending score — upvotes weighted heavily, views secondary, recency bonus
function trendScore(tool) {
  const now = Date.now();
  const created = new Date(tool.created_date).getTime();
  const ageMs = now - created;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const recencyBonus = ageMs < sevenDaysMs ? 1.6 : 1;
  return ((tool.upvotes || 0) * 3 + (tool.views || 0) * 0.8 + (tool.review_count || 0) * 2) * recencyBonus;
}

export default function TrendingSection({ onToolClick }) {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const maxScore = trending[0] ? trendScore(trending[0]) : 1;

  useEffect(() => {
    db.entities.Tool.filter({ status: "approved" }, "-upvotes", 50).then((tools) => {
      const ranked = [...tools].sort((a, b) => trendScore(b) - trendScore(a)).slice(0, 6);
      setTrending(ranked);
      setLoading(false);
    });
  }, []);

  if (loading || trending.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-orange-500/10 border-orange-500/30 text-orange-400 border font-mono text-xs uppercase tracking-wider">
                <Flame className="w-3 h-3 mr-1" /> Trending
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Hot right <span className="gradient-text">now</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Ranked by upvotes, views & recency</p>
          </div>
          <Link to={createPageUrl("Marketplace")} className="hidden md:flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-mono">
            See all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trending.map((tool, i) => {
            const score = trendScore(tool);
            const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
            const isNew = Date.now() - new Date(tool.created_date).getTime() < 7 * 24 * 60 * 60 * 1000;
            return (
              <button
                key={tool.id}
                onClick={() => onToolClick?.(tool)}
                className="glass rounded-xl border border-border/60 hover:border-primary/40 p-4 text-left group transition-all hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] flex gap-4 items-start"
              >
                {/* Rank */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${i === 0 ? "bg-amber-500/20 text-amber-400" : i === 1 ? "bg-slate-400/10 text-slate-400" : i === 2 ? "bg-orange-700/20 text-orange-600" : "bg-muted/20 text-muted-foreground"}`}>
                  #{i + 1}
                </div>

                {/* Image */}
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-violet-900/40 to-cyan-900/20">
                  {tool.image_url ? (
                    <img src={tool.image_url} alt={tool.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/30 font-bold text-sm">{tool.name?.[0]}</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-foreground text-sm truncate group-hover:gradient-text transition-all">{tool.name}</span>
                    {isNew && <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 border text-[9px] px-1.5 py-0">NEW</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{tool.tagline}</p>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <ChevronUp className="w-3 h-3 text-primary" /> {tool.upvotes || 0}
                    </span>
                    {tool.avg_rating > 0 && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" /> {tool.avg_rating.toFixed(1)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-emerald-400 ml-auto">
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-mono">{pct}%</span>
                    </span>
                  </div>

                  {/* Heat bar */}
                  <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}