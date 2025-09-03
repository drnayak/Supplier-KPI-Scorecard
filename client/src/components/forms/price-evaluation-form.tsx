import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertPriceEvaluationSchema, type InsertPriceEvaluation, type Supplier } from "@shared/schema";
import { calculatePriceScore } from "@/lib/scoring-algorithms";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

const formSchema = insertPriceEvaluationSchema.extend({
  poPrice: insertPriceEvaluationSchema.shape.poPrice.min(0.01, "PO price must be greater than 0"),
  invoicePrice: insertPriceEvaluationSchema.shape.invoicePrice.min(0.01, "Invoice price must be greater than 0"),
  quantity: insertPriceEvaluationSchema.shape.quantity.min(1, "Quantity must be at least 1"),
});

export default function PriceEvaluationForm() {
  const [isCalculating, setIsCalculating] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<InsertPriceEvaluation>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: "",
      poNumber: "",
      itemNumber: "",
      poPrice: 0,
      invoicePrice: 0,
      quantity: 0,
    },
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const createEvaluationMutation = useMutation({
    mutationFn: async (data: InsertPriceEvaluation) => {
      const response = await apiRequest("POST", "/api/price-evaluations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      
      toast({
        title: "Price evaluation created",
        description: "The price evaluation has been saved successfully.",
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
  const calculation = watchedValues.poPrice && watchedValues.invoicePrice 
    ? calculatePriceScore({ poPrice: watchedValues.poPrice, invoicePrice: watchedValues.invoicePrice })
    : null;

  const onSubmit = async (data: InsertPriceEvaluation) => {
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
            Price Variance Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="poNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Order Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 4500000124" 
                          {...field}
                          data-testid="input-po-number"
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

              <FormField
                control={form.control}
                name="itemNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 20" 
                        {...field}
                        data-testid="input-item-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="poPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Price per Unit</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="2.55"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-po-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoicePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Price per Unit</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="1.27"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-invoice-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-quantity"
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Variance Amount</p>
                        <p 
                          className={`font-semibold ${calculation.variance < 0 ? 'text-green-600' : 'text-red-600'}`}
                          data-testid="text-variance-amount"
                        >
                          ${calculation.variance.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Variance %</p>
                        <p 
                          className={`font-semibold ${calculation.variancePercentage < 0 ? 'text-green-600' : 'text-red-600'}`}
                          data-testid="text-variance-percentage"
                        >
                          {calculation.variancePercentage.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Score Range</p>
                        <p className="font-semibold" data-testid="text-score-range">
                          {calculation.scoreRange}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Variance Score</p>
                        <p 
                          className="font-semibold text-2xl text-green-600"
                          data-testid="text-variance-score"
                        >
                          {calculation.score}
                        </p>
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
