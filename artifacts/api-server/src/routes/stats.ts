import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, entriesTable, profileTable, badgesTable } from "@workspace/db";
import {
  GetDashboardStatsResponse,
  GetCarbonTrendQueryParams,
  GetCarbonTrendResponse,
  GetFootprintBreakdownResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

/** Rounds a number to one decimal place. */
const round1 = (n: number) => Math.round(n * 10) / 10;

/** CO2 numeric fields present on every entry row. */
type Co2Field = "totalKgCo2" | "transportKgCo2" | "electricityKgCo2" | "foodKgCo2" | "travelKgCo2";

/** Sums a specific CO2 field across an array of entry rows. */
const sumField = (
  entries: Array<Record<Co2Field, number>>,
  field: Co2Field,
) => entries.reduce((acc, e) => acc + e[field], 0);

router.get("/stats/dashboard", async (req, res): Promise<void> => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const allEntries = await db.select().from(entriesTable).orderBy(desc(entriesTable.date));

  const thisMonthEntries = allEntries.filter(e => e.date >= thisMonthStart);
  const lastMonthEntries = allEntries.filter(e => e.date >= lastMonthStart && e.date <= lastMonthEnd);
  const weekEntries = allEntries.filter(e => e.date >= weekAgo);

  const currentMonthKgCo2 = sumField(thisMonthEntries, "totalKgCo2");
  const previousMonthKgCo2 = sumField(lastMonthEntries, "totalKgCo2");

  const percentChange = previousMonthKgCo2 > 0
    ? ((currentMonthKgCo2 - previousMonthKgCo2) / previousMonthKgCo2) * 100
    : 0;

  const weeklyAvgKgCo2 = weekEntries.length > 0
    ? sumField(weekEntries, "totalKgCo2") / weekEntries.length
    : 0;

  // Average score of the most recent 5 entries; default to 50 when no data.
  const carbonScore = allEntries.length > 0
    ? Math.round(
        allEntries.slice(0, 5).reduce((sum, e) => sum + e.score, 0) /
        Math.min(5, allEntries.length),
      )
    : 50;

  const [profile] = await db.select().from(profileTable).limit(1);
  const streakDays = profile?.streakDays ?? 0;

  const earnedBadges = await db.select().from(badgesTable).where(eq(badgesTable.earned, true));

  res.json(GetDashboardStatsResponse.parse({
    currentMonthKgCo2: round1(currentMonthKgCo2),
    previousMonthKgCo2: round1(previousMonthKgCo2),
    percentChange: round1(percentChange),
    weeklyAvgKgCo2: round1(weeklyAvgKgCo2),
    carbonScore,
    streakDays,
    badgesEarned: earnedBadges.length,
    totalEntries: allEntries.length,
  }));
});

router.get("/stats/trend", async (req, res): Promise<void> => {
  const params = GetCarbonTrendQueryParams.safeParse(req.query);
  const period = params.success ? (params.data.period ?? "month") : "month";

  const now = new Date();
  const points: { label: string; date: string }[] = [];

  if (period === "week") {
    // Last 7 days, oldest first
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      points.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.toISOString().slice(0, 10),
      });
    }
  } else {
    // Last 6 calendar months, oldest first
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      points.push({
        label: d.toLocaleDateString("en-US", { month: "short" }),
        date: d.toISOString().slice(0, 10),
      });
    }
  }

  const allEntries = await db.select().from(entriesTable).orderBy(desc(entriesTable.date));

  const result = points.map(point => {
    const matchingEntries = period === "week"
      ? allEntries.filter(e => e.date === point.date)
      : allEntries.filter(e => e.date.startsWith(point.date.slice(0, 7)));

    return {
      label: point.label,
      totalKgCo2: round1(sumField(matchingEntries, "totalKgCo2")),
      transportKgCo2: round1(sumField(matchingEntries, "transportKgCo2")),
      electricityKgCo2: round1(sumField(matchingEntries, "electricityKgCo2")),
      foodKgCo2: round1(sumField(matchingEntries, "foodKgCo2")),
      travelKgCo2: round1(sumField(matchingEntries, "travelKgCo2")),
    };
  });

  res.json(GetCarbonTrendResponse.parse(result));
});

router.get("/stats/breakdown", async (req, res): Promise<void> => {
  const entries = await db.select().from(entriesTable).orderBy(desc(entriesTable.date));
  // Use up to the 30 most recent entries for the breakdown
  const recent = entries.slice(0, 30);

  if (recent.length === 0) {
    res.json(GetFootprintBreakdownResponse.parse([
      { category: "Transport",   kgCo2: 0, percentage: 0, color: "#3b82f6" },
      { category: "Electricity", kgCo2: 0, percentage: 0, color: "#f59e0b" },
      { category: "Food",        kgCo2: 0, percentage: 0, color: "#10b981" },
      { category: "Travel",      kgCo2: 0, percentage: 0, color: "#8b5cf6" },
    ]));
    return;
  }

  const transport   = sumField(recent, "transportKgCo2");
  const electricity = sumField(recent, "electricityKgCo2");
  const food        = sumField(recent, "foodKgCo2");
  const travel      = sumField(recent, "travelKgCo2");
  // Guard against division by zero when all values are 0
  const total = transport + electricity + food + travel || 1;

  const pct = (v: number) => round1((v / total) * 100);

  const breakdown = [
    { category: "Transport",   kgCo2: round1(transport),   percentage: pct(transport),   color: "#3b82f6" },
    { category: "Electricity", kgCo2: round1(electricity), percentage: pct(electricity), color: "#f59e0b" },
    { category: "Food",        kgCo2: round1(food),        percentage: pct(food),        color: "#10b981" },
    { category: "Travel",      kgCo2: round1(travel),      percentage: pct(travel),      color: "#8b5cf6" },
  ];

  res.json(GetFootprintBreakdownResponse.parse(breakdown));
});

export default router;
