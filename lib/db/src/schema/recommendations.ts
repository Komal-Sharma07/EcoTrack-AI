import { pgTable, serial, text, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recommendationsTable = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  potentialSavingKg: doublePrecision("potential_saving_kg").notNull(),
  difficulty: text("difficulty").notNull(),
  priority: integer("priority").notNull().default(0),
});

export const insertRecommendationSchema = createInsertSchema(recommendationsTable).omit({ id: true });
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendationsTable.$inferSelect;
