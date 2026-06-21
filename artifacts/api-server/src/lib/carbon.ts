/** Input parameters for the annual carbon footprint calculation. */
export interface FootprintInputData {
  /** Daily distance travelled by the primary transport mode (km) */
  transportKm: number;
  transportMode: "car" | "bike" | "bus" | "train" | "walking";
  /** Monthly electricity consumption (kWh) */
  electricityKwh: number;
  dietType: "vegan" | "vegetarian" | "omnivore";
  /** Number of flights taken per year */
  flightsPerYear: number;
}

/** Output of the annual carbon footprint calculation. */
export interface FootprintResultData {
  totalKgCo2: number;
  transportKgCo2: number;
  electricityKgCo2: number;
  foodKgCo2: number;
  travelKgCo2: number;
  score: number;
  rating: "excellent" | "good" | "average" | "poor" | "critical";
}

// ---------------------------------------------------------------------------
// Emission factors
// ---------------------------------------------------------------------------

/** kg CO₂ per km per working day for each transport mode */
const TRANSPORT_FACTORS: Record<FootprintInputData["transportMode"], number> = {
  car:     0.21,
  bus:     0.089,
  train:   0.041,
  bike:    0,
  walking: 0,
};

/** kg CO₂ per day for each diet type */
const DIET_FACTORS: Record<FootprintInputData["dietType"], number> = {
  vegan:       1.5,
  vegetarian:  2.5,
  omnivore:    5.0,
};

const ELECTRICITY_FACTOR   = 0.233; // kg CO₂ per kWh
const FLIGHT_FACTOR        = 255;   // kg CO₂ per round-trip flight
const WORKING_DAYS_PER_YEAR = 260;
const MONTHS_PER_YEAR       = 12;
const DAYS_PER_YEAR         = 365;

// ---------------------------------------------------------------------------
// Score / rating helpers
// ---------------------------------------------------------------------------

/**
 * Converts an annual CO₂ total to a 0–100 score.
 * Calibrated so that 500 kg/yr → 100 and 4,000 kg/yr (global avg) → 20.
 */
function computeScore(totalKgCo2: number): number {
  const best      = 500;
  const globalAvg = 4000;
  return Math.max(0, Math.min(100,
    Math.round(100 - ((totalKgCo2 - best) / (globalAvg - best)) * 80),
  ));
}

function computeRating(score: number): FootprintResultData["rating"] {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "average";
  if (score >= 20) return "poor";
  return "critical";
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/** Calculates the estimated annual carbon footprint from lifestyle inputs. */
export function calculateCarbonFootprint(input: FootprintInputData): FootprintResultData {
  const transportKgCo2   = input.transportKm * TRANSPORT_FACTORS[input.transportMode] * WORKING_DAYS_PER_YEAR;
  const electricityKgCo2 = input.electricityKwh * MONTHS_PER_YEAR * ELECTRICITY_FACTOR;
  const foodKgCo2        = DIET_FACTORS[input.dietType] * DAYS_PER_YEAR;
  const travelKgCo2      = input.flightsPerYear * FLIGHT_FACTOR;

  const totalKgCo2 = transportKgCo2 + electricityKgCo2 + foodKgCo2 + travelKgCo2;
  const score  = computeScore(totalKgCo2);
  const rating = computeRating(score);

  const round1 = (n: number) => Math.round(n * 10) / 10;

  return {
    totalKgCo2:        round1(totalKgCo2),
    transportKgCo2:    round1(transportKgCo2),
    electricityKgCo2:  round1(electricityKgCo2),
    foodKgCo2:         round1(foodKgCo2),
    travelKgCo2:       round1(travelKgCo2),
    score,
    rating,
  };
}
