const CATEGORIES = [
  { id: "all",           label: "All",           emoji: "✦" },
  { id: "ai-ml",         label: "AI / ML",        emoji: "🤖" },
  { id: "dev-tools",     label: "Dev Tools",      emoji: "⚙️" },
  { id: "productivity",  label: "Productivity",   emoji: "⚡" },
  { id: "automation",    label: "Automation",     emoji: "🔁" },
  { id: "design",        label: "Design",         emoji: "🎨" },
  { id: "marketing",     label: "Marketing",      emoji: "📈" },
  { id: "finance",       label: "Finance",        emoji: "💰" },
  { id: "education",     label: "Education",      emoji: "📚" },
  { id: "communication", label: "Comms",          emoji: "💬" },
  { id: "security",      label: "Security",       emoji: "🛡️" },
];

// selected = string[] of category ids (empty = all)
// onChange = (newSelected: string[]) => void
export default function CategoryFilter({ selected = [], onChange }) {
  const isAll = selected.length === 0;

  const handleClick = (id) => {
    if (id === "all") {
      onChange([]);
      return;
    }
    if (selected.includes(id)) {
      const next = selected.filter((s) => s !== id);
      onChange(next);
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === "all" ? isAll : selected.includes(cat.id);
        return (
          <button
            key={cat.id}
            onClick={() => handleClick(cat.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200
              ${isActive
                ? "bg-primary/20 border-primary/60 text-primary shadow-[0_0_12px_rgba(124,58,237,0.25)]"
                : "glass border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"}
            `}
          >
            <span className="text-xs">{cat.emoji}</span>
            <span>{cat.label}</span>
            {isActive && cat.id !== "all" && (
              <span className="ml-0.5 w-1 h-1 rounded-full bg-primary inline-block" />
            )}
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-mono border border-border/40 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all"
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}