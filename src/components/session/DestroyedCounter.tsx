import { useStats } from "@/hooks/useStats";
import { Trash2 } from "lucide-react";

export function DestroyedCounter() {
  const { totalDestroyed, loading } = useStats();

  return (
    <div className="flex items-center justify-center gap-4 px-6 py-5 bg-card border border-border rounded-2xl shadow-soft">
      <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
        <Trash2 className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground font-medium">
          Sessions destroyed
        </div>
        <div className="text-2xl font-bold text-foreground tabular-nums">
          {loading ? "—" : totalDestroyed.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
