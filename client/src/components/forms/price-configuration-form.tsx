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
import { insertPriceConfigurationSchema, type InsertPriceConfiguration, type PriceConfiguration } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface PriceConfigurationFormProps {
  initialData?: PriceConfiguration;
  allConfigurations: PriceConfiguration[];
}

const formSchema = insertPriceConfigurationSchema.extend({
  excellentThreshold: insertPriceConfigurationSchema.shape.excellentThreshold.refine(val => (val ?? -5) <= 0, "Excellent threshold must be negative (cost saving)"),
  penaltyRate: insertPriceConfigurationSchema.shape.penaltyRate.refine(val => (val ?? 10) >= 0, "Penalty rate cannot be negative"),
  minimumScore: insertPriceConfigurationSchema.shape.minimumScore.refine(val => (val ?? 0) >= 0 && (val ?? 0) <= 100, "Score must be between 0-100"),
});

export default function PriceConfigurationForm({ initialData, allConfigurations }: PriceConfigurationFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<InsertPriceConfiguration>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "SAP S4HANA Default",
      description: initialData?.description || "",
      excellentThreshold: initialData?.excellentThreshold || -5,
      goodThreshold: initialData?.goodThreshold || -2,
      acceptableThreshold: initialData?.acceptableThreshold || 2,
      penaltyRate: initialData?.penaltyRate || 10,
      minimumScore: initialData?.minimumScore || 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  const updateConfigurationMutation = useMutation({
    mutationFn: async (data: InsertPriceConfiguration) => {
      if (initialData?.id) {
        const response = await apiRequest("PUT", `/api/configurations/price/${initialData.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/configurations/price", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/configurations/price"] });
      
      toast({
        title: "Configuration updated",
        description: "Price scoring configuration has been saved successfully.",
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

  const onSubmit = async (data: InsertPriceConfiguration) => {
    await updateConfigurationMutation.mutateAsync(data);
  };

  const getScorePreview = (variance: number) => {
    const { excellentThreshold, goodThreshold, acceptableThreshold, penaltyRate, minimumScore } = form.getValues();
    
    if (variance <= (excellentThreshold ?? -5)) return 100;
    if (variance <= (goodThreshold ?? -2)) return 80;
    if (variance <= (acceptableThreshold ?? 2)) return 70;
    
    const penalty = Math.abs(variance - (acceptableThreshold ?? 2)) * (penaltyRate ?? 10);
    const score = Math.max(70 - penalty, minimumScore ?? 0);
    return Math.round(score);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <p>Configure how price variance is scored. Lower prices (negative variance) score higher, while price overages are penalized.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
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

          {/* Scoring Parameters */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Scoring Thresholds</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="excellentThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excellent Threshold (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="-5"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-excellent-threshold"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Cost savings of this % or more = 100 points
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goodThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Good Threshold (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="-2"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-good-threshold"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Cost savings between this % and excellent = 80 points
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptableThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acceptable Threshold (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="2"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-acceptable-threshold"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Price variance within ±this % = 70 points
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="penaltyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penalty Rate (points per %)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-penalty-rate"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Points deducted for each % over acceptable threshold
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
            </div>
          </div>

          {/* Scoring Preview */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Scoring Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">-10% variance</p>
                  <p className="font-semibold text-green-600" data-testid="text-score-preview-1">
                    {getScorePreview(-10)} points
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">0% variance</p>
                  <p className="font-semibold text-blue-600" data-testid="text-score-preview-2">
                    {getScorePreview(0)} points
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">+5% variance</p>
                  <p className="font-semibold text-yellow-600" data-testid="text-score-preview-3">
                    {getScorePreview(5)} points
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">+15% variance</p>
                  <p className="font-semibold text-red-600" data-testid="text-score-preview-4">
                    {getScorePreview(15)} points
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