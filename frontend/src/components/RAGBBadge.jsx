import React from 'react';

export const RAGBBadge = ({
  level,
  score,
  size = 'md',
  showLabel = true,
}) => {
  const normLevel = (level || 'GREEN').toUpperCase();

  const styles = {
    RED: {
      bg: 'bg-red-950/60',
      text: 'text-red-300',
      border: 'border-red-700/60',
      dot: 'bg-red-500',
      label: 'Critical Review',
    },
    ORANGE: {
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      border: 'border-amber-700/60',
      dot: 'bg-amber-500',
      label: 'High Risk',
    },
    AMBER: {
      bg: 'bg-yellow-950/40',
      text: 'text-yellow-300',
      border: 'border-yellow-700/50',
      dot: 'bg-yellow-500',
      label: 'Moderate Watch',
    },
    GREEN: {
      bg: 'bg-emerald-950/50',
      text: 'text-emerald-300',
      border: 'border-emerald-700/50',
      dot: 'bg-emerald-500',
      label: 'On Track',
    },
  }[normLevel] || {
    bg: 'bg-slate-900',
    text: 'text-slate-300',
    border: 'border-slate-700',
    dot: 'bg-slate-500',
    label: normLevel,
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 space-x-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 space-x-1.5 font-semibold',
    lg: 'text-xs px-3.5 py-1.5 space-x-2 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border ${styles.bg} ${styles.text} ${styles.border} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
      {score !== undefined && (
        <span className="font-mono">{Number(score).toFixed(0)}</span>
      )}
      {showLabel && <span>{styles.label}</span>}
    </span>
  );
};
