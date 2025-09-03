import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSupplierSchema,
  insertPriceEvaluationSchema,
  insertQuantityEvaluationSchema,
  insertDeliveryEvaluationSchema,
  insertQualityEvaluationSchema,
  insertPpmEvaluationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Suppliers
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const validation = insertSupplierSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid supplier data", details: validation.error.errors });
      }
      
      const supplier = await storage.createSupplier(validation.data);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(500).json({ error: "Failed to create supplier" });
    }
  });

  // Price Evaluations
  app.get("/api/price-evaluations", async (req, res) => {
    try {
      const supplierId = req.query.supplierId as string | undefined;
      const evaluations = await storage.getPriceEvaluations(supplierId);
      res.json(evaluations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch price evaluations" });
    }
  });

  app.post("/api/price-evaluations", async (req, res) => {
    try {
      const validation = insertPriceEvaluationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid price evaluation data", details: validation.error.errors });
      }
      
      const evaluation = await storage.createPriceEvaluation(validation.data);
      res.status(201).json(evaluation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create price evaluation" });
    }
  });

  // Quantity Evaluations
  app.get("/api/quantity-evaluations", async (req, res) => {
    try {
      const supplierId = req.query.supplierId as string | undefined;
      const evaluations = await storage.getQuantityEvaluations(supplierId);
      res.json(evaluations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quantity evaluations" });
    }
  });

  app.post("/api/quantity-evaluations", async (req, res) => {
    try {
      const validation = insertQuantityEvaluationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid quantity evaluation data", details: validation.error.errors });
      }
      
      const evaluation = await storage.createQuantityEvaluation(validation.data);
      res.status(201).json(evaluation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create quantity evaluation" });
    }
  });

  // Delivery Evaluations
  app.get("/api/delivery-evaluations", async (req, res) => {
    try {
      const supplierId = req.query.supplierId as string | undefined;
      const evaluations = await storage.getDeliveryEvaluations(supplierId);
      res.json(evaluations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch delivery evaluations" });
    }
  });

  app.post("/api/delivery-evaluations", async (req, res) => {
    try {
      const validation = insertDeliveryEvaluationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid delivery evaluation data", details: validation.error.errors });
      }
      
      // Convert date strings to Date objects
      const data = {
        ...validation.data,
        scheduledDate: new Date(validation.data.scheduledDate),
        actualDate: new Date(validation.data.actualDate),
      };
      
      const evaluation = await storage.createDeliveryEvaluation(data);
      res.status(201).json(evaluation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create delivery evaluation" });
    }
  });

  // Quality Evaluations
  app.get("/api/quality-evaluations", async (req, res) => {
    try {
      const supplierId = req.query.supplierId as string | undefined;
      const evaluations = await storage.getQualityEvaluations(supplierId);
      res.json(evaluations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quality evaluations" });
    }
  });

  app.post("/api/quality-evaluations", async (req, res) => {
    try {
      const validation = insertQualityEvaluationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid quality evaluation data", details: validation.error.errors });
      }
      
      const evaluation = await storage.createQualityEvaluation(validation.data);
      res.status(201).json(evaluation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create quality evaluation" });
    }
  });

  // PPM Evaluations
  app.get("/api/ppm-evaluations", async (req, res) => {
    try {
      const supplierId = req.query.supplierId as string | undefined;
      const evaluations = await storage.getPpmEvaluations(supplierId);
      res.json(evaluations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch PPM evaluations" });
    }
  });

  app.post("/api/ppm-evaluations", async (req, res) => {
    try {
      const validation = insertPpmEvaluationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid PPM evaluation data", details: validation.error.errors });
      }
      
      const evaluation = await storage.createPpmEvaluation(validation.data);
      res.status(201).json(evaluation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create PPM evaluation" });
    }
  });

  // Supplier KPIs
  app.get("/api/supplier-kpis", async (req, res) => {
    try {
      const kpis = await storage.getSupplierKpis();
      res.json(kpis);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch supplier KPIs" });
    }
  });

  app.get("/api/supplier-kpis/:supplierId", async (req, res) => {
    try {
      const kpi = await storage.getSupplierKpi(req.params.supplierId);
      if (!kpi) {
        return res.status(404).json({ error: "Supplier KPI not found" });
      }
      res.json(kpi);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch supplier KPI" });
    }
  });

  // Dashboard summary
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      const kpis = await storage.getSupplierKpis();
      
      const totalSuppliers = suppliers.length;
      const avgPriceScore = kpis.reduce((sum, k) => sum + (k.priceScore || 0), 0) / totalSuppliers;
      const avgQuantityScore = kpis.reduce((sum, k) => sum + (k.quantityScore || 0), 0) / totalSuppliers;
      const avgDeliveryScore = kpis.reduce((sum, k) => sum + (k.deliveryScore || 0), 0) / totalSuppliers;
      const avgQualityScore = kpis.reduce((sum, k) => sum + (k.qualityScore || 0), 0) / totalSuppliers;
      const avgOverallKpi = kpis.reduce((sum, k) => sum + (k.overallKpi || 0), 0) / totalSuppliers;

      res.json({
        totalSuppliers,
        averageScores: {
          price: Math.round(avgPriceScore * 10) / 10,
          quantity: Math.round(avgQuantityScore * 10) / 10,
          delivery: Math.round(avgDeliveryScore * 10) / 10,
          quality: Math.round(avgQualityScore * 10) / 10,
          overall: Math.round(avgOverallKpi * 10) / 10,
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
  });

  // Export data
  app.get("/api/export/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      const kpis = await storage.getSupplierKpis();
      
      const exportData = suppliers.map(supplier => {
        const kpi = kpis.find(k => k.supplierId === supplier.id);
        return {
          ...supplier,
          kpi: kpi || null,
        };
      });

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=supplier-evaluation-report.json');
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ error: "Failed to export supplier data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
