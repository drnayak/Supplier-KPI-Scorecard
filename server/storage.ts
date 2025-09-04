import { 
  type Supplier, 
  type InsertSupplier,
  type PriceEvaluation,
  type InsertPriceEvaluation,
  type QuantityEvaluation,
  type InsertQuantityEvaluation,
  type DeliveryEvaluation,
  type InsertDeliveryEvaluation,
  type QualityEvaluation,
  type InsertQualityEvaluation,
  type PpmEvaluation,
  type InsertPpmEvaluation,
  type SupplierKpi,
  type PriceConfiguration,
  type InsertPriceConfiguration,
  type QuantityConfiguration,
  type InsertQuantityConfiguration,
  type DeliveryConfiguration,
  type InsertDeliveryConfiguration,
  type QualityConfiguration,
  type InsertQualityConfiguration,
  type PpmConfiguration,
  type InsertPpmConfiguration
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;

  // Price Evaluations
  getPriceEvaluations(supplierId?: string): Promise<PriceEvaluation[]>;
  createPriceEvaluation(evaluation: InsertPriceEvaluation): Promise<PriceEvaluation>;

  // Quantity Evaluations
  getQuantityEvaluations(supplierId?: string): Promise<QuantityEvaluation[]>;
  createQuantityEvaluation(evaluation: InsertQuantityEvaluation): Promise<QuantityEvaluation>;

  // Delivery Evaluations
  getDeliveryEvaluations(supplierId?: string): Promise<DeliveryEvaluation[]>;
  createDeliveryEvaluation(evaluation: InsertDeliveryEvaluation): Promise<DeliveryEvaluation>;

  // Quality Evaluations
  getQualityEvaluations(supplierId?: string): Promise<QualityEvaluation[]>;
  createQualityEvaluation(evaluation: InsertQualityEvaluation): Promise<QualityEvaluation>;

  // PPM Evaluations
  getPpmEvaluations(supplierId?: string): Promise<PpmEvaluation[]>;
  createPpmEvaluation(evaluation: InsertPpmEvaluation): Promise<PpmEvaluation>;

  // Supplier KPIs
  getSupplierKpis(): Promise<SupplierKpi[]>;
  getSupplierKpi(supplierId: string): Promise<SupplierKpi | undefined>;
  updateSupplierKpi(supplierId: string, kpi: Partial<SupplierKpi>): Promise<SupplierKpi>;

  // Configuration Management
  // Price Configurations
  getPriceConfigurations(): Promise<PriceConfiguration[]>;
  getActivePriceConfiguration(): Promise<PriceConfiguration | undefined>;
  createPriceConfiguration(config: InsertPriceConfiguration): Promise<PriceConfiguration>;
  updatePriceConfiguration(id: string, config: Partial<InsertPriceConfiguration>): Promise<PriceConfiguration | undefined>;

  // Quantity Configurations
  getQuantityConfigurations(): Promise<QuantityConfiguration[]>;
  getActiveQuantityConfiguration(): Promise<QuantityConfiguration | undefined>;
  createQuantityConfiguration(config: InsertQuantityConfiguration): Promise<QuantityConfiguration>;
  updateQuantityConfiguration(id: string, config: Partial<InsertQuantityConfiguration>): Promise<QuantityConfiguration | undefined>;

  // Delivery Configurations
  getDeliveryConfigurations(): Promise<DeliveryConfiguration[]>;
  getActiveDeliveryConfiguration(): Promise<DeliveryConfiguration | undefined>;
  createDeliveryConfiguration(config: InsertDeliveryConfiguration): Promise<DeliveryConfiguration>;
  updateDeliveryConfiguration(id: string, config: Partial<InsertDeliveryConfiguration>): Promise<DeliveryConfiguration | undefined>;

  // Quality Configurations
  getQualityConfigurations(): Promise<QualityConfiguration[]>;
  getActiveQualityConfiguration(): Promise<QualityConfiguration | undefined>;
  createQualityConfiguration(config: InsertQualityConfiguration): Promise<QualityConfiguration>;
  updateQualityConfiguration(id: string, config: Partial<InsertQualityConfiguration>): Promise<QualityConfiguration | undefined>;

  // PPM Configurations
  getPpmConfigurations(): Promise<PpmConfiguration[]>;
  getActivePpmConfiguration(): Promise<PpmConfiguration | undefined>;
  createPpmConfiguration(config: InsertPpmConfiguration): Promise<PpmConfiguration>;
  updatePpmConfiguration(id: string, config: Partial<InsertPpmConfiguration>): Promise<PpmConfiguration | undefined>;
}

