import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, DollarSign, Package, Clock, AlertTriangle, Microscope } from "lucide-react";
import Header from "@/components/layout/header";
import PriceConfigurationForm from "@/components/forms/price-configuration-form";
import QuantityConfigurationForm from "@/components/forms/quantity-configuration-form";
import DeliveryConfigurationForm from "@/components/forms/delivery-configuration-form";
import QualityConfigurationForm from "@/components/forms/quality-configuration-form";
import PpmConfigurationForm from "@/components/forms/ppm-configuration-form";
import type { 
  PriceConfiguration, 
  QuantityConfiguration, 
  DeliveryConfiguration, 
  QualityConfiguration, 
  PpmConfiguration 
} from "@shared/schema";

export default function Configurations() {
  const [activeTab, setActiveTab] = useState("price");

  const { data: priceConfigs } = useQuery<PriceConfiguration[]>({
    queryKey: ["/api/configurations/price"],
  });

  const { data: quantityConfigs } = useQuery<QuantityConfiguration[]>({
    queryKey: ["/api/configurations/quantity"],
  });

  const { data: deliveryConfigs } = useQuery<DeliveryConfiguration[]>({
    queryKey: ["/api/configurations/delivery"],
  });

  const { data: qualityConfigs } = useQuery<QualityConfiguration[]>({
    queryKey: ["/api/configurations/quality"],
  });

  const { data: ppmConfigs } = useQuery<PpmConfiguration[]>({
    queryKey: ["/api/configurations/ppm"],
  });

  const activePriceConfig = priceConfigs?.find(config => config.isActive);
  const activeQuantityConfig = quantityConfigs?.find(config => config.isActive);
  const activeDeliveryConfig = deliveryConfigs?.find(config => config.isActive);
  const activeQualityConfig = qualityConfigs?.find(config => config.isActive);
  const activePpmConfig = ppmConfigs?.find(config => config.isActive);

  return (
    <div>
      <Header
        title="Scoring Configuration"
        description="Configure scoring rules and formulas for supplier evaluations"
      />
      
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="price" data-testid="tab-price-config">
              <DollarSign className="h-4 w-4 mr-2" />
              Price
            </TabsTrigger>
            <TabsTrigger value="quantity" data-testid="tab-quantity-config">
              <Package className="h-4 w-4 mr-2" />
              Quantity
            </TabsTrigger>
            <TabsTrigger value="delivery" data-testid="tab-delivery-config">
              <Clock className="h-4 w-4 mr-2" />
              Delivery
            </TabsTrigger>
            <TabsTrigger value="quality" data-testid="tab-quality-config">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Quality
            </TabsTrigger>
            <TabsTrigger value="ppm" data-testid="tab-ppm-config">
              <Microscope className="h-4 w-4 mr-2" />
              PPM
            </TabsTrigger>
          </TabsList>

          <TabsContent value="price" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Price Variance Scoring Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PriceConfigurationForm 
                  initialData={activePriceConfig}
                  allConfigurations={priceConfigs || []}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quantity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Quantity Variance Scoring Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuantityConfigurationForm 
                  initialData={activeQuantityConfig}
                  allConfigurations={quantityConfigs || []}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Delivery Time Scoring Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DeliveryConfigurationForm 
                  initialData={activeDeliveryConfig}
                  allConfigurations={deliveryConfigs || []}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Quality Evaluation Scoring Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QualityConfigurationForm 
                  initialData={activeQualityConfig}
                  allConfigurations={qualityConfigs || []}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ppm" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microscope className="h-5 w-5" />
                  PPM (Parts Per Million) Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PpmConfigurationForm 
                  initialData={activePpmConfig}
                  allConfigurations={ppmConfigs || []}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}