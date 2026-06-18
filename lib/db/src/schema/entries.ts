import { pgTable, serial, text, integer, doublePrecision, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const entriesTable = pgTable("entries", {
  id: serial("id").primaryKey(),
  date: date("date", { mode: "string" }).notNull(),
  totalKgCo2: doublePrecision("total_kg_co2").notNull(),
  transportKgCo2: doublePrecision("transport_kg_co2").notNull(),
  electricityKgCo2: doublePrecision("electricity_kg_co2").notNull(),
  foodKgCo2: doublePrecision("food_kg_co2").notNull(),
  travelKgCo2: doublePrecision("travel_kg_co2").notNull(),
  transportMode: text("transport_mode").notNull(),
  dietType: text("diet_type").notNull(),
  score: integer("score").notNull(),
  notes: text("notes"),
});

export const insertEntrySchema = createInsertSchema(entriesTable).omit({ id: true });
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = typeof entriesTable.$inferSelect;
