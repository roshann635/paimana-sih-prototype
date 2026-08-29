import React, { useState, useEffect, useMemo } from 'react';
import { EXACT_INDIA_OUTLINE_PATH, STATE_DATA } from './indiaPathData';
import { paimanaApi } from '../../services/api/paimanaApi';
import { Info, Plus, Minus, Maximize2 } from 'lucide-react';

export default function IndiaMap({ onSelectState, selectedStateId = 'MH' }) {
  const [activeTab, setActiveTab] = useState('Risk'); // 'Risk' | 'Density' | 'Exposure' | 'Projects'
  const [stateDbData, setStateDbData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStateCode, setSelectedStateCode] = useState(selectedStateId);
  const [hoveredStateCode, setHoveredStateCode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Load real state aggregations from MoSPI database
  useEffect(() => {
    paimanaApi.getStateAnalytics()
      .then((data) => {
        if (data && data.length > 0) {
          setStateDbData(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load state analytics from API:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Merge SVG coordinate geometry with actual database statistics
  const mergedStateData = useMemo(() => {
    const dbMap = new Map();
    stateDbData.forEach((st) => {
      dbMap.set(st.id, st);
      dbMap.set(st.name.toLowerCase(), st);
    });

    return STATE_DATA.map((geo) => {
      const dbRecord = dbMap.get(geo.id) || dbMap.get(geo.name.toLowerCase()) || {};
      return {
        ...geo,
        count: dbRecord.count ?? geo.count,
        capex: dbRecord.capex ?? geo.capex,
        capex_raw: dbRecord.capex_raw ?? 50000,
        avgProgress: dbRecord.avg_progress ?? geo.avgProgress,
        critical: dbRecord.critical ?? geo.critical,
        high_risk: dbRecord.high_risk ?? 1,
        avg_risk: dbRecord.avg_risk ?? 22.5,
        portfolio_health: dbRecord.portfolio_health ?? 72
      };
    });
  }, [stateDbData]);

  // Active state record
  const activeState = useMemo(() => {
    const targetCode = hoveredStateCode || selectedStateCode;
    return mergedStateData.find(s => s.id === targetCode) || mergedStateData.find(s => s.id === 'MH') || mergedStateData[0];
  }, [mergedStateData, selectedStateCode, hoveredStateCode]);

  // Color generator based on live dataset metrics
  const getStateColor = (st, isSelected) => {
    if (isSelected) return '#F59E0B';

    if (activeTab === 'Risk') {
      if (st.critical >= 3 || st.avg_risk >= 30) return '#EF4444'; // Critical Red
      if (st.high_risk >= 3 || st.avg_risk >= 24) return '#F97316'; // High Orange
      if (st.avg_risk >= 20 || st.count >= 50) return '#F59E0B';   // Moderate Yellow
      if (st.avg_risk >= 16) return '#10B981';                      // Low Green
      return '#00E5FF';                                             // Stable Cyan
    }

    if (activeTab === 'Density' || activeTab === 'Projects') {
      if (st.count >= 100) return '#EF4444';
      if (st.count >= 70) return '#F97316';
      if (st.count >= 40) return '#F59E0B';
      if (st.count >= 15) return '#10B981';
      return '#00E5FF';
    }

    if (activeTab === 'Exposure') {
      if (st.capex_raw >= 250000) return '#EF4444';
      if (st.capex_raw >= 150000) return '#F97316';
      if (st.capex_raw >= 75000) return '#F59E0B';
      if (st.capex_raw >= 25000) return '#10B981';
      return '#00E5FF';
    }

    return '#10B981';
  };

  return (
    <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-4 shadow-command-card flex flex-col justify-between relative overflow-hidden flex-1 h-full min-h-[480px]">
      {/* 1. Header with Toggles & Live Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#16324A]/70 z-10">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold uppercase text-[11px] text-slate-300 tracking-wider">
            Portfolio Geography
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] text-[9px] font-mono font-bold border border-[#00E5FF]/30">
            Live MoSPI Data
          </span>
        </div>

        {/* Toggle Pills */}
        <div className="flex items-center gap-1 bg-[#07131F] p-0.5 rounded-lg border border-[#16324A]">
          {['Risk', 'Density', 'Exposure', 'Projects'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all ${
                activeTab === tab
                  ? 'bg-[#F59E0B] text-[#07131F] shadow-gold-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SVG Map Area with Floating Dossier */}
      <div className="relative flex-1 flex items-center justify-center my-1 select-none overflow-hidden min-h-[340px]">
        {/* SVG India Map */}
        <div
          className="w-full flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 500 540"
            className="w-full max-w-[380px] max-h-[360px] drop-shadow-md"
          >
            {/* Main India Base Boundary */}
            <path
              d={EXACT_INDIA_OUTLINE_PATH}
              fill="#11263C"
              stroke="#1E4260"
              strokeWidth="2.2"
              className="transition-colors"
            />

            {/* Regional State Color Nodes */}
            {mergedStateData.map((st) => {
              const isSelected = selectedStateCode === st.id;
              const isHovered = hoveredStateCode === st.id;
              const fillColor = getStateColor(st, isSelected);

              return (
                <g
                  key={st.id}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedStateCode(st.id);
                    if (onSelectState) onSelectState(st);
                  }}
                  onMouseEnter={() => setHoveredStateCode(st.id)}
                  onMouseLeave={() => setHoveredStateCode(null)}
                >
                  {/* Selected Pulsing Outer Ring */}
                  {isSelected && (
                    <circle
                      cx={st.x}
                      cy={st.y}
                      r={17}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* State Node Marker */}
                  <circle
                    cx={st.x}
                    cy={st.y}
                    r={isSelected ? 14 : isHovered ? 13 : 10.5}
                    fill={fillColor}
                    stroke={isSelected ? '#FFFFFF' : '#07131F'}
                    strokeWidth={isSelected ? 2 : 1.2}
                    className="transition-all hover:scale-125"
                  />
                  <text
                    x={st.x}
                    y={st.y + 3.2}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="7.5px"
                    fontWeight="bold"
                    className="pointer-events-none font-mono tracking-tighter"
                  >
                    {st.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sleek Floating State Dossier Overlay (Visible on sm and up) */}
        <div className="hidden sm:block absolute right-1 top-1 w-48 lg:w-52 bg-[#07131F]/90 border border-[#16324A] rounded-lg p-2.5 shadow-2xl backdrop-blur-md z-10 space-y-1.5 text-xs pointer-events-auto">
          <div className="flex items-center justify-between pb-1 border-b border-[#16324A]">
            <span className="font-bold text-white text-xs truncate max-w-[130px]">
              {activeState?.name || 'Maharashtra'}
            </span>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#0E253A] text-[#F59E0B] border border-[#F59E0B]/30">
              {activeState?.id}
            </span>
          </div>

          <div className="text-[10px] font-mono text-slate-300 space-y-0.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Projects:</span>
              <strong className="text-white font-bold">{activeState?.count}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Capex Exposure:</span>
              <strong className="text-[#00E5FF]">{activeState?.capex}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mean Progress:</span>
              <strong className="text-white">{activeState?.avgProgress}%</strong>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono pt-1 border-t border-[#16324A]/70">
            <span className="text-slate-400">High Risk: <strong className="text-[#F97316]">{activeState?.high_risk}</strong></span>
            <span className="text-slate-400">Critical: <strong className="text-[#EF4444]">{activeState?.critical}</strong></span>
          </div>

          <div className="pt-1 border-t border-[#16324A] flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">Health:</span>
            <div className="flex items-center gap-1 text-white font-bold">
              <span>{activeState?.portfolio_health}</span>
              <span className="text-slate-500">/ 100</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] ml-0.5"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Compact Dossier (Rendered Below Map on Mobile) */}
      <div className="sm:hidden p-2.5 bg-[#07131F] border border-[#16324A] rounded-lg text-xs space-y-1 font-mono">
        <div className="flex items-center justify-between border-b border-[#16324A] pb-1">
          <span className="font-bold text-white text-xs">
            {activeState?.name || 'Maharashtra'} ({activeState?.id})
          </span>
          <span className="text-[#00E5FF] font-bold">{activeState?.capex}</span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-300 pt-0.5 text-center">
          <div>Projects: <strong className="text-white">{activeState?.count}</strong></div>
          <div>Avg Prog: <strong className="text-white">{activeState?.avgProgress}%</strong></div>
          <div>Health: <strong className="text-[#10B981]">{activeState?.portfolio_health}/100</strong></div>
        </div>
      </div>

      {/* 3. Bottom Legend & Map Zoom Controls Bar */}
      <div className="pt-2 border-t border-[#16324A]/70 flex items-center justify-between text-[9px] font-mono text-slate-400 z-10">
        {/* Dynamic Scale Legend */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
            <span>{activeTab === 'Risk' ? 'Low' : '<15'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>{activeTab === 'Risk' ? 'Mod' : '15-40'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span>{activeTab === 'Risk' ? 'Elev' : '40-70'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F97316]" />
            <span>{activeTab === 'Risk' ? 'High' : '70-100'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span>{activeTab === 'Risk' ? 'Crit' : '100+'}</span>
          </div>
        </div>

        {/* Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1 bg-[#07131F] rounded border border-[#16324A] p-0.5">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.4))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#11263C]"
            title="Zoom In"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.85))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#11263C]"
            title="Zoom Out"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#11263C]"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
