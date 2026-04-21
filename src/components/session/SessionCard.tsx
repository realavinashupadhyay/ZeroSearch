import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Clock, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Session } from "@/hooks/useSessions";

interface SessionCardProps {
  session: Session;
  onDestroy: (sessionId: string) => Promise<boolean>;
}

export function SessionCard({ session, onDestroy }: SessionCardProps) {
  const navigate = useNavigate();
  const [isDestroying, setIsDestroying] = useState(false);

  const handleDestroy = async () => {
    setIsDestroying(true);
    const success = await onDestroy(session.id);
    if (!success) setIsDestroying(false);
  };

  const createdAt = new Date(session.created_at);
  const timeElapsed = formatDistanceToNow(createdAt, { addSuffix: false });

  return (
    <div
      className={cn(
        "group relative p-5 bg-card border border-border rounded-2xl shadow-soft transition-all",
        "hover:shadow-elevated hover:border-primary/30"
      )}
    >
      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-accent status-pulse" />
          Active
        </div>
        <button
          onClick={() => navigate(`/browser/${session.id}`)}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground"
          aria-label="Open session"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Hash */}
      <div className="mb-1">
        <code className="text-base font-semibold text-foreground tracking-tight">
          {session.session_hash.slice(0, 8)}…{session.session_hash.slice(-4)}
        </code>
      </div>

      {/* Time */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
        <Clock className="w-3.5 h-3.5" />
        <span>Running for {timeElapsed}</span>
      </div>

      {/* Destroy */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDestroy}
        disabled={isDestroying}
        className="w-full gap-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
      >
        {isDestroying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Terminating…
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            Terminate
          </>
        )}
      </Button>
    </div>
  );
}
