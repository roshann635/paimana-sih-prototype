import React from 'react';

/**
 * StatusBadge Component
 * Accessible RAGB status indicator with icon + label + semantic color.
 * Never relies on color alone for meaning.
 */
export default function StatusBadge({ status, level, size = 'md' }) {
  const rawStatus = (level || status || 'GREEN').toUpperCase();

  let config = {
    label: 'NORMAL',
    icon: '✓',
    color: '#3F7D58',
    bg: '#F1F7F4',
    border: '#CEE5D8',
  };

  if (rawStatus === 'CRITICAL' || rawStatus === 'RED') {
    config = {
      label: 'CRITICAL',
      icon: '●',
      color: '#B63A32',
      bg: '#FDF2F2',
      border: '#F8D7D7',
    };
  } else if (rawStatus === 'REVIEW' || rawStatus === 'ORANGE') {
    config = {
      label: 'REVIEW',
      icon: '▲',
      color: '#C66A22',
      bg: '#FEF6EE',
      border: '#FBD8BA',
    };
  } else if (rawStatus === 'WATCH' || rawStatus === 'AMBER' || rawStatus === 'YELLOW') {
    config = {
      label: 'WATCH',
      icon: '■',
      color: '#B58A27',
      bg: '#FEF9EE',
      border: '#F9E9BE',
    };
  }

  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold tracking-wider ${
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } rounded-[6px] border`}
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
