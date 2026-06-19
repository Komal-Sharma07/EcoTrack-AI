import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";

describe("GET /api/recommendations", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/api/recommendations");
    expect(res.status).toBe(200);
  });

  it("returns an array", async () => {
    const res = await request(app).get("/api/recommendations");
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("each recommendation has required fields", async () => {
    const res = await request(app).get("/api/recommendations");
    expect(res.body.length).toBeGreaterThan(0);
    const rec = res.body[0];
    expect(rec).toMatchObject({
      id: expect.any(Number),
      category: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      potentialSavingKg: expect.any(Number),
      difficulty: expect.any(String),
      priority: expect.any(Number),
    });
  });

  it("category is a valid enum value", async () => {
    const res = await request(app).get("/api/recommendations");
    const validCategories = ["transport", "energy", "food", "travel", "general"];
    for (const rec of res.body) {
      expect(validCategories).toContain(rec.category);
    }
  });

  it("difficulty is a valid enum value", async () => {
    const res = await request(app).get("/api/recommendations");
    const validDifficulties = ["easy", "medium", "hard"];
    for (const rec of res.body) {
      expect(validDifficulties).toContain(rec.difficulty);
    }
  });

  it("potentialSavingKg is positive for all recommendations", async () => {
    const res = await request(app).get("/api/recommendations");
    for (const rec of res.body) {
      expect(rec.potentialSavingKg).toBeGreaterThan(0);
    }
  });

  it("results are ordered by priority ascending", async () => {
    const res = await request(app).get("/api/recommendations");
    const priorities = res.body.map((r: { priority: number }) => r.priority);
    const sorted = [...priorities].sort((a, b) => a - b);
    expect(priorities).toEqual(sorted);
  });

  it("returns seeded recommendations (at least 1)", async () => {
    const res = await request(app).get("/api/recommendations");
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
