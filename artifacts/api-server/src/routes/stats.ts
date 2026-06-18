import { Router, type IRouter } from "express";
import { desc, gte } from "drizzle-orm";
import { db, entriesTable, profileTable, badgesTable } from "@workspace/db";
import {
  GetDashboardStatsResponse,
  GetCarbonTrendQueryParams,
  GetCarbonTrendResponse,
  GetFootprintBreakdownResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

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

  const currentMonthKgCo2 = thisMonthEntries.reduce((sum, e) => sum + e.totalKgCo2, 0);
  const previousMonthKgCo2 = lastMonthEntries.reduce((sum, e) => sum + e.totalKgCo2, 0);

  const percentChange = previousMonthKgCo2 > 0
    ? ((currentMonthKgCo2 - previousMonthKgCo2) / previousMonthKgCo2) * 100
    : 0;

  const weeklyAvgKgCo2 = weekEntries.length > 0
    ? weekEntries.reduce((sum, e) => sum + e.totalKgCo2, 0) / weekEntries.length
    : 0;

  const carbonScore = allEntries.length > 0
    ? Math.round(allEntries.slice(0, 5).reduce((sum, e) => sum + e.score, 0) / Math.min(5, allEntries.length))
    : 50;

  const [profile] = await db.select().from(profileTable).limit(1);
  const streakDays = profile?.streakDays ?? 0;

  const earnedBadges = await db.select().from(badgesTable).where(
    (await import("drizzle-orm")).eq(badgesTable.earned, true)
  );

  res.json(GetDashboardStatsResponse.parse({
    currentMonthKgCo2: Math.round(currentMonthKgCo2 * 10) / 10,
    previousMonthKgCo2: Math.round(previousMonthKgCo2 * 10) / 10,
    percentChange: Math.round(percentChange * 10) / 10,
    weeklyAvgKgCo2: Math.round(weeklyAvgKgCo2 * 10) / 10,
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
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      points.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.toISOString().slice(0, 10),
      });
    }
  } else {
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
    let matchingEntries;
    if (period === "week") {
      matchingEntries = allEntries.filter(e => e.date === point.date);
    } else {
      const yearMonth = point.date.slice(0, 7);
      matchingEntries = allEntries.filter(e => e.date.startsWith(yearMonth));
    }

    const sum = (field: keyof typeof allEntries[0]) =>
      matchingEntries.reduce((acc, e) => acc + (Number(e[field]) || 0), 0);

    return {
      label: point.label,
      totalKgCo2: Math.round(sum("totalKgCo2") * 10) / 10,
      transportKgCo2: Math.round(sum("transportKgCo2") * 10) / 10,
      electricityKgCo2: Math.round(sum("electricityKgCo2") * 10) / 10,
      foodKgCo2: Math.round(sum("foodKgCo2") * 10) / 10,
      travelKgCo2: Math.round(sum("travelKgCo2") * 10) / 10,
    };
  });

  res.json(GetCarbonTrendResponse.parse(result));
});

router.get("/stats/breakdown", async (req, res): Promise<void> => {
  const entries = await db.select().from(entriesTable).orderBy(desc(entriesTable.date));
  const recent = entries.slice(0, 30);

  if (recent.length === 0) {
    res.json(GetFootprintBreakdownResponse.parse([
      { category: "Transport", kgCo2: 0, percentage: 0, color: "#3b82f6" },
      { category: "Electricity", kgCo2: 0, percentage: 0, color: "#f59e0b" },
      { category: "Food", kgCo2: 0, percentage: 0, color: "#10b981" },
      { category: "Travel", kgCo2: 0, percentage: 0, color: "#8b5cf6" },
    ]));
    return;
  }

  const transport = recent.reduce((s, e) => s + e.transportKgCo2, 0);
  const electricity = recent.reduce((s, e) => s + e.electricityKgCo2, 0);
  const food = recent.reduce((s, e) => s + e.foodKgCo2, 0);
  const travel = recent.reduce((s, e) => s + e.travelKgCo2, 0);
  const total = transport + electricity + food + travel || 1;

  const breakdown = [
    { category: "Transport", kgCo2: Math.round(transport * 10) / 10, percentage: Math.round((transport / total) * 1000) / 10, color: "#3b82f6" },
    { category: "Electricity", kgCo2: Math.round(electricity * 10) / 10, percentage: Math.round((electricity / total) * 1000) / 10, color: "#f59e0b" },
    { category: "Food", kgCo2: Math.round(food * 10) / 10, percentage: Math.round((food / total) * 1000) / 10, color: "#10b981" },
    { category: "Travel", kgCo2: Math.round(travel * 10) / 10, percentage: Math.round((travel / total) * 1000) / 10, color: "#8b5cf6" },
  ];

  res.json(GetFootprintBreakdownResponse.parse(breakdown));
});

export default router;
