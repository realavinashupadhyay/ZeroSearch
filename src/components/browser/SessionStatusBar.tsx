import { useState, useEffect } from "react";
import { Trash2, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SessionStatusBarProps {
  sessionHash: string;
  createdAt: string;
  onTerminate: () => void;
  isTerminating: boolean;
}

export function SessionStatusBar({
  sessionHash,
  createdAt,
  onTerminate,
  isTerminating,
}: SessionStatusBarProps) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const updateElapsed = () => {
      const start = new Date(createdAt).getTime();
      const diff = Math.floor((Date.now() - start) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      if (h > 0) setElapsed(`${h}h ${m}m`);
      else if (m > 0) setElapsed(`${m}m ${s}s`);
      else setElapsed(`${s}s`);
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-background border-t border-border">
      <div className="flex items-center gap-5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent status-pulse" />
          <span className="text-accent font-semibold">Active</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Hash className="w-3.5 h-3.5" />
          <span className="font-mono text-foreground">{sessionHash.slice(0, 8)}…</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{elapsed}</span>
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isTerminating}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2 rounded-full"
          >
            <Trash2 className="w-4 h-4" />
            {isTerminating ? "Terminating…" : "Terminate"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this session?</AlertDialogTitle>
            <AlertDialogDescription>
              Session <span className="font-mono">{sessionHash.slice(0, 8)}…</span> and all its
              data will be permanently destroyed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onTerminate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Terminate session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
