export interface FootprintInputData {
  transportKm: number;
  transportMode: "car" | "bike" | "bus" | "train" | "walking";
  electricityKwh: number;
  dietType: "vegan" | "vegetarian" | "omnivore";
  flightsPerYear: number;
}

export interface FootprintResultData {
  totalKgCo2: number;
  transportKgCo2: number;
  electricityKgCo2: number;
  foodKgCo2: number;
  travelKgCo2: number;
  score: number;
  rating: "excellent" | "good" | "average" | "poor" | "critical";
}

const TRANSPORT_FACTORS: Record<string, number> = {
  car: 0.21,
  bus: 0.089,
  train: 0.041,
  bike: 0,
  walking: 0,
};

const DIET_FACTORS: Record<string, number> = {
  vegan: 1.5,
  vegetarian: 2.5,
  omnivore: 5.0,
};

const ELECTRICITY_FACTOR = 0.233;
const FLIGHT_FACTOR = 255;
const WORKING_DAYS_PER_YEAR = 260;

export function calculateCarbonFootprint(input: FootprintInputData): FootprintResultData {
  const transportKgCo2 =
    input.transportKm * (TRANSPORT_FACTORS[input.transportMode] ?? 0) * WORKING_DAYS_PER_YEAR;

  const electricityKgCo2 = input.electricityKwh * 12 * ELECTRICITY_FACTOR;

  const foodKgCo2 = (DIET_FACTORS[input.dietType] ?? 5.0) * 365;

  const travelKgCo2 = input.flightsPerYear * FLIGHT_FACTOR;

  const totalKgCo2 = transportKgCo2 + electricityKgCo2 + foodKgCo2 + travelKgCo2;

  const score = computeScore(totalKgCo2);
  const rating = computeRating(score);

  return {
    totalKgCo2: Math.round(totalKgCo2 * 10) / 10,
    transportKgCo2: Math.round(transportKgCo2 * 10) / 10,
    electricityKgCo2: Math.round(electricityKgCo2 * 10) / 10,
    foodKgCo2: Math.round(foodKgCo2 * 10) / 10,
    travelKgCo2: Math.round(travelKgCo2 * 10) / 10,
    score,
    rating,
  };
}

function computeScore(totalKgCo2: number): number {
  const globalAvg = 4000;
  const best = 500;
  const score = Math.max(0, Math.min(100, Math.round(100 - ((totalKgCo2 - best) / (globalAvg - best)) * 80)));
  return score;
}

function computeRating(score: number): "excellent" | "good" | "average" | "poor" | "critical" {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "average";
  if (score >= 20) return "poor";
  return "critical";
}
