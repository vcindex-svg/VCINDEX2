import db from '@/api/base44Client';

import { useState } from "react";

import { X, Zap, Check, CreditCard, Lock, Loader2, Star, ArrowLeft, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

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

function formatCard(val) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}
function formatExpiry(val) {
  const clean = val.replace(/\D/g, "").slice(0, 4);
  return clean.length >= 3 ? clean.slice(0, 2) + "/" + clean.slice(2) : clean;
}

export default function SubscriptionModal({ onClose, user, profile, onSuccess }) {
  const [step, setStep] = useState("plan");
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const plan = PLANS.find((p) => p.id === selectedPlan);

  const handlePay = async () => {
    if (!cardName.trim()) { setError("Please enter the name on your card."); return; }
    if (cardNumber.replace(/\s/g, "").length < 16) { setError("Please enter a valid 16-digit card number."); return; }
    if (expiry.length < 5) { setError("Please enter a valid expiry date."); return; }
    if (cvc.length < 3) { setError("Please enter a valid CVC."); return; }

    setError("");
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1800));

    const now = new Date();
    const end = new Date(now);
    if (selectedPlan === "monthly") end.setMonth(end.getMonth() + 1);
    else end.setFullYear(end.getFullYear() + 1);

    const subData = {
      plan: selectedPlan,
      status: "active",
      amount_paid: plan.price,
      start_date: now.toISOString().split("T")[0],
      end_date: end.toISOString().split("T")[0],
      notes: "Checkout modal — awaiting manual payment confirmation",
    };

    await db.entities.Subscription.create(subData);

    const profileData = {
      subscription_plan: selectedPlan,
      subscription_status: "active",
      subscription_start_date: subData.start_date,
      subscription_end_date: subData.end_date,
    };

    if (profile) {
      await db.entities.CreatorProfile.update(profile.id, profileData);
    } else {
      await db.entities.CreatorProfile.create(profileData);
    }

    setProcessing(false);
    setStep("success");
    onSuccess?.();
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

        {/* ── SUCCESS ── */}
        {step === "success" && (
          <div className="p-8 text-center flex flex-col items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">You're a Creator!</h2>
              <p className="text-sm text-muted-foreground">
                Your <span className="text-foreground font-medium">{plan.name}</span> plan is now active.
              </p>
            </div>
            <div className="glass rounded-xl border border-emerald-500/20 p-4 w-full text-left space-y-2">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Order Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{plan.name} Creator Plan</span>
                <span className="font-semibold gradient-text">{plan.yearlyTotal}/yr</span>
              </div>
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" /> {f}
                </div>
              ))}
            </div>
            <a href={createPageUrl("CreatorDashboard")} className="w-full">
              <Button className="w-full bg-primary hover:bg-primary/90 glow-purple">
                <Zap className="w-4 h-4 mr-2" /> Go to Dashboard
              </Button>
            </a>
          </div>
        )}

        {/* ── PLAN SELECTION ── */}
        {step === "plan" && (
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

            <Button
              onClick={() =>
                user ? setStep("checkout") : db.auth.redirectToLogin(window.location.href)
              }
              className="w-full bg-primary hover:bg-primary/90 glow-purple"
            >
              <Zap className="w-4 h-4 mr-2" />
              {user
                ? `Continue — ${selectedPlan === "monthly" ? "$10/mo" : "$84/yr"}`
                : "Sign In to Continue"}
            </Button>
          </div>
        )}

        {/* ── CHECKOUT ── */}
        {step === "checkout" && (
          <div className="p-6">
            <button
              onClick={() => setStep("plan")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back to plans
            </button>

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-foreground">Payment Details</h2>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1">
                <Shield className="w-3 h-3" /> Secure
              </div>
            </div>

            {/* Order summary */}
            <div className="glass rounded-xl border border-border/60 p-3 mb-5 flex justify-between items-center">
              <div>
                <p className="text-sm text-foreground font-medium">{plan.name} Creator Plan</p>
                <p className="text-xs text-muted-foreground">{plan.billed}</p>
              </div>
              <span className="text-base font-bold gradient-text">
                {selectedPlan === "monthly" ? "$10.00" : "$84.00"}
              </span>
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-mono uppercase block mb-1.5">
                  Name on card
                </label>
                <input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full bg-surface border border-border/60 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-mono uppercase mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3 h-3" /> Card number
                </label>
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCard(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  className="w-full bg-surface border border-border/60 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors font-mono tracking-wider"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-mono uppercase block mb-1.5">
                    Expiry
                  </label>
                  <input
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="w-full bg-surface border border-border/60 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-mono uppercase block mb-1.5">
                    CVC
                  </label>
                  <input
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    className="w-full bg-surface border border-border/60 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handlePay}
              disabled={processing}
              className="w-full bg-primary hover:bg-primary/90 glow-purple mt-5"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" /> Pay{" "}
                  {selectedPlan === "monthly" ? "$10.00" : "$84.00"}
                </>
              )}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground mt-3 leading-relaxed">
              🔒 Payment is processed manually — no charges are made until confirmed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}