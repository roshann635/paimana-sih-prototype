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
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      border: 'border-red-500/30',
      dot: 'bg-red-500',
      label: 'Critical Risk',
    },
    ORANGE: {
      bg: 'bg-orange-500/15',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      dot: 'bg-orange-500',
      label: 'High Risk',
    },
    AMBER: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500',
      label: 'Moderate',
    },
    GREEN: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-500',
      label: 'Healthy',
    },
  }[normLevel] || {
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    dot: 'bg-slate-500',
    label: normLevel,
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 space-x-1.5',
    md: 'text-xs px-2.5 py-1 space-x-2',
    lg: 'text-sm px-3.5 py-1.5 space-x-2.5 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border ${styles.bg} ${styles.text} ${styles.border} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${styles.dot} ${normLevel === 'RED' ? 'animate-ping' : ''}`} />
      {score !== undefined && <span>{Number(score).toFixed(0)}</span>}
      {showLabel && <span>{styles.label}</span>}
    </span>
  );
};
