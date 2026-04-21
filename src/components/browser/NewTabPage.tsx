import { useState, KeyboardEvent } from "react";
import { Search, Globe, BookOpen, Archive, ShieldCheck, ArrowRight } from "lucide-react";

interface NewTabPageProps {
  sessionHash: string;
  onNavigate: (url: string) => void;
}

const quickLinks = [
  { name: "Wikipedia", url: "https://wikipedia.org", icon: BookOpen },
  { name: "DuckDuckGo", url: "https://duckduckgo.com", icon: Search },
  { name: "Archive.org", url: "https://archive.org", icon: Archive },
  { name: "Example.com", url: "https://example.com", icon: Globe },
];

export function NewTabPage({ sessionHash, onNavigate }: NewTabPageProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      onNavigate(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="max-w-2xl w-full flex flex-col items-center text-center fade-up">
        {/* Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          Private session active
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05] mb-3">
          <span className="text-foreground">Search.</span>{" "}
          <span className="text-primary">Nothing Saved.</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Session{" "}
          <span className="font-mono text-foreground">{sessionHash.slice(0, 8)}…</span>{" "}
          is isolated and disposable.
        </p>

        {/* Search */}
        <div className="w-full mb-8">
          <div
            className={`flex items-center gap-3 pl-5 pr-2 py-2 bg-card border rounded-full transition-all ${
              focused ? "border-primary/40 shadow-glow" : "border-border shadow-soft"
            }`}
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
              onClick={handleSearch}
              className="shrink-0 w-11 h-11 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              aria-label="Search"
            >
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Trust */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground mb-10">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" /> No Logs
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" /> No Cookies
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" /> No Tracking
          </span>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.name}
                onClick={() => onNavigate(link.url)}
                className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl shadow-soft hover:shadow-elevated hover:border-primary/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{link.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
