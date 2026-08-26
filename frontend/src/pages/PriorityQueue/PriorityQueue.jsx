import React, { useState, useEffect } from 'react';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import TrendBadge from '../../components/common/TrendBadge';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { paimanaApi } from '../../services/api/paimanaApi';
import { Filter, AlertTriangle, ShieldAlert } from 'lucide-react';

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
      const params = { limit: 150 };
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
        <span className="font-mono font-bold text-text-primary text-xs w-6 h-6 rounded-full bg-gov-secondary inline-flex items-center justify-center border border-gov-border">
          #{val || '—'}
        </span>
      )
    },
    {
      key: 'project_name',
      header: 'Project Name & Code',
      render: (val, row) => (
        <div className="max-w-xs">
          <div className="font-bold text-text-primary group-hover:text-brand-dark transition-colors truncate">{val}</div>
          <div className="text-[11px] font-mono text-text-muted mt-0.5">{row.project_code || row.project_id}</div>
        </div>
      )
    },
    {
      key: 'ministry',
      header: 'Ministry & Sector',
      render: (val, row) => (
        <div className="max-w-xs">
          <div className="text-text-primary font-medium truncate text-xs">{val}</div>
          <div className="text-[11px] text-text-secondary mt-0.5">{row.sector}</div>
        </div>
      )
    },
    {
      key: 'state',
      header: 'State',
      render: (val) => <span className="text-xs text-text-secondary font-medium">{val || 'Multi-State'}</span>
    },
    {
      key: 'revised_cost',
      header: 'Revised Cost',
      align: 'right',
      render: (val) => val ? `₹${Number(val).toLocaleString()} Cr` : '—'
    },
    {
      key: 'delay_days',
      header: 'Delay',
      align: 'right',
      render: (val) => val ? `${val} d` : '0 d'
    },
    {
      key: 'composite_risk_score',
      header: 'Risk Score',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-risk-critical text-sm">
          {Math.round(val || 0)}/100
        </span>
      )
    },
    {
      key: 'ipi_score',
      header: 'IPI Priority',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#FBF2E3] text-[#964F0A] border border-[#E8C89C] shadow-xs">
          {val ? Number(val).toFixed(1) : '—'}
        </span>
      )
    },
    {
      key: 'risk_level',
      header: 'Monitoring Status',
      render: (val) => <StatusBadge level={val} size="sm" />
    },
    {
      key: 'trend_direction',
      header: 'Trajectory',
      render: (val) => <TrendBadge direction={val} />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand" />
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Intervention Priority Queue
            </h1>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Ranked decision-support index (IPI) prioritising projects requiring immediate administrative intervention.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gov-surface border border-gov-border rounded-gov-sm px-3.5 py-1.5 text-xs text-text-secondary shadow-gov">
            <Filter className="w-3.5 h-3.5 text-text-secondary" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-transparent text-xs text-text-primary font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="RED">Critical Review (RED)</option>
              <option value="ORANGE">High Risk (ORANGE)</option>
              <option value="AMBER">Watch (AMBER)</option>
              <option value="GREEN">On Track (GREEN)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={10} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadPriorityQueue} />
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          onRowClick={(row) => onSelectProject && onSelectProject(row.project_id)}
          title="Ranked Intervention Priority Matrix"
          subtitle={`Showing ${projects.length} evaluated central infrastructure projects sorted by IPI score.`}
          exportFilename="paimana_intervention_priority_queue.csv"
          itemsPerPage={15}
        />
      )}
    </div>
  );
}
