import { Router, type IRouter } from "express";
import { desc, eq, gte } from "drizzle-orm";
import { db, entriesTable } from "@workspace/db";
import {
  ListEntriesQueryParams,
  ListEntriesResponse,
  CreateEntryBody,
  DeleteEntryParams,
} from "@workspace/api-zod";
import { calculateCarbonFootprint } from "../lib/carbon";

const router: IRouter = Router();

router.get("/entries", async (req, res): Promise<void> => {
  const params = ListEntriesQueryParams.safeParse(req.query);

  let query = db.select().from(entriesTable).orderBy(desc(entriesTable.date));

  if (params.success && params.data.period) {
    const now = new Date();
    let cutoff: Date;
    if (params.data.period === "week") {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (params.data.period === "month") {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    query = db.select().from(entriesTable).where(gte(entriesTable.date, cutoffStr)).orderBy(desc(entriesTable.date)) as typeof query;
  }

  const entries = await query;
  res.json(ListEntriesResponse.parse(entries));
});

router.post("/entries", async (req, res): Promise<void> => {
  const parsed = CreateEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = calculateCarbonFootprint({
    transportKm: parsed.data.transportKm,
    transportMode: parsed.data.transportMode as "car" | "bike" | "bus" | "train" | "walking",
    electricityKwh: parsed.data.electricityKwh,
    dietType: parsed.data.dietType as "vegan" | "vegetarian" | "omnivore",
    flightsPerYear: parsed.data.flightsPerYear,
  });

  const today = new Date().toISOString().slice(0, 10);

  const [entry] = await db
    .insert(entriesTable)
    .values({
      date: today,
      totalKgCo2: result.totalKgCo2,
      transportKgCo2: result.transportKgCo2,
      electricityKgCo2: result.electricityKgCo2,
      foodKgCo2: result.foodKgCo2,
      travelKgCo2: result.travelKgCo2,
      transportMode: parsed.data.transportMode,
      dietType: parsed.data.dietType,
      score: result.score,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  res.status(201).json(entry);
});

router.delete("/entries/:id", async (req, res): Promise<void> => {
  const params = DeleteEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(entriesTable).where(eq(entriesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
