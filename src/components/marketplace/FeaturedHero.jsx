import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Zap, Tag, Clock } from "lucide-react";

export default function FeaturedHero({ tool }) {
  if (!tool) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-primary/20 glass">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-transparent to-cyan-900/20" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative flex flex-col md:flex-row gap-6 p-6 md:p-8">
        {/* Image */}
        <div className="md:w-2/5 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
          {tool.image_url ? (
            <img src={tool.image_url} alt={tool.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-800/30 to-cyan-800/20 flex items-center justify-center">
              <span className="text-6xl font-mono font-bold text-primary/20">{tool.name?.[0]}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0 text-xs font-mono uppercase tracking-wider">
              <Zap className="w-3 h-3 mr-1" /> Featured Pick
            </Badge>
            <Badge variant="outline" className="text-muted-foreground border-border/50 text-xs uppercase tracking-wide">
              {tool.category}
            </Badge>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text">{tool.name}</h2>
            <p className="text-muted-foreground mt-2 text-sm md:text-base leading-relaxed">{tool.description}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {tool.pricing_model === "free" || tool.pricing_model === "open-source" ? (
              <span className="text-emerald-400 font-semibold text-sm">Free</span>
            ) : tool.price ? (
              <div className="flex items-center gap-2">
                <span className="text-foreground font-semibold text-sm">${tool.price}</span>
                {tool.has_discount && tool.original_price && (
                  <span className="text-muted-foreground line-through text-xs">${tool.original_price}</span>
                )}
                {tool.has_discount && tool.discount_percentage && (
                  <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 border text-xs">
                    <Tag className="w-3 h-3 mr-1" /> -{tool.discount_percentage}%
                  </Badge>
                )}
              </div>
            ) : null}
            {tool.has_free_trial && (
              <Badge className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 border text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {tool.free_trial_days ? `${tool.free_trial_days}-day free trial` : "Free trial available"}
              </Badge>
            )}
          </div>

          <div className="flex gap-3">
            <a href={tool.link} target="_blank" rel="noopener noreferrer">
              <Button className="bg-primary hover:bg-primary/90 glow-purple text-white">
                Visit Tool <ArrowUpRight className="w-4 h-4 ml-1.5" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}