import React from "react";

/**
 * TrendBadge Component
 * Trajectory drift indicator (Deteriorating, Improving, Stable).
 */
export default function TrendBadge({ direction }) {
  const dir = (direction || "stable").toLowerCase();

  if (dir === "deteriorating" || dir === "up_risk") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-risk-review">
        <span aria-hidden="true">↑</span>
        <span>Deteriorating</span>
      </span>
    );
  }

  if (dir === "improving" || dir === "down_risk") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-risk-normal">
        <span aria-hidden="true">↓</span>
        <span>Improving</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted">
      <span aria-hidden="true">→</span>
      <span>Stable</span>
    </span>
  );
}
