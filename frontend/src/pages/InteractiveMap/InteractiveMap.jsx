import React, { useState } from 'react';
import IndiaMap from '../../components/maps/IndiaMap';

export default function InteractiveMap({ onSelectProject }) {
  const [selectedState, setSelectedState] = useState({ id: 'MH', name: 'Maharashtra', count: 184, critical: 8, capex: '₹3,42,100 Cr' });
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            National Infrastructure Map
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Geographic visualization of infrastructure capital deployment, project concentration, and regional risk clusters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer bg-gov-surface border border-gov-border px-3.5 py-1.5 rounded-gov-sm shadow-gov">
            <input
              type="checkbox"
              checked={filterRiskOnly}
              onChange={(e) => setFilterRiskOnly(e.target.checked)}
              className="rounded text-brand focus:ring-0"
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
