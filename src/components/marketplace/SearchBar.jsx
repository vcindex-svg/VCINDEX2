import { Search, SlidersHorizontal } from "lucide-react";

export default function SearchBar({ value, onChange, onFilterToggle, showFilter }) {
  return (
    <div className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search tools, systems, apps..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-surface border border-border/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>
      {onFilterToggle && (
        <button
          onClick={onFilterToggle}
          className={`p-2.5 rounded-xl border transition-all duration-200 ${showFilter ? "bg-primary/20 border-primary/60 text-primary" : "glass border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}