import { pgTable, text, serial, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const zipCodesTable = pgTable("zip_codes", {
  id: serial("id").primaryKey(),
  zip: text("zip").notNull().unique(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  stateCode: text("state_code").notNull(),
  county: text("county").notNull(),
  region: text("region").notNull(),
  // Regional cost multiplier: 1.0 = average, >1 = more expensive, <1 = cheaper
  costMultiplier: real("cost_multiplier").notNull().default(1.0),
});

export const insertZipCodeSchema = createInsertSchema(zipCodesTable).omit({ id: true });
export type InsertZipCode = z.infer<typeof insertZipCodeSchema>;
export type ZipCode = typeof zipCodesTable.$inferSelect;
