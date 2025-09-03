import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import PriceEvaluation from "@/pages/price-evaluation";
import QuantityEvaluation from "@/pages/quantity-evaluation";
import DeliveryEvaluation from "@/pages/delivery-evaluation";
import QualityEvaluation from "@/pages/quality-evaluation";
import PpmEvaluation from "@/pages/ppm-evaluation";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/price-evaluation" component={PriceEvaluation} />
          <Route path="/quantity-evaluation" component={QuantityEvaluation} />
          <Route path="/delivery-evaluation" component={DeliveryEvaluation} />
          <Route path="/quality-evaluation" component={QualityEvaluation} />
          <Route path="/ppm-evaluation" component={PpmEvaluation} />
          <Route path="/reports" component={Reports} />
          <Route component={NotFound} />
        </Switch>
      </main>
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
