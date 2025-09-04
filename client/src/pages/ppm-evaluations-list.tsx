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
import { formatPpm } from "@/lib/scoring-algorithms";
import type { PpmEvaluation, Supplier } from "@shared/schema";

interface PpmEvaluationWithSupplier extends PpmEvaluation {
  supplier: Supplier;
}

export default function PpmEvaluationsList() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: evaluations, isLoading } = useQuery<PpmEvaluationWithSupplier[]>({
    queryKey: ["/api/ppm-evaluations"],
  });

  const filteredEvaluations = evaluations?.filter(evaluation =>
    evaluation.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluation.materialDocument.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPpmColor = (ppmValue: number) => {
    if (ppmValue === 0) return "text-green-600";
    if (ppmValue < 1000) return "text-blue-600";
    if (ppmValue < 10000) return "text-yellow-600";
    return "text-red-600";
  };

  const getPpmRange = (ppmValue: number) => {
    if (ppmValue === 0) return "Zero Defects";
    if (ppmValue < 1000) return "Excellent";
    if (ppmValue < 10000) return "Good";
    return "Needs Improvement";
  };

  if (isLoading) {
    return (
      <div>
        <Header
          title="PPM Evaluations"
          description="Historical parts per million evaluations"
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
        title="PPM Evaluations"
        description="Historical parts per million evaluations and quality tracking"
      />
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Input
              placeholder="Search by supplier or material document..."
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
            <Link href="/ppm-evaluation">
              <Button data-testid="button-add-evaluation">
                <Plus className="h-4 w-4 mr-2" />
                New Evaluation
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>PPM (Parts Per Million) Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEvaluations && filteredEvaluations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Material Document</TableHead>
                    <TableHead>Rejected Qty</TableHead>
                    <TableHead>Total Received</TableHead>
                    <TableHead>PPM Value</TableHead>
                    <TableHead>Quality Range</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvaluations.map((evaluation) => {
                    const ppmValue = (evaluation.rejectedQuantity / evaluation.totalReceivedQuantity) * 1000000;
                    return (
                      <TableRow key={evaluation.id} data-testid={`row-evaluation-${evaluation.id}`}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{evaluation.supplier.name}</p>
                            <p className="text-sm text-muted-foreground">{evaluation.supplier.code}</p>
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-material-document-${evaluation.id}`}>
                          {evaluation.materialDocument}
                        </TableCell>
                        <TableCell data-testid={`text-rejected-quantity-${evaluation.id}`}>
                          {evaluation.rejectedQuantity.toLocaleString()}
                        </TableCell>
                        <TableCell data-testid={`text-total-received-${evaluation.id}`}>
                          {evaluation.totalReceivedQuantity.toLocaleString()}
                        </TableCell>
                        <TableCell data-testid={`text-ppm-value-${evaluation.id}`}>
                          <span className={getPpmColor(ppmValue)}>
                            {formatPpm(ppmValue)}
                          </span>
                        </TableCell>
                        <TableCell data-testid={`text-quality-range-${evaluation.id}`}>
                          <Badge 
                            variant="secondary" 
                            className={getPpmColor(ppmValue)}
                          >
                            {getPpmRange(ppmValue)}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-date-${evaluation.id}`}>
                          {evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No PPM evaluations found</p>
                <Link href="/ppm-evaluation">
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