export class MemStorage implements IStorage {
  private suppliers: Map<string, Supplier> = new Map();
  private priceEvaluations: Map<string, PriceEvaluation> = new Map();
  private quantityEvaluations: Map<string, QuantityEvaluation> = new Map();
  private deliveryEvaluations: Map<string, DeliveryEvaluation> = new Map();
  private qualityEvaluations: Map<string, QualityEvaluation> = new Map();
  private ppmEvaluations: Map<string, PpmEvaluation> = new Map();
  private supplierKpis: Map<string, SupplierKpi> = new Map();
  
  // Configuration storage
  private priceConfigurations: Map<string, PriceConfiguration> = new Map();
  private quantityConfigurations: Map<string, QuantityConfiguration> = new Map();
  private deliveryConfigurations: Map<string, DeliveryConfiguration> = new Map();
  private qualityConfigurations: Map<string, QualityConfiguration> = new Map();
  private ppmConfigurations: Map<string, PpmConfiguration> = new Map();

  constructor() {
    // Initialize with some sample suppliers
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleSuppliers = [
      { name: "ABC Manufacturing Ltd", code: "SUP-001", contactEmail: "contact@abcmfg.com", contactPhone: "+1-555-0101", address: "123 Industrial Ave, Manufacturing City, MC 12345" },
      { name: "XYZ Components Inc", code: "SUP-002", contactEmail: "sales@xyzcomp.com", contactPhone: "+1-555-0102", address: "456 Component St, Tech Valley, TV 67890" },
      { name: "Global Supply Co", code: "SUP-003", contactEmail: "orders@globalsupply.com", contactPhone: "+1-555-0103", address: "789 Supply Chain Blvd, Logistics City, LC 54321" },
    ];

    for (const supplierData of sampleSuppliers) {
      const id = randomUUID();
      const supplier: Supplier = {
        id,
        name: supplierData.name,
        code: supplierData.code,
        contactEmail: supplierData.contactEmail || null,
        contactPhone: supplierData.contactPhone || null,
        address: supplierData.address || null,
        createdAt: new Date(),
      };
      this.suppliers.set(id, supplier);

      // Initialize KPI for each supplier
      const kpi: SupplierKpi = {
        id: randomUUID(),
        supplierId: id,
        priceScore: 0,
        quantityScore: 0,
        deliveryScore: 0,
        qualityScore: 0,
        overallKpi: 0,
        evaluationCount: 0,
        lastUpdated: new Date(),
      };
      this.supplierKpis.set(id, kpi);
    }

    // Initialize default configurations
    this.initializeDefaultConfigurations();
  }

