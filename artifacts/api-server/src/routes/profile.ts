import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profileTable } from "@workspace/db";
import { UpdateProfileBody, GetProfileResponse, UpdateProfileResponse } from "@workspace/api-zod";

const router: IRouter = Router();

/** Seed values used when no profile row exists yet. */
const DEFAULT_PROFILE = {
  name: "Eco User",
  email: "user@ecotrack.app",
  dietType: "omnivore" as const,
  streakDays: 7,
  totalCarbonSaved: 120.5,
} as const;

router.get("/profile", async (req, res): Promise<void> => {
  let [profile] = await db.select().from(profileTable).limit(1);

  if (!profile) {
    [profile] = await db.insert(profileTable).values(DEFAULT_PROFILE).returning();
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
