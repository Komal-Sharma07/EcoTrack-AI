import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";

describe("GET /api/profile", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/api/profile");
    expect(res.status).toBe(200);
  });

  it("response has all required fields", async () => {
    const res = await request(app).get("/api/profile");
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      email: expect.any(String),
      dietType: expect.any(String),
      streakDays: expect.any(Number),
      totalCarbonSaved: expect.any(Number),
      createdAt: expect.any(String),
    });
  });

  it("dietType is a valid enum value", async () => {
    const res = await request(app).get("/api/profile");
    expect(["vegan", "vegetarian", "omnivore"]).toContain(res.body.dietType);
  });

  it("streakDays is a non-negative integer", async () => {
    const res = await request(app).get("/api/profile");
    expect(res.body.streakDays).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(res.body.streakDays)).toBe(true);
  });

  it("createdAt is a valid ISO date string", async () => {
    const res = await request(app).get("/api/profile");
    expect(() => new Date(res.body.createdAt)).not.toThrow();
    expect(new Date(res.body.createdAt).toISOString()).toBe(res.body.createdAt);
  });

  it("email looks like an email address", async () => {
    const res = await request(app).get("/api/profile");
    expect(res.body.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});

describe("PUT /api/profile", () => {
  let originalProfile: { name: string; email: string; dietType: string };

  it("returns 200 with updated profile", async () => {
    const getRes = await request(app).get("/api/profile");
    originalProfile = { name: getRes.body.name, email: getRes.body.email, dietType: getRes.body.dietType };

    const res = await request(app).put("/api/profile").send({
      name: "Test User",
      email: "test@ecotrack.app",
      dietType: "vegetarian",
    });
    expect(res.status).toBe(200);

    await request(app).put("/api/profile").send(originalProfile);
  });

  it("updated profile reflects new values", async () => {
    const getRes = await request(app).get("/api/profile");
    originalProfile = { name: getRes.body.name, email: getRes.body.email, dietType: getRes.body.dietType };

    const res = await request(app).put("/api/profile").send({
      name: "Integration Tester",
      email: "tester@ecotrack.app",
      dietType: "vegan",
    });
    expect(res.body.name).toBe("Integration Tester");
    expect(res.body.email).toBe("tester@ecotrack.app");
    expect(res.body.dietType).toBe("vegan");

    await request(app).put("/api/profile").send(originalProfile);
  });

  it("response has all required fields after update", async () => {
    const res = await request(app).put("/api/profile").send({
      name: "Test User",
      email: "test@ecotrack.app",
      dietType: "omnivore",
    });
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      email: expect.any(String),
      dietType: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it("accepts any string for email (no format validation enforced)", async () => {
    const res = await request(app).put("/api/profile").send({
      name: "Test",
      email: "not-an-email",
      dietType: "vegan",
    });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("not-an-email");
  });

  it("returns 400 for invalid dietType", async () => {
    const res = await request(app).put("/api/profile").send({
      name: "Test",
      email: "test@ecotrack.app",
      dietType: "keto",
    });
    expect(res.status).toBe(400);
  });

  it("accepts partial update when name is omitted (all fields optional)", async () => {
    const res = await request(app).put("/api/profile").send({
      email: "test@ecotrack.app",
      dietType: "vegan",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
  });
});
