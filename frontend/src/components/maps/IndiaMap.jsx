import React, { useState, useMemo } from 'react';
import StatusBadge from '../common/StatusBadge';
import { EXACT_INDIA_OUTLINE_PATH, STATE_DATA } from './indiaPathData';
import { MapPin, Layers, AlertOctagon, ArrowRight, Activity, Filter } from 'lucide-react';

export default function IndiaMap({ onSelectState, selectedStateId = 'MH', filterRiskOnly = false }) {
  const [hoveredState, setHoveredState] = useState(null);
  const [activeStateId, setActiveStateId] = useState(selectedStateId);
  const [heatmapMode, setHeatmapMode] = useState('risk'); // 'risk' | 'density'

  const activeState = useMemo(() => {
    return STATE_DATA.find(s => s.id === activeStateId) || STATE_DATA[0];
  }, [activeStateId]);

  const handleStateClick = (state) => {
    setActiveStateId(state.id);
    if (onSelectState) onSelectState(state);
  };

  return (
    <div className="bg-gov-surface border border-gov-border rounded-gov p-6 shadow-gov">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-gov-border">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand" />
            <h3 className="text-base font-extrabold text-text-primary tracking-tight">
              National Infrastructure Geographic Observatory
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Geographic distribution of monitored infrastructure capex, regional execution velocity, and early warning risk clusters across India.
          </p>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#FAFBF8] p-1 rounded-gov-sm border border-gov-border">
            <button
              onClick={() => setHeatmapMode('risk')}
              className={`px-3 py-1 text-xs font-bold rounded-gov-sm transition-all ${
                heatmapMode === 'risk'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Risk Heatmap
            </button>
            <button
              onClick={() => setHeatmapMode('density')}
              className={`px-3 py-1 text-xs font-bold rounded-gov-sm transition-all ${
                heatmapMode === 'density'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Project Volume
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Exact SVG Map + State Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG India Map Container */}
        <div className="lg:col-span-7 bg-[#FAFBF8] border border-gov-border rounded-gov p-4 min-h-[500px] flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
          {/* Map Legend */}
          <div className="absolute top-3 left-3 bg-white/95 border border-gov-border shadow-gov rounded-gov-sm px-3.5 py-2.5 text-[11px] space-y-1.5 z-10">
            <div className="font-bold text-text-primary text-xs pb-1 border-b border-gov-border">
              {heatmapMode === 'risk' ? 'Risk Density Legend' : 'Project Count Legend'}
            </div>
            {heatmapMode === 'risk' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#A82420]"></span>
                  <span>Critical Cluster (≥6 Flags)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#B55214]"></span>
                  <span>Review Watch (3–5 Flags)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#2B6E44]"></span>
                  <span>Low Risk (&lt;3 Flags)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#C97919]"></span>
                  <span>100+ Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#D9822B]"></span>
                  <span>50–99 Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#737A82]"></span>
                  <span>&lt;50 Projects</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-2 pt-1 border-t border-gov-border">
              <span className="w-3 h-3 rounded-full bg-[#C97919] ring-2 ring-brand-border"></span>
              <span className="font-bold text-brand-dark">Selected State</span>
            </div>
          </div>

          {/* Exact India SVG Map */}
          <svg
            viewBox="0 0 500 550"
            className="w-full max-w-[450px] h-auto drop-shadow-sm select-none"
            aria-label="Official Map of India"
          >
            {/* National Outline Base with Exact Traced Vector Path from Uploaded Image */}
            <path
              d={EXACT_INDIA_OUTLINE_PATH}
              fill="#EBF0E6"
              stroke="#1C1F23"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="drop-shadow-xs"
            />

            {/* Inner subtle geographic fill contour */}
            <path
              d={EXACT_INDIA_OUTLINE_PATH}
              fill="#FAFBF8"
              opacity="0.3"
              stroke="none"
            />

            {/* Interactive State Regional Nodes Overlay */}
            {STATE_DATA.map((st) => {
              const isSelected = (activeStateId === st.id);
              const isHovered = (hoveredState?.id === st.id);

              let nodeColor = '#2B6E44'; // Green
              if (heatmapMode === 'risk') {
                if (st.critical >= 6) nodeColor = '#A82420'; // Red
                else if (st.critical >= 3) nodeColor = '#B55214'; // Orange
                else nodeColor = '#2B6E44';
              } else {
                if (st.count >= 100) nodeColor = '#C97919';
                else if (st.count >= 50) nodeColor = '#D9822B';
                else nodeColor = '#737A82';
              }

              if (isSelected) {
                nodeColor = '#C97919';
              }

              const radius = isSelected ? 18 : isHovered ? 17 : 14;

              return (
                <g
                  key={st.id}
                  className="cursor-pointer transition-transform duration-150"
                  onClick={() => handleStateClick(st)}
                  onMouseEnter={() => setHoveredState(st)}
                  onMouseLeave={() => setHoveredState(null)}
                >
                  {/* Selected Outer Pulse Ring */}
                  {isSelected && (
                    <circle
                      cx={st.x}
                      cy={st.y}
                      r={radius + 5}
                      fill="none"
                      stroke="#C97919"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={st.x}
                    cy={st.y}
                    r={radius}
                    fill={nodeColor}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="shadow-sm transition-all"
                  />

                  {/* State Abbreviation Code */}
                  <text
                    x={st.x}
                    y={st.y + 3.5}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="9px"
                    fontWeight="800"
                    className="pointer-events-none font-mono tracking-tight"
                  >
                    {st.id}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Floating Tooltip */}
          {hoveredState && (
            <div className="absolute bottom-3 right-3 bg-white border border-gov-border shadow-gov-md rounded-gov-sm px-4 py-3 text-xs pointer-events-none z-20 animate-in fade-in zoom-in-95 duration-100">
              <div className="font-extrabold text-text-primary flex items-center justify-between gap-3 pb-1.5 border-b border-gov-border">
                <span>{hoveredState.name}</span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-brand-light text-brand-dark rounded border border-brand-border">
                  {hoveredState.id}
                </span>
              </div>
              <div className="text-text-secondary text-[11px] mt-2 space-y-1">
                <div>Total Projects: <strong className="text-text-primary font-mono">{hoveredState.count}</strong></div>
                <div>Approved Capex: <strong className="text-text-primary font-mono">{hoveredState.capex}</strong></div>
                <div>Critical Flags: <strong className="text-risk-critical font-mono">{hoveredState.critical}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Selected State Dossier */}
        <div className="lg:col-span-5 bg-gov-surface border border-gov-border rounded-gov p-6 shadow-gov space-y-5">
          <div className="pb-3 border-b border-gov-border">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wider text-brand-dark uppercase">
                State Infrastructure Profile
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-brand-light text-brand-dark rounded border border-brand-border">
                State Code: {activeState.id}
              </span>
            </div>
            <h4 className="text-xl font-extrabold text-text-primary mt-1">
              {activeState.name}
            </h4>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-[#FAFBF8] p-3.5 rounded-gov-sm border border-gov-border shadow-xs">
              <div className="text-[11px] text-text-secondary uppercase font-bold">Total Monitored</div>
              <div className="text-2xl font-extrabold font-mono text-text-primary mt-0.5">{activeState.count}</div>
              <div className="text-[11px] text-text-muted mt-0.5">Central Sector Projects</div>
            </div>

            <div className="bg-red-50/60 p-3.5 rounded-gov-sm border border-[#F3BFBC] shadow-xs">
              <div className="text-[11px] text-risk-critical uppercase font-bold">Critical Review</div>
              <div className="text-2xl font-extrabold font-mono text-risk-critical mt-0.5">{activeState.critical}</div>
              <div className="text-[11px] text-risk-critical/80 mt-0.5">Immediate review flags</div>
            </div>

            <div className="bg-[#FAFBF8] p-3.5 rounded-gov-sm border border-gov-border shadow-xs">
              <div className="text-[11px] text-text-secondary uppercase font-bold">Approved Capex</div>
              <div className="text-base font-extrabold font-mono text-text-primary mt-1">{activeState.capex}</div>
            </div>

            <div className="bg-[#FAFBF8] p-3.5 rounded-gov-sm border border-gov-border shadow-xs">
              <div className="text-[11px] text-text-secondary uppercase font-bold">Mean Physical Progress</div>
              <div className="text-base font-extrabold font-mono text-text-primary mt-1">{activeState.avgProgress}%</div>
            </div>
          </div>

          {/* Sector Profile */}
          <div className="p-3.5 bg-gov-secondary/40 rounded-gov-sm border border-gov-border space-y-1 text-xs">
            <div className="font-bold text-text-primary">Dominant Infrastructure Sectors</div>
            <p className="text-text-secondary leading-relaxed">{activeState.sectors}</p>
          </div>

          {/* Regional Status Badge */}
          <div className="flex items-center justify-between p-3 bg-white rounded-gov-sm border border-gov-border text-xs shadow-xs">
            <span className="font-bold text-text-secondary">Composite Regional Risk:</span>
            <StatusBadge level={activeState.critical >= 6 ? 'CRITICAL' : activeState.critical >= 3 ? 'REVIEW' : 'NORMAL'} size="sm" />
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button
              onClick={() => onSelectState && onSelectState(activeState)}
              className="w-full py-2.5 px-4 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-gov-sm transition-colors text-center shadow-gov flex items-center justify-center gap-2"
            >
              <span>Explore Priority Projects in {activeState.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
