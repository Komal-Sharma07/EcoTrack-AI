import { Router, type IRouter } from "express";
import { db, profileTable } from "@workspace/db";
import { UpdateProfileBody, GetProfileResponse, UpdateProfileResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/profile", async (req, res): Promise<void> => {
  let [profile] = await db.select().from(profileTable).limit(1);

  if (!profile) {
    [profile] = await db
      .insert(profileTable)
      .values({
        name: "Eco User",
        email: "user@ecotrack.app",
        dietType: "omnivore",
        streakDays: 7,
        totalCarbonSaved: 120.5,
      })
      .returning();
  }

  res.json(GetProfileResponse.parse({
    ...profile,
    createdAt: profile.createdAt.toISOString(),
  }));
});

router.put("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let [profile] = await db.select().from(profileTable).limit(1);

  if (!profile) {
    [profile] = await db.insert(profileTable).values(parsed.data).returning();
  } else {
    const { eq } = await import("drizzle-orm");
    [profile] = await db
      .update(profileTable)
      .set(parsed.data)
      .where(eq(profileTable.id, profile.id))
      .returning();
  }

  res.json(UpdateProfileResponse.parse({
    ...profile,
    createdAt: profile.createdAt.toISOString(),
  }));
});

export default router;
