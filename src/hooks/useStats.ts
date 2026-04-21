import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useStats() {
  const [totalDestroyed, setTotalDestroyed] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const { data, error } = await supabase
      .from("aggregate_stats")
      .select("stat_value")
      .eq("stat_key", "total_sessions_destroyed")
      .single();

    if (error) {
      console.error("Error fetching stats:", error);
    } else {
      setTotalDestroyed(data?.stat_value || 0);
    }
    setLoading(false);
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel("stats-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "aggregate_stats",
        },
        (payload) => {
          console.log("Stats update:", payload);
          const newData = payload.new as { stat_key: string; stat_value: number };
          if (newData.stat_key === "total_sessions_destroyed") {
            setTotalDestroyed(newData.stat_value);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  return {
    totalDestroyed,
    loading,
    refetch: fetchStats,
  };
}
