import React from "react";
import { Link, useLocation } from "wouter";
import { Moon, Sun, Home, Calculator, History, ListChecks, Award, Lightbulb, User } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/history", label: "History", icon: History },
  { href: "/recommendations", label: "Actions", icon: ListChecks },
  { href: "/badges", label: "Badges", icon: Award },
  { href: "/tips", label: "Tips", icon: Lightbulb },
  { href: "/profile", label: "Profile", icon: User },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card" aria-label="Main sidebar">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center" aria-hidden="true">
            <span className="text-primary-foreground font-bold">E</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">EcoTrack AI</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1" aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="w-full justify-start gap-3"
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon className="h-5 w-5" aria-hidden="true" /> : <Sun className="h-5 w-5" aria-hidden="true" />}
            Toggle Theme
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0" id="main-content">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center" aria-hidden="true">
              <span className="text-primary-foreground font-bold text-xs">E</span>
            </div>
            <span className="font-bold text-foreground">EcoTrack</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon className="h-5 w-5" aria-hidden="true" /> : <Sun className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </header>
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card flex items-center justify-around p-2 z-10 pb-safe" aria-label="Mobile navigation">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className={`flex flex-col items-center p-2 rounded-lg ${isActive ? "text-primary" : "text-muted-foreground"}`}
            >
              <item.icon className="h-6 w-6" aria-hidden="true" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
