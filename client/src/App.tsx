import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "@/hooks/use-theme";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import StudentDashboard from "@/pages/student-dashboard";
import HistoryPage from "@/pages/history-page";
import AdminDashboard from "@/pages/admin-dashboard";
import StudentsListPage from "@/pages/students-list-page";
import AdminReportsPage from "@/pages/admin-reports-page";
import LeaderboardPage from "@/pages/leaderboard-page";

function ProtectedRoute({ 
  component: Component, 
  adminOnly = false 
}: { 
  component: React.ComponentType, 
  adminOnly?: boolean 
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Redirect to="/" />;
  }

  // If logged in as admin but trying to access student root, redirect to admin dashboard
  if (user.role === "admin" && !adminOnly) {
    return <Redirect to="/admin" />;
  }

  return (
    <LayoutShell>
      <Component />
    </LayoutShell>
  );
}

function Router() {
  return (
    <Switch>
      {/* Auth */}
      <Route path="/auth" component={AuthPage} />

      {/* Student Routes */}
      <Route path="/">
        {() => <ProtectedRoute component={StudentDashboard} />}
      </Route>
      <Route path="/history">
        {() => <ProtectedRoute component={HistoryPage} />}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} adminOnly />}
      </Route>
      <Route path="/admin/students">
        {() => <ProtectedRoute component={StudentsListPage} adminOnly />}
      </Route>
      <Route path="/admin/reports">
        {() => <ProtectedRoute component={AdminReportsPage} adminOnly />}
      </Route>
      <Route path="/admin/leaderboard">
        {() => <ProtectedRoute component={LeaderboardPage} adminOnly />}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
