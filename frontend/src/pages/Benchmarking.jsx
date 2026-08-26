import React, { useEffect, useState } from 'react';
import { Activity, Building2, TrendingUp, Clock, ShieldAlert, BarChart2 } from 'lucide-react';
import { fetchBenchmarks, fetchProjectDetail, fetchProjects } from '../services/api';

export const Benchmarking = ({ projectId, onSelectProject }) => {
  const [benchmarks, setBenchmarks] = useState([]);
  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [bmData, projData, listData] = await Promise.all([
          fetchBenchmarks(),
          fetchProjectDetail(projectId),
          fetchProjects({ limit: 100 }),
        ]);
        setBenchmarks(bmData);
        setProject(projData);
        setAllProjects(listData.items);
      } catch (err) {
        console.error('Error fetching benchmarks:', err);
      } finally {
        setLoading(false);
      }
    }
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3 text-slate-400">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Computing National Sector Peer Benchmarks...</p>
        </div>
      </div>
    );
  }

  const latestSnap = project.latest_snapshot;
  const latestPred = project.latest_prediction;

  // Find matching sector benchmark
  const peerBm = benchmarks.find((b) => b.sector === project.sector) || {
    median_cost_escalation_pct: 12.4,
    median_delay_months: 6.2,
    median_progress_velocity: 2.1,
    median_risk_score: 48.0,
    sample_size: 150,
  };

  const projCostEscPct = Number(
    (
      (((latestSnap?.revised_cost || project.original_cost) - project.original_cost) /
        Math.max(1, project.original_cost)) *
      100
    ).toFixed(1)
  );
  const projDelayM = Number(((latestSnap?.delay_days || 0) / 30.4).toFixed(1));
  const projRisk = Number(latestPred?.composite_risk_score || 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <span className="text-xs text-slate-400 uppercase font-semibold">Select Project to Benchmark:</span>
        <select
          value={projectId}
          onChange={(e) => onSelectProject(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
        >
          {allProjects.map((p) => (
            <option key={p.project_id} value={p.project_id}>
              {p.project_id} • {p.project_name.slice(0, 45)}... ({p.sector})
            </option>
          ))}
        </select>
      </div>

      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-md">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">
            Sector & Peer Portfolio Benchmarking
          </h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Comparing <strong className="text-white">{project.project_name}</strong> against{' '}
          <strong className="text-orange-400">{project.sector}</strong> peer baseline ({peerBm.sample_size} peer projects).
        </p>
      </div>

      {/* Metric Peer Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cost Escalation */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Cost Escalation %</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-white">{projCostEscPct}%</span>
              <span className="text-xs text-slate-400 block mt-0.5">Project</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-slate-400">{peerBm.median_cost_escalation_pct}%</span>
              <span className="text-xs text-slate-500 block mt-0.5">Sector Median</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px]">
            {projCostEscPct > peerBm.median_cost_escalation_pct ? (
              <span className="text-red-400 font-semibold">
                ▲ +{(projCostEscPct - peerBm.median_cost_escalation_pct).toFixed(1)}% higher than peers
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">
                ▼ Within normal peer sector bounds
              </span>
            )}
          </div>
        </div>

        {/* Schedule Delay Months */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Schedule Slippage</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-white">{projDelayM} mo</span>
              <span className="text-xs text-slate-400 block mt-0.5">Project</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-slate-400">{peerBm.median_delay_months} mo</span>
              <span className="text-xs text-slate-500 block mt-0.5">Sector Median</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px]">
            {projDelayM > peerBm.median_delay_months ? (
              <span className="text-red-400 font-semibold">
                ▲ +{(projDelayM - peerBm.median_delay_months).toFixed(1)} mo delayed vs peers
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">
                ▼ Ahead of / within peer median
              </span>
            )}
          </div>
        </div>

        {/* Progress Velocity */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Progress Velocity</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-white">
                {latestSnap?.physical_progress_pct ? (latestSnap.physical_progress_pct / 12).toFixed(1) : 1.2}%/mo
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">Project</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-slate-400">{peerBm.median_progress_velocity}%/mo</span>
              <span className="text-xs text-slate-500 block mt-0.5">Sector Median</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Monthly physical milestone rate
          </div>
        </div>

        {/* Risk Score */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Composite Risk</span>
            <ShieldAlert className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-red-400">{projRisk.toFixed(0)}</span>
              <span className="text-xs text-slate-400 block mt-0.5">Project</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-slate-400">{peerBm.median_risk_score.toFixed(0)}</span>
              <span className="text-xs text-slate-500 block mt-0.5">Sector Median</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px]">
            {projRisk > peerBm.median_risk_score ? (
              <span className="text-red-400 font-semibold">
                ▲ High Risk (+{(projRisk - peerBm.median_risk_score).toFixed(0)} pts vs peer median)
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">
                ▼ Within expected peer sector risk band
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Full Sector Benchmarks Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-orange-400" />
            <span>National Infrastructure Sector Baselines (22 Sectors)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Aggregated from ~2,000 projects</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right">Sample Size</th>
                <th className="py-3 px-4 text-right">Median Cost Escalation</th>
                <th className="py-3 px-4 text-right">Median Delay</th>
                <th className="py-3 px-4 text-right">Median Velocity</th>
                <th className="py-3 px-4 text-right">Median Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {benchmarks.map((bm) => {
                const isSelected = bm.sector === project.sector;
                return (
                  <tr
                    key={bm.sector}
                    className={`hover:bg-slate-800/40 transition ${
                      isSelected ? 'bg-orange-500/10 font-bold text-orange-300' : 'text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-4 font-sans font-medium flex items-center space-x-2">
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                      <span>{bm.sector}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">{bm.sample_size} projects</td>
                    <td className="py-3 px-4 text-right text-amber-400">+{bm.median_cost_escalation_pct}%</td>
                    <td className="py-3 px-4 text-right text-rose-400">{bm.median_delay_months} months</td>
                    <td className="py-3 px-4 text-right text-emerald-400">{bm.median_progress_velocity}%/mo</td>
                    <td className="py-3 px-4 text-right font-bold text-white">{bm.median_risk_score.toFixed(0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
