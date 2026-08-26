import React, { useState, useEffect } from 'react';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { paimanaApi } from '../../services/api/paimanaApi';
import { Building2 } from 'lucide-react';

export default function MinistryAnalytics({ onNavigate }) {
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    paimanaApi.getProjects({ limit: 2000 })
      .then((res) => {
        const items = res?.items || (Array.isArray(res) ? res : []);
        const grouped = {};

        items.forEach(p => {
          const m = p.ministry || 'Ministry of Infrastructure';
          if (!grouped[m]) {
            grouped[m] = {
              ministry: m,
              project_count: 0,
              original_cost: 0,
              revised_cost: 0,
              critical_count: 0,
              total_progress: 0,
              total_delay: 0,
            };
          }
          grouped[m].project_count += 1;
          grouped[m].original_cost += (p.original_cost || 0);
          grouped[m].revised_cost += (p.revised_cost || p.original_cost || 0);
          grouped[m].total_progress += (p.physical_progress_pct || 0);
          grouped[m].total_delay += (p.delay_days || 0);
          if (p.risk_level === 'RED' || p.risk_level === 'CRITICAL') {
            grouped[m].critical_count += 1;
          }
        });

        const data = Object.values(grouped).map(g => ({
          ministry: g.ministry,
          project_count: g.project_count,
          total_capex: Math.round(g.original_cost),
          revised_cost: Math.round(g.revised_cost),
          cost_escalation_pct: g.original_cost > 0 ? Math.round(((g.revised_cost - g.original_cost) / g.original_cost) * 100) : 0,
          avg_delay_days: g.project_count > 0 ? Math.round(g.total_delay / g.project_count) : 0,
          avg_progress: g.project_count > 0 ? Math.round(g.total_progress / g.project_count) : 0,
          critical_count: g.critical_count,
          capex_at_risk: Math.round(g.critical_count > 0 ? g.revised_cost * (g.critical_count / g.project_count) : 0),
        })).sort((a, b) => b.revised_cost - a.revised_cost);

        setMinistries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load ministry analytics:', err);
        setError('Unable to load ministry portfolio metrics.');
        setLoading(false);
      });
  }, []);

  const columns = [
    {
      key: 'ministry',
      header: 'Ministry / Agency',
      render: (val) => (
        <span className="font-bold text-white text-xs">
          {val}
        </span>
      )
    },
    {
      key: 'project_count',
      header: 'Total Projects',
      align: 'center',
      render: (val) => (
        <span className="font-mono font-bold text-slate-200">
          {val}
        </span>
      )
    },
    {
      key: 'revised_cost',
      header: 'Revised Capex',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-white">
          ₹{Number(val).toLocaleString()} Cr
        </span>
      )
    },
    {
      key: 'cost_escalation_pct',
      header: 'Cost Escalation',
      align: 'right',
      render: (val) => (
        <span className={`font-mono font-bold text-xs ${val > 15 ? 'text-[#EF4444]' : val > 0 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
          {val > 0 ? `+${val}%` : `${val}%`}
        </span>
      )
    },
    {
      key: 'avg_progress',
      header: 'Avg Progress',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-[#00E5FF]">
          {val}%
        </span>
      )
    },
    {
      key: 'critical_count',
      header: 'Critical Flags',
      align: 'center',
      render: (val) => (
        <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${val > 0 ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40' : 'text-slate-400'}`}>
          {val}
        </span>
      )
    },
  ];

  if (loading) return <LoadingSkeleton rows={10} />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="p-6 space-y-5 bg-[#07131F] min-h-screen">
      <div className="flex items-center gap-2 pb-3 border-b border-[#16324A]">
        <Building2 className="w-5 h-5 text-[#F59E0B]" />
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight uppercase">
            Ministry Portfolio Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparative capital deployment, milestone performance, and risk concentration across central infrastructure ministries.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={ministries}
        exportFilename="paimana_ministries_analytics.csv"
        itemsPerPage={15}
        searchPlaceholder="Filter ministry..."
      />
    </div>
  );
}
