/**
 * Shared display constants and utilities for carbon footprint data.
 * Keep purely presentational — no API calls or side effects.
 */

import type { FC } from "react";
import { Car, Zap, Utensils, Plane, Leaf } from "lucide-react";

// ---------------------------------------------------------------------------
// Chart colors
// ---------------------------------------------------------------------------

/**
 * Canonical 4-color palette for category charts:
 * [transport, electricity, food, travel]
 */
export const CATEGORY_CHART_COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
] as const;

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------

/** Lucide icon component for each emission category */
export const CATEGORY_ICONS: Record<string, FC<{ className?: string }>> = {
  transport: Car,
  energy: Zap,
  food: Utensils,
  travel: Plane,
  general: Leaf,
};

/** Tailwind classes for category icon containers (background + text) */
export const CATEGORY_BG: Record<string, string> = {
  transport: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  energy: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  food: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  travel: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  general: "bg-primary/10 text-primary",
};

// ---------------------------------------------------------------------------
// Score rating
// ---------------------------------------------------------------------------

export interface RatingInfo {
  label: string;
  /** Tailwind text-color class */
  color: string;
  /** Tailwind background class (used for pill badges) */
  bg: string;
}

/** Maps a carbon score (0–100) to human-readable rating metadata. */
export function getRatingInfo(score: number): RatingInfo {
  if (score >= 80) return { label: "Excellent", color: "text-emerald-500", bg: "bg-emerald-500/10" };
  if (score >= 60) return { label: "Good", color: "text-teal-500", bg: "bg-teal-500/10" };
  if (score >= 40) return { label: "Average", color: "text-yellow-500", bg: "bg-yellow-500/10" };
  if (score >= 20) return { label: "Poor", color: "text-orange-500", bg: "bg-orange-500/10" };
  return { label: "Critical", color: "text-red-500", bg: "bg-red-500/10" };
}

// ---------------------------------------------------------------------------
// Recharts shared styles
// ---------------------------------------------------------------------------

/** contentStyle prop for all Recharts <Tooltip> components — matches app theme */
export const CHART_CONTENT_STYLE = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
} as const;

/** labelStyle prop for Recharts <Tooltip> when the label should stand out */
export const CHART_LABEL_STYLE = {
  color: "hsl(var(--foreground))",
  fontWeight: 600,
} as const;
