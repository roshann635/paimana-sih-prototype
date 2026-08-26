import React, { useState, useMemo } from 'react';
import StatusBadge from '../common/StatusBadge';

// Key states representation with representative geographic grid positions & project density
const INDIAN_STATES = [
  { id: 'MH', name: 'Maharashtra', x: 220, y: 310, count: 184, critical: 8, capex: '₹3,42,100 Cr' },
  { id: 'UP', name: 'Uttar Pradesh', x: 260, y: 190, count: 215, critical: 11, capex: '₹4,18,600 Cr' },
  { id: 'GJ', name: 'Gujarat', x: 150, y: 260, count: 142, critical: 4, capex: '₹2,84,500 Cr' },
  { id: 'RJ', name: 'Rajasthan', x: 170, y: 190, count: 128, critical: 5, capex: '₹1,95,400 Cr' },
  { id: 'MP', name: 'Madhya Pradesh', x: 240, y: 260, count: 136, critical: 6, capex: '₹2,12,000 Cr' },
  { id: 'TN', name: 'Tamil Nadu', x: 240, y: 460, count: 112, critical: 3, capex: '₹1,88,900 Cr' },
  { id: 'KA', name: 'Karnataka', x: 200, y: 400, count: 98, critical: 4, capex: '₹1,64,300 Cr' },
  { id: 'AP', name: 'Andhra Pradesh', x: 260, y: 380, count: 94, critical: 5, capex: '₹1,52,700 Cr' },
  { id: 'WB', name: 'West Bengal', x: 370, y: 260, count: 104, critical: 6, capex: '₹1,92,400 Cr' },
  { id: 'OD', name: 'Odisha', x: 320, y: 310, count: 88, critical: 4, capex: '₹1,44,800 Cr' },
  { id: 'BR', name: 'Bihar', x: 330, y: 210, count: 116, critical: 7, capex: '₹1,78,200 Cr' },
  { id: 'JH', name: 'Jharkhand', x: 330, y: 260, count: 74, critical: 3, capex: '₹1,15,600 Cr' },
  { id: 'TG', name: 'Telangana', x: 250, y: 340, count: 68, critical: 2, capex: '₹1,08,200 Cr' },
  { id: 'KL', name: 'Kerala', x: 200, y: 470, count: 42, critical: 1, capex: '₹72,400 Cr' },
  { id: 'AS', name: 'Assam & NE', x: 420, y: 190, count: 64, critical: 4, capex: '₹94,800 Cr' },
  { id: 'PB', name: 'Punjab & Haryana', x: 190, y: 140, count: 82, critical: 2, capex: '₹1,24,000 Cr' },
  { id: 'JK', name: 'J&K / Ladakh', x: 180, y: 80, count: 48, critical: 3, capex: '₹86,500 Cr' },
  { id: 'MS', name: 'Multi-State Projects', x: 270, y: 130, count: 91, critical: 5, capex: '₹2,34,000 Cr' },
];