  private initializeDefaultConfigurations() {
    // Default Price Configuration
    const priceConfigId = randomUUID();
    const defaultPriceConfig: PriceConfiguration = {
      id: priceConfigId,
      name: "SAP S4HANA Default",
      description: "Standard SAP price variance scoring configuration",
      excellentThreshold: -5,
      goodThreshold: -2,
      acceptableThreshold: 2,
      penaltyRate: 10,
      minimumScore: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.priceConfigurations.set(priceConfigId, defaultPriceConfig);

    // Default Quantity Configuration
    const quantityConfigId = randomUUID();
    const defaultQuantityConfig: QuantityConfiguration = {
      id: quantityConfigId,
      name: "SAP S4HANA Default",
      description: "Standard SAP quantity variance scoring configuration",
      perfectDeliveryScore: 100,
      shortfallPenaltyRate: 5,
      overdeliveryPenaltyRate: 2,
      minimumScore: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.quantityConfigurations.set(quantityConfigId, defaultQuantityConfig);

    // Default Delivery Configuration
    const deliveryConfigId = randomUUID();
    const defaultDeliveryConfig: DeliveryConfiguration = {
      id: deliveryConfigId,
      name: "SAP S4HANA Default",
      description: "Standard SAP delivery time scoring configuration",
      onTimeScore: 100,
      penaltyPerDay: 5,
      maxOverdueDays: 20,
      minimumScore: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.deliveryConfigurations.set(deliveryConfigId, defaultDeliveryConfig);

    // Default Quality Configuration
    const qualityConfigId = randomUUID();
    const defaultQualityConfig: QualityConfiguration = {
      id: qualityConfigId,
      name: "SAP S4HANA Default",
      description: "Standard SAP quality evaluation scoring configuration",
      baseScore: 100,
      notificationPenalty: 10,
      inspectionOkBonus: 0,
      inspectionNotOkPenalty: 20,
      minimumScore: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.qualityConfigurations.set(qualityConfigId, defaultQualityConfig);

    // Default PPM Configuration
    const ppmConfigId = randomUUID();
    const defaultPpmConfig: PpmConfiguration = {
      id: ppmConfigId,
      name: "SAP S4HANA Default",
      description: "Standard SAP PPM evaluation configuration",
      zeroDefectsLabel: "Zero Defects",
      excellentThreshold: 1000,
      excellentLabel: "Excellent",
      goodThreshold: 10000,
      goodLabel: "Good",
      improvementLabel: "Needs Improvement",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.ppmConfigurations.set(ppmConfigId, defaultPpmConfig);
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = {
      id,
      name: insertSupplier.name,
      code: insertSupplier.code,
      contactEmail: insertSupplier.contactEmail || null,
      contactPhone: insertSupplier.contactPhone || null,
      address: insertSupplier.address || null,
      createdAt: new Date(),
    };
    this.suppliers.set(id, supplier);

    // Initialize KPI for new supplier
    const kpi: SupplierKpi = {
      id: randomUUID(),
      supplierId: id,
      priceScore: 0,
      quantityScore: 0,
      deliveryScore: 0,
      qualityScore: 0,
      overallKpi: 0,
      evaluationCount: 0,
      lastUpdated: new Date(),
    };
    this.supplierKpis.set(id, kpi);

    return supplier;
  }

  async updateSupplier(id: string, updateData: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;

    const updated = { ...supplier, ...updateData };
    this.suppliers.set(id, updated);
    return updated;
  }

  // Price Evaluations
  async getPriceEvaluations(supplierId?: string): Promise<PriceEvaluation[]> {
    const evaluations = Array.from(this.priceEvaluations.values());
    return supplierId ? evaluations.filter(e => e.supplierId === supplierId) : evaluations;
  }

  async createPriceEvaluation(evaluation: InsertPriceEvaluation): Promise<PriceEvaluation> {
    const id = randomUUID();
    
    // Calculate variance and score
    const varianceAmount = evaluation.invoicePrice - evaluation.poPrice;
    const variancePercentage = (varianceAmount / evaluation.poPrice) * 100;
    const score = this.calculatePriceScore(variancePercentage);

    const priceEvaluation: PriceEvaluation = {
      id,
      ...evaluation,
      varianceAmount,
      variancePercentage,
      score,
      createdAt: new Date(),
    };
    
    this.priceEvaluations.set(id, priceEvaluation);
    await this.updateSupplierKpis(evaluation.supplierId);
    
    return priceEvaluation;
  }

  // Quantity Evaluations
  async getQuantityEvaluations(supplierId?: string): Promise<QuantityEvaluation[]> {
    const evaluations = Array.from(this.quantityEvaluations.values());
    return supplierId ? evaluations.filter(e => e.supplierId === supplierId) : evaluations;
  }

  async createQuantityEvaluation(evaluation: InsertQuantityEvaluation): Promise<QuantityEvaluation> {
    const id = randomUUID();
    
    const varianceQuantity = evaluation.receivedQuantity - evaluation.orderedQuantity;
    const variancePercentage = (varianceQuantity / evaluation.orderedQuantity) * 100;
    const score = this.calculateQuantityScore(variancePercentage);

    const quantityEvaluation: QuantityEvaluation = {
      id,
      ...evaluation,
      varianceQuantity,
      variancePercentage,
      score,
      createdAt: new Date(),
    };
    
    this.quantityEvaluations.set(id, quantityEvaluation);
    await this.updateSupplierKpis(evaluation.supplierId);
    
    return quantityEvaluation;
  }

  // Delivery Evaluations
  async getDeliveryEvaluations(supplierId?: string): Promise<DeliveryEvaluation[]> {
    const evaluations = Array.from(this.deliveryEvaluations.values());
    return supplierId ? evaluations.filter(e => e.supplierId === supplierId) : evaluations;
  }

  async createDeliveryEvaluation(evaluation: InsertDeliveryEvaluation): Promise<DeliveryEvaluation> {
    const id = randomUUID();
    
    const timeDiff = evaluation.actualDate.getTime() - evaluation.scheduledDate.getTime();
    const overdueDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const score = this.calculateDeliveryScore(overdueDays);

    const deliveryEvaluation: DeliveryEvaluation = {
      id,
      ...evaluation,
      overdueDays,
      score,
      createdAt: new Date(),
    };
    
    this.deliveryEvaluations.set(id, deliveryEvaluation);
    await this.updateSupplierKpis(evaluation.supplierId);
    
    return deliveryEvaluation;
  }

  // Quality Evaluations
  async getQualityEvaluations(supplierId?: string): Promise<QualityEvaluation[]> {
    const evaluations = Array.from(this.qualityEvaluations.values());
    return supplierId ? evaluations.filter(e => e.supplierId === supplierId) : evaluations;
  }

  async createQualityEvaluation(evaluation: InsertQualityEvaluation): Promise<QualityEvaluation> {
    const id = randomUUID();
    
    const notificationScore = this.calculateQualityNotificationScore(evaluation.qualityNotifications);
    const inspectionScore = evaluation.inspectionResult === 'OK' ? 100 : 1;
    const overallScore = (notificationScore + inspectionScore) / 2;

    const qualityEvaluation: QualityEvaluation = {
      id,
      ...evaluation,
      notificationScore,
      inspectionScore,
      overallScore,
      createdAt: new Date(),
    };
    
    this.qualityEvaluations.set(id, qualityEvaluation);
    await this.updateSupplierKpis(evaluation.supplierId);
    
    return qualityEvaluation;
  }

  // PPM Evaluations
  async getPpmEvaluations(supplierId?: string): Promise<PpmEvaluation[]> {
    const evaluations = Array.from(this.ppmEvaluations.values());
    return supplierId ? evaluations.filter(e => e.supplierId === supplierId) : evaluations;
  }

  async createPpmEvaluation(evaluation: InsertPpmEvaluation): Promise<PpmEvaluation> {
    const id = randomUUID();
    
    const ppmValue = Math.round((evaluation.rejectedQuantity / evaluation.totalReceivedQuantity) * 1000000);

    const ppmEvaluation: PpmEvaluation = {
      id,
      ...evaluation,
      ppmValue,
      createdAt: new Date(),
    };
    
    this.ppmEvaluations.set(id, ppmEvaluation);
    
    return ppmEvaluation;
  }

  // Supplier KPIs
  async getSupplierKpis(): Promise<SupplierKpi[]> {
    return Array.from(this.supplierKpis.values());
  }

  async getSupplierKpi(supplierId: string): Promise<SupplierKpi | undefined> {
    return this.supplierKpis.get(supplierId);
  }

  async updateSupplierKpi(supplierId: string, kpiData: Partial<SupplierKpi>): Promise<SupplierKpi> {
    const existing = this.supplierKpis.get(supplierId);
    const updated: SupplierKpi = {
      id: existing?.id || randomUUID(),
      supplierId,
      priceScore: 0,
      quantityScore: 0,
      deliveryScore: 0,
      qualityScore: 0,
      overallKpi: 0,
      evaluationCount: 0,
      lastUpdated: new Date(),
      ...existing,
      ...kpiData,
    };
    
    this.supplierKpis.set(supplierId, updated);
    return updated;
  }

  // Private scoring methods implementing SAP algorithms
  private calculatePriceScore(variancePercentage: number): number {
    // SAP Price scoring intervals based on documentation
    if (variancePercentage >= 20) return 5;
    if (variancePercentage >= 10) return 10;
    if (variancePercentage >= 5) return 20;
    if (variancePercentage >= 0) return 40;
    if (variancePercentage >= -5) return 60;
    if (variancePercentage >= -10) return 80;
    if (variancePercentage >= -20) return 90;
    return 95; // -20% to -100%
  }

  private calculateQuantityScore(variancePercentage: number): number {
    // SAP Quantity scoring intervals
    if (variancePercentage >= 20) return 100;
    if (variancePercentage >= 10) return 95;
    if (variancePercentage >= 5) return 90;
    if (variancePercentage >= 0) return 80;
    if (variancePercentage >= -5) return 60;
    if (variancePercentage >= -10) return 40;
    if (variancePercentage >= -20) return 20;
    return 10; // -20% to -100%
  }

  private calculateDeliveryScore(overdueDays: number): number {
    // SAP Delivery scoring based on overdue days
    if (overdueDays <= -60) return 5;
    if (overdueDays <= -30) return 20;
    if (overdueDays <= -10) return 40;
    if (overdueDays <= -1) return 65;
    if (overdueDays === 0) return 100;
    if (overdueDays <= 10) return 80;
    if (overdueDays <= 20) return 60;
    if (overdueDays <= 30) return 40;
    if (overdueDays <= 40) return 20;
    return 5; // 40+ days overdue
  }

  private calculateQualityNotificationScore(notifications: number): number {
    // SAP Quality notification scoring
    if (notifications === 0) return 100;
    if (notifications <= 5) return 80;
    if (notifications <= 10) return 60;
    if (notifications <= 20) return 40;
    if (notifications <= 50) return 20;
    return 5; // 50+ notifications
  }

  private async updateSupplierKpis(supplierId: string): Promise<void> {
    const priceEvals = await this.getPriceEvaluations(supplierId);
    const quantityEvals = await this.getQuantityEvaluations(supplierId);
    const deliveryEvals = await this.getDeliveryEvaluations(supplierId);
    const qualityEvals = await this.getQualityEvaluations(supplierId);

    const priceScore = priceEvals.length > 0 
      ? priceEvals.reduce((sum, e) => sum + e.score, 0) / priceEvals.length 
      : 0;
    
    const quantityScore = quantityEvals.length > 0 
      ? quantityEvals.reduce((sum, e) => sum + e.score, 0) / quantityEvals.length 
      : 0;
    
    const deliveryScore = deliveryEvals.length > 0 
      ? deliveryEvals.reduce((sum, e) => sum + e.score, 0) / deliveryEvals.length 
      : 0;
    
    const qualityScore = qualityEvals.length > 0 
      ? qualityEvals.reduce((sum, e) => sum + e.overallScore, 0) / qualityEvals.length 
      : 0;

    const overallKpi = (priceScore + quantityScore + deliveryScore + qualityScore) / 4;
    const evaluationCount = priceEvals.length + quantityEvals.length + deliveryEvals.length + qualityEvals.length;

    await this.updateSupplierKpi(supplierId, {
      priceScore,
      quantityScore,
      deliveryScore,
      qualityScore,
      overallKpi,
      evaluationCount,
      lastUpdated: new Date(),
    });
  }

  // Configuration Methods

  // Price Configurations
  async getPriceConfigurations(): Promise<PriceConfiguration[]> {
    return Array.from(this.priceConfigurations.values());
  }

  async getActivePriceConfiguration(): Promise<PriceConfiguration | undefined> {
    return Array.from(this.priceConfigurations.values()).find(config => config.isActive);
  }

  async createPriceConfiguration(config: InsertPriceConfiguration): Promise<PriceConfiguration> {
    const id = randomUUID();
    const priceConfig: PriceConfiguration = {
      id,
      name: config.name || "Default",
      description: config.description || null,
      excellentThreshold: config.excellentThreshold ?? -5,
      goodThreshold: config.goodThreshold ?? -2,
      acceptableThreshold: config.acceptableThreshold ?? 2,
      penaltyRate: config.penaltyRate ?? 10,
      minimumScore: config.minimumScore ?? 0,
      isActive: config.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.priceConfigurations.set(id, priceConfig);
    return priceConfig;
  }

  async updatePriceConfiguration(id: string, config: Partial<InsertPriceConfiguration>): Promise<PriceConfiguration | undefined> {
    const existing = this.priceConfigurations.get(id);
    if (!existing) return undefined;
    
    const updated: PriceConfiguration = {
      ...existing,
      ...config,
      updatedAt: new Date(),
    };
    this.priceConfigurations.set(id, updated);
    return updated;
  }

  // Quantity Configurations
  async getQuantityConfigurations(): Promise<QuantityConfiguration[]> {
    return Array.from(this.quantityConfigurations.values());
  }

  async getActiveQuantityConfiguration(): Promise<QuantityConfiguration | undefined> {
    return Array.from(this.quantityConfigurations.values()).find(config => config.isActive);
  }

  async createQuantityConfiguration(config: InsertQuantityConfiguration): Promise<QuantityConfiguration> {
    const id = randomUUID();
    const quantityConfig: QuantityConfiguration = {
      id,
      name: config.name || "Default",
      description: config.description || null,
      perfectDeliveryScore: config.perfectDeliveryScore ?? 100,
      shortfallPenaltyRate: config.shortfallPenaltyRate ?? 5,
      overdeliveryPenaltyRate: config.overdeliveryPenaltyRate ?? 2,
      minimumScore: config.minimumScore ?? 0,
      isActive: config.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.quantityConfigurations.set(id, quantityConfig);
    return quantityConfig;
  }

  async updateQuantityConfiguration(id: string, config: Partial<InsertQuantityConfiguration>): Promise<QuantityConfiguration | undefined> {
    const existing = this.quantityConfigurations.get(id);
    if (!existing) return undefined;
    
    const updated: QuantityConfiguration = {
      ...existing,
      ...config,
      updatedAt: new Date(),
    };
    this.quantityConfigurations.set(id, updated);
    return updated;
  }

  // Delivery Configurations
  async getDeliveryConfigurations(): Promise<DeliveryConfiguration[]> {
    return Array.from(this.deliveryConfigurations.values());
  }

  async getActiveDeliveryConfiguration(): Promise<DeliveryConfiguration | undefined> {
    return Array.from(this.deliveryConfigurations.values()).find(config => config.isActive);
  }

  async createDeliveryConfiguration(config: InsertDeliveryConfiguration): Promise<DeliveryConfiguration> {
    const id = randomUUID();
    const deliveryConfig: DeliveryConfiguration = {
      id,
      name: config.name || "Default",
      description: config.description || null,
      onTimeScore: config.onTimeScore ?? 100,
      penaltyPerDay: config.penaltyPerDay ?? 5,
      maxOverdueDays: config.maxOverdueDays ?? 20,
      minimumScore: config.minimumScore ?? 0,
      isActive: config.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.deliveryConfigurations.set(id, deliveryConfig);
    return deliveryConfig;
  }

  async updateDeliveryConfiguration(id: string, config: Partial<InsertDeliveryConfiguration>): Promise<DeliveryConfiguration | undefined> {
    const existing = this.deliveryConfigurations.get(id);
    if (!existing) return undefined;
    
    const updated: DeliveryConfiguration = {
      ...existing,
      ...config,
      updatedAt: new Date(),
    };
    this.deliveryConfigurations.set(id, updated);
    return updated;
  }

  // Quality Configurations
  async getQualityConfigurations(): Promise<QualityConfiguration[]> {
    return Array.from(this.qualityConfigurations.values());
  }

  async getActiveQualityConfiguration(): Promise<QualityConfiguration | undefined> {
    return Array.from(this.qualityConfigurations.values()).find(config => config.isActive);
  }

  async createQualityConfiguration(config: InsertQualityConfiguration): Promise<QualityConfiguration> {
    const id = randomUUID();
    const qualityConfig: QualityConfiguration = {
      id,
      name: config.name || "Default",
      description: config.description || null,
      baseScore: config.baseScore ?? 100,
      notificationPenalty: config.notificationPenalty ?? 10,
      inspectionOkBonus: config.inspectionOkBonus ?? 0,
      inspectionNotOkPenalty: config.inspectionNotOkPenalty ?? 20,
      minimumScore: config.minimumScore ?? 0,
      isActive: config.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.qualityConfigurations.set(id, qualityConfig);
    return qualityConfig;
  }

  async updateQualityConfiguration(id: string, config: Partial<InsertQualityConfiguration>): Promise<QualityConfiguration | undefined> {
    const existing = this.qualityConfigurations.get(id);
    if (!existing) return undefined;
    
    const updated: QualityConfiguration = {
      ...existing,
      ...config,
      updatedAt: new Date(),
    };
    this.qualityConfigurations.set(id, updated);
    return updated;
  }

  // PPM Configurations
  async getPpmConfigurations(): Promise<PpmConfiguration[]> {
    return Array.from(this.ppmConfigurations.values());
  }

  async getActivePpmConfiguration(): Promise<PpmConfiguration | undefined> {
    return Array.from(this.ppmConfigurations.values()).find(config => config.isActive);
  }

  async createPpmConfiguration(config: InsertPpmConfiguration): Promise<PpmConfiguration> {
    const id = randomUUID();
    const ppmConfig: PpmConfiguration = {
      id,
      name: config.name || "Default",
      description: config.description || null,
      zeroDefectsLabel: config.zeroDefectsLabel || "Zero Defects",
      excellentThreshold: config.excellentThreshold ?? 1000,
      excellentLabel: config.excellentLabel || "Excellent",
      goodThreshold: config.goodThreshold ?? 10000,
      goodLabel: config.goodLabel || "Good",
      improvementLabel: config.improvementLabel || "Needs Improvement",
      isActive: config.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.ppmConfigurations.set(id, ppmConfig);
    return ppmConfig;
  }

  async updatePpmConfiguration(id: string, config: Partial<InsertPpmConfiguration>): Promise<PpmConfiguration | undefined> {
    const existing = this.ppmConfigurations.get(id);
    if (!existing) return undefined;
    
    const updated: PpmConfiguration = {
      ...existing,
      ...config,
      updatedAt: new Date(),
    };
    this.ppmConfigurations.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
