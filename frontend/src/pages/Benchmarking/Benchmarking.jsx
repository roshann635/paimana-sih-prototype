import React, { useState, useEffect } from 'react';
import DataTable from '../../components/tables/DataTable';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { paimanaApi } from '../../services/api/paimanaApi';
import { Scale, Activity, TrendingUp, DollarSign } from 'lucide-react';

export default function Benchmarking() {
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    paimanaApi.getBenchmarks()
      .then((data) => {
        setBenchmarks(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load sector benchmarks:', err);
        setError('Unable to load sector baselines.');
        setLoading(false);
      });
  }, []);

  const columns = [
    {
      key: 'sector',
      header: 'Sector',
      render: (val) => <div className="font-bold text-white text-xs">{val}</div>
    },
    {
      key: 'sample_size',
      header: 'Monitored Sample',
      align: 'right',
      render: (val) => <span className="font-mono text-xs text-slate-300 font-bold">{val} Projects</span>
    },
    {
      key: 'median_cost_escalation_pct',
      header: 'Median Cost Growth',
      align: 'right',
      render: (val) => (
        <span className={`font-mono text-xs font-bold ${Number(val || 0) > 10 ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
          {Number(val || 0).toFixed(1)}%
        </span>
      )
    },
    {
      key: 'median_delay_months',
      header: 'Median Slippage',
      align: 'right',
      render: (val) => (
        <span className="font-mono text-xs text-slate-300">
          {Number(val || 0).toFixed(1)} Months
        </span>
      )
    },
    {
      key: 'median_progress_velocity',
      header: 'Median Monthly Velocity',
      align: 'right',
      render: (val) => (
        <span className="font-mono text-xs font-bold text-[#00E5FF]">
          {Number(val || 0).toFixed(2)}% / mo
        </span>
      )
    },
    {
      key: 'median_risk_score',
      header: 'Median Risk Score',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-extrabold text-white text-xs">
          {Math.round(val || 40)}/100
        </span>
      )
    }
  ];

  if (loading) return <LoadingSkeleton rows={10} />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="p-6 space-y-5 bg-[#07131F] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-[#16324A]">
        <Scale className="w-5 h-5 text-[#F59E0B]" />
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight uppercase">
            Sector Peer Benchmarking & Baselines
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical baseline medians computed across peer central infrastructure groups to identify anomalous cost and schedule drift.
          </p>
        </div>
      </div>

      {/* Peer Comparison Framework Cards */}
      <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#16324A]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00E5FF]" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Peer Deviation Evaluation Standards
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">MoSPI Historical Baseline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#07131F] border border-[#16324A] rounded-lg space-y-1.5 shadow-xs">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Progress Velocity Deviation</span>
              <span className="text-[10px] font-mono text-[#00E5FF]">Milestones</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Compares a project's 3-month physical progress velocity against the sector median baseline. Negative deviations identify site-level stagnation.
            </p>
          </div>

          <div className="p-4 bg-[#07131F] border border-[#16324A] rounded-lg space-y-1.5 shadow-xs">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Capex Drawdown Disparity</span>
              <span className="text-[10px] font-mono text-[#F59E0B]">Expenditure</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Evaluates cumulative financial utilization against actual physical milestone completion relative to peer medians.
            </p>
          </div>

          <div className="p-4 bg-[#07131F] border border-[#16324A] rounded-lg space-y-1.5 shadow-xs">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Schedule Expansion Velocity</span>
              <span className="text-[10px] font-mono text-[#EF4444]">Delays</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Flags projects whose completion targets move further out faster than the historical sector median pace across multi-year cycles.
            </p>
          </div>
        </div>
      </div>

      {/* Benchmarks Table */}
      <DataTable
        columns={columns}
        data={benchmarks}
        exportFilename="paimana_sector_benchmarks.csv"
        itemsPerPage={15}
        searchPlaceholder="Filter sector benchmarks..."
      />
    </div>
  );
}
