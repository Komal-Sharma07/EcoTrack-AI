import { Router, type IRouter } from "express";
import { db, badgesTable } from "@workspace/db";
import { ListBadgesResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/badges", async (req, res): Promise<void> => {
  const badges = await db.select().from(badgesTable);
  res.json(ListBadgesResponse.parse(
    badges.map(b => ({
      ...b,
      earnedAt: b.earnedAt ? b.earnedAt.toISOString() : null,
    }))
  ));
});

export default router;
