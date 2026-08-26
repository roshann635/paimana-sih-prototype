import React, { useState } from 'react';
import IndiaMap from '../../components/maps/IndiaMap';
import { MapPin } from 'lucide-react';

export default function InteractiveMap({ onSelectProject }) {
  const [selectedState, setSelectedState] = useState({ id: 'MH', name: 'Maharashtra', count: 147, critical: 1, capex: '₹6,07,703 Cr' });
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);

  return (
    <div className="p-6 space-y-5 bg-[#07131F] min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#16324A]">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00E5FF]" />
            <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight uppercase">
              National Infrastructure Spatial Observatory
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic visualization of infrastructure capital deployment, project concentration, and regional risk clusters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-300 cursor-pointer bg-[#0D1E30] border border-[#16324A] px-3.5 py-1.5 rounded-lg shadow-xs">
            <input
              type="checkbox"
              checked={filterRiskOnly}
              onChange={(e) => setFilterRiskOnly(e.target.checked)}
              className="rounded text-[#00E5FF] focus:ring-0"
            />
            <span>Highlight High-Risk Regional Clusters</span>
          </label>
        </div>
      </div>

      <IndiaMap
        selectedStateId={selectedState.id}
        onSelectState={(st) => setSelectedState(st)}
        filterRiskOnly={filterRiskOnly}
      />
    </div>
  );
}
