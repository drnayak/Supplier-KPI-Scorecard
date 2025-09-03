import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Package,
  Clock,
  Star,
  AlertTriangle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getScoreColor, formatPpm } from "@/lib/scoring-algorithms";
import type { 
  Supplier, 
  SupplierKpi, 
  PriceEvaluation, 
  QuantityEvaluation, 
  DeliveryEvaluation, 
  QualityEvaluation,
  PpmEvaluation 
} from "@shared/schema";

interface ReportsData {
  suppliers: Supplier[];
  kpis: SupplierKpi[];
  priceEvaluations: PriceEvaluation[];
  quantityEvaluations: QuantityEvaluation[];
  deliveryEvaluations: DeliveryEvaluation[];
  qualityEvaluations: QualityEvaluation[];
  ppmEvaluations: PpmEvaluation[];
}

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [dateRange, setDateRange] = useState("30");

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: kpis } = useQuery<SupplierKpi[]>({
    queryKey: ["/api/supplier-kpis"],
  });

  const { data: priceEvaluations } = useQuery<PriceEvaluation[]>({
    queryKey: ["/api/price-evaluations"],
  });

  const { data: quantityEvaluations } = useQuery<QuantityEvaluation[]>({
    queryKey: ["/api/quantity-evaluations"],
  });

  const { data: deliveryEvaluations } = useQuery<DeliveryEvaluation[]>({
    queryKey: ["/api/delivery-evaluations"],
  });

  const { data: qualityEvaluations } = useQuery<QualityEvaluation[]>({
    queryKey: ["/api/quality-evaluations"],
  });

  const { data: ppmEvaluations } = useQuery<PpmEvaluation[]>({
    queryKey: ["/api/ppm-evaluations"],
  });

  const handleExportReport = async () => {
    try {
      const response = await fetch("/api/export/suppliers");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `supplier-evaluation-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "Comprehensive supplier report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export report data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter suppliers based on search and selection
  const filteredSuppliers = suppliers?.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSelection = selectedSupplier === "all" || supplier.id === selectedSupplier;
    return matchesSearch && matchesSelection;
  }) || [];

  // Calculate summary statistics
  const summaryStats = {
    totalEvaluations: (priceEvaluations?.length || 0) + 
                     (quantityEvaluations?.length || 0) + 
                     (deliveryEvaluations?.length || 0) + 
                     (qualityEvaluations?.length || 0),
    avgOverallKpi: kpis ? kpis.reduce((sum, k) => sum + (k.overallKpi || 0), 0) / kpis.length : 0,
    topPerformers: kpis?.filter(k => (k.overallKpi || 0) >= 80).length || 0,
    needsImprovement: kpis?.filter(k => (k.overallKpi || 0) < 60).length || 0,
  };

  const getScoreTextColor = (score: number) => {
    const color = getScoreColor(score);
    switch (color) {
      case 'green': return 'text-green-600';
      case 'blue': return 'text-blue-600';
      case 'yellow': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 60) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      <Header
        title="Supplier Performance Reports"
        description="Comprehensive reporting and analysis of supplier evaluation data"
        onExport={handleExportReport}
      />
      
      <div className="p-6 space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="summary-stats">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Evaluations</p>
                  <p className="text-2xl font-bold" data-testid="text-total-evaluations">
                    {summaryStats.totalEvaluations}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average KPI</p>
                  <p className="text-2xl font-bold" data-testid="text-average-kpi">
                    {summaryStats.avgOverallKpi.toFixed(1)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Top Performers</p>
                  <p className="text-2xl font-bold text-green-600" data-testid="text-top-performers">
                    {summaryStats.topPerformers}
                  </p>
                </div>
                <Star className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Needs Improvement</p>
                  <p className="text-2xl font-bold text-red-600" data-testid="text-needs-improvement">
                    {summaryStats.needsImprovement}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-suppliers"
                />
              </div>
              <div className="w-48">
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger data-testid="select-supplier-filter">
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {suppliers?.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger data-testid="select-date-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Reports Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="price" data-testid="tab-price">Price</TabsTrigger>
            <TabsTrigger value="quantity" data-testid="tab-quantity">Quantity</TabsTrigger>
            <TabsTrigger value="delivery" data-testid="tab-delivery">Delivery</TabsTrigger>
            <TabsTrigger value="quality" data-testid="tab-quality">Quality</TabsTrigger>
            <TabsTrigger value="ppm" data-testid="tab-ppm">PPM</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSuppliers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No suppliers found matching your criteria.
                    </div>
                  ) : (
                    filteredSuppliers.map((supplier) => {
                      const kpi = kpis?.find(k => k.supplierId === supplier.id);
                      return (
                        <div 
                          key={supplier.id}
                          className="border border-border rounded-lg p-4"
                          data-testid={`supplier-overview-${supplier.code}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">{supplier.name}</h3>
                              <p className="text-sm text-muted-foreground">{supplier.code}</p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={getScoreBadgeColor(kpi?.overallKpi || 0)}
                            >
                              Overall KPI: {(kpi?.overallKpi || 0).toFixed(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <DollarSign className="w-6 h-6 mx-auto mb-1 text-green-600" />
                              <p className="text-sm text-muted-foreground">Price</p>
                              <p className={`font-semibold ${getScoreTextColor(kpi?.priceScore || 0)}`}>
                                {(kpi?.priceScore || 0).toFixed(1)}
                              </p>
                            </div>
                            <div className="text-center">
                              <Package className="w-6 h-6 mx-auto mb-1 text-yellow-600" />
                              <p className="text-sm text-muted-foreground">Quantity</p>
                              <p className={`font-semibold ${getScoreTextColor(kpi?.quantityScore || 0)}`}>
                                {(kpi?.quantityScore || 0).toFixed(1)}
                              </p>
                            </div>
                            <div className="text-center">
                              <Clock className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                              <p className="text-sm text-muted-foreground">Delivery</p>
                              <p className={`font-semibold ${getScoreTextColor(kpi?.deliveryScore || 0)}`}>
                                {(kpi?.deliveryScore || 0).toFixed(1)}
                              </p>
                            </div>
                            <div className="text-center">
                              <Star className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                              <p className="text-sm text-muted-foreground">Quality</p>
                              <p className={`font-semibold ${getScoreTextColor(kpi?.qualityScore || 0)}`}>
                                {(kpi?.qualityScore || 0).toFixed(1)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="price" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Price Variance Evaluations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">PO Number</th>
                        <th className="text-left p-2">Supplier</th>
                        <th className="text-right p-2">PO Price</th>
                        <th className="text-right p-2">Invoice Price</th>
                        <th className="text-right p-2">Variance %</th>
                        <th className="text-center p-2">Score</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceEvaluations?.filter(evaluation => 
                        selectedSupplier === "all" || evaluation.supplierId === selectedSupplier
                      ).map((evaluation) => {
                        const supplier = suppliers?.find(s => s.id === evaluation.supplierId);
                        return (
                          <tr key={evaluation.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-mono text-sm">{evaluation.poNumber}</td>
                            <td className="p-2">{supplier?.name}</td>
                            <td className="p-2 text-right">${evaluation.poPrice.toFixed(2)}</td>
                            <td className="p-2 text-right">${evaluation.invoicePrice.toFixed(2)}</td>
                            <td className={`p-2 text-right font-semibold ${
                              evaluation.variancePercentage < 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {evaluation.variancePercentage.toFixed(1)}%
                            </td>
                            <td className="p-2 text-center">
                              <Badge className={getScoreBadgeColor(evaluation.score)}>
                                {evaluation.score}
                              </Badge>
                            </td>
                            <td className="p-2 text-sm text-muted-foreground">
                              {formatDate(evaluation.createdAt!)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!priceEvaluations?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      No price evaluations found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quantity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quantity Variance Evaluations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">PO Number</th>
                        <th className="text-left p-2">Supplier</th>
                        <th className="text-right p-2">Ordered</th>
                        <th className="text-right p-2">Received</th>
                        <th className="text-right p-2">Variance %</th>
                        <th className="text-center p-2">Score</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quantityEvaluations?.filter(evaluation => 
                        selectedSupplier === "all" || evaluation.supplierId === selectedSupplier
                      ).map((evaluation) => {
                        const supplier = suppliers?.find(s => s.id === evaluation.supplierId);
                        return (
                          <tr key={evaluation.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-mono text-sm">{evaluation.poNumber}</td>
                            <td className="p-2">{supplier?.name}</td>
                            <td className="p-2 text-right">{evaluation.orderedQuantity}</td>
                            <td className="p-2 text-right">{evaluation.receivedQuantity}</td>
                            <td className={`p-2 text-right font-semibold ${
                              evaluation.variancePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {evaluation.variancePercentage.toFixed(1)}%
                            </td>
                            <td className="p-2 text-center">
                              <Badge className={getScoreBadgeColor(evaluation.score)}>
                                {evaluation.score}
                              </Badge>
                            </td>
                            <td className="p-2 text-sm text-muted-foreground">
                              {formatDate(evaluation.createdAt!)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!quantityEvaluations?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      No quantity evaluations found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Time Evaluations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">PO Number</th>
                        <th className="text-left p-2">Supplier</th>
                        <th className="text-left p-2">Scheduled Date</th>
                        <th className="text-left p-2">Actual Date</th>
                        <th className="text-right p-2">Overdue Days</th>
                        <th className="text-center p-2">Score</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveryEvaluations?.filter(evaluation => 
                        selectedSupplier === "all" || evaluation.supplierId === selectedSupplier
                      ).map((evaluation) => {
                        const supplier = suppliers?.find(s => s.id === evaluation.supplierId);
                        return (
                          <tr key={evaluation.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-mono text-sm">{evaluation.poNumber}</td>
                            <td className="p-2">{supplier?.name}</td>
                            <td className="p-2">{formatDate(evaluation.scheduledDate)}</td>
                            <td className="p-2">{formatDate(evaluation.actualDate)}</td>
                            <td className={`p-2 text-right font-semibold ${
                              evaluation.overdueDays <= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {evaluation.overdueDays}
                            </td>
                            <td className="p-2 text-center">
                              <Badge className={getScoreBadgeColor(evaluation.score)}>
                                {evaluation.score}
                              </Badge>
                            </td>
                            <td className="p-2 text-sm text-muted-foreground">
                              {formatDate(evaluation.createdAt!)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!deliveryEvaluations?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      No delivery evaluations found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quality Evaluations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">PO Number</th>
                        <th className="text-left p-2">Supplier</th>
                        <th className="text-right p-2">Notifications</th>
                        <th className="text-center p-2">Inspection</th>
                        <th className="text-center p-2">Notification Score</th>
                        <th className="text-center p-2">Inspection Score</th>
                        <th className="text-center p-2">Overall Score</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qualityEvaluations?.filter(evaluation => 
                        selectedSupplier === "all" || evaluation.supplierId === selectedSupplier
                      ).map((evaluation) => {
                        const supplier = suppliers?.find(s => s.id === evaluation.supplierId);
                        return (
                          <tr key={evaluation.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-mono text-sm">{evaluation.poNumber}</td>
                            <td className="p-2">{supplier?.name}</td>
                            <td className="p-2 text-right">{evaluation.qualityNotifications}</td>
                            <td className="p-2 text-center">
                              <Badge variant={evaluation.inspectionResult === 'OK' ? 'default' : 'destructive'}>
                                {evaluation.inspectionResult}
                              </Badge>
                            </td>
                            <td className="p-2 text-center">
                              <Badge className={getScoreBadgeColor(evaluation.notificationScore)}>
                                {evaluation.notificationScore}
                              </Badge>
                            </td>
                            <td className="p-2 text-center">
                              <Badge className={getScoreBadgeColor(evaluation.inspectionScore)}>
                                {evaluation.inspectionScore}
                              </Badge>
                            </td>
                            <td className="p-2 text-center">
                              <Badge className={getScoreBadgeColor(evaluation.overallScore)}>
                                {Math.round(evaluation.overallScore)}
                              </Badge>
                            </td>
                            <td className="p-2 text-sm text-muted-foreground">
                              {formatDate(evaluation.createdAt!)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!qualityEvaluations?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      No quality evaluations found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ppm" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Parts Per Million (PPM) Evaluations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Material Document</th>
                        <th className="text-left p-2">Supplier</th>
                        <th className="text-right p-2">Rejected Qty</th>
                        <th className="text-right p-2">Total Received</th>
                        <th className="text-right p-2">PPM Value</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ppmEvaluations?.filter(evaluation => 
                        selectedSupplier === "all" || evaluation.supplierId === selectedSupplier
                      ).map((evaluation) => {
                        const supplier = suppliers?.find(s => s.id === evaluation.supplierId);
                        return (
                          <tr key={evaluation.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-mono text-sm">{evaluation.materialDocument}</td>
                            <td className="p-2">{supplier?.name}</td>
                            <td className="p-2 text-right">{evaluation.rejectedQuantity}</td>
                            <td className="p-2 text-right">{evaluation.totalReceivedQuantity}</td>
                            <td className="p-2 text-right font-mono">
                              <Badge variant={evaluation.ppmValue === 0 ? 'default' : 'destructive'}>
                                {formatPpm(evaluation.ppmValue)}
                              </Badge>
                            </td>
                            <td className="p-2 text-sm text-muted-foreground">
                              {formatDate(evaluation.createdAt!)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!ppmEvaluations?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      No PPM evaluations found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
