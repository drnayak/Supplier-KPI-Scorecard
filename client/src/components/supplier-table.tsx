import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import { getScoreColor } from "@/lib/scoring-algorithms";
import type { Supplier, SupplierKpi } from "@shared/schema";

interface SupplierWithKpi extends Supplier {
  kpi?: SupplierKpi;
}

export default function SupplierTable() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: suppliers, isLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: kpis } = useQuery<SupplierKpi[]>({
    queryKey: ["/api/supplier-kpis"],
  });

  const suppliersWithKpis: SupplierWithKpi[] = suppliers?.map(supplier => ({
    ...supplier,
    kpi: kpis?.find(kpi => kpi.supplierId === supplier.id),
  })) || [];

  const filteredSuppliers = suppliersWithKpis.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(search.toLowerCase()) ||
                         supplier.code.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === "all") return true;
    if (filter === "top-performers") return (supplier.kpi?.overallKpi || 0) >= 80;
    if (filter === "needs-improvement") return (supplier.kpi?.overallKpi || 0) < 60;
    
    return true;
  });

  const getScoreDisplay = (score: number | null | undefined) => {
    if (score === null || score === undefined) return { value: 0, color: 'gray' };
    return { value: score, color: getScoreColor(score) };
  };

  const getProgressBarColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-600';
      case 'blue': return 'bg-blue-600';
      case 'yellow': return 'bg-yellow-600';
      case 'red': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getScoreTextColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600';
      case 'blue': return 'text-blue-600';
      case 'yellow': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getOverallKpiBadgeColor = (kpi: number) => {
    if (kpi >= 80) return 'bg-green-50 text-green-700';
    if (kpi >= 60) return 'bg-yellow-50 text-yellow-700';
    return 'bg-red-50 text-red-700';
  };

  const formatLastUpdated = (date: Date | null | undefined) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
          <div className="flex gap-3">
            <div className="h-10 bg-muted rounded flex-1"></div>
            <div className="h-10 bg-muted rounded w-40"></div>
          </div>
        </div>
        <div className="space-y-4 p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border" data-testid="supplier-table">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" data-testid="text-table-title">
            Supplier Performance Overview
          </h3>
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
              data-testid="input-search-suppliers"
            />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-suppliers">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="top-performers">Top Performers</SelectItem>
                <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Supplier</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-muted-foreground">Price Score</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-muted-foreground">Quantity Score</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-muted-foreground">Delivery Score</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-muted-foreground">Quality Score</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-muted-foreground">Overall KPI</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-muted-foreground">Last Updated</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  {search || filter !== "all" ? "No suppliers found matching your criteria." : "No suppliers available."}
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => {
                const priceScore = getScoreDisplay(supplier.kpi?.priceScore);
                const quantityScore = getScoreDisplay(supplier.kpi?.quantityScore);
                const deliveryScore = getScoreDisplay(supplier.kpi?.deliveryScore);
                const qualityScore = getScoreDisplay(supplier.kpi?.qualityScore);
                const overallKpi = supplier.kpi?.overallKpi || 0;

                return (
                  <tr 
                    key={supplier.id} 
                    className="hover:bg-muted/30 transition-colors"
                    data-testid={`row-supplier-${supplier.code}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {supplier.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium" data-testid={`text-supplier-name-${supplier.code}`}>
                            {supplier.name}
                          </p>
                          <p className="text-xs text-muted-foreground" data-testid={`text-supplier-code-${supplier.code}`}>
                            Supplier ID: {supplier.code}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-sm font-semibold ${getScoreTextColor(priceScore.color)}`}>
                          {Math.round(priceScore.value)}
                        </span>
                        <div className="w-12 h-2 bg-muted rounded-full">
                          <div 
                            className={`h-2 rounded-full ${getProgressBarColor(priceScore.color)}`}
                            style={{ width: `${Math.min(priceScore.value, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-sm font-semibold ${getScoreTextColor(quantityScore.color)}`}>
                          {Math.round(quantityScore.value)}
                        </span>
                        <div className="w-12 h-2 bg-muted rounded-full">
                          <div 
                            className={`h-2 rounded-full ${getProgressBarColor(quantityScore.color)}`}
                            style={{ width: `${Math.min(quantityScore.value, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-sm font-semibold ${getScoreTextColor(deliveryScore.color)}`}>
                          {Math.round(deliveryScore.value)}
                        </span>
                        <div className="w-12 h-2 bg-muted rounded-full">
                          <div 
                            className={`h-2 rounded-full ${getProgressBarColor(deliveryScore.color)}`}
                            style={{ width: `${Math.min(deliveryScore.value, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-sm font-semibold ${getScoreTextColor(qualityScore.color)}`}>
                          {Math.round(qualityScore.value)}
                        </span>
                        <div className="w-12 h-2 bg-muted rounded-full">
                          <div 
                            className={`h-2 rounded-full ${getProgressBarColor(qualityScore.color)}`}
                            style={{ width: `${Math.min(qualityScore.value, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span 
                        className={`px-2 py-1 rounded-full text-sm font-semibold ${getOverallKpiBadgeColor(overallKpi)}`}
                        data-testid={`text-overall-kpi-${supplier.code}`}
                      >
                        {overallKpi.toFixed(1)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                      {formatLastUpdated(supplier.kpi?.lastUpdated)}
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          data-testid={`button-view-${supplier.code}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          data-testid={`button-edit-${supplier.code}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {filteredSuppliers.length > 0 && (
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredSuppliers.length} of {suppliersWithKpis.length} suppliers
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="default" size="sm">1</Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
