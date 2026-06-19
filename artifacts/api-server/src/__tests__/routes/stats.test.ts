import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";

describe("GET /api/stats/dashboard", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/api/stats/dashboard");
    expect(res.status).toBe(200);
  });

  it("response has all required fields", async () => {
    const res = await request(app).get("/api/stats/dashboard");
    expect(res.body).toMatchObject({
      currentMonthKgCo2: expect.any(Number),
      previousMonthKgCo2: expect.any(Number),
      percentChange: expect.any(Number),
      weeklyAvgKgCo2: expect.any(Number),
      carbonScore: expect.any(Number),
      streakDays: expect.any(Number),
      badgesEarned: expect.any(Number),
      totalEntries: expect.any(Number),
    });
  });

  it("carbonScore is between 0 and 100", async () => {
    const res = await request(app).get("/api/stats/dashboard");
    expect(res.body.carbonScore).toBeGreaterThanOrEqual(0);
    expect(res.body.carbonScore).toBeLessThanOrEqual(100);
  });

  it("badgesEarned is a non-negative integer", async () => {
    const res = await request(app).get("/api/stats/dashboard");
    expect(res.body.badgesEarned).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(res.body.badgesEarned)).toBe(true);
  });

  it("totalEntries is a non-negative integer", async () => {
    const res = await request(app).get("/api/stats/dashboard");
    expect(res.body.totalEntries).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(res.body.totalEntries)).toBe(true);
  });

  it("currentMonthKgCo2 is non-negative", async () => {
    const res = await request(app).get("/api/stats/dashboard");
    expect(res.body.currentMonthKgCo2).toBeGreaterThanOrEqual(0);
  });
});

describe("GET /api/stats/trend", () => {
  it("returns 200 with default period", async () => {
    const res = await request(app).get("/api/stats/trend");
    expect(res.status).toBe(200);
  });

  it("returns an array for monthly period", async () => {
    const res = await request(app).get("/api/stats/trend?period=month");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns an array for weekly period", async () => {
    const res = await request(app).get("/api/stats/trend?period=week");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("monthly trend returns 6 data points", async () => {
    const res = await request(app).get("/api/stats/trend?period=month");
    expect(res.body).toHaveLength(6);
  });

  it("weekly trend returns 7 data points", async () => {
    const res = await request(app).get("/api/stats/trend?period=week");
    expect(res.body).toHaveLength(7);
  });

  it("each trend point has required fields", async () => {
    const res = await request(app).get("/api/stats/trend?period=month");
    const point = res.body[0];
    expect(point).toMatchObject({
      label: expect.any(String),
      totalKgCo2: expect.any(Number),
      transportKgCo2: expect.any(Number),
      electricityKgCo2: expect.any(Number),
      foodKgCo2: expect.any(Number),
      travelKgCo2: expect.any(Number),
    });
  });

  it("all numeric trend values are non-negative", async () => {
    const res = await request(app).get("/api/stats/trend?period=month");
    for (const point of res.body) {
      expect(point.totalKgCo2).toBeGreaterThanOrEqual(0);
      expect(point.transportKgCo2).toBeGreaterThanOrEqual(0);
      expect(point.electricityKgCo2).toBeGreaterThanOrEqual(0);
      expect(point.foodKgCo2).toBeGreaterThanOrEqual(0);
      expect(point.travelKgCo2).toBeGreaterThanOrEqual(0);
    }
  });

  it("weekly trend points have string labels", async () => {
    const res = await request(app).get("/api/stats/trend?period=week");
    for (const point of res.body) {
      expect(typeof point.label).toBe("string");
      expect(point.label.length).toBeGreaterThan(0);
    }
  });
});

describe("GET /api/stats/breakdown", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/api/stats/breakdown");
    expect(res.status).toBe(200);
  });

  it("returns an array of 4 categories", async () => {
    const res = await request(app).get("/api/stats/breakdown");
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(4);
  });

  it("breakdown categories are Transport, Electricity, Food, Travel", async () => {
    const res = await request(app).get("/api/stats/breakdown");
    const categories = res.body.map((b: { category: string }) => b.category);
    expect(categories).toContain("Transport");
    expect(categories).toContain("Electricity");
    expect(categories).toContain("Food");
    expect(categories).toContain("Travel");
  });

  it("each breakdown item has required fields", async () => {
    const res = await request(app).get("/api/stats/breakdown");
    for (const item of res.body) {
      expect(item).toMatchObject({
        category: expect.any(String),
        kgCo2: expect.any(Number),
        percentage: expect.any(Number),
        color: expect.any(String),
      });
    }
  });

  it("all kgCo2 values are non-negative", async () => {
    const res = await request(app).get("/api/stats/breakdown");
    for (const item of res.body) {
      expect(item.kgCo2).toBeGreaterThanOrEqual(0);
    }
  });

  it("all percentage values are between 0 and 100", async () => {
    const res = await request(app).get("/api/stats/breakdown");
    for (const item of res.body) {
      expect(item.percentage).toBeGreaterThanOrEqual(0);
      expect(item.percentage).toBeLessThanOrEqual(100);
    }
  });

  it("color values are valid hex codes", async () => {
    const res = await request(app).get("/api/stats/breakdown");
    for (const item of res.body) {
      expect(item.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