export default function IndiaMap({ onSelectState, selectedStateId, filterRiskOnly = false }) {
  const [hoveredState, setHoveredState] = useState(null);

  const selectedState = useMemo(() => {
    return INDIAN_STATES.find(s => s.id === selectedStateId) || INDIAN_STATES[0];
  }, [selectedStateId]);

  return (
    <div className="bg-gov-surface border border-gov-border rounded-gov p-5 shadow-gov">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gov-border">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            National Infrastructure Geographic Distribution
          </h3>
          <p className="text-xs text-text-secondary">
            Select a state/region to inspect project concentration, capital exposure, and critical watchlist count.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#E8E8E3] border border-gov-border"></span>
            <span>Standard Density</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-risk-critical"></span>
            <span>High Risk Cluster</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand"></span>
            <span>Selected</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Regional Schematic Map */}
        <div className="lg:col-span-8 flex items-center justify-center p-2 bg-gov-secondary/40 rounded-gov border border-gov-border min-h-[380px] relative overflow-hidden">
          <svg viewBox="0 0 500 520" className="w-full max-w-[460px] h-auto drop-shadow-sm select-none">
            {/* Outline background silhouette */}
            <path
              d="M170,50 L220,50 L240,110 L300,140 L340,170 L440,170 L450,220 L380,240 L360,320 L300,380 L260,490 L210,480 L180,380 L140,320 L130,240 L160,140 Z"
              fill="#F2F3EF"
              stroke="#D9D9D6"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />

            {/* State Regional Nodes */}
            {INDIAN_STATES.map((st) => {
              const isSelected = (selectedStateId === st.id);
              const isHovered = (hoveredState?.id === st.id);
              const isCriticalZone = st.critical >= 6;

              let fillColor = '#E8E8E3';
              if (isSelected) fillColor = '#C97919';
              else if (isHovered) fillColor = '#D9B16E';
              else if (filterRiskOnly && isCriticalZone) fillColor = '#B63A32';

              const radius = Math.max(14, Math.min(26, Math.sqrt(st.count) * 1.6));

              return (
                <g
                  key={st.id}
                  className="cursor-pointer transition-all duration-150"
                  onClick={() => onSelectState && onSelectState(st)}
                  onMouseEnter={() => setHoveredState(st)}
                  onMouseLeave={() => setHoveredState(null)}
                >
                  <circle
                    cx={st.x}
                    cy={st.y}
                    r={radius}
                    fill={fillColor}
                    stroke={isSelected ? '#A75F12' : '#B8B8B3'}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    opacity={isSelected || isHovered ? 1.0 : 0.9}
                  />
                  <text
                    x={st.x}
                    y={st.y + 4}
                    textAnchor="middle"
                    fill={isSelected ? '#FFFFFF' : '#252525'}
                    fontSize="10px"
                    fontWeight="600"
                    className="pointer-events-none font-mono"
                  >
                    {st.id}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredState && (
            <div className="absolute top-3 left-3 bg-gov-surface border border-gov-border shadow-gov-md rounded-gov-sm px-3 py-2 text-xs pointer-events-none z-10">
              <div className="font-semibold text-text-primary">{hoveredState.name}</div>
              <div className="text-text-secondary text-[11px]">
                {hoveredState.count} Projects · {hoveredState.critical} Critical · {hoveredState.capex}
              </div>
            </div>
          )}
        </div>

        {/* Selected State Summary Dossier */}
        <div className="lg:col-span-4 bg-gov-surface border border-gov-border rounded-gov p-4 shadow-gov space-y-4">
          <div className="pb-3 border-b border-gov-border">
            <div className="text-[11px] font-semibold tracking-wider text-text-muted uppercase mb-0.5">
              Regional Monitoring Dossier
            </div>
            <h4 className="text-base font-bold text-text-primary">
              {selectedState.name}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gov-secondary/60 p-2.5 rounded-gov-sm border border-gov-border/60">
              <div className="text-[10px] text-text-muted uppercase font-medium">Monitored Projects</div>
              <div className="text-lg font-bold text-text-primary">{selectedState.count}</div>
            </div>
            <div className="bg-gov-secondary/60 p-2.5 rounded-gov-sm border border-gov-border/60">
              <div className="text-[10px] text-text-muted uppercase font-medium">Critical Review</div>
              <div className="text-lg font-bold text-risk-critical">{selectedState.critical}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gov-border/50">
              <span className="text-text-secondary">Approved Capex:</span>
              <span className="font-semibold text-text-primary">{selectedState.capex}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gov-border/50">
              <span className="text-text-secondary">Primary Sectors:</span>
              <span className="font-medium text-text-primary">Highways, Railways, Power</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-secondary">Regional Risk Status:</span>
              <StatusBadge status={selectedState.critical >= 6 ? 'CRITICAL' : selectedState.critical >= 3 ? 'REVIEW' : 'NORMAL'} size="sm" />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onSelectState && onSelectState(selectedState)}
              className="w-full py-1.5 px-3 bg-gov-secondary text-text-primary text-xs font-semibold rounded-gov-sm border border-gov-border hover:bg-gov-border transition-colors text-center"
            >
              Filter Priority Queue by {selectedState.id}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
