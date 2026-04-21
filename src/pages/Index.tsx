import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { InitializeButton } from "@/components/session/InitializeButton";
import { DestroyedCounter } from "@/components/session/DestroyedCounter";
import { useSessions } from "@/hooks/useSessions";
import { ShieldCheck, Eye, Cookie, Activity } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { createSession, activeSessions } = useSessions();

  const handleInitialize = async (query?: string) => {
    const session = await createSession();
    if (session) {
      const target = query
        ? `/browser/${session.id}?q=${encodeURIComponent(query)}`
        : `/browser/${session.id}`;
      navigate(target);
    }
  };

  return (
    <MainLayout>
      <section className="container mx-auto px-6 pt-16 md:pt-24 pb-16">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center fade-up">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-soft text-primary text-sm font-semibold mb-8">
            <ShieldCheck className="w-4 h-4" />
            Privacy-First Search Engine
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
            <span className="text-foreground">Search.</span>{" "}
            <span className="text-primary">Nothing Saved.</span>
          </h1>

          {/* Subhead */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
            No tracking. No history. No data collection. What you search stays yours, always.
          </p>

          {/* Search input */}
          <div className="w-full flex justify-center mb-6">
            <InitializeButton onInitialize={handleInitialize} />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground mb-10">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" /> No Logs
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" /> No Cookies
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" /> No Tracking
            </span>
          </div>

          {activeSessions.length > 0 && (
            <button
              onClick={() => navigate("/sessions")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium hover:bg-accent/15 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-accent status-pulse" />
              {activeSessions.length} active session{activeSessions.length !== 1 ? "s" : ""} · view
            </button>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container mx-auto px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
              How we protect you
            </h2>
            <p className="text-muted-foreground">
              Three simple promises. Built into every session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            <FeatureCard
              icon={Eye}
              title="No tracking"
              description="We never profile you, follow you across the web, or sell your behavior."
            />
            <FeatureCard
              icon={Cookie}
              title="No cookies"
              description="Sessions are isolated and disposable. Nothing persists once you're done."
            />
            <FeatureCard
              icon={Activity}
              title="No logs"
              description="Queries vanish the moment they're answered. There is nothing to leak."
            />
          </div>

          <div className="flex justify-center">
            <DestroyedCounter />
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-card border border-border rounded-2xl shadow-soft hover:shadow-elevated transition-shadow">
      <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default Index;
