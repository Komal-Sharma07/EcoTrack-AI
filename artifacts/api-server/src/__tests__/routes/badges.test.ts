import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";

describe("GET /api/badges", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/api/badges");
    expect(res.status).toBe(200);
  });

  it("returns an array", async () => {
    const res = await request(app).get("/api/badges");
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("each badge has required fields", async () => {
    const res = await request(app).get("/api/badges");
    expect(res.body.length).toBeGreaterThan(0);
    const badge = res.body[0];
    expect(badge).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      description: expect.any(String),
      icon: expect.any(String),
      category: expect.any(String),
      earned: expect.any(Boolean),
    });
  });

  it("earnedAt is null or a valid ISO string", async () => {
    const res = await request(app).get("/api/badges");
    for (const badge of res.body) {
      if (badge.earnedAt !== null) {
        expect(() => new Date(badge.earnedAt)).not.toThrow();
        expect(typeof badge.earnedAt).toBe("string");
      } else {
        expect(badge.earnedAt).toBeNull();
      }
    }
  });

  it("earned badges have a non-null earnedAt", async () => {
    const res = await request(app).get("/api/badges");
    const earnedBadges = res.body.filter((b: { earned: boolean }) => b.earned);
    for (const badge of earnedBadges) {
      expect(badge.earnedAt).not.toBeNull();
    }
  });

  it("locked badges have null earnedAt", async () => {
    const res = await request(app).get("/api/badges");
    const lockedBadges = res.body.filter((b: { earned: boolean }) => !b.earned);
    for (const badge of lockedBadges) {
      expect(badge.earnedAt).toBeNull();
    }
  });

  it("returns the seeded set of badges (at least 1)", async () => {
    const res = await request(app).get("/api/badges");
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("at least one badge is earned from seed data", async () => {
    const res = await request(app).get("/api/badges");
    const earned = res.body.filter((b: { earned: boolean }) => b.earned);
    expect(earned.length).toBeGreaterThanOrEqual(1);
  });
});
