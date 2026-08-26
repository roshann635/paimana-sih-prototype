import React from 'react';

export default function KPICard({ label, value, context, trend, status, accentColor, loading = false }) {
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
  let topBarColor = 'border-t-[#D3D6CE]';

  if (status === 'critical') {
    valueColor = 'text-risk-critical';
    topBarColor = 'border-t-risk-critical';
  } else if (status === 'review') {
    valueColor = 'text-risk-review';
    topBarColor = 'border-t-risk-review';
  } else if (status === 'watch') {
    valueColor = 'text-risk-watch';
    topBarColor = 'border-t-risk-watch';
  } else if (status === 'normal' || status === 'brand') {
    valueColor = 'text-brand-dark';
    topBarColor = 'border-t-brand';
  }

  return (
    <div className={`bg-gov-surface border border-gov-border border-t-[3px] ${topBarColor} rounded-gov p-5 shadow-gov hover:shadow-gov-md transition-all flex flex-col justify-between`}>
      <div>
        <div className="text-[11px] font-bold tracking-wider uppercase text-text-secondary mb-2 truncate">
          {label}
        </div>
        <div className={`text-2xl lg:text-[28px] font-extrabold tracking-tight ${valueColor} mb-1.5 leading-tight font-mono`}>
          {value ?? '—'}
        </div>
      </div>
      {(context || trend) && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted pt-2 border-t border-gov-border/60 truncate mt-1">
          {trend && (
            <span className="font-semibold text-brand-dark bg-brand-light px-1.5 py-0.2 rounded text-[11px] border border-brand/20">
              {trend}
            </span>
          )}
          {context && <span className="truncate">{context}</span>}
        </div>
      )}
    </div>
  );
}
