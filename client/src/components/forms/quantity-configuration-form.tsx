import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertQuantityConfigurationSchema, type InsertQuantityConfiguration, type QuantityConfiguration } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface QuantityConfigurationFormProps {
  initialData?: QuantityConfiguration;
  allConfigurations: QuantityConfiguration[];
}

const formSchema = insertQuantityConfigurationSchema.extend({
  perfectDeliveryScore: insertQuantityConfigurationSchema.shape.perfectDeliveryScore.refine(val => (val ?? 100) >= 0 && (val ?? 100) <= 100, "Score must be between 0-100"),
  shortfallPenaltyRate: insertQuantityConfigurationSchema.shape.shortfallPenaltyRate.refine(val => (val ?? 5) >= 0, "Penalty rate cannot be negative"),
  overdeliveryPenaltyRate: insertQuantityConfigurationSchema.shape.overdeliveryPenaltyRate.refine(val => (val ?? 2) >= 0, "Penalty rate cannot be negative"),
  minimumScore: insertQuantityConfigurationSchema.shape.minimumScore.refine(val => (val ?? 0) >= 0 && (val ?? 0) <= 100, "Score must be between 0-100"),
});

export default function QuantityConfigurationForm({ initialData, allConfigurations }: QuantityConfigurationFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<InsertQuantityConfiguration>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "SAP S4HANA Default",
      description: initialData?.description || "",
      perfectDeliveryScore: initialData?.perfectDeliveryScore || 100,
      shortfallPenaltyRate: initialData?.shortfallPenaltyRate || 5,
      overdeliveryPenaltyRate: initialData?.overdeliveryPenaltyRate || 2,
      minimumScore: initialData?.minimumScore || 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  const updateConfigurationMutation = useMutation({
    mutationFn: async (data: InsertQuantityConfiguration) => {
      if (initialData?.id) {
        const response = await apiRequest("PUT", `/api/configurations/quantity/${initialData.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/configurations/quantity", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/configurations/quantity"] });
      
      toast({
        title: "Configuration updated",
        description: "Quantity scoring configuration has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update configuration",
        description: error.message || "An error occurred while saving the configuration.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertQuantityConfiguration) => {
    await updateConfigurationMutation.mutateAsync(data);
  };

  const getScorePreview = (variancePercentage: number) => {
    const { perfectDeliveryScore, shortfallPenaltyRate, overdeliveryPenaltyRate, minimumScore } = form.getValues();
    
    if (variancePercentage === 0) return perfectDeliveryScore ?? 100;
    
    let score = perfectDeliveryScore ?? 100;
    if (variancePercentage < 0) {
      // Shortfall penalty
      score -= Math.abs(variancePercentage) * (shortfallPenaltyRate ?? 5);
    } else {
      // Overdelivery penalty
      score -= variancePercentage * (overdeliveryPenaltyRate ?? 2);
    }
    
    return Math.max(Math.round(score), minimumScore ?? 0);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <p>Configure how quantity variance is scored. Perfect deliveries score highest, with penalties for shortfalls and overdeliveries.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Configuration Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., SAP S4HANA Default" 
                      {...field}
                      data-testid="input-config-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Configuration</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Use this configuration for scoring
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-is-active"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe this configuration..."
                    {...field}
                    value={field.value || ""}
                    data-testid="textarea-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Scoring Parameters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="perfectDeliveryScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfect Delivery Score</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-perfect-score"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Score when ordered quantity = received quantity
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimumScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Score</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-minimum-score"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Lowest possible score (floor value)
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shortfallPenaltyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shortfall Penalty Rate</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-shortfall-penalty"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Points deducted per % of quantity shortfall
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overdeliveryPenaltyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overdelivery Penalty Rate</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="2"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-overdelivery-penalty"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Points deducted per % of quantity overdelivery
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Scoring Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Perfect delivery (0%)</p>
                  <p className="font-semibold text-green-600" data-testid="text-score-preview-1">
                    {getScorePreview(0)} points
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">-10% shortage</p>
                  <p className="font-semibold text-red-600" data-testid="text-score-preview-2">
                    {getScorePreview(-10)} points
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">+5% overdelivery</p>
                  <p className="font-semibold text-yellow-600" data-testid="text-score-preview-3">
                    {getScorePreview(5)} points
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">+20% overdelivery</p>
                  <p className="font-semibold text-orange-600" data-testid="text-score-preview-4">
                    {getScorePreview(20)} points
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={updateConfigurationMutation.isPending}
              data-testid="button-save-config"
            >
              {updateConfigurationMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => form.reset()}
              data-testid="button-reset-config"
            >
              Reset to Default
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}