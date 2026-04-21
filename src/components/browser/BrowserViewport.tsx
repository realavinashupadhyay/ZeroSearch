import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2, BookOpen, Globe, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";

interface BrowserViewportProps {
  url: string;
  onLoad: () => void;
  onError: () => void;
  isLoading: boolean;
  onNavigate?: (url: string) => void;
  hideChrome?: boolean;
}

export interface BrowserViewportRef {
  reload: () => void;
}

type Mode = "iframe" | "reader";

export const BrowserViewport = forwardRef<BrowserViewportRef, BrowserViewportProps>(
  ({ url, onLoad, onError, isLoading, onNavigate, hideChrome = false }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [hasError, setHasError] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [mode, setMode] = useState<Mode>("iframe");
    const [readerLoading, setReaderLoading] = useState(false);
    const [readerError, setReaderError] = useState<string | null>(null);
    const [readerData, setReaderData] = useState<{
      markdown: string;
      title?: string;
    } | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useImperativeHandle(ref, () => ({
      reload: () => {
        if (mode === "iframe" && iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src;
        } else {
          setReloadKey((k) => k + 1);
        }
      },
    }));

    // Reset on URL change
    useEffect(() => {
      setHasError(false);
      setShowContent(false);
      setReaderError(null);
      setReaderData(null);
    }, [url]);

    // Fetch reader content when in reader mode
    useEffect(() => {
      if (mode !== "reader" || !url) return;
      let cancelled = false;
      const run = async () => {
        setReaderLoading(true);
        setReaderError(null);
        setReaderData(null);
        try {
          const { data, error } = await supabase.functions.invoke("proxy-fetch", {
            body: { url },
          });
          if (cancelled) return;
          if (error) throw new Error(error.message || "Failed to load page");
          if (!data?.success) throw new Error(data?.error || "Failed to load page");
          setReaderData({
            markdown: data.markdown || "_No readable content found on this page._",
            title: data.metadata?.title,
          });
          onLoad();
        } catch (err) {
          if (cancelled) return;
          const msg = err instanceof Error ? err.message : "Unknown error";
          setReaderError(msg);
          onError();
        } finally {
          if (!cancelled) setReaderLoading(false);
        }
      };
      run();
      return () => {
        cancelled = true;
      };
    }, [mode, url, reloadKey, onLoad, onError]);

    const handleIframeLoad = () => {
      setShowContent(true);
      onLoad();
    };

    const handleIframeError = () => {
      setHasError(true);
      onError();
    };

    return (
      <div className="relative flex-1 bg-muted/30 overflow-hidden flex flex-col">
        {/* Mode toggle */}
        {!hideChrome && (
          <div className="flex items-center justify-between px-4 py-2 bg-background border-b border-border">
            <div className="inline-flex items-center bg-muted rounded-full p-1 gap-1">
              <button
                onClick={() => setMode("iframe")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5",
                  mode === "iframe"
                    ? "bg-card text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Globe className="w-3.5 h-3.5" />
                Live
              </button>
              <button
                onClick={() => setMode("reader")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5",
                  mode === "reader"
                    ? "bg-card text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Reader
              </button>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              Open in new tab <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <div className="relative flex-1 overflow-hidden">
          {/* Iframe mode */}
          {mode === "iframe" && (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-20">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <div className="text-sm text-muted-foreground">Loading…</div>
                  </div>
                </div>
              )}

              {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-background z-20">
                  <div className="flex flex-col items-center gap-4 p-8 text-center max-w-md">
                    <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="w-7 h-7 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      This site blocks embedding
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Many sites refuse to load inside an iframe. Try Reader mode — it
                      works for almost any page.
                    </p>
                    <Button
                      onClick={() => setMode("reader")}
                      className="gap-2 bg-primary hover:bg-primary/90"
                    >
                      <BookOpen className="w-4 h-4" />
                      Open in Reader mode
                    </Button>
                  </div>
                </div>
              )}

              <iframe
                ref={iframeRef}
                src={url}
                className={cn(
                  "w-full h-full border-0 bg-card transition-opacity duration-300",
                  showContent && !hasError ? "opacity-100" : "opacity-0"
                )}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title="Browser viewport"
              />
            </>
          )}

          {/* Reader mode */}
          {mode === "reader" && (
            <div className="absolute inset-0 overflow-y-auto bg-background">
              {readerLoading && (
                <div className="flex items-center justify-center py-24">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <div className="text-sm text-muted-foreground">
                      Fetching and cleaning page…
                    </div>
                  </div>
                </div>
              )}

              {readerError && (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-7 h-7 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Couldn't load this page
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {readerError}
                  </p>
                </div>
              )}

              {!readerLoading && !readerError && readerData && (
                <article className="max-w-3xl mx-auto px-6 md:px-10 py-10">
                  {readerData.title && (
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
                      {readerData.title}
                    </h1>
                  )}
                  <div className="text-xs text-muted-foreground mb-8 truncate">
                    {url}
                  </div>
                  <div className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ href, children, ...props }) => (
                          <a
                            href={href}
                            onClick={(e) => {
                              if (
                                onNavigate &&
                                href &&
                                /^https?:\/\//i.test(href)
                              ) {
                                e.preventDefault();
                                onNavigate(href);
                              }
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {readerData.markdown}
                    </ReactMarkdown>
                  </div>
                </article>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

BrowserViewport.displayName = "BrowserViewport";
