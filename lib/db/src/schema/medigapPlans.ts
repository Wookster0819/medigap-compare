import { pgTable, text, serial, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const medigapPlansTable = pgTable("medigap_plans", {
  id: serial("id").primaryKey(),
  insurerId: integer("insurer_id").notNull(),
  planLetter: text("plan_letter").notNull(),
  // Base monthly premium at age 65 in a median-cost state
  basePremium: real("base_premium").notNull(),
  annualDeductible: real("annual_deductible").notNull().default(0),
  outOfPocketLimit: real("out_of_pocket_limit"),
  marriedDiscount: boolean("married_discount").notNull().default(false),
  planType: text("plan_type").notNull().default("attained-age"),
  partBDeductibleCovered: boolean("part_b_deductible_covered").notNull().default(false),
  foreignTravelCovered: boolean("foreign_travel_covered").notNull().default(false),
  notes: text("notes"),
});

export const insertMedigapPlanSchema = createInsertSchema(medigapPlansTable).omit({ id: true });
export type InsertMedigapPlan = z.infer<typeof insertMedigapPlanSchema>;
export type MedigapPlan = typeof medigapPlansTable.$inferSelect;
