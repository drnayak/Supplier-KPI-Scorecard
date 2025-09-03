import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertQualityEvaluationSchema, type InsertQualityEvaluation, type Supplier } from "@shared/schema";
import { calculateQualityScore } from "@/lib/scoring-algorithms";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

const formSchema = insertQualityEvaluationSchema.extend({
  qualityNotifications: insertQualityEvaluationSchema.shape.qualityNotifications.min(0, "Quality notifications cannot be negative"),
});

export default function QualityEvaluationForm() {
  const [isCalculating, setIsCalculating] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<InsertQualityEvaluation>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: "",
      poNumber: "",
      itemNumber: "",
      qualityNotifications: 0,
      inspectionResult: "OK",
    },
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const createEvaluationMutation = useMutation({
    mutationFn: async (data: InsertQualityEvaluation) => {
      const response = await apiRequest("POST", "/api/quality-evaluations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quality-evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      
      toast({
        title: "Quality evaluation created",
        description: "The quality evaluation has been saved successfully.",
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
  const calculation = watchedValues.qualityNotifications !== undefined && watchedValues.inspectionResult
    ? calculateQualityScore({ 
        qualityNotifications: watchedValues.qualityNotifications, 
        inspectionResult: watchedValues.inspectionResult as 'OK' | 'NOT_OK'
      })
    : null;

  const onSubmit = async (data: InsertQualityEvaluation) => {
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
            Quality Evaluation
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
                          placeholder="e.g., 4500000202" 
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
                        placeholder="e.g., 10" 
                        {...field}
                        data-testid="input-item-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="qualityNotifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quality Notifications Count</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-quality-notifications"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inspectionResult"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inspection Result</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-inspection-result">
                            <SelectValue placeholder="Select result" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OK">OK</SelectItem>
                          <SelectItem value="NOT_OK">Not OK</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Notification Score</p>
                        <p 
                          className={`font-semibold ${calculation.notificationScore >= 80 ? 'text-green-600' : calculation.notificationScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
                          data-testid="text-notification-score"
                        >
                          {calculation.notificationScore}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Inspection Score</p>
                        <p 
                          className={`font-semibold ${calculation.inspectionScore === 100 ? 'text-green-600' : 'text-red-600'}`}
                          data-testid="text-inspection-score"
                        >
                          {calculation.inspectionScore}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Overall Quality Score</p>
                        <p 
                          className={`font-semibold text-2xl ${calculation.overallScore >= 80 ? 'text-green-600' : calculation.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
                          data-testid="text-overall-quality-score"
                        >
                          {Math.round(calculation.overallScore)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-background rounded border">
                      <p className="text-sm text-muted-foreground mb-2">Scoring Logic:</p>
                      <div className="text-xs space-y-1">
                        <p><strong>Notifications:</strong> 0=100, 1-5=80, 6-10=60, 11-20=40, 21-50=20, 50+=5</p>
                        <p><strong>Inspection:</strong> OK=100, Not OK=1</p>
                        <p><strong>Overall:</strong> Average of both scores</p>
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
