import { Router, type IRouter } from "express";
import { CalculateFootprintBody, CalculateFootprintResponse } from "@workspace/api-zod";
import { calculateCarbonFootprint } from "../lib/carbon";

const router: IRouter = Router();

router.post("/footprint/calculate", async (req, res): Promise<void> => {
  const parsed = CalculateFootprintBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = calculateCarbonFootprint(parsed.data as Parameters<typeof calculateCarbonFootprint>[0]);
  res.json(CalculateFootprintResponse.parse(result));
});

export default router;
