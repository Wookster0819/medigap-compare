import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const insurersTable = pgTable("insurers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amBestRating: text("am_best_rating").notNull().default("A"),
  moodyRating: text("moody_rating"),
  yearsInBusiness: integer("years_in_business").notNull().default(20),
});

export const insertInsurerSchema = createInsertSchema(insurersTable).omit({ id: true });
export type InsertInsurer = z.infer<typeof insertInsurerSchema>;
export type Insurer = typeof insurersTable.$inferSelect;
