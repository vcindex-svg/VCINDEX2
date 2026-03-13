import db from '@/api/base44Client';

import { useState, useEffect, useMemo } from "react";

import ParticleBackground from "@/components/ui/ParticleBackground";
import ToolCard from "@/components/marketplace/ToolCard";
import CategoryFilter from "@/components/marketplace/CategoryFilter";
import FeaturedHero from "@/components/marketplace/FeaturedHero";
import ToolModal from "@/components/marketplace/ToolModal";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PackageSearch, Search, SlidersHorizontal, X, Tag } from "lucide-react";

const VIBE_TAGS = [
  "ai", "automation", "no-code", "productivity", "open-source",
  "api", "analytics", "design", "finance", "writing", "devtools",
  "mobile", "saas", "free", "creator",
];

const PRICING_FILTERS = [
  { id: "all",        label: "All Prices" },
  { id: "free",       label: "Free" },
  { id: "freemium",   label: "Freemium" },
  { id: "paid",       label: "Paid" },
  { id: "free_trial", label: "Free Trial" },
];

// Simple fuzzy match — checks if all chars of query appear in order in target
function fuzzyMatch(str, query) {
  if (!query) return true;
  str = str.toLowerCase();
  query = query.toLowerCase();
  let si = 0;
  for (let qi = 0; qi < query.length; qi++) {
    si = str.indexOf(query[qi], si);
    if (si === -1) return false;
    si++;
  }
  return true;
}

function scoreMatch(tool, query) {
  if (!query) return 1;
  const q = query.toLowerCase();
  // Exact substring = highest score
  if (tool.name?.toLowerCase().includes(q)) return 3;
  if (tool.tagline?.toLowerCase().includes(q)) return 2;
  if (tool.description?.toLowerCase().includes(q)) return 1.5;
  if (tool.tags?.some((t) => t.toLowerCase().includes(q))) return 1.2;
  // Fuzzy fallback
  if (fuzzyMatch(tool.name || "", query)) return 1;
  if (fuzzyMatch(tool.tagline || "", query)) return 0.8;
  if (fuzzyMatch(tool.description || "", query)) return 0.5;
  return 0;
}

