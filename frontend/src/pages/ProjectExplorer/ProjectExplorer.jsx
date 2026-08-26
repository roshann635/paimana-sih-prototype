import React, { useState, useEffect } from 'react';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { paimanaApi } from '../../services/api/paimanaApi';
import { Filter, Layers } from 'lucide-react';

export default function ProjectExplorer({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sectorFilter, setSectorFilter] = useState('ALL');

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 200 };
      if (sectorFilter !== 'ALL') params.sector = sectorFilter;

      const res = await paimanaApi.getProjects(params);
      if (res && res.items) {
        setProjects(res.items);
        setTotalCount(res.total || res.items.length);
      } else if (Array.isArray(res)) {
        setProjects(res);
        setTotalCount(res.length);
      }
    } catch (err) {
      console.error('Failed to load projects list:', err);
      setError('Unable to load project explorer directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [sectorFilter]);

  const columns = [
    {
      key: 'project_code',
      header: 'Project Code',
      render: (val, row) => (
        <span className="font-mono text-xs font-semibold text-text-primary">
          {val || row.project_id}
        </span>
      )
    },
    {
      key: 'project_name',
      header: 'Project Title',
      render: (val) => (
        <div className="font-semibold text-text-primary truncate max-w-sm">
          {val}
        </div>
      )
    },
    {
      key: 'ministry',
      header: 'Ministry & Sector',
      render: (val, row) => (
        <div className="text-xs">
          <div className="text-text-primary truncate max-w-[220px]">{val}</div>
          <div className="text-[11px] text-text-muted">{row.sector}</div>
        </div>
      )
    },
    {
      key: 'state',
      header: 'State',
      render: (val) => <span className="text-xs text-text-secondary">{val || 'Multi-State'}</span>
    },
    {
      key: 'original_cost',
      header: 'Original Cost',
      align: 'right',
      render: (val) => val ? `₹${Number(val).toLocaleString()} Cr` : '—'
    },
    {
      key: 'revised_cost',
      header: 'Revised Cost',
      align: 'right',
      render: (val) => val ? `₹${Number(val).toLocaleString()} Cr` : '—'
    },
    {
      key: 'physical_progress_pct',
      header: 'Progress',
      align: 'right',
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-text-primary">
          {val != null ? `${Number(val).toFixed(0)}%` : '—'}
        </span>
      )
    },
    {
      key: 'risk_level',
      header: 'Status',
      render: (val) => <StatusBadge level={val} size="sm" />
    }
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Central Infrastructure Project Explorer
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Searchable repository of all sanctioned central sector infrastructure projects (Cost ≥ ₹150 Crore).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-text-muted">
            Total Records: <strong className="text-text-primary">{totalCount.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={12} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadProjects} />
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          onRowClick={(row) => onSelectProject && onSelectProject(row.project_id)}
          title="Project Directory Matrix"
          subtitle="Click on any project row to inspect trajectory S-curves, TreeSHAP diagnosis, and EVM parameters."
          exportFilename="paimana_project_directory.csv"
          itemsPerPage={20}
        />
      )}
    </div>
  );
}
