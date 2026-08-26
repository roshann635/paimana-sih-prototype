import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const TrendIndicator = ({ trend, showLabel = true }) => {
  const norm = (trend || 'stable').toLowerCase();

  if (norm === 'deteriorating') {
    return (
      <span className="inline-flex items-center space-x-1 text-red-400 font-semibold text-xs px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
        {showLabel && <span>Deteriorating</span>}
      </span>
    );
  }

  if (norm === 'improving') {
    return (
      <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
        <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
        {showLabel && <span>Improving</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 text-slate-400 font-medium text-xs px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/50">
      <Minus className="w-3.5 h-3.5" />
      {showLabel && <span>Stable</span>}
    </span>
  );
};
