import React from 'react';

/**
 * StatusBadge Component
 * Accessible RAGB status indicator with icon + label + semantic color.
 * Follows the enhanced light institutional design system.
 */
export default function StatusBadge({ status, level, size = 'md' }) {
  const rawStatus = (level || status || 'GREEN').toUpperCase();

  let config = {
    label: 'NORMAL',
    icon: '✓',
    color: '#2B6E44',
    bg: '#EDF7F1',
    border: '#BDDFCB',
  };

  if (rawStatus === 'CRITICAL' || rawStatus === 'RED') {
    config = {
      label: 'CRITICAL',
      icon: '●',
      color: '#A82420',
      bg: '#FDF0EF',
      border: '#F3BFBC',
    };
  } else if (rawStatus === 'REVIEW' || rawStatus === 'ORANGE') {
    config = {
      label: 'REVIEW',
      icon: '▲',
      color: '#B55214',
      bg: '#FEF3EB',
      border: '#F5CDAF',
    };
  } else if (rawStatus === 'WATCH' || rawStatus === 'AMBER' || rawStatus === 'YELLOW') {
    config = {
      label: 'WATCH',
      icon: '■',
      color: '#916812',
      bg: '#FEF9EB',
      border: '#EBD9A0',
    };
  }

  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold tracking-wider ${
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } rounded-[6px] border shadow-xs`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
      role="status"
      aria-label={`Risk Level: ${config.label}`}
    >
      <span className="text-[10px] leading-none" aria-hidden="true">
        {config.icon}
      </span>
      <span>{config.label}</span>
    </span>
  );
}
