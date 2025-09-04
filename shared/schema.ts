import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const priceEvaluations = pgTable("price_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => suppliers.id),
  poNumber: text("po_number").notNull(),
  itemNumber: text("item_number").notNull(),
  poPrice: real("po_price").notNull(),
  invoicePrice: real("invoice_price").notNull(),
  quantity: integer("quantity").notNull(),
  varianceAmount: real("variance_amount").notNull(),
  variancePercentage: real("variance_percentage").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quantityEvaluations = pgTable("quantity_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => suppliers.id),
  poNumber: text("po_number").notNull(),
  itemNumber: text("item_number").notNull(),
  orderedQuantity: integer("ordered_quantity").notNull(),
  receivedQuantity: integer("received_quantity").notNull(),
  varianceQuantity: integer("variance_quantity").notNull(),
  variancePercentage: real("variance_percentage").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deliveryEvaluations = pgTable("delivery_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => suppliers.id),
  poNumber: text("po_number").notNull(),
  itemNumber: text("item_number").notNull(),
  scheduleLineNumber: text("schedule_line_number").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  actualDate: timestamp("actual_date").notNull(),
  overdueDays: integer("overdue_days").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const qualityEvaluations = pgTable("quality_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => suppliers.id),
  poNumber: text("po_number").notNull(),
  itemNumber: text("item_number").notNull(),
  qualityNotifications: integer("quality_notifications").notNull(),
  inspectionResult: text("inspection_result").notNull(), // 'OK' or 'NOT_OK'
  notificationScore: integer("notification_score").notNull(),
  inspectionScore: integer("inspection_score").notNull(),
  overallScore: integer("overall_score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ppmEvaluations = pgTable("ppm_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => suppliers.id),
  materialDocument: text("material_document").notNull(),
  rejectedQuantity: integer("rejected_quantity").notNull(),
  totalReceivedQuantity: integer("total_received_quantity").notNull(),
  ppmValue: integer("ppm_value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supplierKpis = pgTable("supplier_kpis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => suppliers.id),
  priceScore: real("price_score").default(0),
  quantityScore: real("quantity_score").default(0),
  deliveryScore: real("delivery_score").default(0),
  qualityScore: real("quality_score").default(0),
  overallKpi: real("overall_kpi").default(0),
  evaluationCount: integer("evaluation_count").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Configuration tables for scoring parameters
export const priceConfigurations = pgTable("price_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("Default"),
  description: text("description"),
  // Price variance scoring bands (SAP style)
  excellentThreshold: real("excellent_threshold").notNull().default(-5), // -5% or better = 100 points
  goodThreshold: real("good_threshold").notNull().default(-2), // -2% to -5% = 80 points  
  acceptableThreshold: real("acceptable_threshold").notNull().default(2), // -2% to +2% = 70 points
  penaltyRate: real("penalty_rate").notNull().default(10), // Points deducted per % overage
  minimumScore: integer("minimum_score").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quantityConfigurations = pgTable("quantity_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("Default"),
  description: text("description"),
  // Quantity variance scoring (SAP style - penalize shortfalls)
  perfectDeliveryScore: integer("perfect_delivery_score").notNull().default(100), // 0% variance = 100 points
  shortfallPenaltyRate: real("shortfall_penalty_rate").notNull().default(5), // Points deducted per % shortfall
  overdeliveryPenaltyRate: real("overdelivery_penalty_rate").notNull().default(2), // Points deducted per % overdelivery
  minimumScore: integer("minimum_score").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deliveryConfigurations = pgTable("delivery_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("Default"),
  description: text("description"),
  // Delivery time scoring (SAP style)
  onTimeScore: integer("on_time_score").notNull().default(100), // On-time or early = 100 points
  penaltyPerDay: integer("penalty_per_day").notNull().default(5), // Points deducted per overdue day
  maxOverdueDays: integer("max_overdue_days").notNull().default(20), // Maximum tracked overdue days
  minimumScore: integer("minimum_score").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const qualityConfigurations = pgTable("quality_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("Default"),
  description: text("description"),
  // Quality evaluation scoring (SAP style)
  baseScore: integer("base_score").notNull().default(100), // Starting score
  notificationPenalty: integer("notification_penalty").notNull().default(10), // Points deducted per notification
  inspectionOkBonus: integer("inspection_ok_bonus").notNull().default(0), // Bonus for OK inspection
  inspectionNotOkPenalty: integer("inspection_not_ok_penalty").notNull().default(20), // Additional penalty for NOT_OK
  minimumScore: integer("minimum_score").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ppmConfigurations = pgTable("ppm_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("Default"),
  description: text("description"),
  // PPM evaluation ranges (SAP style)
  zeroDefectsLabel: text("zero_defects_label").notNull().default("Zero Defects"),
  excellentThreshold: integer("excellent_threshold").notNull().default(1000), // < 1000 PPM = Excellent
  excellentLabel: text("excellent_label").notNull().default("Excellent"),
  goodThreshold: integer("good_threshold").notNull().default(10000), // < 10000 PPM = Good
  goodLabel: text("good_label").notNull().default("Good"),
  improvementLabel: text("improvement_label").notNull().default("Needs Improvement"), // >= 10000 PPM
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertPriceEvaluationSchema = createInsertSchema(priceEvaluations).omit({
  id: true,
  createdAt: true,
  varianceAmount: true,
  variancePercentage: true,
  score: true,
});

export const insertQuantityEvaluationSchema = createInsertSchema(quantityEvaluations).omit({
  id: true,
  createdAt: true,
  varianceQuantity: true,
  variancePercentage: true,
  score: true,
});

export const insertDeliveryEvaluationSchema = createInsertSchema(deliveryEvaluations).omit({
  id: true,
  createdAt: true,
  overdueDays: true,
  score: true,
});

export const insertQualityEvaluationSchema = createInsertSchema(qualityEvaluations).omit({
  id: true,
  createdAt: true,
  notificationScore: true,
  inspectionScore: true,
  overallScore: true,
});

export const insertPpmEvaluationSchema = createInsertSchema(ppmEvaluations).omit({
  id: true,
  createdAt: true,
  ppmValue: true,
});

export const insertPriceConfigurationSchema = createInsertSchema(priceConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuantityConfigurationSchema = createInsertSchema(quantityConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeliveryConfigurationSchema = createInsertSchema(deliveryConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQualityConfigurationSchema = createInsertSchema(qualityConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPpmConfigurationSchema = createInsertSchema(ppmConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type PriceEvaluation = typeof priceEvaluations.$inferSelect;
export type InsertPriceEvaluation = z.infer<typeof insertPriceEvaluationSchema>;
export type QuantityEvaluation = typeof quantityEvaluations.$inferSelect;
export type InsertQuantityEvaluation = z.infer<typeof insertQuantityEvaluationSchema>;
export type DeliveryEvaluation = typeof deliveryEvaluations.$inferSelect;
export type InsertDeliveryEvaluation = z.infer<typeof insertDeliveryEvaluationSchema>;
export type QualityEvaluation = typeof qualityEvaluations.$inferSelect;
export type InsertQualityEvaluation = z.infer<typeof insertQualityEvaluationSchema>;
export type PpmEvaluation = typeof ppmEvaluations.$inferSelect;
export type InsertPpmEvaluation = z.infer<typeof insertPpmEvaluationSchema>;
export type SupplierKpi = typeof supplierKpis.$inferSelect;

// Configuration types
export type PriceConfiguration = typeof priceConfigurations.$inferSelect;
export type InsertPriceConfiguration = z.infer<typeof insertPriceConfigurationSchema>;
export type QuantityConfiguration = typeof quantityConfigurations.$inferSelect;
export type InsertQuantityConfiguration = z.infer<typeof insertQuantityConfigurationSchema>;
export type DeliveryConfiguration = typeof deliveryConfigurations.$inferSelect;
export type InsertDeliveryConfiguration = z.infer<typeof insertDeliveryConfigurationSchema>;
export type QualityConfiguration = typeof qualityConfigurations.$inferSelect;
export type InsertQualityConfiguration = z.infer<typeof insertQualityConfigurationSchema>;
export type PpmConfiguration = typeof ppmConfigurations.$inferSelect;
export type InsertPpmConfiguration = z.infer<typeof insertPpmConfigurationSchema>;
