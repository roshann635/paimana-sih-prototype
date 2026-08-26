import React, { useState, useMemo } from 'react';
import StatusBadge from '../common/StatusBadge';
import { MapPin, Layers, AlertOctagon, TrendingUp, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

// Comprehensive Indian States & UTs dataset with realistic SVG paths
const STATE_DATA = [
  {
    id: 'MH',
    name: 'Maharashtra',
    count: 184,
    critical: 8,
    capex: '₹3,42,100 Cr',
    avgProgress: 52,
    sectors: 'Highways (48%), Railways (28%), Power (14%)',
    path: 'M 130,265 L 165,250 L 195,260 L 210,290 L 190,325 L 155,335 L 135,315 L 120,285 Z'
  },
  {
    id: 'UP',
    name: 'Uttar Pradesh',
    count: 215,
    critical: 11,
    capex: '₹4,18,600 Cr',
    avgProgress: 48,
    sectors: 'Railways (42%), Highways (38%), Urban (12%)',
    path: 'M 175,150 L 225,145 L 260,175 L 250,205 L 205,210 L 170,185 L 160,165 Z'
  },
  {
    id: 'GJ',
    name: 'Gujarat',
    count: 142,
    critical: 4,
    capex: '₹2,84,500 Cr',
    avgProgress: 64,
    sectors: 'Petroleum (40%), Ports (32%), Highways (20%)',
    path: 'M 80,210 L 125,200 L 140,235 L 120,265 L 90,260 L 70,240 L 75,220 Z'
  },
  {
    id: 'RJ',
    name: 'Rajasthan',
    count: 128,
    critical: 5,
    capex: '₹1,95,400 Cr',
    avgProgress: 58,
    sectors: 'Power (45%), Highways (35%), Mines (12%)',
    path: 'M 105,145 L 150,130 L 175,160 L 155,205 L 120,205 L 95,175 Z'
  },
  {
    id: 'MP',
    name: 'Madhya Pradesh',
    count: 136,
    critical: 6,
    capex: '₹2,12,000 Cr',
    avgProgress: 51,
    sectors: 'Highways (44%), Railways (32%), Water (16%)',
    path: 'M 155,205 L 210,210 L 235,230 L 215,265 L 165,255 L 145,235 Z'
  },
  {
    id: 'TN',
    name: 'Tamil Nadu',
    count: 112,
    critical: 3,
    capex: '₹1,88,900 Cr',
    avgProgress: 62,
    sectors: 'Highways (36%), Railways (30%), Atomic Energy (22%)',
    path: 'M 175,390 L 205,395 L 210,445 L 195,475 L 170,455 L 165,415 Z'
  },
  {
    id: 'KA',
    name: 'Karnataka',
    count: 98,
    critical: 4,
    capex: '₹1,64,300 Cr',
    avgProgress: 57,
    sectors: 'Railways (38%), Highways (34%), Urban (18%)',
    path: 'M 140,325 L 170,325 L 180,380 L 155,415 L 135,385 L 130,350 Z'
  },
  {
    id: 'AP',
    name: 'Andhra Pradesh',
    count: 94,
    critical: 5,
    capex: '₹1,52,700 Cr',
    avgProgress: 49,
    sectors: 'Ports (35%), Highways (32%), Petroleum (24%)',
    path: 'M 180,315 L 225,310 L 245,345 L 215,395 L 185,385 L 175,345 Z'
  },
  {
    id: 'WB',
    name: 'West Bengal',
    count: 104,
    critical: 6,
    capex: '₹1,92,400 Cr',
    avgProgress: 45,
    sectors: 'Railways (48%), Coal (28%), Highways (18%)',
    path: 'M 285,200 L 310,195 L 315,245 L 290,265 L 275,235 L 280,215 Z'
  },
  {
    id: 'OD',
    name: 'Odisha',
    count: 88,
    critical: 4,
    capex: '₹1,44,800 Cr',
    avgProgress: 56,
    sectors: 'Steel & Mines (42%), Railways (34%), Ports (18%)',
    path: 'M 235,245 L 275,240 L 285,280 L 255,305 L 225,285 Z'
  },
  {
    id: 'BR',
    name: 'Bihar',
    count: 116,
    critical: 7,
    capex: '₹1,78,200 Cr',
    avgProgress: 42,
    sectors: 'Highways (46%), Railways (38%), Power (12%)',
    path: 'M 255,170 L 295,165 L 305,195 L 275,215 L 250,205 Z'
  },
  {
    id: 'JH',
    name: 'Jharkhand',
    count: 74,
    critical: 3,
    capex: '₹1,15,600 Cr',
    avgProgress: 53,
    sectors: 'Coal (52%), Railways (32%), Steel (12%)',
    path: 'M 250,210 L 285,210 L 285,245 L 255,245 L 245,225 Z'
  },
  {
    id: 'TG',
    name: 'Telangana',
    count: 68,
    critical: 2,
    capex: '₹1,08,200 Cr',
    avgProgress: 61,
    sectors: 'Railways (40%), Highways (35%), Power (18%)',
    path: 'M 175,290 L 215,285 L 220,325 L 185,335 L 170,310 Z'
  },
  {
    id: 'KL',
    name: 'Kerala',
    count: 42,
    critical: 1,
    capex: '₹72,400 Cr',
    avgProgress: 66,
    sectors: 'Highways (45%), Ports (35%), Railways (15%)',
    path: 'M 145,415 L 165,415 L 175,465 L 160,480 L 140,445 Z'
  },
  {
    id: 'AS',
    name: 'Assam & North East',
    count: 64,
    critical: 4,
    capex: '₹94,800 Cr',
    avgProgress: 44,
    sectors: 'Highways (55%), Railways (28%), Petroleum (14%)',
    path: 'M 325,160 L 375,145 L 410,165 L 390,205 L 335,195 L 315,175 Z'
  },
  {
    id: 'PB',
    name: 'Punjab & Haryana',
    count: 82,
    critical: 2,
    capex: '₹1,24,000 Cr',
    avgProgress: 68,
    sectors: 'Highways (52%), Railways (32%), Power (12%)',
    path: 'M 135,100 L 165,95 L 175,135 L 145,145 L 125,120 Z'
  },
  {
    id: 'JK',
    name: 'J&K / Ladakh',
    count: 48,
    critical: 3,
    capex: '₹86,500 Cr',
    avgProgress: 46,
    sectors: 'Highways (60%), Railways (32%), Hydro Power (8%)',
    path: 'M 125,45 L 165,30 L 195,65 L 165,100 L 130,90 L 115,65 Z'
  },
  {
    id: 'HP',
    name: 'Himachal & Uttarakhand',
    count: 52,
    critical: 3,
    capex: '₹76,800 Cr',
    avgProgress: 49,
    sectors: 'Highways (54%), Hydro Power (34%), Railways (10%)',
    path: 'M 165,85 L 205,75 L 220,120 L 180,135 L 160,110 Z'
  },
  {
    id: 'CG',
    name: 'Chhattisgarh',
    count: 56,
    critical: 2,
    capex: '₹88,200 Cr',
    avgProgress: 55,
    sectors: 'Railways (48%), Coal (34%), Power (14%)',
    path: 'M 215,235 L 245,230 L 250,285 L 225,295 L 210,265 Z'
  }
];

export default function IndiaMap({ onSelectState, selectedStateId = 'MH', filterRiskOnly = false }) {
  const [hoveredState, setHoveredState] = useState(null);
  const [activeStateId, setActiveStateId] = useState(selectedStateId);
  const [viewMode, setViewMode] = useState('density'); // 'density' | 'risk_clusters'

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
            <MapPin className="w-4 h-4 text-brand" />
            <h3 className="text-base font-bold text-text-primary">
              National Infrastructure Geographic Observatory
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Interactive state-wise infrastructure project concentration, capex deployment, and regional risk monitoring.
          </p>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gov-secondary p-1 rounded-gov-sm border border-gov-border">
            <button
              onClick={() => setViewMode('density')}
              className={`px-3 py-1 text-xs font-semibold rounded-gov-sm transition-colors ${
                viewMode === 'density'
                  ? 'bg-white text-text-primary shadow-gov'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Project Concentration
            </button>
            <button
              onClick={() => setViewMode('risk_clusters')}
              className={`px-3 py-1 text-xs font-semibold rounded-gov-sm transition-colors ${
                viewMode === 'risk_clusters'
                  ? 'bg-white text-text-primary shadow-gov'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Risk Heatmap
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG India Map Container */}
        <div className="lg:col-span-7 bg-[#FAFBF8] border border-gov-border rounded-gov p-4 min-h-[460px] flex flex-col items-center justify-center relative shadow-inner">
          {/* Map Legend */}
          <div className="absolute top-3 left-3 bg-white/95 border border-gov-border shadow-gov rounded-gov-sm px-3 py-2 text-[11px] space-y-1.5 z-10">
            <div className="font-semibold text-text-primary text-xs pb-1 border-b border-gov-border">Map Legend</div>
            {viewMode === 'density' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#D3DDD4] border border-[#BAC7BB]"></span>
                  <span>100+ Projects (High)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#E3E7DE] border border-[#CBD2C4]"></span>
                  <span>50–99 Projects (Medium)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#ECEFE8] border border-[#D5DAD0]"></span>
                  <span>&lt;50 Projects (Standard)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#A82420]"></span>
                  <span>Critical Cluster (≥6 Flags)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#B55214]"></span>
                  <span>Review Watch (3–5 Flags)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#2B6E44]"></span>
                  <span>Low Risk (&lt;3 Flags)</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-2 pt-1 border-t border-gov-border">
              <span className="w-3 h-3 rounded-sm bg-[#C97919] border border-[#964F0A]"></span>
              <span className="font-semibold text-brand-dark">Selected State</span>
            </div>
          </div>

          {/* SVG Map of India */}
          <svg
            viewBox="0 0 450 510"
            className="w-full max-w-[420px] h-auto drop-shadow-sm select-none"
            aria-label="Interactive Map of India"
          >
            {/* National Silhouette Outer Boundary */}
            <path
              d="M 120,40 L 170,25 L 205,65 L 180,125 L 225,120 L 265,160 L 320,150 L 385,135 L 420,165 L 395,215 L 340,205 L 305,255 L 265,305 L 225,395 L 195,485 L 165,490 L 140,435 L 125,345 L 85,270 L 65,230 L 95,165 L 115,115 Z"
              fill="#ECEFE8"
              stroke="#D3D6CE"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Individual State Boundaries */}
            {STATE_DATA.map((st) => {
              const isSelected = (activeStateId === st.id);
              const isHovered = (hoveredState?.id === st.id);

              let fillColor = '#E3E7DE';
              if (viewMode === 'density') {
                if (st.count >= 100) fillColor = '#D3DDD4';
                else if (st.count >= 50) fillColor = '#E3E7DE';
                else fillColor = '#ECEFE8';
              } else {
                if (st.critical >= 6) fillColor = '#F7E2E0';
                else if (st.critical >= 3) fillColor = '#FEF3EB';
                else fillColor = '#EDF7F1';
              }

              if (isSelected) {
                fillColor = '#FBF2E3';
              } else if (isHovered) {
                fillColor = '#F7E8D1';
              }

              let strokeColor = isSelected ? '#C97919' : isHovered ? '#A75F12' : '#B8BDB0';
              let strokeWidth = isSelected ? '2.5' : isHovered ? '2' : '1.2';

              return (
                <g
                  key={st.id}
                  className="cursor-pointer transition-all duration-150"
                  onClick={() => handleStateClick(st)}
                  onMouseEnter={() => setHoveredState(st)}
                  onMouseLeave={() => setHoveredState(null)}
                >
                  <path
                    d={st.path}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className="transition-colors"
                  />
                  {/* State Abbreviation Marker */}
                  <text
                    x={pathCentroid(st.path).x}
                    y={pathCentroid(st.path).y + 3}
                    textAnchor="middle"
                    fill={isSelected ? '#964F0A' : '#252525'}
                    fontSize="10px"
                    fontWeight={isSelected ? 'bold' : '600'}
                    className="pointer-events-none font-mono"
                  >
                    {st.id}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Floating Tooltip */}
          {hoveredState && (
            <div className="absolute bottom-3 right-3 bg-white border border-gov-border shadow-gov-md rounded-gov-sm px-3.5 py-2.5 text-xs pointer-events-none z-20">
              <div className="font-bold text-text-primary flex items-center justify-between gap-2">
                <span>{hoveredState.name}</span>
                <span className="font-mono text-[10px] text-text-muted">({hoveredState.id})</span>
              </div>
              <div className="text-text-secondary text-[11px] mt-1 space-y-0.5">
                <div>Projects: <strong className="text-text-primary font-mono">{hoveredState.count}</strong></div>
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
              <span className="text-[11px] font-bold tracking-wider text-brand-dark uppercase">
                State Infrastructure Profile
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-brand-light text-brand-dark rounded border border-brand/30">
                Code: {activeState.id}
              </span>
            </div>
            <h4 className="text-xl font-bold text-text-primary mt-1">
              {activeState.name}
            </h4>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-[#FAFBF8] p-3.5 rounded-gov-sm border border-gov-border">
              <div className="text-[11px] text-text-secondary uppercase font-semibold">Total Monitored</div>
              <div className="text-2xl font-bold font-mono text-text-primary mt-0.5">{activeState.count}</div>
              <div className="text-[11px] text-text-muted mt-0.5">Central Sector Projects</div>
            </div>

            <div className="bg-red-50/60 p-3.5 rounded-gov-sm border border-[#F3BFBC]">
              <div className="text-[11px] text-risk-critical uppercase font-semibold">Critical Review</div>
              <div className="text-2xl font-bold font-mono text-risk-critical mt-0.5">{activeState.critical}</div>
              <div className="text-[11px] text-risk-critical/80 mt-0.5">Immediate review flags</div>
            </div>

            <div className="bg-[#FAFBF8] p-3.5 rounded-gov-sm border border-gov-border">
              <div className="text-[11px] text-text-secondary uppercase font-semibold">Approved Capex</div>
              <div className="text-base font-bold font-mono text-text-primary mt-1">{activeState.capex}</div>
            </div>

            <div className="bg-[#FAFBF8] p-3.5 rounded-gov-sm border border-gov-border">
              <div className="text-[11px] text-text-secondary uppercase font-semibold">Mean Physical Progress</div>
              <div className="text-base font-bold font-mono text-text-primary mt-1">{activeState.avgProgress}%</div>
            </div>
          </div>

          {/* Sector Profile */}
          <div className="p-3.5 bg-gov-secondary/40 rounded-gov-sm border border-gov-border space-y-1 text-xs">
            <div className="font-semibold text-text-primary">Dominant Infrastructure Sectors</div>
            <p className="text-text-secondary leading-relaxed">{activeState.sectors}</p>
          </div>

          {/* Regional Status Badge */}
          <div className="flex items-center justify-between p-3 bg-white rounded-gov-sm border border-gov-border text-xs">
            <span className="font-semibold text-text-secondary">Composite Risk Tier:</span>
            <StatusBadge level={activeState.critical >= 6 ? 'CRITICAL' : activeState.critical >= 3 ? 'REVIEW' : 'NORMAL'} size="sm" />
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button
              onClick={() => onSelectState && onSelectState(activeState)}
              className="w-full py-2.5 px-4 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-gov-sm transition-colors text-center shadow-gov flex items-center justify-center gap-1.5"
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

// Utility to find visual center of simple polygonal SVG path
function pathCentroid(pathString) {
  const coords = pathString.match(/(\d+),(\d+)/g) || [];
  if (coords.length === 0) return { x: 200, y: 200 };
  let sumX = 0, sumY = 0;
  coords.forEach(c => {
    const [x, y] = c.split(',').map(Number);
    sumX += x;
    sumY += y;
  });
  return {
    x: Math.round(sumX / coords.length),
    y: Math.round(sumY / coords.length)
  };
}
