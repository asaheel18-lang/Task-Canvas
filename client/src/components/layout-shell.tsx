import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { LogOut, Home, BarChart2, Users, FileText, Menu, X, Sun, Moon, Palette } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LayoutShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return <>{children}</>;

  const isAdmin = user.role === "admin";

  const navItems = isAdmin
    ? [
        { href: "/admin", label: "Dashboard", icon: Home },
        { href: "/admin/students", label: "Students", icon: Users },
        { href: "/admin/reports", label: "All Reports", icon: FileText },
        { href: "/admin/leaderboard", label: "Leaderboard", icon: BarChart2 },
      ]
    : [
        { href: "/", label: "Today", icon: Home },
        { href: "/history", label: "My History", icon: FileText },
      ];

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            location === item.href 
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )} onClick={() => setMobileMenuOpen(false)}>
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 space-y-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3">Personalization</p>
        <div className="flex items-center gap-2 px-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="w-full flex justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-sm font-medium">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </Button>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex justify-start gap-3 px-3 text-muted-foreground hover:text-foreground">
              <Palette className="w-4 h-4" />
              <span className="text-sm font-medium">Color Scheme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Choose Scheme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setColorScheme("emerald")} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10b981]" /> Emerald (Default)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setColorScheme("rose")} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f43f5e]" /> Rose
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setColorScheme("amber")} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]" /> Amber
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setColorScheme("indigo")} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#6366f1]" /> Indigo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-auto pt-8 border-t border-border/50">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background/50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white/80 backdrop-blur-md border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="font-display font-bold text-lg text-primary">Islamic Daily Tasks</h1>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm p-6 pt-24 animate-in fade-in slide-in-from-top-4">
          <NavContent />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-card border-r border-border p-6 shadow-sm z-30">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-primary tracking-tight">Islamic Daily Tasks</h1>
        </div>
        <div className="flex-1 flex flex-col">
          <NavContent />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500 slide-in-from-bottom-4">
          {children}
        </div>
      </main>
    </div>
  );
}
