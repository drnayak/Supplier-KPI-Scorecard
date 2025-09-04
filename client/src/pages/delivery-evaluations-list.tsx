import { useQuery } from "@tanstack/react-query";
import { Plus, Filter, Download } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import { useState } from "react";
import { format } from "date-fns";
import type { DeliveryEvaluation, Supplier } from "@shared/schema";

interface DeliveryEvaluationWithSupplier extends DeliveryEvaluation {
  supplier: Supplier;
}

export default function DeliveryEvaluationsList() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: evaluations, isLoading } = useQuery<DeliveryEvaluationWithSupplier[]>({
    queryKey: ["/api/delivery-evaluations"],
  });

  const filteredEvaluations = evaluations?.filter(evaluation =>
    evaluation.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluation.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getOverdueDisplay = (days: number) => {
    if (days === 0) return <span className="text-green-600">On Time</span>;
    if (days > 0) return <span className="text-red-600">{days} days late</span>;
    return <span className="text-blue-600">{Math.abs(days)} days early</span>;
  };

  if (isLoading) {
    return (
      <div>
        <Header
          title="Delivery Evaluations"
          description="Historical delivery time evaluations"
        />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Delivery Evaluations"
        description="Historical delivery time evaluations and performance tracking"
      />
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Input
              placeholder="Search by supplier or PO number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              data-testid="input-search-evaluations"
            />
            <Button variant="outline" size="icon" data-testid="button-filter">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/delivery-evaluation">
              <Button data-testid="button-add-evaluation">
                <Plus className="h-4 w-4 mr-2" />
                New Evaluation
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Time Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEvaluations && filteredEvaluations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Actual Date</TableHead>
                    <TableHead>Delivery Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvaluations.map((evaluation) => (
                    <TableRow key={evaluation.id} data-testid={`row-evaluation-${evaluation.id}`}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{evaluation.supplier.name}</p>
                          <p className="text-sm text-muted-foreground">{evaluation.supplier.code}</p>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-po-number-${evaluation.id}`}>
                        {evaluation.poNumber}
                      </TableCell>
                      <TableCell data-testid={`text-scheduled-date-${evaluation.id}`}>
                        {format(new Date(evaluation.scheduledDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell data-testid={`text-actual-date-${evaluation.id}`}>
                        {format(new Date(evaluation.actualDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell data-testid={`text-delivery-status-${evaluation.id}`}>
                        {getOverdueDisplay(evaluation.overdueDays)}
                      </TableCell>
                      <TableCell data-testid={`text-score-${evaluation.id}`}>
                        <Badge 
                          variant="secondary" 
                          className={getScoreColor(evaluation.score)}
                        >
                          {evaluation.score.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-date-${evaluation.id}`}>
                        {evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No delivery evaluations found</p>
                <Link href="/delivery-evaluation">
                  <Button className="mt-4" data-testid="button-create-first">
                    Create First Evaluation
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}