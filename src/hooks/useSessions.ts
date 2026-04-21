import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Session {
  id: string;
  session_hash: string;
  created_at: string;
  destroyed_at: string | null;
  destruction_method: string | null;
  status: string;
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all sessions
  const fetchSessions = useCallback(async () => {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "ERROR",
        description: "Failed to fetch sessions",
        variant: "destructive",
      });
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  }, [toast]);

  // Create a new session
  const createSession = useCallback(async () => {
    const sessionHash = generateSessionHash();
    
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        session_hash: sessionHash,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      toast({
        title: "INITIALIZATION FAILED",
        description: "Could not create new session",
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "SESSION INITIALIZED",
      description: `Session ${sessionHash.slice(0, 8)}... is now active`,
    });

    return data;
  }, [toast]);

  // Destroy a session
  const destroySession = useCallback(
    async (sessionId: string, method: "manual" | "auto-timeout" = "manual") => {
      const { error } = await supabase
        .from("sessions")
        .update({
          status: "destroyed",
          destroyed_at: new Date().toISOString(),
          destruction_method: method,
        })
        .eq("id", sessionId);

      if (error) {
        console.error("Error destroying session:", error);
        toast({
          title: "DESTRUCTION FAILED",
          description: "Session could not be terminated",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "SESSION DESTROYED",
        description: "Session has been permanently terminated",
      });

      return true;
    },
    [toast]
  );

  // Delete a session record entirely
  const deleteSession = useCallback(
    async (sessionId: string) => {
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("id", sessionId);

      if (error) {
        console.error("Error deleting session:", error);
        return false;
      }

      return true;
    },
    []
  );

  // Purge all destroyed sessions
  const purgeHistory = useCallback(async () => {
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("status", "destroyed");

    if (error) {
      console.error("Error purging history:", error);
      toast({
        title: "PURGE FAILED",
        description: "Could not purge session history",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "HISTORY PURGED",
      description: "All session logs have been permanently deleted",
    });

    return true;
  }, [toast]);

  // Set up real-time subscription
  useEffect(() => {
    fetchSessions();

    const channel = supabase
      .channel("sessions-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions",
        },
        (payload) => {
          console.log("Realtime update:", payload);
          
          if (payload.eventType === "INSERT") {
            setSessions((prev) => [payload.new as Session, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === (payload.new as Session).id
                  ? (payload.new as Session)
                  : s
              )
            );
          } else if (payload.eventType === "DELETE") {
            setSessions((prev) =>
              prev.filter((s) => s.id !== (payload.old as Session).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSessions]);

  // Computed values
  const activeSessions = sessions.filter((s) => s.status === "active");
  const destroyedSessions = sessions.filter((s) => s.status === "destroyed");

  return {
    sessions,
    activeSessions,
    destroyedSessions,
    loading,
    createSession,
    destroySession,
    deleteSession,
    purgeHistory,
    refetch: fetchSessions,
  };
}

// Generate a random session hash
function generateSessionHash(): string {
  const chars = "0123456789ABCDEF";
  let hash = "";
  for (let i = 0; i < 32; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}
