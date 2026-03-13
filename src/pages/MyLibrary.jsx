import db from '@/api/base44Client';

import { useState, useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, Loader2, PackageSearch, Trash2, ArrowUpRight, Plus, FolderOpen, Folder, X, Edit2, Check } from "lucide-react";
import ToolModal from "@/components/marketplace/ToolModal";
import ParticleBackground from "@/components/ui/ParticleBackground";

const COLOR_CLASSES = {
  violet:  { dot: "bg-violet-500",  ring: "ring-violet-500/40",  text: "text-violet-400",  bg: "bg-violet-500/10"  },
  cyan:    { dot: "bg-cyan-500",    ring: "ring-cyan-500/40",    text: "text-cyan-400",    bg: "bg-cyan-500/10"    },
  pink:    { dot: "bg-pink-500",    ring: "ring-pink-500/40",    text: "text-pink-400",    bg: "bg-pink-500/10"    },
  emerald: { dot: "bg-emerald-500", ring: "ring-emerald-500/40", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  amber:   { dot: "bg-amber-500",   ring: "ring-amber-500/40",   text: "text-amber-400",   bg: "bg-amber-500/10"   },
  blue:    { dot: "bg-blue-500",    ring: "ring-blue-500/40",    text: "text-blue-400",    bg: "bg-blue-500/10"    },
};
const COLORS = Object.keys(COLOR_CLASSES);

function NewCollectionForm({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("violet");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const col = await db.entities.Collection.create({ name: name.trim(), color });
    onSave(col);
  };

  return (
    <div className="glass border border-primary/30 rounded-xl p-4 mb-3">
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Collection name..."
        className="bg-surface border-border/60 text-sm mb-3"
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel(); }}
      />
      <div className="flex items-center gap-2 mb-3">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-5 h-5 rounded-full ${COLOR_CLASSES[c].dot} transition-all ${color === c ? "ring-2 ring-offset-1 ring-offset-background " + COLOR_CLASSES[c].ring + " scale-125" : ""}`}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()} className="bg-primary hover:bg-primary/90 h-7 text-xs">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 mr-1" />} Create
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="h-7 text-xs text-muted-foreground">Cancel</Button>
      </div>
    </div>
  );
}

function ToolCard({ tool, savedRecord, collections, onView, onRemove, removingId, onMoveToCollection }) {
  const [showMove, setShowMove] = useState(false);
  const currentCol = collections.find((c) => c.id === savedRecord?.collection_id);

  return (
    <div className="glass rounded-xl border border-border/60 hover:border-primary/40 transition-all group overflow-hidden flex flex-col">
      <div className="relative overflow-hidden cursor-pointer" style={{ aspectRatio: "16/9" }} onClick={() => onView(tool)}>
        {tool.image_url ? (
          <img src={tool.image_url} alt={tool.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-900/40 to-cyan-900/20 flex items-center justify-center">
            <span className="text-4xl font-mono font-bold text-primary/30">{tool.name?.[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
      </div>

      <div className="flex-1 p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-foreground text-base line-clamp-1">{tool.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 flex-1">{tool.tagline || tool.description}</p>

        {/* Move to collection */}
        {showMove ? (
          <div className="flex flex-col gap-1 text-xs">
            <button
              className="text-left px-2 py-1 rounded hover:bg-muted/40 text-muted-foreground"
              onClick={() => { onMoveToCollection(savedRecord, null); setShowMove(false); }}
            >
              — No collection (All Saved)
            </button>
            {collections.map((col) => {
              const cc = COLOR_CLASSES[col.color] || COLOR_CLASSES.violet;
              return (
                <button
                  key={col.id}
                  className="text-left px-2 py-1 rounded hover:bg-muted/40 flex items-center gap-2"
                  onClick={() => { onMoveToCollection(savedRecord, col.id); setShowMove(false); }}
                >
                  <span className={`w-2 h-2 rounded-full ${cc.dot}`} />
                  <span className="text-foreground/80">{col.name}</span>
                </button>
              );
            })}
            <button className="text-muted-foreground/50 text-xs mt-1" onClick={() => setShowMove(false)}>Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {currentCol && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${COLOR_CLASSES[currentCol.color]?.bg} ${COLOR_CLASSES[currentCol.color]?.text}`}>
                {currentCol.name}
              </span>
            )}
            <button
              className="text-[10px] text-muted-foreground/50 hover:text-primary transition-colors ml-auto"
              onClick={() => setShowMove(true)}
            >
              {currentCol ? "Move" : "+ Add to collection"}
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-border/40 mt-1">
          <Button size="sm" variant="ghost" className="flex-1 text-xs text-foreground/60 hover:text-foreground" onClick={() => onView(tool)}>
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> View
          </Button>
          <Button
            size="sm" variant="ghost"
            disabled={removingId === savedRecord?.id}
            className="text-muted-foreground hover:text-destructive"
            onClick={() => savedRecord && onRemove(savedRecord)}
          >
            {removingId === savedRecord?.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MyLibrary() {
  const [saved, setSaved] = useState([]);
  const [tools, setTools] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [activeCollection, setActiveCollection] = useState(null); // null = All Saved
  const [showNewForm, setShowNewForm] = useState(false);
  const [deletingCol, setDeletingCol] = useState(null);

  useEffect(() => {
    const init = async () => {
      const isAuth = await db.auth.isAuthenticated();
      if (!isAuth) { db.auth.redirectToLogin(window.location.href); return; }
      const [savedRecords, cols] = await Promise.all([
        db.entities.SavedTool.list("-created_date", 200),
        db.entities.Collection.list("-created_date", 100),
      ]);
      setSaved(savedRecords);
      setCollections(cols);
      if (savedRecords.length > 0) {
        const toolIds = [...new Set(savedRecords.map((s) => s.tool_id))];
        const allTools = await db.entities.Tool.list("-created_date", 500);
        setTools(allTools.filter((t) => toolIds.includes(t.id)));
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleRemove = async (savedRecord) => {
    setRemovingId(savedRecord.id);
    await db.entities.SavedTool.delete(savedRecord.id);
    setSaved((prev) => prev.filter((s) => s.id !== savedRecord.id));
    setTools((prev) => prev.filter((t) => t.id !== savedRecord.tool_id));
    setRemovingId(null);
  };

  const handleMoveToCollection = async (savedRecord, collectionId) => {
    const updated = await db.entities.SavedTool.update(savedRecord.id, { collection_id: collectionId || null });
    setSaved((prev) => prev.map((s) => s.id === savedRecord.id ? { ...s, collection_id: collectionId || null } : s));
  };

  const handleDeleteCollection = async (col) => {
    setDeletingCol(col.id);
    // Remove collection_id from all tools in it
    const toUpdate = saved.filter((s) => s.collection_id === col.id);
    await Promise.all(toUpdate.map((s) => db.entities.SavedTool.update(s.id, { collection_id: null })));
    await db.entities.Collection.delete(col.id);
    setCollections((prev) => prev.filter((c) => c.id !== col.id));
    setSaved((prev) => prev.map((s) => s.collection_id === col.id ? { ...s, collection_id: null } : s));
    if (activeCollection === col.id) setActiveCollection(null);
    setDeletingCol(null);
  };

  const visibleSavedRecords = useMemo(() => {
    if (activeCollection === null) return saved;
    if (activeCollection === "__uncategorized__") return saved.filter((s) => !s.collection_id);
    return saved.filter((s) => s.collection_id === activeCollection);
  }, [saved, activeCollection]);

  const visibleTools = useMemo(() => {
    const ids = new Set(visibleSavedRecords.map((s) => s.tool_id));
    return tools.filter((t) => ids.has(t.id));
  }, [tools, visibleSavedRecords]);

  const countForCollection = (colId) => saved.filter((s) => s.collection_id === colId).length;
  const unsortedCount = saved.filter((s) => !s.collection_id).length;

  return (
    <div className="relative min-h-screen font-space">
      <ParticleBackground />
      {selectedTool && (
        <ToolModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
          savedToolIds={saved.map((s) => s.tool_id)}
          onSaveToggle={(toolId, isSaving) => {
            if (!isSaving) {
              const rec = saved.find((s) => s.tool_id === toolId);
              if (rec) handleRemove(rec);
            }
          }}
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            My <span className="gradient-text">Library</span>
          </h1>
          <p className="text-muted-foreground mt-2">Your saved tools, organized into collections.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="flex gap-6 flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="md:w-56 flex-shrink-0">
              <div className="glass rounded-xl border border-border/60 p-3">
                {/* All saved */}
                <button
                  onClick={() => setActiveCollection(null)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${activeCollection === null ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                >
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>All Saved</span>
                  </div>
                  <span className="text-xs font-mono opacity-60">{saved.length}</span>
                </button>

                {/* Uncategorized */}
                {unsortedCount > 0 && (
                  <button
                    onClick={() => setActiveCollection("__uncategorized__")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${activeCollection === "__uncategorized__" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-3.5 h-3.5" />
                      <span>Unsorted</span>
                    </div>
                    <span className="text-xs font-mono opacity-60">{unsortedCount}</span>
                  </button>
                )}

                {collections.length > 0 && <div className="border-t border-border/40 my-2" />}

                {/* Collections */}
                {collections.map((col) => {
                  const cc = COLOR_CLASSES[col.color] || COLOR_CLASSES.violet;
                  const count = countForCollection(col.id);
                  return (
                    <div key={col.id} className="group/item flex items-center gap-1 mb-1">
                      <button
                        onClick={() => setActiveCollection(col.id)}
                        className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeCollection === col.id ? cc.bg + " " + cc.text : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cc.dot}`} />
                          <span className="truncate">{col.name}</span>
                        </div>
                        <span className="text-xs font-mono opacity-60 flex-shrink-0">{count}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(col)}
                        disabled={deletingCol === col.id}
                        className="opacity-0 group-hover/item:opacity-100 p-1 text-muted-foreground/50 hover:text-destructive transition-all"
                      >
                        {deletingCol === col.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                      </button>
                    </div>
                  );
                })}

                <div className="border-t border-border/40 mt-2 pt-2">
                  {showNewForm ? (
                    <NewCollectionForm
                      onSave={(col) => { setCollections((prev) => [col, ...prev]); setShowNewForm(false); setActiveCollection(col.id); }}
                      onCancel={() => setShowNewForm(false)}
                    />
                  ) : (
                    <button
                      onClick={() => setShowNewForm(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground/60 hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Collection
                    </button>
                  )}
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-5">
                <FolderOpen className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">
                  {activeCollection === null ? "All Saved Tools" :
                   activeCollection === "__uncategorized__" ? "Unsorted Tools" :
                   collections.find((c) => c.id === activeCollection)?.name ?? "Collection"}
                </h2>
                <span className="text-xs text-muted-foreground font-mono">({visibleTools.length})</span>
              </div>

              {visibleTools.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center">
                    <Bookmark className="w-8 h-8 text-primary/40" />
                  </div>
                  <p className="text-muted-foreground">
                    {saved.length === 0 ? "No saved tools yet." : "No tools in this collection."}
                  </p>
                  {saved.length === 0 && (
                    <a href="/Marketplace">
                      <Button size="sm" className="bg-primary hover:bg-primary/90 mt-2">Browse Marketplace</Button>
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleTools.map((tool) => {
                    const savedRecord = saved.find((s) => s.tool_id === tool.id);
                    return (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        savedRecord={savedRecord}
                        collections={collections}
                        onView={setSelectedTool}
                        onRemove={handleRemove}
                        removingId={removingId}
                        onMoveToCollection={handleMoveToCollection}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}