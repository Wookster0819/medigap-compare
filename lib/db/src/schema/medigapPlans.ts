import { pgTable, text, serial, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const medigapPlansTable = pgTable("medigap_plans", {
  id: serial("id").primaryKey(),
  insurerId: integer("insurer_id").notNull(),
  planLetter: text("plan_letter").notNull(),
  // Base monthly premium at age 65 in a median-cost region
  basePremium: real("base_premium").notNull(),
  annualDeductible: real("annual_deductible").notNull().default(0),
  outOfPocketLimit: real("out_of_pocket_limit"),
  // Per-insurer household discount. null = insurer does not offer one.
  // Rate and eligibility vary significantly by insurer and state — do NOT assume a uniform rate.
  householdDiscountRate: real("household_discount_rate"),
  householdEligibility: text("household_eligibility"),
  householdDiscountNotes: text("household_discount_notes"),
  planType: text("plan_type").notNull().default("attained-age"),
  partBDeductibleCovered: text("part_b_deductible_covered").notNull().default("false"),
  foreignTravelCovered: text("foreign_travel_covered").notNull().default("false"),
  notes: text("notes"),
});

export const insertMedigapPlanSchema = createInsertSchema(medigapPlansTable).omit({ id: true });
export type InsertMedigapPlan = z.infer<typeof insertMedigapPlanSchema>;
export type MedigapPlan = typeof medigapPlansTable.$inferSelect;
