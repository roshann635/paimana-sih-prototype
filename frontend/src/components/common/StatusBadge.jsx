import React from 'react';

/**
 * StatusBadge Component
 * Accessible RAGB status indicator with icon + label + semantic color.
 * Follows the light institutional design system.
 */
export default function StatusBadge({ status, level, size = 'md' }) {
  const rawStatus = (level || status || 'GREEN').toUpperCase();

  let config = {
    label: 'NORMAL',
    icon: '✓',
    color: '#3F7D58',
    bg: '#E7F1EA',
    border: '#C8E2D1',
  };

  if (rawStatus === 'CRITICAL' || rawStatus === 'RED') {
    config = {
      label: 'CRITICAL',
      icon: '●',
      color: '#A5322D',
      bg: '#F7E2E0',
      border: '#ECC4C1',
    };
  } else if (rawStatus === 'REVIEW' || rawStatus === 'ORANGE') {
    config = {
      label: 'REVIEW',
      icon: '▲',
      color: '#A65318',
      bg: '#F8E7D8',
      border: '#EFCDB2',
    };
  } else if (rawStatus === 'WATCH' || rawStatus === 'AMBER' || rawStatus === 'YELLOW') {
    config = {
      label: 'WATCH',
      icon: '■',
      color: '#8E6C16',
      bg: '#F5EFD9',
      border: '#E8DCB0',
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
