import React from 'react';

export function LoadingSkeleton({ rows = 5 }) {
  return (
    <div className="w-full space-y-3 p-6 bg-gov-surface border border-gov-border rounded-gov animate-pulse shadow-gov">
      <div className="h-4 bg-gov-secondary rounded w-1/4 mb-4"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-gov-secondary rounded w-1/6"></div>
          <div className="h-4 bg-gov-secondary rounded w-1/3"></div>
          <div className="h-4 bg-gov-secondary rounded w-1/4"></div>
          <div className="h-4 bg-gov-secondary rounded w-1/5"></div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title = "No data found",
  message = "No records match the current filter selection.",
  onReset
}) {
  return (
    <div className="bg-gov-surface border border-gov-border rounded-gov p-8 text-center my-4 shadow-gov">
      <div className="text-text-muted text-3xl mb-2 font-light">∅</div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-secondary max-w-sm mx-auto mb-4">{message}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-brand-dark bg-brand-light rounded-gov-sm hover:bg-amber-200 transition-colors border border-brand/30 shadow-gov"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Unable to load data",
  message = "Data source temporarily unavailable. Please verify the backend service is running.",
  onRetry
}) {
  return (
    <div className="bg-gov-surface border border-risk-critical/30 rounded-gov p-6 text-center my-4 shadow-gov border-l-4 border-l-risk-critical">
      <div className="text-risk-critical text-2xl mb-2">⚠</div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-secondary max-w-md mx-auto mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded-gov-sm transition-colors shadow-gov"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
}
