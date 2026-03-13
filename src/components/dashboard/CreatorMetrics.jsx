import { useMemo } from "react";
import ToolSwapCard from "@/components/dashboard/ToolSwapCard";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Eye, ThumbsUp, TrendingUp, Zap, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, subDays, eachDayOfInterval } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-border/60 rounded-lg px-3 py-2 text-xs">
      <p className="text-foreground font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function CreatorMetrics({ tools, savedTools = [], upvoteHistory = [] }) {
  const approved = tools.filter((t) => t.status === "approved");

  const stats = useMemo(() => {
    const totalViews = tools.reduce((s, t) => s + (t.views || 0), 0);
    const totalUpvotes = tools.reduce((s, t) => s + (t.upvotes || 0), 0);
    const totalBookmarks = savedTools.length;
    const avgCTR = totalViews > 0 ? ((totalUpvotes / totalViews) * 100).toFixed(1) : "0.0";
    return { totalViews, totalUpvotes, avgCTR, liveTool: approved.length, totalBookmarks };
  }, [tools, approved, savedTools]);

  // Build 30-day trend using upvote + saved timestamps
  const trendData = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({ start: subDays(today, 29), end: today });
    return days.map((day) => {
      const label = format(day, "MMM d");
      const dayStr = format(day, "yyyy-MM-dd");
      const upvotes = upvoteHistory.filter((u) => u.created_at?.startsWith(dayStr)).length;
      const bookmarks = savedTools.filter((s) => s.created_at?.startsWith(dayStr)).length;
      return { label, Upvotes: upvotes, Bookmarks: bookmarks };
    });
  }, [upvoteHistory, savedTools]);

  const chartData = tools.map((t) => ({
    name: t.name?.length > 12 ? t.name.slice(0, 12) + "…" : t.name,
    Views: t.views || 0,
    Upvotes: t.upvotes || 0,
    status: t.status,
  }));

  const maxViews = Math.max(...tools.map((t) => t.views || 0), 1);

  const STAT_CARDS = [
    { label: "Total Impressions", value: stats.totalViews.toLocaleString(), icon: Eye,        color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20" },
    { label: "Total Upvotes",     value: stats.totalUpvotes,                icon: ThumbsUp,   color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20" },
    { label: "Bookmarks",         value: stats.totalBookmarks,              icon: Bookmark,   color: "text-pink-400",    bg: "bg-pink-500/10",    border: "border-pink-500/20" },
    { label: "Live Tools",        value: stats.liveTool,                    icon: Zap,        color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Tool Swap Card */}
      {tools.length > 0 && <ToolSwapCard tools={tools} />}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className={`glass rounded-xl border ${s.border} p-4`}>
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 30-day trend chart */}
      <div className="glass rounded-xl border border-border/60 p-5">
        <p className="text-sm font-semibold text-foreground mb-1">30-Day Engagement Trend</p>
        <p className="text-xs text-muted-foreground mb-4 font-mono">Upvotes & Bookmarks over time</p>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="upvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bmkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={6}
              />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(124,58,237,0.2)", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="Upvotes" stroke="#7c3aed" strokeWidth={2} fill="url(#upvGrad)" dot={false} />
              <Area type="monotone" dataKey="Bookmarks" stroke="#ec4899" strokeWidth={2} fill="url(#bmkGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-tool bar chart */}
      {tools.length > 0 && (
        <div className="glass rounded-xl border border-border/60 p-5">
          <p className="text-sm font-semibold text-foreground mb-4">Impressions & Upvotes per Tool</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2}>
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.06)" }} />
                <Bar dataKey="Views" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.status === "approved" ? "#7c3aed" : "#4b5563"} />
                  ))}
                </Bar>
                <Bar dataKey="Upvotes" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per-tool table */}
      {tools.length > 0 && (
        <div className="glass rounded-xl border border-border/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <p className="text-sm font-semibold text-foreground">Tool Performance</p>
          </div>
          <div className="divide-y divide-border/30">
            {tools.map((tool) => {
              const ctr = tool.views > 0 ? ((tool.upvotes / tool.views) * 100).toFixed(1) : "0.0";
              const barWidth = ((tool.views || 0) / maxViews) * 100;
              const toolBookmarks = savedTools.filter((s) => s.tool_id === tool.id).length;
              return (
                <div key={tool.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">{tool.name}</p>
                      {tool.status === "approved" && (
                        <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 border text-[10px]">Live</Badge>
                      )}
                      {tool.status === "pending" && (
                        <Badge className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400 border text-[10px]">Pending</Badge>
                      )}
                    </div>
                    <div className="w-full bg-border/30 rounded-full h-1">
                      <div className="h-1 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${barWidth}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
                    <div className="text-center">
                      <p className="text-foreground font-semibold">{(tool.views || 0).toLocaleString()}</p>
                      <p>views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-foreground font-semibold">{tool.upvotes || 0}</p>
                      <p>upvotes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-pink-400 font-semibold">{toolBookmarks}</p>
                      <p>saves</p>
                    </div>
                    <div className="text-center">
                      <p className="text-emerald-400 font-semibold">{ctr}%</p>
                      <p>CTR</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tools.length === 0 && (
        <div className="glass rounded-xl border border-border/60 p-12 text-center">
          <TrendingUp className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No tools yet — add your first listing to see analytics.</p>
        </div>
      )}
    </div>
  );
}