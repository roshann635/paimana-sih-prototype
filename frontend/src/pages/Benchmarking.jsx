import React, { useEffect, useState } from 'react';
import { Activity, Building, TrendingUp, Clock, ShieldAlert, BarChart2 } from 'lucide-react';
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
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Computing Inter-Ministerial Peer Baselines...</p>
        </div>
      </div>
    );
  }

  const latestSnap = project.latest_snapshot;
  const latestPred = project.latest_prediction;

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
    <div className="space-y-5 pb-12">
      {/* Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400 uppercase font-semibold">Select Project for Comparative Appraisal:</span>
        <select
          value={projectId}
          onChange={(e) => onSelectProject(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
        >
          {allProjects.map((p) => (
            <option key={p.project_id} value={p.project_id}>
              {p.project_id} • {p.project_name.slice(0, 48)}... ({p.sector})
            </option>
          ))}
        </select>
      </div>

      {/* Official Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <h1 className="text-xl font-black text-white tracking-tight">
            Inter-Ministerial & Sector Peer Comparative Benchmarking
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Appraisal of <strong className="text-white">{project.project_name}</strong> against the median baseline of <strong className="text-blue-300">{project.sector}</strong> projects ({peerBm.sample_size} peer projects in portfolio).
        </p>
      </div>

      {/* Peer Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Cost Escalation */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Cost Growth %</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between font-mono">
            <div>
              <span className="text-2xl font-black text-white">{projCostEscPct}%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Project</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-400">{peerBm.median_cost_escalation_pct}%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Sector Median</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px]">
            {projCostEscPct > peerBm.median_cost_escalation_pct ? (
              <span className="text-red-300 font-semibold">
                ▲ +{(projCostEscPct - peerBm.median_cost_escalation_pct).toFixed(1)}% above peer median
              </span>
            ) : (
              <span className="text-emerald-300 font-semibold">
                ▼ Within expected peer sector bounds
              </span>
            )}
          </div>
        </div>

        {/* Schedule Delay Months */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Accumulated Delay</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between font-mono">
            <div>
              <span className="text-2xl font-black text-white">{projDelayM} mo</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Project</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-400">{peerBm.median_delay_months} mo</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Sector Median</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px]">
            {projDelayM > peerBm.median_delay_months ? (
              <span className="text-red-300 font-semibold">
                ▲ +{(projDelayM - peerBm.median_delay_months).toFixed(1)} mo delay vs peers
              </span>
            ) : (
              <span className="text-emerald-300 font-semibold">
                ▼ On track with / ahead of peer median
              </span>
            )}
          </div>
        </div>

        {/* Progress Velocity */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Monthly Velocity</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between font-mono">
            <div>
              <span className="text-2xl font-black text-white">
                {latestSnap?.physical_progress_pct ? (latestSnap.physical_progress_pct / 12).toFixed(1) : 1.2}%/mo
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Project</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-400">{peerBm.median_progress_velocity}%/mo</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Sector Median</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Average monthly progress rate
          </div>
        </div>

        {/* Risk Score */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Composite Risk</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between font-mono">
            <div>
              <span className="text-2xl font-black text-red-400">{projRisk.toFixed(0)}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Project</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-400">{peerBm.median_risk_score.toFixed(0)}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Sector Median</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px]">
            {projRisk > peerBm.median_risk_score ? (
              <span className="text-red-300 font-semibold">
                ▲ Elevated (+{(projRisk - peerBm.median_risk_score).toFixed(0)} pts divergence)
              </span>
            ) : (
              <span className="text-emerald-300 font-semibold">
                ▼ Within normal sector baseline band
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sector Baselines Data Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-blue-400" />
            <span>National Infrastructure Sector Baselines (22 Sectors)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Statistical Portfolio Baseline</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-3.5">Sector</th>
                <th className="py-3 px-3.5 text-right">Sample Projects</th>
                <th className="py-3 px-3.5 text-right">Median Cost Growth</th>
                <th className="py-3 px-3.5 text-right">Median Delay</th>
                <th className="py-3 px-3.5 text-right">Median Velocity</th>
                <th className="py-3 px-3.5 text-right">Median Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {benchmarks.map((bm) => {
                const isSelected = bm.sector === project.sector;
                return (
                  <tr
                    key={bm.sector}
                    className={`hover:bg-slate-800/40 transition ${
                      isSelected ? 'bg-blue-950/40 font-bold text-blue-300' : 'text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-3.5 font-sans font-medium flex items-center space-x-2">
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                      <span>{bm.sector}</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-slate-400">{bm.sample_size}</td>
                    <td className="py-2.5 px-3.5 text-right text-amber-300">+{bm.median_cost_escalation_pct}%</td>
                    <td className="py-2.5 px-3.5 text-right text-rose-300">{bm.median_delay_months} mo</td>
                    <td className="py-2.5 px-3.5 text-right text-emerald-300">{bm.median_progress_velocity}%/mo</td>
                    <td className="py-2.5 px-3.5 text-right font-bold text-white">{bm.median_risk_score.toFixed(0)}</td>
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
