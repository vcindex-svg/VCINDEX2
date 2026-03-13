import { cn } from "@/lib/utils";

const styles = {
  primary: "bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 text-white shadow-[0_0_24px_rgba(124,58,237,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_36px_rgba(124,58,237,0.65)] active:scale-x-110 active:scale-y-[0.84]",
  outline: "bg-transparent border border-border/60 text-foreground hover:border-primary/50 hover:bg-primary/5 active:scale-x-110 active:scale-y-[0.84]",
};

export default function SquishyButton({ children, onClick, className, disabled, variant = "primary", ...props }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease" }}
      className={cn(
        "relative overflow-hidden inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-8 py-3 text-base select-none hover:scale-[1.04] hover:-translate-y-px",
        styles[variant],
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-xl" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}