import React, { useState, useEffect } from 'react';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { paimanaApi } from '../../services/api/paimanaApi';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function PriorityQueue({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');

  const loadPriorityQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 250 };
      if (riskFilter !== 'ALL') params.risk_level = riskFilter;
      if (sectorFilter !== 'ALL') params.sector = sectorFilter;

      const data = await paimanaApi.getPriorityQueue(params);
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load priority queue:', err);
      setError('Unable to load intervention priority queue from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriorityQueue();
  }, [riskFilter, sectorFilter]);

  const columns = [
    {
      key: 'ipi_rank',
      header: 'IPI Rank',
      align: 'center',
      render: (val, row) => (
        <span className="font-mono font-bold text-[#F59E0B] text-xs px-2 py-0.5 rounded bg-[#F59E0B]/15 border border-[#F59E0B]/30">
          #{val || '—'}
        </span>
      )
    },
    {
      key: 'project_name',
      header: 'Project Name & Code',
      render: (val, row) => (
        <div className="max-w-xs">
          <div className="font-semibold text-white group-hover:text-[#00E5FF] transition-colors truncate">{val}</div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">{row.project_code || row.project_id}</div>
        </div>
      )
    },
    {
      key: 'ministry',
      header: 'Ministry & Sector',
      render: (val, row) => (
        <div className="text-xs">
          <div className="text-slate-200 truncate max-w-[200px]">{val}</div>
          <div className="text-[11px] font-mono text-slate-400">{row.sector}</div>
        </div>
      )
    },
    {
      key: 'revised_cost',
      header: 'Exposure (Capex)',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-white text-xs">
          {val ? `₹${Number(val).toLocaleString()} Cr` : '—'}
        </span>
      )
    },
    {
      key: 'composite_risk_score',
      header: 'Risk Score',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-extrabold text-[#EF4444] text-xs">
          {val != null ? `${Number(val).toFixed(1)}/100` : '—'}
        </span>
      )
    },
    {
      key: 'ipi_score',
      header: 'IPI Score',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-extrabold text-[#F59E0B] text-xs">
          {val != null ? Number(val).toFixed(1) : '—'}
        </span>
      )
    },
    {
      key: 'risk_level',
      header: 'Risk Tier',
      align: 'center',
      render: (val) => <StatusBadge level={val || 'CRITICAL'} size="sm" />
    }
  ];

  if (loading && projects.length === 0) return <LoadingSkeleton rows={10} />;
  if (error && projects.length === 0) return <ErrorState message={error} onRetry={loadPriorityQueue} />;

  return (
    <div className="p-6 space-y-5 bg-[#07131F] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#16324A]">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight uppercase">
              Intervention Priority Queue
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked decision-support index (IPI) prioritizing projects requiring immediate administrative intervention.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-[#0D1E30] border border-[#16324A] text-white text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#00E5FF]"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="RED">Critical (RED)</option>
            <option value="ORANGE">High Risk (ORANGE)</option>
            <option value="AMBER">Moderate (AMBER)</option>
            <option value="GREEN">Stable (GREEN)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={projects}
        onRowClick={(row) => onSelectProject && onSelectProject(row.project_id)}
        exportFilename="paimana_priority_queue.csv"
        itemsPerPage={15}
        searchPlaceholder="Filter priority queue..."
      />
    </div>
  );
}
