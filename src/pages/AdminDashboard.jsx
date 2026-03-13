import db from '@/api/base44Client';

import { useState, useEffect } from "react";

import ParticleBackground from "@/components/ui/ParticleBackground";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, XCircle, Clock, Users, Package, CreditCard, Star, Loader2, Eye } from "lucide-react";

const STATUS_CONFIG = {
  pending:  { icon: Clock,       color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/30" },
  approved: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  rejected: { icon: XCircle,     color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30"    },
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [tools, setTools] = useState([]);
  const [users, setUsers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const u = await db.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
      const [t, us, s] = await Promise.all([
        db.entities.Tool.list("-created_date", 200),
        db.entities.User.list(),
        db.entities.Subscription.list("-created_date", 200),
      ]);
      setTools(t);
      setUsers(us);
      setSubs(s);
      setLoading(false);
    };
    init();
  }, []);

  const updateToolStatus = async (id, status) => {
    setActionId(id);
    const updated = await db.entities.Tool.update(id, { status });
    setTools((ts) => ts.map((t) => t.id === id ? updated : t));
    setActionId(null);
  };

  const toggleFeatured = async (tool) => {
    setActionId(tool.id);
    const updated = await db.entities.Tool.update(tool.id, { featured: !tool.featured });
    setTools((ts) => ts.map((t) => t.id === tool.id ? updated : t));
    setActionId(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  if (!user || user.role !== "admin") return (
    <div className="flex items-center justify-center min-h-screen text-muted-foreground">
      Access denied — admin only.
    </div>
  );

  const pending = tools.filter((t) => t.status === "pending");
  const approved = tools.filter((t) => t.status === "approved");
  const activeSubs = subs.filter((s) => s.status === "active");

  const STATS = [
    { label: "Pending Reviews", value: pending.length, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Live Tools",     value: approved.length, icon: Package, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Users",    value: users.length,   icon: Users,   color: "text-cyan-400",    bg: "bg-cyan-500/10" },
    { label: "Active Subs",    value: activeSubs.length, icon: CreditCard, color: "text-violet-400", bg: "bg-violet-500/10" },
  ];

  return (
    <div className="relative min-h-screen font-space">
      <ParticleBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Badge className="bg-primary/10 border-primary/30 text-primary border mb-3 font-mono text-xs uppercase tracking-wider">Admin</Badge>
          <h1 className="text-3xl font-bold text-foreground">Control Center</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {STATS.map((s) => (
            <div key={s.label} className="glass rounded-xl border border-border/60 p-5">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="listings">
          <TabsList className="bg-surface border border-border/60 mb-6">
            <TabsTrigger value="listings" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Listings
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Users
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Subscriptions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <div className="flex flex-col gap-3">
              {tools.map((tool) => {
                const s = STATUS_CONFIG[tool.status] || STATUS_CONFIG.pending;
                return (
                  <div key={tool.id} className="glass rounded-xl border border-border/60 p-4 flex items-center gap-4 flex-wrap">
                    <div className={`p-2 rounded-lg ${s.bg} flex-shrink-0`}>
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{tool.name}</span>
                        <Badge className={`${s.bg} ${s.border} ${s.color} border text-[10px] font-mono uppercase`}>{tool.status}</Badge>
                        {tool.featured && <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0 text-[10px]">Featured</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{tool.created_by} · {tool.category}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Star className="w-3 h-3" />
                        <Switch checked={!!tool.featured} onCheckedChange={() => toggleFeatured(tool)} disabled={actionId === tool.id} />
                      </div>
                      <a href={tool.link} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                      {tool.status !== "approved" && (
                        <Button size="sm" onClick={() => updateToolStatus(tool.id, "approved")} disabled={actionId === tool.id}
                          className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3">
                          {actionId === tool.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                          Approve
                        </Button>
                      )}
                      {tool.status !== "rejected" && (
                        <Button size="sm" variant="outline" onClick={() => updateToolStatus(tool.id, "rejected")} disabled={actionId === tool.id}
                          className="h-8 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs px-3">
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="flex flex-col gap-3">
              {users.map((u) => (
                <div key={u.id} className="glass rounded-xl border border-border/60 p-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {u.full_name?.[0] || u.email?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{u.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <Badge className="border border-border/60 text-muted-foreground text-xs">{u.role}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subscriptions">
            <div className="flex flex-col gap-3">
              {subs.map((s) => {
                const active = s.status === "active";
                return (
                  <div key={s.id} className="glass rounded-xl border border-border/60 p-4 flex items-center gap-4 flex-wrap">
                    <div className={`p-2 rounded-lg ${active ? "bg-emerald-500/10" : "bg-muted"} flex-shrink-0`}>
                      <CreditCard className={`w-4 h-4 ${active ? "text-emerald-400" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{s.created_by}</span>
                        <Badge className={`border text-[10px] font-mono uppercase ${active ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-muted border-border text-muted-foreground"}`}>{s.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.plan} · ${s.amount_paid} · {s.start_date} → {s.end_date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}