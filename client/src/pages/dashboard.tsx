import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import KpiCard from "@/components/kpi-card";
import SupplierTable from "@/components/supplier-table";
import { DollarSign, Package, Clock, Star, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DashboardSummary {
  totalSuppliers: number;
  averageScores: {
    price: number;
    quantity: number;
    delivery: number;
    quality: number;
    overall: number;
  };
}

export default function Dashboard() {
  const { data: summary, isLoading, error } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export/suppliers");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'supplier-evaluation-report.json';
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "Supplier evaluation report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export supplier data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">Error Loading Dashboard</h3>
          <p className="text-muted-foreground">Failed to load dashboard data. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Supplier Evaluation Dashboard"
        description="Monitor and evaluate supplier performance across key metrics"
        onExport={handleExport}
      />
      
      <div className="p-6 space-y-6">
        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" data-testid="kpi-cards">
          {isLoading ? (
            // Loading skeletons
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </div>
            ))
          ) : summary ? (
            <>
              <KpiCard
                title="Price Variance"
                value={summary.averageScores.price}
                subtitle="Average Score"
                icon={<DollarSign className="w-6 h-6 text-green-600" />}
                color="green"
              />
              <KpiCard
                title="Quantity Variance"
                value={summary.averageScores.quantity}
                subtitle="Average Score"
                icon={<Package className="w-6 h-6 text-yellow-600" />}
                color="yellow"
              />
              <KpiCard
                title="Delivery Time"
                value={summary.averageScores.delivery}
                subtitle="Average Score"
                icon={<Clock className="w-6 h-6 text-blue-600" />}
                color="blue"
              />
              <KpiCard
                title="Quality Score"
                value={summary.averageScores.quality}
                subtitle="Average Score"
                icon={<Star className="w-6 h-6 text-purple-600" />}
                color="purple"
              />
              <KpiCard
                title="Overall KPI"
                value={summary.averageScores.overall}
                subtitle="Weighted Average"
                icon={<BarChart3 className="w-6 h-6 text-gray-600" />}
                color="gray"
              />
            </>
          ) : null}
        </div>

        {/* Supplier Performance Table */}
        <SupplierTable />
      </div>
    </div>
  );
}
