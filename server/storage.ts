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
  type SupplierKpi
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
}

export class MemStorage implements IStorage {
  private suppliers: Map<string, Supplier> = new Map();
  private priceEvaluations: Map<string, PriceEvaluation> = new Map();
  private quantityEvaluations: Map<string, QuantityEvaluation> = new Map();
  private deliveryEvaluations: Map<string, DeliveryEvaluation> = new Map();
  private qualityEvaluations: Map<string, QualityEvaluation> = new Map();
  private ppmEvaluations: Map<string, PpmEvaluation> = new Map();
  private supplierKpis: Map<string, SupplierKpi> = new Map();

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
}

export const storage = new MemStorage();
