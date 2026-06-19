import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";

describe("POST /api/footprint/calculate", () => {
  const validBody = {
    transportKm: 20,
    transportMode: "car",
    electricityKwh: 300,
    dietType: "omnivore",
    flightsPerYear: 2,
  };

  it("returns 200 with a valid footprint result", async () => {
    const res = await request(app).post("/api/footprint/calculate").send(validBody);
    expect(res.status).toBe(200);
  });

  it("response contains all required fields", async () => {
    const res = await request(app).post("/api/footprint/calculate").send(validBody);
    expect(res.body).toMatchObject({
      totalKgCo2: expect.any(Number),
      transportKgCo2: expect.any(Number),
      electricityKgCo2: expect.any(Number),
      foodKgCo2: expect.any(Number),
      travelKgCo2: expect.any(Number),
      score: expect.any(Number),
      rating: expect.any(String),
    });
  });

  it("score is between 0 and 100", async () => {
    const res = await request(app).post("/api/footprint/calculate").send(validBody);
    expect(res.body.score).toBeGreaterThanOrEqual(0);
    expect(res.body.score).toBeLessThanOrEqual(100);
  });

  it("rating is a valid enum value", async () => {
    const res = await request(app).post("/api/footprint/calculate").send(validBody);
    expect(["excellent", "good", "average", "poor", "critical"]).toContain(res.body.rating);
  });

  it("zero-emission inputs produce a high score", async () => {
    const res = await request(app).post("/api/footprint/calculate").send({
      transportKm: 0,
      transportMode: "bike",
      electricityKwh: 0,
      dietType: "vegan",
      flightsPerYear: 0,
    });
    expect(res.body.score).toBeGreaterThanOrEqual(80);
    expect(res.body.rating).toBe("excellent");
  });

  it("returns 400 when transportMode is invalid", async () => {
    const res = await request(app)
      .post("/api/footprint/calculate")
      .send({ ...validBody, transportMode: "rocket" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when dietType is invalid", async () => {
    const res = await request(app)
      .post("/api/footprint/calculate")
      .send({ ...validBody, dietType: "carnivore" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/footprint/calculate")
      .send({ transportKm: 20 });
    expect(res.status).toBe(400);
  });

  it("accepts negative transportKm (no server-side floor enforced)", async () => {
    const res = await request(app)
      .post("/api/footprint/calculate")
      .send({ ...validBody, transportKm: -5 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalKgCo2");
  });

  it("totalKgCo2 equals sum of category values (within rounding)", async () => {
    const res = await request(app).post("/api/footprint/calculate").send(validBody);
    const { totalKgCo2, transportKgCo2, electricityKgCo2, foodKgCo2, travelKgCo2 } = res.body;
    const sum = Math.round((transportKgCo2 + electricityKgCo2 + foodKgCo2 + travelKgCo2) * 10) / 10;
    expect(totalKgCo2).toBe(sum);
  });

  it("bike transport produces zero transport emissions", async () => {
    const res = await request(app).post("/api/footprint/calculate").send({
      ...validBody,
      transportMode: "bike",
    });
    expect(res.body.transportKgCo2).toBe(0);
  });

  it("zero flights produces zero travel emissions", async () => {
    const res = await request(app).post("/api/footprint/calculate").send({
      ...validBody,
      flightsPerYear: 0,
    });
    expect(res.body.travelKgCo2).toBe(0);
  });
});
