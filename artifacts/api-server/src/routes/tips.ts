import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, tipsTable } from "@workspace/db";
import { ListTipsQueryParams, ListTipsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tips", async (req, res): Promise<void> => {
  const params = ListTipsQueryParams.safeParse(req.query);
  let tips;

  if (params.success && params.data.category) {
    tips = await db.select().from(tipsTable).where(eq(tipsTable.category, params.data.category));
  } else {
    tips = await db.select().from(tipsTable);
  }

  res.json(ListTipsResponse.parse(tips));
});

export default router;
