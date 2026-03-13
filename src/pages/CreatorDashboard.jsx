import db from '@/api/base44Client';

import { useState, useEffect } from "react";

import ParticleBackground from "@/components/ui/ParticleBackground";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, CheckCircle, Clock, XCircle, Zap, Edit, Trash2, AlertCircle, BarChart2, Upload, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CreatorMetrics from "@/components/dashboard/CreatorMetrics";
import { createPageUrl } from "@/utils";

const CATEGORIES = ["productivity","ai-ml","dev-tools","design","marketing","finance","education","automation","communication","security"];
const PRICING_MODELS = ["free","freemium","one-time","subscription","open-source"];

const STATUS_CONFIG = {
  pending:  { icon: Clock,        color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", label: "Pending Review" },
  approved: { icon: CheckCircle,  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Approved" },
  rejected: { icon: XCircle,      color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30",    label: "Rejected" },
};

const EMPTY_FORM = { name: "", tagline: "", description: "", link: "", image_url: "", category: "ai-ml", subcategory: "", tags: [], pricing_model: "free", price: "", has_discount: false, discount_percentage: "", original_price: "", has_free_trial: false, free_trial_days: "" };

export default function CreatorDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [savedTools, setSavedTools] = useState([]);
  const [upvoteHistory, setUpvoteHistory] = useState([]);

  useEffect(() => {
    const init = async () => {
      const isAuth = await db.auth.isAuthenticated();
      if (!isAuth) { db.auth.redirectToLogin(window.location.href); return; }
      const u = await db.auth.me();
      setUser(u);
      const [profiles, myTools] = await Promise.all([
        db.entities.CreatorProfile.filter({ created_by: u.email }),
        db.entities.Tool.filter({ created_by: u.email }, "-created_date"),
      ]);
      if (profiles[0]) setProfile(profiles[0]);
      setTools(myTools);
      setLoading(false);
      // Fetch engagement data for analytics (non-blocking)
      if (myTools.length > 0) {
        const toolIds = myTools.map((t) => t.id);
        const [savedList, upvoteList] = await Promise.all([
          db.entities.SavedTool.list("-created_date", 500),
          db.entities.Upvote.list("-created_date", 500),
        ]);
        setSavedTools(savedList.filter((s) => toolIds.includes(s.tool_id)));
        setUpvoteHistory(upvoteList.filter((u2) => toolIds.includes(u2.tool_id)));
      }
    };
    init();
  }, []);

  const isActive = profile?.subscription_status === "active";
  const listingLimit = 1 + (profile?.extra_listings || 0);
  const approvedTools = tools.filter((t) => t.status === "approved").length;
  const canAddMore = tools.length < listingLimit;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (tool) => {
    setEditingId(tool.id);
    setForm({ ...EMPTY_FORM, ...tool, tags: tool.tags || [] });
    setTagInput("");
    setShowForm(true);
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIcon(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    set("image_url", file_url);
    setUploadingIcon(false);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const removeTag = (tag) => set("tags", form.tags.filter((t) => t !== tag));

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, price: form.price ? Number(form.price) : undefined, discount_percentage: form.discount_percentage ? Number(form.discount_percentage) : undefined, original_price: form.original_price ? Number(form.original_price) : undefined, free_trial_days: form.free_trial_days ? Number(form.free_trial_days) : undefined, status: editingId ? form.status : "pending" };
    if (editingId) {
      const updated = await db.entities.Tool.update(editingId, payload);
      setTools((ts) => ts.map((t) => t.id === editingId ? updated : t));
    } else {
      const created = await db.entities.Tool.create(payload);
      setTools((ts) => [created, ...ts]);
    }
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    await db.entities.Tool.delete(id);
    setTools((ts) => ts.filter((t) => t.id !== id));
    setDeleting(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="relative min-h-screen font-space">
      <ParticleBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Creator Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your tool listings</p>
          </div>
          {isActive ? (
            <Button onClick={openNew} disabled={!canAddMore} className="bg-primary hover:bg-primary/90 glow-purple">
              <Plus className="w-4 h-4 mr-2" /> Add Tool
            </Button>
          ) : (
            <a href={createPageUrl("CreatorSignup")}>
              <Button className="bg-primary hover:bg-primary/90">Subscribe to List</Button>
            </a>
          )}
        </div>

        {/* Status Bar */}
        <div className="glass rounded-xl border border-border/60 p-5 mb-8 flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Subscription</p>
            {isActive ? (
              <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 border text-xs">Active — {profile.subscription_plan}</Badge>
            ) : (
              <Badge className="bg-red-500/10 border-red-500/30 text-red-400 border text-xs">Inactive</Badge>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Listings</p>
            <p className="text-sm font-semibold text-foreground">{tools.length} / {listingLimit}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Live Tools</p>
            <p className="text-sm font-semibold text-emerald-400">{approvedTools}</p>
          </div>
          {isActive && !canAddMore && (
            <div className="flex items-center gap-2 text-xs text-amber-400 ml-auto self-center">
              <AlertCircle className="w-3.5 h-3.5" /> Listing limit reached — upgrade for more
            </div>
          )}
        </div>

        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="bg-surface border border-border/60 mb-6">
            <TabsTrigger value="listings" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Listings
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <BarChart2 className="w-3.5 h-3.5 mr-1.5" /> Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <CreatorMetrics tools={tools} savedTools={savedTools} upvoteHistory={upvoteHistory} />
          </TabsContent>

          <TabsContent value="listings">
            {/* Tool Form */}
            {showForm && (
          <div className="glass rounded-xl border border-primary/30 p-6 mb-8">
            <h2 className="font-semibold text-foreground mb-5">{editingId ? "Edit Tool" : "New Tool Listing"}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Tool Name *</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="My Awesome Tool" className="bg-surface border-border/60" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Link *</Label>
                <Input value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="https://..." className="bg-surface border-border/60" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label>Tagline</Label>
                <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="One killer sentence about your tool" className="bg-surface border-border/60" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What does it do? Who is it for?" rows={3} className="bg-surface border-border/60 resize-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger className="bg-surface border-border/60"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface border-border">
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Subcategory</Label>
                <Input value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)} placeholder="e.g. Image Generation" className="bg-surface border-border/60" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Pricing Model</Label>
                <Select value={form.pricing_model} onValueChange={(v) => set("pricing_model", v)}>
                  <SelectTrigger className="bg-surface border-border/60"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface border-border">
                    {PRICING_MODELS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Price ($)</Label>
                <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0" className="bg-surface border-border/60" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Tool Icon / Image</Label>
                <div className="flex gap-2 items-center">
                  <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-surface border border-border/60 rounded-lg text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all">
                    {uploadingIcon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploadingIcon ? "Uploading..." : "Upload Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleIconUpload} disabled={uploadingIcon} />
                  </label>
                  {form.image_url && (
                    <img src={form.image_url} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-border/60" />
                  )}
                </div>
                <Input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="Or paste image URL" className="bg-surface border-border/60 text-xs" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Type a tag and press Enter"
                    className="bg-surface border-border/60 flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTag} className="border-border/60 h-9">Add</Button>
                </div>
                {form.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {form.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-xs rounded-lg px-2 py-0.5 font-mono">
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Switch checked={form.has_discount} onCheckedChange={(v) => set("has_discount", v)} />
                  <Label>Discount</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.has_free_trial} onCheckedChange={(v) => set("has_free_trial", v)} />
                  <Label>Free Trial</Label>
                </div>
              </div>
              {form.has_discount && (
                <div className="flex gap-3 md:col-span-2">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Label>Discount %</Label>
                    <Input type="number" value={form.discount_percentage} onChange={(e) => set("discount_percentage", e.target.value)} className="bg-surface border-border/60" />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Label>Original Price</Label>
                    <Input type="number" value={form.original_price} onChange={(e) => set("original_price", e.target.value)} className="bg-surface border-border/60" />
                  </div>
                </div>
              )}
              {form.has_free_trial && (
                <div className="flex flex-col gap-1.5">
                  <Label>Free Trial Days</Label>
                  <Input type="number" value={form.free_trial_days} onChange={(e) => set("free_trial_days", e.target.value)} className="bg-surface border-border/60" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleSave} disabled={saving || !form.name || !form.link} className="bg-primary hover:bg-primary/90">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingId ? "Save Changes" : "Submit for Review"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-border/60">Cancel</Button>
            </div>
            </div>
            )}

            {/* Tools List */}
            {tools.length === 0 ? (
              <div className="glass rounded-xl border border-border/60 p-12 text-center">
                <Zap className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">No tools yet. {isActive ? "Add your first listing!" : "Subscribe to start listing."}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {tools.map((tool) => {
                  const s = STATUS_CONFIG[tool.status] || STATUS_CONFIG.pending;
                  return (
                    <div key={tool.id} className="glass rounded-xl border border-border/60 p-5 flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${s.bg} flex-shrink-0`}>
                        <s.icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground truncate">{tool.name}</h3>
                          <Badge className={`${s.bg} ${s.border} ${s.color} border text-[10px] font-mono uppercase`}>{s.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{tool.link}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(tool)} className="h-8 w-8 p-0 hover:text-primary">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(tool.id)} disabled={deleting === tool.id} className="h-8 w-8 p-0 hover:text-destructive">
                          {deleting === tool.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}