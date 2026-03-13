import db from '@/api/base44Client';

import { useState, useEffect } from "react";

import ParticleBackground from "@/components/ui/ParticleBackground";
import ToolCard from "@/components/marketplace/ToolCard";
import ToolModal from "@/components/marketplace/ToolModal";
import SubscriptionModal from "@/components/marketplace/SubscriptionModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Twitter, Github, Zap, User, ExternalLink, Clock } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function CreatorProfile() {
  const params = new URLSearchParams(window.location.search);
  const creatorEmail = params.get("creator");

  const [viewer, setViewer] = useState(null);
  const [profile, setProfile] = useState(null);
  const [approvedTools, setApprovedTools] = useState([]);
  const [pendingTools, setPendingTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [activeTab, setActiveTab] = useState("published");

  useEffect(() => {
    if (!creatorEmail) { setNotFound(true); setLoading(false); return; }
    const init = async () => {
      const [isAuth] = await Promise.all([db.auth.isAuthenticated()]);
      if (isAuth) {
        const me = await db.auth.me();
        setViewer(me);
      }

      const [profiles, approved, pending] = await Promise.all([
        db.entities.CreatorProfile.filter({ created_by: creatorEmail }),
        db.entities.Tool.filter({ created_by: creatorEmail, status: "approved" }, "-created_date"),
        db.entities.Tool.filter({ created_by: creatorEmail, status: "pending" }, "-created_date"),
      ]);

      if (!profiles[0]) { setNotFound(true); setLoading(false); return; }
      setProfile(profiles[0]);
      setApprovedTools(approved);
      setPendingTools(pending);
      setLoading(false);
    };
    init();
  }, [creatorEmail]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Zap className="w-12 h-12 text-muted-foreground/30" />
      <p className="text-muted-foreground">Creator not found.</p>
    </div>
  );

  const handle = creatorEmail?.split("@")[0];
  const isOwner = viewer?.email === creatorEmail;
  const totalUpvotes = approvedTools.reduce((s, t) => s + (t.upvotes || 0), 0);
  const totalViews = approvedTools.reduce((s, t) => s + (t.views || 0), 0);

  const tabs = [
    { id: "published", label: "Published", count: approvedTools.length },
    { id: "pending", label: "Pending Review", count: pendingTools.length, ownerOnly: true },
  ].filter((t) => !t.ownerOnly || isOwner);

  const displayTools = activeTab === "pending" ? pendingTools : approvedTools;

  return (
    <div className="relative min-h-screen font-space">
      <ParticleBackground />

      {selectedTool && <ToolModal tool={selectedTool} onClose={() => setSelectedTool(null)} />}
      {showSubModal && (
        <SubscriptionModal
          user={viewer}
          profile={profile}
          onClose={() => setShowSubModal(false)}
          onSuccess={() => setShowSubModal(false)}
        />
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">

        {/* Hero / Profile card */}
        <div className="glass rounded-2xl border border-border/60 overflow-hidden mb-8">
          {/* Cover gradient */}
          <div className="h-28 bg-gradient-to-br from-violet-900/60 via-purple-800/40 to-cyan-900/40 relative">
            <div className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(124,58,237,0.2), transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(6,182,212,0.15), transparent 60%)"
              }}
            />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-10 mb-4 flex-wrap gap-3">
              <div className="ring-4 ring-background rounded-2xl">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={handle}
                    className="w-20 h-20 rounded-2xl object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <User className="w-9 h-9 text-primary/60" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isOwner && (
                  <a href={createPageUrl("CreatorDashboard")}>
                    <Button variant="outline" size="sm" className="border-border/60 text-muted-foreground hover:text-foreground text-xs h-8">
                      Edit Profile
                    </Button>
                  </a>
                )}
                {isOwner && profile?.subscription_status !== "active" && (
                  <Button
                    size="sm"
                    onClick={() => setShowSubModal(true)}
                    className="bg-primary hover:bg-primary/90 text-white text-xs h-8"
                  >
                    <Zap className="w-3 h-3 mr-1" /> Upgrade Plan
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold gradient-text">@{handle}</h1>
                  <Badge className="bg-primary/10 border-primary/30 text-primary border text-[10px] font-mono uppercase">
                    {profile.subscription_plan || "creator"}
                  </Badge>
                  {profile.subscription_status === "active" && (
                    <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 border text-[10px] font-mono">
                      ✦ Active
                    </Badge>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mt-2">
                    {profile.bio}
                  </p>
                )}

                {/* Social links */}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Globe className="w-3.5 h-3.5" />
                      {profile.website.replace(/^https?:\/\//, "")}
                      <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                      <Twitter className="w-3.5 h-3.5" /> @{profile.twitter}
                    </a>
                  )}
                  {profile.github && (
                    <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Github className="w-3.5 h-3.5" /> {profile.github}
                    </a>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-5 sm:flex-col sm:gap-3 sm:text-right flex-shrink-0">
                <StatItem value={approvedTools.length} label="Tools" />
                <StatItem value={totalUpvotes} label="Upvotes" />
                <StatItem value={totalViews} label="Views" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="flex gap-1 mb-5 bg-surface rounded-xl p-1 border border-border/60 w-fit">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                  activeTab === t.id
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.id === "pending" && <Clock className="w-3.5 h-3.5" />}
                {t.label}
                <span className={`text-xs rounded-md px-1.5 py-0.5 font-mono ${
                  activeTab === t.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {displayTools.length === 0 ? (
          <div className="glass rounded-xl border border-border/60 p-16 text-center">
            <Zap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {activeTab === "pending" ? "No tools pending review." : "No published tools yet."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayTools.map((tool) => (
              <div key={tool.id} className="relative">
                {activeTab === "pending" && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-amber-500/15 border-amber-500/40 text-amber-400 border text-[10px] font-mono uppercase">
                      Pending
                    </Badge>
                  </div>
                )}
                <ToolCard tool={tool} onClick={() => setSelectedTool(tool)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ value, label }) {
  return (
    <div>
      <p className="text-xl font-bold gradient-text leading-none">{value}</p>
      <p className="text-xs text-muted-foreground font-mono uppercase mt-0.5">{label}</p>
    </div>
  );
}