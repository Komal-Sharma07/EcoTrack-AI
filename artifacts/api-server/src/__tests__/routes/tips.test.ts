import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";

const VALID_CATEGORIES = ["transport", "energy", "food", "travel", "general"] as const;

describe("GET /api/tips", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/api/tips");
    expect(res.status).toBe(200);
  });

  it("returns an array", async () => {
    const res = await request(app).get("/api/tips");
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("each tip has required fields", async () => {
    const res = await request(app).get("/api/tips");
    expect(res.body.length).toBeGreaterThan(0);
    const tip = res.body[0];
    expect(tip).toMatchObject({
      id: expect.any(Number),
      category: expect.any(String),
      title: expect.any(String),
      body: expect.any(String),
      impact: expect.any(String),
    });
  });

  it("category is a valid enum value for every tip", async () => {
    const res = await request(app).get("/api/tips");
    for (const tip of res.body) {
      expect(VALID_CATEGORIES as readonly string[]).toContain(tip.category);
    }
  });

  it("impact is low, medium, or high for every tip", async () => {
    const res = await request(app).get("/api/tips");
    const validImpacts = ["low", "medium", "high"];
    for (const tip of res.body) {
      expect(validImpacts).toContain(tip.impact);
    }
  });

  it("returns seeded tips (at least 1)", async () => {
    const res = await request(app).get("/api/tips");
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});

describe("GET /api/tips with category filter", () => {
  for (const cat of VALID_CATEGORIES) {
    it(`filters by category=${cat} and returns only matching tips`, async () => {
      const res = await request(app).get(`/api/tips?category=${cat}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      for (const tip of res.body) {
        expect(tip.category).toBe(cat);
      }
    });
  }

  it("transport category returns only transport tips", async () => {
    const res = await request(app).get("/api/tips?category=transport");
    expect(res.body.every((t: { category: string }) => t.category === "transport")).toBe(true);
  });

  it("energy category returns only energy tips", async () => {
    const res = await request(app).get("/api/tips?category=energy");
    expect(res.body.every((t: { category: string }) => t.category === "energy")).toBe(true);
  });

  it("food category returns only food tips", async () => {
    const res = await request(app).get("/api/tips?category=food");
    expect(res.body.every((t: { category: string }) => t.category === "food")).toBe(true);
  });

  it("filtered results are a subset of unfiltered results", async () => {
    const allRes = await request(app).get("/api/tips");
    const filteredRes = await request(app).get("/api/tips?category=transport");

    const allIds = new Set(allRes.body.map((t: { id: number }) => t.id));
    for (const tip of filteredRes.body) {
      expect(allIds.has(tip.id)).toBe(true);
    }
  });

  it("unknown category falls back to returning all tips (invalid enum → parse fails → no filter applied)", async () => {
    const allRes = await request(app).get("/api/tips");
    const unknownRes = await request(app).get("/api/tips?category=aerospace");
    expect(unknownRes.status).toBe(200);
    expect(unknownRes.body).toHaveLength(allRes.body.length);
  });
});
