import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { SessionCard } from "@/components/session/SessionCard";
import { useSessions } from "@/hooks/useSessions";
import { Ghost, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Sessions = () => {
  const navigate = useNavigate();
  const { activeSessions, loading, createSession, destroySession, refetch } = useSessions();

  const handleTerminate = async (id: string) => {
    return await destroySession(id);
  };

  const handleCreate = async () => {
    const s = await createSession();
    if (s) navigate(`/browser/${s.id}`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Active sessions
              </h1>
              <p className="text-muted-foreground mt-2">
                {activeSessions.length} session{activeSessions.length !== 1 ? "s" : ""} currently running
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button size="sm" onClick={handleCreate} className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                New session
              </Button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading sessions…</p>
              </div>
            </div>
          )}

          {!loading && activeSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-card border border-dashed border-border rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Ghost className="w-7 h-7 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                No active sessions
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Start a private session to begin browsing
              </p>
              <Button onClick={handleCreate} className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                New session
              </Button>
            </div>
          )}

          {!loading && activeSessions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSessions.map((session) => (
                <SessionCard key={session.id} session={session} onDestroy={handleTerminate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Sessions;
