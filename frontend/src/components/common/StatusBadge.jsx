import React from 'react';

/**
 * StatusBadge Component
 * Premium Calibrated Risk Indicator with Accessible Semantics
 */
export default function StatusBadge({ status, level, size = 'md' }) {
  const raw = (level || status || 'LOW').toUpperCase();

  let config = {
    label: 'LOW',
    icon: '✓',
    color: '#2F7D68',
    bg: '#EEF7F4',
    border: '#B7DFD4',
  };

  if (raw === 'CRITICAL' || raw === 'RED') {
    config = {
      label: 'CRITICAL',
      icon: '●',
      color: '#A63D40',
      bg: '#FDF0F0',
      border: '#F3C5C7',
    };
  } else if (raw === 'HIGH' || raw === 'ORANGE' || raw === 'REVIEW') {
    config = {
      label: 'HIGH RISK',
      icon: '▲',
      color: '#C66A2B',
      bg: '#FEF4EB',
      border: '#F9D1B4',
    };
  } else if (raw === 'MODERATE' || raw === 'AMBER' || raw === 'WATCH' || raw === 'YELLOW') {
    config = {
      label: 'MODERATE',
      icon: '■',
      color: '#B08A32',
      bg: '#FDF9EC',
      border: '#F2DF9E',
    };
  } else if (raw === 'STABLE' || raw === 'GREEN' || raw === 'NORMAL') {
    config = {
      label: 'STABLE',
      icon: '✓',
      color: '#2F7D68',
      bg: '#EEF7F4',
      border: '#B7DFD4',
    };
  }

  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold tracking-wider ${
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } rounded-[6px] border shadow-xs select-none`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
      role="status"
      aria-label={`Risk Tier: ${config.label}`}
    >
      <span className="text-[10px] leading-none" aria-hidden="true">
        {config.icon}
      </span>
      <span>{config.label}</span>
    </span>
  );
}
