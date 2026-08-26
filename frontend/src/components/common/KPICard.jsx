import React from 'react';

/**
 * KPICard Component
 * Institutional executive KPI metric card.
 * High density, restrained styling, 1px border, no oversized cards or gradients.
 */
export default function KPICard({ label, value, context, trend, status, loading = false }) {
  if (loading) {
    return (
      <div className="bg-gov-surface border border-gov-border rounded-gov p-4 shadow-gov animate-pulse">
        <div className="h-3.5 bg-gov-secondary rounded w-28 mb-3"></div>
        <div className="h-8 bg-gov-secondary rounded w-20 mb-2"></div>
        <div className="h-3 bg-gov-secondary rounded w-36"></div>
      </div>
    );
  }

  let accentStyle = 'text-text-primary';
  if (status === 'critical') accentStyle = 'text-risk-critical';
  if (status === 'review') accentStyle = 'text-risk-review';
  if (status === 'watch') accentStyle = 'text-risk-watch';
  if (status === 'normal') accentStyle = 'text-risk-normal';

  return (
    <div className="bg-gov-surface border border-gov-border rounded-gov p-4 shadow-gov hover:border-text-muted transition-colors">
      <div className="text-[11px] font-semibold tracking-wider uppercase text-text-secondary mb-1.5 truncate">
        {label}
      </div>
      <div className={`text-2xl lg:text-[28px] font-semibold tracking-tight ${accentStyle} mb-1 leading-tight`}>
        {value ?? '—'}
      </div>
      {(context || trend) && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted truncate">
          {trend && <span className="font-medium">{trend}</span>}
          {context && <span>{context}</span>}
        </div>
      )}
    </div>
  );
}
