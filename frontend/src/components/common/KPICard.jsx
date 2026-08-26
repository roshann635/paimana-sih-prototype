import React from 'react';

/**
 * KPICard Component
 * Institutional executive KPI metric card.
 * Background #FFFFFF, 1px border #D9D9D6, subtle shadow, Title #5F6368, Value #252525, Context #7A7A76.
 */
export default function KPICard({ label, value, context, trend, status, loading = false }) {
  if (loading) {
    return (
      <div className="bg-gov-surface border border-gov-border rounded-gov p-5 shadow-gov animate-pulse">
        <div className="h-3.5 bg-gov-secondary rounded w-28 mb-3"></div>
        <div className="h-8 bg-gov-secondary rounded w-20 mb-2"></div>
        <div className="h-3 bg-gov-secondary rounded w-36"></div>
      </div>
    );
  }

  let valueColor = 'text-text-primary';
  if (status === 'critical') valueColor = 'text-risk-critical';
  if (status === 'review') valueColor = 'text-risk-review';
  if (status === 'watch') valueColor = 'text-risk-watch';
  if (status === 'normal') valueColor = 'text-risk-normal';

  return (
    <div className="bg-gov-surface border border-gov-border rounded-gov p-5 shadow-gov hover:border-[#B8B8B3] transition-colors flex flex-col justify-between">
      <div>
        <div className="text-[11px] font-semibold tracking-wider uppercase text-text-secondary mb-2 truncate">
          {label}
        </div>
        <div className={`text-2xl lg:text-[28px] font-bold tracking-tight ${valueColor} mb-1.5 leading-tight font-mono`}>
          {value ?? '—'}
        </div>
      </div>
      {(context || trend) && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted pt-1 border-t border-gov-border/40 truncate">
          {trend && <span className="font-medium text-text-secondary">{trend}</span>}
          {context && <span>{context}</span>}
        </div>
      )}
    </div>
  );
}
