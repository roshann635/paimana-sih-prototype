import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const TrendIndicator = ({ trend, showLabel = true }) => {
  const norm = (trend || 'stable').toLowerCase();

  if (norm === 'deteriorating') {
    return (
      <span className="inline-flex items-center space-x-1 text-red-300 font-medium text-xs px-2 py-0.5 rounded bg-red-950/40 border border-red-800/40">
        <ArrowUpRight className="w-3.5 h-3.5 text-red-400 stroke-[2]" />
        {showLabel && <span>Deteriorating</span>}
      </span>
    );
  }

  if (norm === 'improving') {
    return (
      <span className="inline-flex items-center space-x-1 text-emerald-300 font-medium text-xs px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40">
        <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400 stroke-[2]" />
        {showLabel && <span>Improving</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 text-slate-300 font-medium text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700/60">
      <Minus className="w-3.5 h-3.5 text-slate-400" />
      {showLabel && <span>Stable</span>}
    </span>
  );
};
