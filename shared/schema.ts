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
