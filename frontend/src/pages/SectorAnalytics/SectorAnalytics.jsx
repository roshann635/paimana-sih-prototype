import React, { useState, useEffect } from 'react';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { paimanaApi } from '../../services/api/paimanaApi';
import { Boxes, PieChart } from 'lucide-react';

export default function SectorAnalytics() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    paimanaApi.getProjects({ limit: 2000 })
      .then((res) => {
        const items = res?.items || (Array.isArray(res) ? res : []);
        const grouped = {};

        items.forEach(p => {
          const s = p.sector || 'Transport & Logistics';
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
          if (p.risk_level === 'RED' || p.risk_level === 'ORANGE' || p.risk_level === 'CRITICAL' || (p.composite_risk_score && p.composite_risk_score >= 60)) {
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
      header: 'Sector',
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
      header: 'Mean Physical Progress*',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-[#00E5FF]">
          {val}%
        </span>
      )
    },
    {
      key: 'critical_count',
      header: 'High Risk / Critical Flags',
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-5 bg-[#07131F] min-h-screen">
      {/* Top Provenance Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 bg-[#0D1E30] border border-[#16324A] rounded-lg text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Classification Basis:</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-600/40">
            🏛️ DEA Harmonized Master List (6 Macro Sectors)
          </span>
          <span className="text-slate-500">•</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-[#00E5FF] border border-[#00E5FF]/40">
            ⚡ PARAKH Risk Analytics
          </span>
        </div>
        <div className="text-[10.5px] font-mono text-slate-400">
          Source: MoSPI July 2026 PAIMANA Sector Distribution (1,775 Ongoing Projects)
        </div>
      </div>

      <div className="flex items-center gap-2 pb-3 border-b border-[#16324A]">
        <Boxes className="w-5 h-5 text-[#00E5FF]" />
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight uppercase">
            Sector Performance & Risk Distribution
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            DEA Harmonized Master List sector analysis across Transport & Logistics, Energy, Water & Sanitation, Communication, Social & Commercial, and Others.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={sectors}
        exportFilename="parakh_sectors_analytics.csv"
        itemsPerPage={10}
        searchPlaceholder="Filter sector..."
      />

      {/* Methodology Note */}
      <div className="p-3 bg-[#0D1E30] border border-[#16324A] rounded-lg text-[11px] font-mono text-slate-400 space-y-1">
        <div><strong className="text-slate-300">* Note on Physical Progress Accounting:</strong> Mean reported physical progress is calculated as the project-level arithmetic average. Official MoSPI Flash Reports summarize progress by milestone distribution (e.g. ~38% of projects exceed 80% physical progress).</div>
        <div><strong className="text-slate-300">** High Risk / Critical Flags:</strong> Projects classified in RED/ORANGE risk tiers or exhibiting Composite Risk Score ≥ 60/100 under PARAKH predictive models.</div>
      </div>
    </div>
  );
}
