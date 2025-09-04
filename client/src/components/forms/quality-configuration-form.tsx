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
import { insertQualityConfigurationSchema, type InsertQualityConfiguration, type QualityConfiguration } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface QualityConfigurationFormProps {
  initialData?: QualityConfiguration;
  allConfigurations: QualityConfiguration[];
}

const formSchema = insertQualityConfigurationSchema.extend({
  baseScore: insertQualityConfigurationSchema.shape.baseScore.refine(val => (val ?? 100) >= 0 && (val ?? 100) <= 100, "Score must be between 0-100"),
  notificationPenalty: insertQualityConfigurationSchema.shape.notificationPenalty.refine(val => (val ?? 10) >= 0, "Penalty cannot be negative"),
  inspectionOkBonus: insertQualityConfigurationSchema.shape.inspectionOkBonus.refine(val => (val ?? 0) >= 0, "Bonus cannot be negative"),
  inspectionNotOkPenalty: insertQualityConfigurationSchema.shape.inspectionNotOkPenalty.refine(val => (val ?? 20) >= 0, "Penalty cannot be negative"),
  minimumScore: insertQualityConfigurationSchema.shape.minimumScore.refine(val => (val ?? 0) >= 0 && (val ?? 0) <= 100, "Score must be between 0-100"),
});

export default function QualityConfigurationForm({ initialData, allConfigurations }: QualityConfigurationFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<InsertQualityConfiguration>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "SAP S4HANA Default",
      description: initialData?.description || "",
      baseScore: initialData?.baseScore || 100,
      notificationPenalty: initialData?.notificationPenalty || 10,
      inspectionOkBonus: initialData?.inspectionOkBonus || 0,
      inspectionNotOkPenalty: initialData?.inspectionNotOkPenalty || 20,
      minimumScore: initialData?.minimumScore || 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  const updateConfigurationMutation = useMutation({
    mutationFn: async (data: InsertQualityConfiguration) => {
      if (initialData?.id) {
        const response = await apiRequest("PUT", `/api/configurations/quality/${initialData.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/configurations/quality", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/configurations/quality"] });
      
      toast({
        title: "Configuration updated",
        description: "Quality scoring configuration has been saved successfully.",
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

  const onSubmit = async (data: InsertQualityConfiguration) => {
    await updateConfigurationMutation.mutateAsync(data);
  };

  const getScorePreview = (notifications: number, inspectionResult: 'OK' | 'NOT_OK') => {
    const { baseScore, notificationPenalty, inspectionOkBonus, inspectionNotOkPenalty, minimumScore } = form.getValues();
    
    let score = baseScore ?? 100;
    score -= notifications * (notificationPenalty ?? 10);
    
    if (inspectionResult === 'OK') {
      score += inspectionOkBonus ?? 0;
    } else {
      score -= inspectionNotOkPenalty ?? 20;
    }
    
    return Math.max(Math.round(score), minimumScore ?? 0);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <p>Configure how quality performance is scored. Combines quality notification counts with inspection results for comprehensive quality assessment.</p>
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
                name="baseScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Score</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-base-score"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Starting score before deductions
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
                name="notificationPenalty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Penalty</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-notification-penalty"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Points deducted per quality notification
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inspectionNotOkPenalty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspection NOT_OK Penalty</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="20"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-inspection-penalty"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Additional penalty for failed inspections
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
                  <p className="text-muted-foreground">0 notifications, OK</p>
                  <p className="font-semibold text-green-600" data-testid="text-score-preview-1">
                    {getScorePreview(0, 'OK')} points
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">2 notifications, OK</p>
                  <p className="font-semibold text-yellow-600" data-testid="text-score-preview-2">
                    {getScorePreview(2, 'OK')} points
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">1 notification, NOT_OK</p>
                  <p className="font-semibold text-orange-600" data-testid="text-score-preview-3">
                    {getScorePreview(1, 'NOT_OK')} points
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">5 notifications, NOT_OK</p>
                  <p className="font-semibold text-red-600" data-testid="text-score-preview-4">
                    {getScorePreview(5, 'NOT_OK')} points
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