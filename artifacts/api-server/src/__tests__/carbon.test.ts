import { describe, it, expect } from "vitest";
import { calculateCarbonFootprint } from "../lib/carbon.js";

const WORKING_DAYS = 260;
const ELECTRICITY_FACTOR = 0.233;
const FLIGHT_FACTOR = 255;

describe("calculateCarbonFootprint", () => {
  describe("transport emission calculations", () => {
    it("calculates car emissions correctly", () => {
      const result = calculateCarbonFootprint({
        transportKm: 20,
        transportMode: "car",
        electricityKwh: 0,
        dietType: "vegan",
        flightsPerYear: 0,
      });
      const expected = Math.round(20 * 0.21 * WORKING_DAYS * 10) / 10;
      expect(result.transportKgCo2).toBe(expected);
    });

    it("calculates bus emissions correctly", () => {
      const result = calculateCarbonFootprint({
        transportKm: 10,
        transportMode: "bus",
        electricityKwh: 0,
        dietType: "vegan",
        flightsPerYear: 0,
      });
      const expected = Math.round(10 * 0.089 * WORKING_DAYS * 10) / 10;
      expect(result.transportKgCo2).toBe(expected);
    });

    it("calculates train emissions correctly", () => {
      const result = calculateCarbonFootprint({
        transportKm: 30,
        transportMode: "train",
        electricityKwh: 0,
        dietType: "vegan",
        flightsPerYear: 0,
      });
      const expected = Math.round(30 * 0.041 * WORKING_DAYS * 10) / 10;
      expect(result.transportKgCo2).toBe(expected);
    });

    it("produces zero emissions for bike", () => {
      const result = calculateCarbonFootprint({
        transportKm: 15,
        transportMode: "bike",
        electricityKwh: 0,
        dietType: "vegan",
        flightsPerYear: 0,
      });
      expect(result.transportKgCo2).toBe(0);
    });

    it("produces zero emissions for walking", () => {
      const result = calculateCarbonFootprint({
        transportKm: 5,
        transportMode: "walking",
        electricityKwh: 0,
        dietType: "vegan",
        flightsPerYear: 0,
      });
      expect(result.transportKgCo2).toBe(0);
    });

    it("produces zero transport emissions when distance is 0", () => {
      const result = calculateCarbonFootprint({
        transportKm: 0,
        transportMode: "car",
        electricityKwh: 0,
        dietType: "vegan",
        flightsPerYear: 0,
      });
      expect(result.transportKgCo2).toBe(0);
    });
  });

  describe("diet impact calculations", () => {
    it("calculates vegan food emissions correctly", () => {
      const result = calculateCarbonFootprint({
        transportKm: 0,
        transportMode: "bike",
        electricityKwh: 0,
        dietType: "vegan",
        flightsPerYear: 0,
      });
      const expected = Math.round(1.5 * 365 * 10) / 10;
      expect(result.foodKgCo2).toBe(expected);
    });

    it("calculates vegetarian food emissions correctly", () => {
      const result = calculateCarbonFootprint({
        transportKm: 0,
        transportMode: "bike",
        electricityKwh: 0,
        dietType: "vegetarian",
        flightsPerYear: 0,
      });
      const expected = Math.round(2.5 * 365 * 10) / 10;
      expect(result.foodKgCo2).toBe(expected);
    });

    it("calculates omnivore food emissions correctly", () => {
      const result = calculateCarbonFootprint({
        transportKm: 0,
        transportMode: "bike",
        electricityKwh: 0,
        dietType: "omnivore",
        flightsPerYear: 0,
      });
      const expected = Math.round(5.0 * 365 * 10) / 10;
      expect(result.foodKgCo2).toBe(expected);
    });

    it("vegan diet has lower emissions than vegetarian", () => {
      const vegan = calculateCarbonFootprint({
        transportKm: 0, transportMode: "bike", electricityKwh: 0, dietType: "vegan", flightsPerYear: 0,
      });
      const vegetarian = calculateCarbonFootprint({
        transportKm: 0, transportMode: "bike", electricityKwh: 0, dietType: "vegetarian", flightsPerYear: 0,
      });
      expect(vegan.foodKgCo2).toBeLessThan(vegetarian.foodKgCo2);
    });

    it("vegetarian diet has lower emissions than omnivore", () => {
      const vegetarian = calculateCarbonFootprint({
        transportKm: 0, transportMode: "bike", electricityKwh: 0, dietType: "vegetarian", flightsPerYear: 0,
      });
      const omnivore = calculateCarbonFootprint({
        transportKm: 0, transportMode: "bike", electricityKwh: 0, dietType: "omnivore", flightsPerYear: 0,
      });
      expect(vegetarian.foodKgCo2).toBeLessThan(omnivore.foodKgCo2);
    });
  });

  describe("electricity calculation", () => {
    it("calculates annual electricity emissions from monthly kWh", () => {
      const result = calculateCarbonFootprint({
        transportKm: 0,
        transportMode: "bike",
        electricityKwh: 300,
        dietType: "vegan",
        flightsPerYear: 0,
      });
      const expected = Math.round(300 * 12 * ELECTRICITY_FACTOR * 10) / 10;
      expect(result.electricityKgCo2).toBe(expected);
    });

    it("produces zero electricity emissions at 0 kWh", () => {
      const result = calculateCarbonFootprint({
        transportKm: 0,
        transportMode: "bike",
        electricityKwh: 0,
        dietType: "vegan",
        flightsPerYear: 0,
      });
      expect(result.electricityKgCo2).toBe(0);
    });

    it("scales linearly with kWh usage", () => {
      const low = calculateCarbonFootprint({
        transportKm: 0, transportMode: "bike", electricityKwh: 200, dietType: "vegan", flightsPerYear: 0,
      });
      const high = calculateCarbonFootprint({
        transportKm: 0, transportMode: "bike", electricityKwh: 400, dietType: "vegan", flightsPerYear: 0,
      });
      expect(high.electricityKgCo2).toBeCloseTo(low.electricityKgCo2 * 2, 0);
    });
  });

  describe("flight emission calculations", () => {
    it("calculates single flight emissions correctly", () => {
      const result = calculateCarbonFootprint({
        transportKm: 0,
        transportMode: "bike",
        electricityKwh: 0,
        dietType: "vegan",
        flightsPerYear: 1,
      });
      expect(result.travelKgCo2).toBe(FLIGHT_FACTOR);
    });

    it("scales linearly with number of flights", () => {
      const result = calculateCarbonFootprint({
        transportKm: 0,
        transportMode: "bike",
        electricityKwh: 0,
        dietType: "vegan",
        flightsPerYear: 4,
      });
      expect(result.travelKgCo2).toBe(4 * FLIGHT_FACTOR);
    });

    it("produces zero travel emissions with no flights", () => {
      const result = calculateCarbonFootprint({
        transportKm: 0,
        transportMode: "bike",
        electricityKwh: 0,
        dietType: "vegan",
        flightsPerYear: 0,
      });
      expect(result.travelKgCo2).toBe(0);
    });
  });

  describe("total aggregation", () => {
    it("totalKgCo2 equals sum of all category emissions", () => {
      const result = calculateCarbonFootprint({
        transportKm: 20,
        transportMode: "car",
        electricityKwh: 300,
        dietType: "omnivore",
        flightsPerYear: 2,
      });
      const sum = Math.round(
        (result.transportKgCo2 + result.electricityKgCo2 + result.foodKgCo2 + result.travelKgCo2) * 10
      ) / 10;
      expect(result.totalKgCo2).toBe(sum);
    });

    it("returns rounded values to 1 decimal place", () => {
      const result = calculateCarbonFootprint({
        transportKm: 7,
        transportMode: "car",
        electricityKwh: 137,
        dietType: "vegetarian",
        flightsPerYear: 3,
      });
      const decimalPlaces = (n: number) => {
        const s = n.toString();
        return s.includes(".") ? s.split(".")[1].length : 0;
      };
      expect(decimalPlaces(result.totalKgCo2)).toBeLessThanOrEqual(1);
      expect(decimalPlaces(result.transportKgCo2)).toBeLessThanOrEqual(1);
      expect(decimalPlaces(result.electricityKgCo2)).toBeLessThanOrEqual(1);
      expect(decimalPlaces(result.foodKgCo2)).toBeLessThanOrEqual(1);
      expect(decimalPlaces(result.travelKgCo2)).toBeLessThanOrEqual(1);
    });
  });

  describe("score and rating", () => {
    it("assigns Excellent rating for very low emissions (score >= 80)", () => {
      const result = calculateCarbonFootprint({
        transportKm: 0,
        transportMode: "bike",
        electricityKwh: 0,
        dietType: "vegan",
        flightsPerYear: 0,
      });
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.rating).toBe("excellent");
    });

    it("assigns Critical rating for very high emissions (score < 20)", () => {
      const result = calculateCarbonFootprint({
        transportKm: 200,
        transportMode: "car",
        electricityKwh: 2000,
        dietType: "omnivore",
        flightsPerYear: 20,
      });
      expect(result.score).toBeLessThan(20);
      expect(result.rating).toBe("critical");
    });

    it("score is always between 0 and 100 inclusive", () => {
      const inputs = [
        { transportKm: 0, transportMode: "bike" as const, electricityKwh: 0, dietType: "vegan" as const, flightsPerYear: 0 },
        { transportKm: 50, transportMode: "car" as const, electricityKwh: 500, dietType: "omnivore" as const, flightsPerYear: 5 },
        { transportKm: 200, transportMode: "car" as const, electricityKwh: 2000, dietType: "omnivore" as const, flightsPerYear: 50 },
      ];
      for (const input of inputs) {
        const result = calculateCarbonFootprint(input);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      }
    });

    it("higher emissions produce a lower score", () => {
      const low = calculateCarbonFootprint({
        transportKm: 0, transportMode: "bike", electricityKwh: 50, dietType: "vegan", flightsPerYear: 0,
      });
      const high = calculateCarbonFootprint({
        transportKm: 80, transportMode: "car", electricityKwh: 800, dietType: "omnivore", flightsPerYear: 6,
      });
      expect(low.score).toBeGreaterThan(high.score);
    });

    it("assigns correct rating boundaries", () => {
      const cases: Array<[number, string]> = [
        [0, "bike"],
        [10, "car"],
        [50, "car"],
        [100, "car"],
      ];
      for (const [km, mode] of cases) {
        const result = calculateCarbonFootprint({
          transportKm: km,
          transportMode: mode as "car" | "bike",
          electricityKwh: 0,
          dietType: "vegan",
          flightsPerYear: 0,
        });
        const validRatings = ["excellent", "good", "average", "poor", "critical"];
        expect(validRatings).toContain(result.rating);
      }
    });
  });

  describe("recommendation generation logic", () => {
    it("car commuter has higher transport emissions than train commuter for same distance", () => {
      const byCar = calculateCarbonFootprint({
        transportKm: 30, transportMode: "car", electricityKwh: 0, dietType: "vegan", flightsPerYear: 0,
      });
      const byTrain = calculateCarbonFootprint({
        transportKm: 30, transportMode: "train", electricityKwh: 0, dietType: "vegan", flightsPerYear: 0,
      });
      expect(byCar.transportKgCo2).toBeGreaterThan(byTrain.transportKgCo2);
    });

    it("switching from omnivore to vegan reduces food emissions by more than 50%", () => {
      const omnivore = calculateCarbonFootprint({
        transportKm: 0, transportMode: "bike", electricityKwh: 0, dietType: "omnivore", flightsPerYear: 0,
      });
      const vegan = calculateCarbonFootprint({
        transportKm: 0, transportMode: "bike", electricityKwh: 0, dietType: "vegan", flightsPerYear: 0,
      });
      const reduction = (omnivore.foodKgCo2 - vegan.foodKgCo2) / omnivore.foodKgCo2;
      expect(reduction).toBeGreaterThan(0.5);
    });

    it("each additional flight adds a fixed 255 kg CO₂", () => {
      const zero = calculateCarbonFootprint({
        transportKm: 0, transportMode: "bike", electricityKwh: 0, dietType: "vegan", flightsPerYear: 0,
      });
      const one = calculateCarbonFootprint({
        transportKm: 0, transportMode: "bike", electricityKwh: 0, dietType: "vegan", flightsPerYear: 1,
      });
      const two = calculateCarbonFootprint({
        transportKm: 0, transportMode: "bike", electricityKwh: 0, dietType: "vegan", flightsPerYear: 2,
      });
      expect(one.travelKgCo2 - zero.travelKgCo2).toBe(255);
      expect(two.travelKgCo2 - one.travelKgCo2).toBe(255);
    });

    it("bus emits less than car for same distance", () => {
      const byCar = calculateCarbonFootprint({
        transportKm: 20, transportMode: "car", electricityKwh: 0, dietType: "vegan", flightsPerYear: 0,
      });
      const byBus = calculateCarbonFootprint({
        transportKm: 20, transportMode: "bus", electricityKwh: 0, dietType: "vegan", flightsPerYear: 0,
      });
      expect(byBus.transportKgCo2).toBeLessThan(byCar.transportKgCo2);
    });
  });
});
