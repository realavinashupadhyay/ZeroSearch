import { useState, KeyboardEvent } from "react";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InitializeButtonProps {
  onInitialize: (query?: string) => Promise<unknown>;
}

export function InitializeButton({ onInitialize }: InitializeButtonProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = async () => {
    if (isInitializing) return;
    setIsInitializing(true);
    await onInitialize(query.trim() || undefined);
    setIsInitializing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="w-full max-w-2xl">
      <div
        className={cn(
          "flex items-center gap-3 pl-5 pr-2 py-2 bg-card border rounded-full transition-all",
          focused
            ? "border-primary/40 shadow-glow"
            : "border-border shadow-soft hover:shadow-elevated"
        )}
      >
        <Search className="w-5 h-5 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search without being watched..."
          className="flex-1 bg-transparent border-0 outline-none text-base text-foreground placeholder:text-muted-foreground py-3"
        />
        <button
          onClick={handleSubmit}
          disabled={isInitializing}
          className={cn(
            "shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all",
            "bg-gradient-primary text-primary-foreground hover:scale-105 active:scale-95",
            "disabled:opacity-70 disabled:scale-100"
          )}
          aria-label="Start private session"
        >
          {isInitializing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          )}
        </button>
      </div>
    </div>
  );
}
