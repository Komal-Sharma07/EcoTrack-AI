import { pgTable, serial, text, integer, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profileTable = pgTable("profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Eco User"),
  email: text("email").notNull().default("user@ecotrack.app"),
  avatarUrl: text("avatar_url"),
  dietType: text("diet_type").notNull().default("omnivore"),
  streakDays: integer("streak_days").notNull().default(0),
  totalCarbonSaved: doublePrecision("total_carbon_saved").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profileTable).omit({ id: true, createdAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profileTable.$inferSelect;
