import { useState } from "react";
import { format, formatDistanceStrict } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";
import { useSessions } from "@/hooks/useSessions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Trash2, FileX } from "lucide-react";
import { cn } from "@/lib/utils";

const History = () => {
  const { destroyedSessions, loading, purgeHistory } = useSessions();
  const [isPurging, setIsPurging] = useState(false);

  const handlePurge = async () => {
    setIsPurging(true);
    await purgeHistory();
    setIsPurging(false);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Session history
              </h1>
              <p className="text-muted-foreground mt-2">
                {destroyedSessions.length} terminated session{destroyedSessions.length !== 1 ? "s" : ""}
              </p>
            </div>

            {destroyedSessions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePurge}
                disabled={isPurging}
                className="gap-2 text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="w-4 h-4" />
                {isPurging ? "Purging…" : "Purge all logs"}
              </Button>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading…</p>
              </div>
            </div>
          )}

          {!loading && destroyedSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-card border border-dashed border-border rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileX className="w-7 h-7 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                No history yet
              </h2>
              <p className="text-sm text-muted-foreground">
                Terminated sessions will appear here
              </p>
            </div>
          )}

          {!loading && destroyedSessions.length > 0 && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Destroyed</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {destroyedSessions.map((session) => {
                    const createdAt = new Date(session.created_at);
                    const destroyedAt = session.destroyed_at ? new Date(session.destroyed_at) : null;
                    const duration = destroyedAt ? formatDistanceStrict(createdAt, destroyedAt) : "N/A";

                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          <code className="text-sm font-medium text-foreground">
                            {session.session_hash.slice(0, 8)}…
                          </code>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(createdAt, "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {destroyedAt ? format(destroyedAt, "MMM d, HH:mm") : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{duration}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                              session.destruction_method === "manual"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {session.destruction_method === "manual" ? "Manual" : "Auto"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default History;
