import { useState, useEffect, KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BrowserNavBarProps {
  currentUrl: string;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
}

export function BrowserNavBar({
  currentUrl,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  canGoBack,
  canGoForward,
  isLoading,
}: BrowserNavBarProps) {
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInputUrl(currentUrl);
  }, [currentUrl]);

  const handleSubmit = () => {
    let url = inputUrl.trim();
    if (!url) return;
    // If looks like a search query, send to DuckDuckGo
    const looksLikeUrl = /^https?:\/\//i.test(url) || /^[\w-]+(\.[\w-]+)+/.test(url);
    if (!looksLikeUrl) {
      url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
    } else if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    onNavigate(url);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-background border-b border-border">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          disabled={!canGoBack}
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onForward}
          disabled={!canGoForward}
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          className={cn(
            "h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted",
            isLoading && "animate-spin"
          )}
        >
          <RotateCw className="w-4 h-4" />
        </Button>
      </div>

      <div
        className={cn(
          "flex-1 flex items-center gap-2 px-4 py-2 bg-muted rounded-full transition-all",
          isFocused && "bg-card ring-2 ring-primary/30"
        )}
      >
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search or enter address"
          className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
