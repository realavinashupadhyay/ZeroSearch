import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { BrowserNavBar } from "@/components/browser/BrowserNavBar";
import { BrowserViewport, BrowserViewportRef } from "@/components/browser/BrowserViewport";
import { SessionStatusBar } from "@/components/browser/SessionStatusBar";
import { NewTabPage } from "@/components/browser/NewTabPage";
import { useSessions, Session } from "@/hooks/useSessions";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Browser() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { destroySession } = useSessions();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);

  const viewportRef = useRef<BrowserViewportRef>(null);
  const browserShellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === browserShellRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!isImmersive) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isImmersive]);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error || !data || data.status !== "active") {
        navigate("/");
        return;
      }

      setSession(data);
      setLoading(false);

      const q = searchParams.get("q");
      if (q) {
        const url = `https://duckduckgo.com/?q=${encodeURIComponent(q)}`;
        setCurrentUrl(url);
        setHistory([url]);
        setHistoryIndex(0);
        setIsPageLoading(true);
      }
    };

    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleNavigate = (url: string) => {
    setIsPageLoading(true);
    setCurrentUrl(url);
    const newHistory = [...history.slice(0, historyIndex + 1), url];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setIsPageLoading(true);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setIsPageLoading(true);
    }
  };

  const handleRefresh = () => {
    if (viewportRef.current) {
      setIsPageLoading(true);
      viewportRef.current.reload();
    }
  };

  const handleToggleFullscreen = async () => {
    const isNativeFullscreen = document.fullscreenElement === browserShellRef.current;

    try {
      if (isNativeFullscreen) {
        await document.exitFullscreen();
        setIsImmersive(false);
        return;
      }

      if (isImmersive) {
        setIsImmersive(false);
        return;
      }

      if (browserShellRef.current) {
        await browserShellRef.current.requestFullscreen();
        return;
      }
    } catch (error) {
      console.error("Failed to toggle fullscreen", error);
    }

    setIsImmersive(true);
  };

  const handleTerminate = async () => {
    if (!session) return;
    setIsTerminating(true);
    const success = await destroySession(session.id);
    if (success) navigate("/");
    else setIsTerminating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <div className="text-sm text-muted-foreground">Loading session…</div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const isChromeHidden = isFullscreen || isImmersive;

  return (
    <div
      ref={browserShellRef}
      className={cn(
        "flex flex-col bg-background",
        isChromeHidden
          ? "fixed inset-0 z-50 h-dvh w-screen overflow-hidden"
          : "min-h-screen"
      )}
    >
      {!isChromeHidden && (
        <BrowserNavBar
          currentUrl={currentUrl}
          onNavigate={handleNavigate}
          onBack={handleBack}
          onForward={handleForward}
          onRefresh={handleRefresh}
          canGoBack={historyIndex > 0}
          canGoForward={historyIndex < history.length - 1}
          isLoading={isPageLoading}
        />
      )}

      <div className="flex-1 flex flex-col min-h-0 relative">
        {currentUrl === "" ? (
          <NewTabPage sessionHash={session.session_hash} onNavigate={handleNavigate} />
        ) : (
          <BrowserViewport
            ref={viewportRef}
            url={currentUrl}
            onLoad={() => setIsPageLoading(false)}
            onError={() => setIsPageLoading(false)}
            isLoading={isPageLoading}
            onNavigate={handleNavigate}
            hideChrome={isChromeHidden}
          />
        )}

        {currentUrl !== "" && (
          <Button
            variant="secondary"
            size="icon"
            onClick={handleToggleFullscreen}
            className="absolute top-3 right-3 z-30 h-9 w-9 rounded-full border border-border bg-background/80 shadow-lg backdrop-blur hover:bg-background"
             title={isChromeHidden ? "Exit full screen" : "Full screen"}
          >
             {isChromeHidden ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {!isChromeHidden && (
        <SessionStatusBar
          sessionHash={session.session_hash}
          createdAt={session.created_at}
          onTerminate={handleTerminate}
          isTerminating={isTerminating}
        />
      )}
    </div>
  );
}
