import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import History from "@/pages/history";
import Settings from "@/pages/settings";
import Audit from "@/pages/audit";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import Header from "@/components/layout/header";

function Router() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar (desktop only) */}
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Header />
        
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/audit" component={Audit} />
          <Route path="/history" component={History} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {/* Mobile navigation */}
      <MobileNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
