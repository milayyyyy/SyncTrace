/** SyncTrace academic & professional color theme */
export const colors = {
  brand: {
    navy: "#1E3A5F",
    slate: "#475569",
    emerald: "#059669",
    gold: "#D4AF37",
    coral: "#F97316",
    indigo: "#4F46E5",
  },
  status: {
    pass: "#10B981",
    partial: "#F59E0B",
    fail: "#EF4444",
    critical: "#B91C1C",
    drift: "#EA580C",
    ai: "#8B5CF6",
    ready: "#22C55E",
    revision: "#EAB308",
    criticalGaps: "#EF4444",
  },
} as const;

/** Alignment / readiness score text color */
export function getScoreColor(score: number): string {
  if (score >= 85) return "text-brand-gold";
  if (score >= 65) return "text-status-partial";
  return "text-status-fail";
}

/** Alignment / readiness score progress bar fill */
export function getScoreBg(score: number): string {
  if (score >= 85) return "bg-brand-gold";
  if (score >= 65) return "bg-status-partial";
  return "bg-status-fail";
}
