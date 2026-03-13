import { useState } from "react";
import { X, Zap, Check, Lock, Loader2, Star, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: 10,
    display: "$10",
    yearlyTotal: "$120",
    period: "/mo",
    billed: "Billed monthly — cancel anytime",
    features: ["1 tool listing", "Creator profile", "Basic analytics", "Cancel anytime"],
  },
  {
    id: "annual",
    name: "Annual",
    price: 84,
    display: "$7",
    yearlyTotal: "$84",
    period: "/mo",
    billed: "Billed $84/year",
    badge: "Best Value",
    saving: "Save $36/yr",
    features: ["1 tool listing", "Creator profile", "Priority analytics", "Featured placement boost"],
  },
];

export default function SubscriptionModal({ onClose, user }) {
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const plan = PLANS.find((p) => p.id === selectedPlan);

  const handlePay = async () => {
    if (!user) {
      window.location.href = `/Login?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }

    setError("");
    setProcessing(true);

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          userEmail: user.email,
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong. Please try again.");
        setProcessing(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative glass rounded-2xl border border-border/60 w-full max-w-md shadow-2xl overflow-hidden">
        {/* Gradient top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="mb-5">
            <Badge className="bg-primary/10 border-primary/30 text-primary border mb-2 text-xs font-mono uppercase">
              Creator Plan
            </Badge>
            <h2 className="text-xl font-bold text-foreground">Choose your plan</h2>
            <p className="text-sm text-muted-foreground mt-0.5">List your tools. Reach the builder community.</p>
          </div>

          <div className="flex flex-col gap-3 mb-5">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`relative rounded-xl border p-4 text-left transition-all ${
                  selectedPlan === p.id
                    ? "border-primary/50 bg-primary/5 shadow-[0_0_24px_rgba(124,58,237,0.12)]"
                    : "border-border/60 hover:border-primary/30"
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-2.5 right-4">
                    <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0 text-[10px] font-mono uppercase px-2.5">
                      <Star className="w-2 h-2 mr-1" /> {p.badge}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-2xl font-bold text-foreground">{p.display}</span>
                      <span className="text-muted-foreground text-sm">{p.period}</span>
                      {p.saving && (
                        <Badge className="ml-1 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 border text-[10px]">
                          {p.saving}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.billed}</p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                      selectedPlan === p.id ? "border-primary bg-primary" : "border-border"
                    }`}
                  />
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2.5">
                  {p.features.map((f) => (
                    <span key={f} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-primary flex-shrink-0" /> {f}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <Button
            onClick={handlePay}
            disabled={processing}
            className="w-full bg-primary hover:bg-primary/90 glow-purple"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting to payment…
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                {user
                  ? `Pay ${selectedPlan === "monthly" ? "$10/mo" : "$84/yr"} — Secure Checkout`
                  : "Sign In to Continue"}
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 mt-3">
            <Shield className="w-3 h-3 text-muted-foreground" />
            <p className="text-center text-[11px] text-muted-foreground">
              Payments secured by <span className="text-foreground font-medium">Stripe</span> — we never store your card details
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
