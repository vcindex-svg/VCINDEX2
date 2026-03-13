import db from '@/api/base44Client';

import { useState, useEffect } from "react";

import ParticleBackground from "@/components/ui/ParticleBackground";
import SubscriptionModal from "@/components/marketplace/SubscriptionModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";

const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$10",
    period: "/month",
    billed: "Billed monthly — cancel anytime",
    badge: null,
    features: ["1 tool listing", "Creator profile", "Basic analytics", "Cancel anytime"],
  },
  {
    id: "annual",
    name: "Annual",
    price: "$7",
    period: "/month",
    billed: "Billed $84/year (save $36)",
    badge: "Best Value",
    features: ["1 tool listing", "Creator profile", "Priority analytics", "Featured placement boost", "Priority support"],
    saving: "Save $36/yr",
  },
];

export default function CreatorSignup() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const init = async () => {
      const isAuth = await db.auth.isAuthenticated();
      if (!isAuth) { setLoading(false); return; }
      const u = await db.auth.me();
      setUser(u);
      const profiles = await db.entities.CreatorProfile.filter({ created_by: u.email });
      if (profiles.length > 0) setProfile(profiles[0]);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const isActive = profile?.subscription_status === "active" || subscribed;

  return (
    <div className="relative min-h-screen font-space">
      <ParticleBackground />

      {showModal && (
        <SubscriptionModal
          user={user}
          profile={profile}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setSubscribed(true); setShowModal(false); }}
        />
      )}

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge className="bg-primary/10 border-primary/30 text-primary border mb-4 font-mono text-xs uppercase tracking-wider">
            Creator Plan
          </Badge>
          <h1 className="text-4xl font-bold gradient-text mb-3">List Your Tool</h1>
          <p className="text-muted-foreground">Join the marketplace. Reach builders worldwide.</p>
        </div>

        {isActive ? (
          <div className="glass rounded-2xl border border-emerald-500/30 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {subscribed ? "You're in!" : "Already Subscribed"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {subscribed
                ? "Your creator account is active. Start listing your tool now."
                : `Your ${profile?.subscription_plan} plan is active until ${profile?.subscription_end_date}.`}
            </p>
            <a href={createPageUrl("CreatorDashboard")}>
              <Button className="bg-primary hover:bg-primary/90 glow-purple">Go to Dashboard</Button>
            </a>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-5 mb-8">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-6 flex flex-col gap-4 ${
                    plan.badge
                      ? "border-primary/40 bg-primary/5 shadow-[0_0_30px_rgba(124,58,237,0.12)]"
                      : "glass border-border/60"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0 px-4 text-xs font-mono uppercase">
                        <Zap className="w-2.5 h-2.5 mr-1" /> {plan.badge}
                      </Badge>
                    </div>
                  )}
                  <span className="font-mono text-sm text-muted-foreground uppercase tracking-wide">{plan.name}</span>
                  <div>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground mb-1 text-sm">{plan.period}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.billed}</p>
                    {plan.saving && (
                      <Badge className="mt-1 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 border text-xs">{plan.saving}</Badge>
                    )}
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setShowModal(true)}
              className="w-full bg-primary hover:bg-primary/90 glow-purple text-white py-3 h-auto text-base font-semibold"
            >
              <Zap className="w-4 h-4 mr-2" />
              Get Started — Choose Your Plan
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Secure checkout. Cancel anytime. No hidden fees.
            </p>
          </>
        )}
      </div>
    </div>
  );
}