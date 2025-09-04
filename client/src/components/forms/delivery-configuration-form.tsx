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
import { insertDeliveryConfigurationSchema, type InsertDeliveryConfiguration, type DeliveryConfiguration } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface DeliveryConfigurationFormProps {
  initialData?: DeliveryConfiguration;
  allConfigurations: DeliveryConfiguration[];
}

const formSchema = insertDeliveryConfigurationSchema.extend({
  onTimeScore: insertDeliveryConfigurationSchema.shape.onTimeScore.refine(val => (val ?? 100) >= 0 && (val ?? 100) <= 100, "Score must be between 0-100"),
  penaltyPerDay: insertDeliveryConfigurationSchema.shape.penaltyPerDay.refine(val => (val ?? 5) >= 0, "Penalty cannot be negative"),
  maxOverdueDays: insertDeliveryConfigurationSchema.shape.maxOverdueDays.refine(val => (val ?? 20) >= 1, "Must be at least 1 day"),
  minimumScore: insertDeliveryConfigurationSchema.shape.minimumScore.refine(val => (val ?? 0) >= 0 && (val ?? 0) <= 100, "Score must be between 0-100"),
});

export default function DeliveryConfigurationForm({ initialData, allConfigurations }: DeliveryConfigurationFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<InsertDeliveryConfiguration>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "SAP S4HANA Default",
      description: initialData?.description || "",
      onTimeScore: initialData?.onTimeScore || 100,
      penaltyPerDay: initialData?.penaltyPerDay || 5,
      maxOverdueDays: initialData?.maxOverdueDays || 20,
      minimumScore: initialData?.minimumScore || 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  const updateConfigurationMutation = useMutation({
    mutationFn: async (data: InsertDeliveryConfiguration) => {
      if (initialData?.id) {
        const response = await apiRequest("PUT", `/api/configurations/delivery/${initialData.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/configurations/delivery", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/configurations/delivery"] });
      
      toast({
        title: "Configuration updated",
        description: "Delivery scoring configuration has been saved successfully.",
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

  const onSubmit = async (data: InsertDeliveryConfiguration) => {
    await updateConfigurationMutation.mutateAsync(data);
  };

  const getScorePreview = (overdueDays: number) => {
    const { onTimeScore, penaltyPerDay, minimumScore } = form.getValues();
    
    if (overdueDays <= 0) return onTimeScore ?? 100;
    
    const penalty = overdueDays * (penaltyPerDay ?? 5);
    const score = Math.max((onTimeScore ?? 100) - penalty, minimumScore ?? 0);
    return Math.round(score);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <p>Configure how delivery performance is scored. On-time and early deliveries score highest, with daily penalties for overdue deliveries.</p>
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
                name="onTimeScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>On-Time Score</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-ontime-score"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Score for on-time or early deliveries
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
                name="penaltyPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penalty Per Day</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-penalty-per-day"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Points deducted for each overdue day
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxOverdueDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Tracked Overdue Days</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="20"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-max-overdue-days"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Maximum overdue days to track for penalties
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
                  <p className="text-muted-foreground">On time</p>
                  <p className="font-semibold text-green-600" data-testid="text-score-preview-1">
                    {getScorePreview(0)} points
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">3 days late</p>
                  <p className="font-semibold text-yellow-600" data-testid="text-score-preview-2">
                    {getScorePreview(3)} points
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">7 days late</p>
                  <p className="font-semibold text-orange-600" data-testid="text-score-preview-3">
                    {getScorePreview(7)} points
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">15 days late</p>
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