export default function Marketplace() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [pricingFilter, setPricingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTool, setSelectedTool] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [vibeTags, setVibeTags] = useState([]);
  const [userUpvotedIds, setUserUpvotedIds] = useState([]);
  const [savedToolIds, setSavedToolIds] = useState([]);

  useEffect(() => {
    const init = async () => {
      const toolsData = await db.entities.Tool.filter({ status: "approved" }, "-created_date", 200);
      setTools(toolsData);
      setLoading(false);
      const isAuth = await db.auth.isAuthenticated();
      if (isAuth) {
        const [upvotes, savedItems] = await Promise.all([
          db.entities.Upvote.filter({}, "-created_date", 500),
          db.entities.SavedTool.list("-created_date", 500),
        ]);
        setUserUpvotedIds(upvotes.map((u) => u.tool_id));
        setSavedToolIds(savedItems.map((s) => s.tool_id));
      }
    };
    init();
  }, []);

  const featuredTool = tools.find((t) => t.featured);

  const filtered = useMemo(() => {
    return tools
      .map((t) => ({ tool: t, score: scoreMatch(t, search) }))
      .filter(({ tool: t, score }) => {
        if (score === 0) return false;
        const catMatch = categories.length === 0 || categories.includes(t.category);
        const priceMatch =
          pricingFilter === "all" ||
          (pricingFilter === "free" && (t.pricing_model === "free" || t.pricing_model === "open-source")) ||
          (pricingFilter === "freemium" && t.pricing_model === "freemium") ||
          (pricingFilter === "paid" && (t.pricing_model === "subscription" || t.pricing_model === "one-time")) ||
          (pricingFilter === "free_trial" && t.has_free_trial);
        const tagMatch =
          vibeTags.length === 0 ||
          vibeTags.some((vt) =>
            t.tags?.some((tag) => tag.toLowerCase().includes(vt)) ||
            t.category?.toLowerCase().includes(vt) ||
            t.name?.toLowerCase().includes(vt) ||
            t.tagline?.toLowerCase().includes(vt) ||
            t.description?.toLowerCase().includes(vt) ||
            (vt === "free" && (t.pricing_model === "free" || t.pricing_model === "open-source" || t.has_free_trial)) ||
            (vt === "open-source" && t.pricing_model === "open-source")
          );
        return catMatch && priceMatch && tagMatch;
      })
      .sort((a, b) => {
        if (search) return b.score - a.score;
        if (sortBy === "newest") return new Date(b.tool.created_at) - new Date(a.tool.created_at);
        if (sortBy === "popular") return (b.tool.views || 0) - (a.tool.views || 0);
        if (sortBy === "upvoted") return (b.tool.upvotes || 0) - (a.tool.upvotes || 0);
        return 0;
      })
      .map(({ tool }) => tool);
  }, [tools, search, categories, pricingFilter, sortBy]);

  const hasActiveFilters = categories.length > 0 || pricingFilter !== "all" || search || vibeTags.length > 0;

  const toggleVibeTag = (tag) =>
    setVibeTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  return (
    <div className="relative min-h-screen font-space">
      <ParticleBackground />

      {selectedTool && (
        <ToolModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
          savedToolIds={savedToolIds}
          onSaveToggle={(id, isSaving) =>
            setSavedToolIds((prev) => isSaving ? [...prev, id] : prev.filter((s) => s !== id))
          }
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <Badge className="bg-primary/10 border-primary/30 text-primary border mb-3 font-mono text-xs uppercase tracking-wider">
            Marketplace
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Explore <span className="gradient-text">Vibe-Built Tools</span>
          </h1>
          <p className="text-muted-foreground mt-2">Discover the best AI-powered tools, apps & systems.</p>
        </div>

        {/* Featured */}
        {featuredTool && !search && categories.length === 0 && (
          <div className="mb-10">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">✦ Featured</p>
            <FeaturedHero tool={featuredTool} />
          </div>
        )}

        {/* Search + toggle filters */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Fuzzy search — tools, descriptions, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border/60 rounded-xl pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-all duration-200 ${showFilters || hasActiveFilters ? "bg-primary/20 border-primary/60 text-primary" : "glass border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="glass rounded-xl border border-border/60 p-4 mb-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">PRICE</span>
                <Select value={pricingFilter} onValueChange={setPricingFilter}>
                  <SelectTrigger className="w-36 bg-surface border-border/60 text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-border">
                    {PRICING_FILTERS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">SORT</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36 bg-surface border-border/60 text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-border">
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Viewed</SelectItem>
                    <SelectItem value="upvoted">Most Upvoted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-mono mb-2 block">CATEGORIES (multi-select)</span>
              <CategoryFilter selected={categories} onChange={setCategories} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-mono mb-2 flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> VIBE TAGS
              </span>
              <div className="flex flex-wrap gap-2">
                {VIBE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleVibeTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all font-mono ${
                      vibeTags.includes(tag)
                        ? "bg-primary/20 border-primary/50 text-primary"
                        : "border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {!showFilters && (
          <div className="mb-4">
            <CategoryFilter selected={categories} onChange={setCategories} />
          </div>
        )}

        {/* Results count */}
        <div className="mb-6 flex items-center gap-3 text-sm text-muted-foreground font-mono">
          {!loading && (
            <>
              <span>{filtered.length} tool{filtered.length !== 1 ? "s" : ""} found</span>
              {search && <span className="text-primary/60">for "{search}"</span>}
              {hasActiveFilters && (
                <button onClick={() => { setSearch(""); setCategories([]); setPricingFilter("all"); setVibeTags([]); }}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <PackageSearch className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No tools found. Try a different filter or search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onClick={() => setSelectedTool(tool)}
                userUpvotedIds={userUpvotedIds}
                onUpvote={(id) => setUserUpvotedIds((prev) => [...prev, id])}
                savedToolIds={savedToolIds}
                onSaveToggle={(id, isSaving) =>
                  setSavedToolIds((prev) => isSaving ? [...prev, id] : prev.filter((s) => s !== id))
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}