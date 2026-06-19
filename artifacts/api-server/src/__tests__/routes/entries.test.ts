import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import app from "../../app.js";

const validEntryBody = {
  transportKm: 15,
  transportMode: "bus",
  electricityKwh: 250,
  dietType: "vegetarian",
  flightsPerYear: 1,
};

const createdIds: number[] = [];

afterEach(async () => {
  for (const id of createdIds) {
    await request(app).delete(`/api/entries/${id}`);
  }
  createdIds.length = 0;
});

describe("GET /api/entries", () => {
  it("returns 200 with an array", async () => {
    const res = await request(app).get("/api/entries");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("each entry has required fields", async () => {
    const postRes = await request(app).post("/api/entries").send(validEntryBody);
    createdIds.push(postRes.body.id);

    const res = await request(app).get("/api/entries");
    expect(res.body.length).toBeGreaterThan(0);
    const entry = res.body[0];
    expect(entry).toMatchObject({
      id: expect.any(Number),
      date: expect.any(String),
      totalKgCo2: expect.any(Number),
      transportKgCo2: expect.any(Number),
      electricityKgCo2: expect.any(Number),
      foodKgCo2: expect.any(Number),
      travelKgCo2: expect.any(Number),
      score: expect.any(Number),
    });
  });

  it("filters by week period without error", async () => {
    const res = await request(app).get("/api/entries?period=week");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("filters by month period without error", async () => {
    const res = await request(app).get("/api/entries?period=month");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("filters by year period without error", async () => {
    const res = await request(app).get("/api/entries?period=year");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("POST /api/entries", () => {
  it("returns 201 and creates an entry", async () => {
    const res = await request(app).post("/api/entries").send(validEntryBody);
    expect(res.status).toBe(201);
    createdIds.push(res.body.id);
  });

  it("created entry has correct transport mode", async () => {
    const res = await request(app).post("/api/entries").send(validEntryBody);
    createdIds.push(res.body.id);
    expect(res.body.transportMode).toBe("bus");
  });

  it("created entry has correct diet type", async () => {
    const res = await request(app).post("/api/entries").send(validEntryBody);
    createdIds.push(res.body.id);
    expect(res.body.dietType).toBe("vegetarian");
  });

  it("created entry has a numeric score in range", async () => {
    const res = await request(app).post("/api/entries").send(validEntryBody);
    createdIds.push(res.body.id);
    expect(res.body.score).toBeGreaterThanOrEqual(0);
    expect(res.body.score).toBeLessThanOrEqual(100);
  });

  it("created entry has a date field", async () => {
    const res = await request(app).post("/api/entries").send(validEntryBody);
    createdIds.push(res.body.id);
    expect(res.body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns 400 for missing fields", async () => {
    const res = await request(app).post("/api/entries").send({ transportKm: 10 });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid transportMode", async () => {
    const res = await request(app)
      .post("/api/entries")
      .send({ ...validEntryBody, transportMode: "hovercraft" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid dietType", async () => {
    const res = await request(app)
      .post("/api/entries")
      .send({ ...validEntryBody, dietType: "pescatarian" });
    expect(res.status).toBe(400);
  });

  it("entry appears in GET /api/entries after creation", async () => {
    const postRes = await request(app).post("/api/entries").send(validEntryBody);
    const id = postRes.body.id;
    createdIds.push(id);

    const getRes = await request(app).get("/api/entries");
    const found = getRes.body.find((e: { id: number }) => e.id === id);
    expect(found).toBeDefined();
  });
});

describe("DELETE /api/entries/:id", () => {
  it("returns 204 on successful deletion", async () => {
    const postRes = await request(app).post("/api/entries").send(validEntryBody);
    const id = postRes.body.id;

    const delRes = await request(app).delete(`/api/entries/${id}`);
    expect(delRes.status).toBe(204);
  });

  it("deleted entry no longer appears in GET /api/entries", async () => {
    const postRes = await request(app).post("/api/entries").send(validEntryBody);
    const id = postRes.body.id;

    await request(app).delete(`/api/entries/${id}`);

    const getRes = await request(app).get("/api/entries");
    const found = getRes.body.find((e: { id: number }) => e.id === id);
    expect(found).toBeUndefined();
  });

  it("returns 400 for non-numeric id", async () => {
    const res = await request(app).delete("/api/entries/abc");
    expect(res.status).toBe(400);
  });
});
