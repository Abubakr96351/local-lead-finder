import type { GaugeLabel } from "@/lib/score";
import { GAUGE_COLORS } from "@/lib/score";

const RADIUS = 34;
const CIRCUMFERENCE = Math.PI * RADIUS; // semicircle arc length

export function OutreachGauge({
  score,
  label,
}: {
  score: number;
  label: GaugeLabel;
}) {
  const filled = (Math.min(Math.max(score, 0), 100) / 100) * CIRCUMFERENCE;
  const color = GAUGE_COLORS[label];

  return (
    <div className="flex flex-col items-center">
      <svg width="88" height="50" viewBox="0 0 88 50">
        <path
          d="M 7 44 A 34 34 0 0 1 81 44"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M 7 44 A 34 34 0 0 1 81 44"
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
        />
      </svg>
      <span className="-mt-2 text-base font-bold" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
