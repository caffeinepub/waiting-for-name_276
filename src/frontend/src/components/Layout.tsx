import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Activity, LogOut, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      data-ocid="theme-toggle"
      className="h-9 w-9 rounded-lg"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

function Header() {
  const { isAuthenticated, principal, logout } = useAuth();

  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : null;

  return (
    <header
      className="sticky top-0 z-40 bg-card border-b border-border shadow-card"
      data-ocid="app-header"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <a
            href="/"
            className="flex items-center gap-2.5 transition-smooth hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-subtle">
              <Activity
                className="h-5 w-5 text-primary-foreground"
                aria-hidden="true"
              />
            </div>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">
              KidiCare
            </span>
          </a>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isAuthenticated && shortPrincipal && (
              <div
                className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-1.5"
                data-ocid="user-principal"
              >
                <User
                  className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">
                  {shortPrincipal}
                </span>
              </div>
            )}

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                data-ocid="logout-btn"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  return (
    <footer
      className="bg-card border-t border-border mt-auto"
      data-ocid="app-footer"
    >
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <p className="text-center text-xs text-muted-foreground">
          © {year}. Built with love using{" "}
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline underline-offset-2"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className={cn("flex-1", className)} data-ocid="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
