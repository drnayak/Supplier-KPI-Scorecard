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
import { insertPpmConfigurationSchema, type InsertPpmConfiguration, type PpmConfiguration } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { formatPpm } from "@/lib/scoring-algorithms";

interface PpmConfigurationFormProps {
  initialData?: PpmConfiguration;
  allConfigurations: PpmConfiguration[];
}

const formSchema = insertPpmConfigurationSchema.extend({
  excellentThreshold: insertPpmConfigurationSchema.shape.excellentThreshold.refine(val => (val ?? 1000) >= 1, "Threshold must be at least 1"),
  goodThreshold: insertPpmConfigurationSchema.shape.goodThreshold.refine(val => (val ?? 10000) >= 1, "Threshold must be at least 1"),
});

export default function PpmConfigurationForm({ initialData, allConfigurations }: PpmConfigurationFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<InsertPpmConfiguration>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "SAP S4HANA Default",
      description: initialData?.description || "",
      zeroDefectsLabel: initialData?.zeroDefectsLabel || "Zero Defects",
      excellentThreshold: initialData?.excellentThreshold || 1000,
      excellentLabel: initialData?.excellentLabel || "Excellent",
      goodThreshold: initialData?.goodThreshold || 10000,
      goodLabel: initialData?.goodLabel || "Good",
      improvementLabel: initialData?.improvementLabel || "Needs Improvement",
      isActive: initialData?.isActive ?? true,
    },
  });

  const updateConfigurationMutation = useMutation({
    mutationFn: async (data: InsertPpmConfiguration) => {
      if (initialData?.id) {
        const response = await apiRequest("PUT", `/api/configurations/ppm/${initialData.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/configurations/ppm", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/configurations/ppm"] });
      
      toast({
        title: "Configuration updated",
        description: "PPM configuration has been saved successfully.",
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

  const onSubmit = async (data: InsertPpmConfiguration) => {
    await updateConfigurationMutation.mutateAsync(data);
  };

  const getQualityRange = (ppmValue: number) => {
    const { excellentThreshold, goodThreshold, zeroDefectsLabel, excellentLabel, goodLabel, improvementLabel } = form.getValues();
    
    if (ppmValue === 0) return zeroDefectsLabel || "Zero Defects";
    if (ppmValue < (excellentThreshold ?? 1000)) return excellentLabel || "Excellent";
    if (ppmValue < (goodThreshold ?? 10000)) return goodLabel || "Good";
    return improvementLabel || "Needs Improvement";
  };

  const getRangeColor = (ppmValue: number) => {
    const { excellentThreshold, goodThreshold } = form.getValues();
    
    if (ppmValue === 0) return "text-green-600";
    if (ppmValue < (excellentThreshold ?? 1000)) return "text-blue-600";
    if (ppmValue < (goodThreshold ?? 10000)) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <p>Configure PPM (Parts Per Million) evaluation ranges and labels. PPM is calculated as (Rejected Quantity / Total Received Quantity) × 1,000,000.</p>
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
            <h3 className="text-lg font-medium">Quality Range Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="zeroDefectsLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zero Defects Label</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Zero Defects" 
                        {...field}
                        data-testid="input-zero-defects-label"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Label for 0 PPM (perfect quality)
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excellentLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excellent Range Label</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Excellent" 
                        {...field}
                        data-testid="input-excellent-label"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Label for low PPM values
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excellentThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excellent Threshold (PPM)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-excellent-threshold"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      PPM values below this are "Excellent"
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goodLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Good Range Label</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Good" 
                        {...field}
                        data-testid="input-good-label"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Label for medium PPM values
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
                    <FormLabel>Good Threshold (PPM)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-good-threshold"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      PPM values below this are "Good"
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="improvementLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Improvement Needed Label</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Needs Improvement" 
                        {...field}
                        data-testid="input-improvement-label"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Label for high PPM values
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Quality Range Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">0 PPM</p>
                  <p className={`font-semibold ${getRangeColor(0)}`} data-testid="text-range-preview-1">
                    {getQualityRange(0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">500 PPM</p>
                  <p className={`font-semibold ${getRangeColor(500)}`} data-testid="text-range-preview-2">
                    {getQualityRange(500)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">5,000 PPM</p>
                  <p className={`font-semibold ${getRangeColor(5000)}`} data-testid="text-range-preview-3">
                    {getQualityRange(5000)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">50,000 PPM</p>
                  <p className={`font-semibold ${getRangeColor(50000)}`} data-testid="text-range-preview-4">
                    {getQualityRange(50000)}
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