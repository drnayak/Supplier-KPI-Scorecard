import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertDeliveryEvaluationSchema, type InsertDeliveryEvaluation, type Supplier } from "@shared/schema";
import { calculateDeliveryScore } from "@/lib/scoring-algorithms";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = insertDeliveryEvaluationSchema.extend({
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  actualDate: z.string().min(1, "Actual date is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function DeliveryEvaluationForm() {
  const [isCalculating, setIsCalculating] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: "",
      poNumber: "",
      itemNumber: "",
      scheduleLineNumber: "",
      scheduledDate: "",
      actualDate: "",
    },
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const createEvaluationMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const transformedData: InsertDeliveryEvaluation = {
        ...data,
        scheduledDate: new Date(data.scheduledDate),
        actualDate: new Date(data.actualDate),
      };
      const response = await apiRequest("POST", "/api/delivery-evaluations", transformedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      
      toast({
        title: "Delivery evaluation created",
        description: "The delivery evaluation has been saved successfully.",
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
  const calculation = watchedValues.scheduledDate && watchedValues.actualDate
    ? calculateDeliveryScore({ 
        scheduledDate: new Date(watchedValues.scheduledDate), 
        actualDate: new Date(watchedValues.actualDate) 
      })
    : null;

  const onSubmit = async (data: FormData) => {
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
            Delivery Time Evaluation
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
                          placeholder="e.g., 4500000185" 
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <FormField
                  control={form.control}
                  name="scheduleLineNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule Line Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 2" 
                          {...field}
                          data-testid="input-schedule-line"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Delivery Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          data-testid="input-scheduled-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actualDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Delivery Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          data-testid="input-actual-date"
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Overdue Days</p>
                        <p 
                          className={`font-semibold ${calculation.overdueDays <= 0 ? 'text-green-600' : 'text-red-600'}`}
                          data-testid="text-overdue-days"
                        >
                          {calculation.overdueDays}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Score Range</p>
                        <p className="font-semibold" data-testid="text-score-range">
                          {calculation.scoreRange}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Delivery Score</p>
                        <p 
                          className={`font-semibold text-2xl ${calculation.score >= 60 ? 'text-green-600' : 'text-red-600'}`}
                          data-testid="text-delivery-score"
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
