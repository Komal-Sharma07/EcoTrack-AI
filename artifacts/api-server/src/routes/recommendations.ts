import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import { db, recommendationsTable } from "@workspace/db";
import { ListRecommendationsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/recommendations", async (req, res): Promise<void> => {
  const recs = await db.select().from(recommendationsTable).orderBy(asc(recommendationsTable.priority));
  res.json(ListRecommendationsResponse.parse(recs));
});

export default router;
