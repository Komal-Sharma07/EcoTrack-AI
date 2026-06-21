---
name: EcoTrack shared frontend utilities
description: Where shared display constants/utilities live and what they contain.
---

All shared presentational constants live in `artifacts/ecotrack/src/lib/carbon-display.ts`.

Contents:
- `CATEGORY_CHART_COLORS` — canonical 4-color hex array for recharts (transport/electricity/food/travel order)
- `CATEGORY_ICONS` — category key → Lucide icon (transport, energy, food, travel, general)
- `CATEGORY_BG` — category key → Tailwind bg+text classes
- `getRatingInfo(score)` → `{ label, color, bg }` — single source for score rating text+colors
- `CHART_CONTENT_STYLE` — recharts `contentStyle` object matching app theme
- `CHART_LABEL_STYLE` — recharts `labelStyle` object for axis labels

**Why:** getRatingLabel was defined 3 times, CATEGORY_ICONS twice, chart colors twice. Centralizing removes drift risk.

**How to apply:** Any new page/component needing these should import from `@/lib/carbon-display`, not define inline.
