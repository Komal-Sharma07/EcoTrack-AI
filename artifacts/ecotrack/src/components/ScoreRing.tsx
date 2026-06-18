interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

function getRingColor(score: number) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#14b8a6";
  if (score >= 40) return "#f59e0b";
  if (score >= 20) return "#f97316";
  return "#ef4444";
}

function getRatingLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  if (score >= 20) return "Poor";
  return "Critical";
}

export function ScoreRing({ score, size = 80, strokeWidth = 8 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const offset = circumference - (progress / 100) * circumference;
  const color = getRingColor(score);
  const rating = getRatingLabel(score);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-label={`Carbon score: ${score} out of 100 — ${rating}`}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className="text-lg font-bold text-foreground" style={{ fontSize: size * 0.22 }}>{score}</span>
      </div>
    </div>
  );
}
