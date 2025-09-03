import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertPpmEvaluationSchema, type InsertPpmEvaluation, type Supplier } from "@shared/schema";
import { calculatePpm, formatPpm } from "@/lib/scoring-algorithms";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

const formSchema = insertPpmEvaluationSchema.extend({
  rejectedQuantity: insertPpmEvaluationSchema.shape.rejectedQuantity.min(0, "Rejected quantity cannot be negative"),
  totalReceivedQuantity: insertPpmEvaluationSchema.shape.totalReceivedQuantity.min(1, "Total received quantity must be at least 1"),
});

export default function PpmEvaluationForm() {
  const [isCalculating, setIsCalculating] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<InsertPpmEvaluation>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: "",
      materialDocument: "",
      rejectedQuantity: 0,
      totalReceivedQuantity: 0,
    },
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const createEvaluationMutation = useMutation({
    mutationFn: async (data: InsertPpmEvaluation) => {
      const response = await apiRequest("POST", "/api/ppm-evaluations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ppm-evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      
      toast({
        title: "PPM evaluation created",
        description: "The PPM evaluation has been saved successfully.",
      });
      
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create evaluation",
        description: error.message || "An error occurred while saving the evaluation.",
        variant: "destructive",
      });
    },
  });

  const watchedValues = form.watch();
  const calculation = watchedValues.rejectedQuantity !== undefined && watchedValues.totalReceivedQuantity
    ? calculatePpm({ 
        rejectedQuantity: watchedValues.rejectedQuantity, 
        totalReceivedQuantity: watchedValues.totalReceivedQuantity 
      })
    : null;

  const onSubmit = async (data: InsertPpmEvaluation) => {
    setIsCalculating(true);
    try {
      await createEvaluationMutation.mutateAsync(data);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            PPM (Parts Per Million) Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="materialDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Document Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 4900000403" 
                          {...field}
                          data-testid="input-material-document"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-supplier">
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers?.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rejectedQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rejected Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-rejected-quantity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalReceivedQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Received Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="25"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-total-received-quantity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Live Calculation Display */}
              {calculation && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-base">Calculation Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">PPM Value</p>
                        <p 
                          className="font-semibold text-2xl text-blue-600"
                          data-testid="text-ppm-value"
                        >
                          {formatPpm(calculation.ppmValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quality Range</p>
                        <p 
                          className={`font-semibold ${
                            calculation.ppmValue === 0 ? 'text-green-600' :
                            calculation.ppmValue < 1000 ? 'text-blue-600' :
                            calculation.ppmValue < 10000 ? 'text-yellow-600' : 'text-red-600'
                          }`}
                          data-testid="text-quality-range"
                        >
                          {calculation.scoreRange}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-background rounded border">
                      <p className="text-sm text-muted-foreground mb-2">Calculation Formula:</p>
                      <div className="text-xs space-y-1">
                        <p><strong>PPM = (Rejected Quantity / Total Received Quantity) × 1,000,000</strong></p>
                        <p>Example from SAP: 20/25 × 1,000,000 = 800K PPM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={isCalculating || createEvaluationMutation.isPending}
                  data-testid="button-submit-evaluation"
                >
                  {isCalculating || createEvaluationMutation.isPending ? "Saving..." : "Calculate & Save"}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => form.reset()}
                  data-testid="button-reset-form"
                >
                  Reset Form
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}