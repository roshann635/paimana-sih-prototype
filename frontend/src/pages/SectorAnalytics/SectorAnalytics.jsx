import React, { useState, useEffect } from 'react';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { paimanaApi } from '../../services/api/paimanaApi';
import { Boxes, TrendingDown } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function SectorAnalytics() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    paimanaApi.getProjects({ limit: 1630 })
      .then((res) => {
        const items = res?.items || (Array.isArray(res) ? res : []);
        const grouped = {};

        items.forEach(p => {
          const s = p.sector || 'General Infrastructure';
          if (!grouped[s]) {
            grouped[s] = {
              sector: s,
              project_count: 0,
              original_cost: 0,
              revised_cost: 0,
              critical_count: 0,
              total_progress: 0,
              total_delay: 0,
            };
          }
          grouped[s].project_count += 1;
          grouped[s].original_cost += (p.original_cost || 0);
          grouped[s].revised_cost += (p.revised_cost || p.original_cost || 0);
          grouped[s].total_progress += (p.physical_progress_pct || 0);
          grouped[s].total_delay += (p.delay_days || 0);
          if (p.risk_level === 'RED' || p.risk_level === 'CRITICAL') {
            grouped[s].critical_count += 1;
          }
        });

        const data = Object.values(grouped).map(g => ({
          sector: g.sector,
          project_count: g.project_count,
          total_capex: Math.round(g.original_cost),
          revised_cost: Math.round(g.revised_cost),
          cost_escalation_pct: g.original_cost > 0 ? Math.round(((g.revised_cost - g.original_cost) / g.original_cost) * 100) : 0,
          avg_delay_days: g.project_count > 0 ? Math.round(g.total_delay / g.project_count) : 0,
          avg_progress: g.project_count > 0 ? Math.round(g.total_progress / g.project_count) : 0,
          critical_count: g.critical_count,
          capex_at_risk: Math.round(g.critical_count > 0 ? g.revised_cost * (g.critical_count / g.project_count) : 0),
        })).sort((a, b) => b.revised_cost - a.revised_cost);

        setSectors(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load sector analytics:', err);
        setError('Unable to load sector analytics.');
        setLoading(false);
      });
  }, []);

  const columns = [
    {
      key: 'sector',
      header: 'Infrastructure Sector',
      render: (val) => <div className="font-semibold text-text-primary text-xs truncate max-w-xs">{val}</div>
    },
    {
      key: 'project_count',
      header: 'Projects',
      align: 'right',
      render: (val) => <span className="font-mono text-xs font-semibold">{val}</span>
    },
    {
      key: 'revised_cost',
      header: 'Revised Capex',
      align: 'right',
      render: (val) => `₹${Number(val).toLocaleString()} Cr`
    },
    {
      key: 'cost_escalation_pct',
      header: 'Cost Escalation',
      align: 'right',
      render: (val) => (
        <span className={`font-mono text-xs font-semibold ${val > 15 ? 'text-risk-review' : 'text-text-primary'}`}>
          {val > 0 ? `+${val}%` : '0%'}
        </span>
      )
    },
    {
      key: 'avg_progress',
      header: 'Mean Progress',
      align: 'right',
      render: (val) => `${val}%`
    },
    {
      key: 'avg_delay_days',
      header: 'Mean Delay',
      align: 'right',
      render: (val) => `${val} d`
    },
    {
      key: 'critical_count',
      header: 'Critical Projects',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-risk-critical">{val}</span>
      )
    },
    {
      key: 'capex_at_risk',
      header: 'Capex at Risk',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-risk-review">
          ₹${Number(val).toLocaleString()} Cr
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-gov-border">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Sector Performance & Risk Distribution
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Macro sector-wise analysis across Highways, Railways, Petroleum, Power, Coal, Urban, and Ports.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton rows={10} />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <DataTable
          columns={columns}
          data={sectors}
          title="Sector Infrastructure Directory"
          subtitle="Aggregated metrics computed across all monitored projects per sector."
          exportFilename="paimana_sector_analytics.csv"
          itemsPerPage={15}
        />
      )}
    </div>
  );
}
