import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/", label: "Home" },
  { path: "/sessions", label: "Active" },
  { path: "/history", label: "History" },
  { path: "/#how", label: "How it works" },
];

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <ShieldCheck className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">
                ZeroSearch
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} ZeroSearch · Privacy by design</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
