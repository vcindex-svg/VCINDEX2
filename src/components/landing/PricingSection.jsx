import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { createPageUrl } from "@/utils";

const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$10",
    period: "/month",
    total: "$10/mo",
    badge: null,
    features: [
      "1 tool listing included",
      "Creator profile page",
      "Analytics dashboard",
      "Direct link to your tool",
      "Cancel anytime",
    ],
  },
  {
    id: "annual",
    name: "Annual",
    price: "$7",
    period: "/month",
    total: "$84/year",
    originalTotal: "$120/year",
    saving: "Save $36",
    badge: "Best Value",
    features: [
      "1 tool listing included",
      "Creator profile page",
      "Analytics dashboard",
      "Direct link to your tool",
      "Priority support",
      "Featured placement boost",
    ],
  },
];

export default function PricingSection() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <Badge className="bg-primary/10 border-primary/30 text-primary border mb-4 font-mono text-xs uppercase tracking-wider">
            Creator Pricing
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-4">List Your Tool</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            One listing included with every plan. Need more? Unlock additional listings anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 flex flex-col gap-5 transition-all ${
                plan.badge
                  ? "border-primary/40 bg-primary/5 shadow-[0_0_40px_rgba(124,58,237,0.12)]"
                  : "glass border-border/60"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0 px-4 text-xs font-mono uppercase tracking-wider">
                    <Zap className="w-3 h-3 mr-1" /> {plan.badge}
                  </Badge>
                </div>
              )}

              <div>
                <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider mb-2">{plan.name}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground mb-1">{plan.period}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">{plan.total}</span>
                  {plan.originalTotal && (
                    <span className="text-xs text-muted-foreground line-through">{plan.originalTotal}</span>
                  )}
                  {plan.saving && (
                    <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 border text-xs">{plan.saving}</Badge>
                  )}
                </div>
              </div>

              <ul className="flex flex-col gap-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a href={createPageUrl("CreatorSignup")}>
                <Button className={`w-full ${plan.badge ? "bg-primary hover:bg-primary/90 glow-purple" : "bg-surface-2 hover:bg-muted border border-border/60"}`}>
                  Get Started
                </Button>
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Extra listings available as add-ons. Admin approval required before going live.
        </p>
      </div>
    </section>
  );
}