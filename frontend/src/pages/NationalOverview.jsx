import React, { useEffect, useState } from 'react';
import { 
  Building2, TrendingUp, AlertTriangle, IndianRupee, ShieldAlert,
  Flame, Activity, ArrowRight, ArrowUpRight
} from 'lucide-react';
import { fetchDashboardSummary, fetchAlerts } from '../services/api';
import { RAGBBadge } from '../components/RAGBBadge';

export const NationalOverview = ({
  onSelectProject,
  onNavigateTab,
}) => {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumData, alertData] = await Promise.all([
          fetchDashboardSummary(),
          fetchAlerts('CRITICAL', 6),
        ]);
        setSummary(sumData);
        setAlerts(alertData);
      } catch (err) {
        console.error('Error loading dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3 text-slate-400">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Aggregating National Infrastructure Portfolio...</p>
        </div>
      </div>
    );
  }

  const escalationPct = (
    (summary.total_cost_escalation_cr / Math.max(1, summary.total_original_cost_cr)) *
    100
  ).toFixed(1);

  const expUtilization = (
    (summary.total_expenditure_cr / Math.max(1, summary.total_revised_cost_cr)) *
    100
  ).toFixed(1);

  const redCount = summary.risk_counts?.RED || 0;
  const orangeCount = summary.risk_counts?.ORANGE || 0;
  const amberCount = summary.risk_counts?.AMBER || 0;
  const greenCount = summary.risk_counts?.GREEN || 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Portfolio Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              National Infrastructure Portfolio Overview
            </h1>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Live Monitoring: April 2026
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time trajectory tracking, early warning anomalies, and predictive risk scoring across 17+ Union Ministries.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('priority-queue')}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition text-sm"
        >
          <Flame className="w-4 h-4 text-slate-950" />
          <span>Open Priority Intervention Queue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* High-Impact Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Projects */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Projects</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{summary.total_projects.toLocaleString()}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">17 Ministries • 22 Sectors</p>
        </div>

        {/* Card 2: Revised Capex */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revised Capex</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">
              ₹{(summary.total_revised_cost_cr / 100000).toFixed(2)}L Cr
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Orig: ₹{(summary.total_original_cost_cr / 100000).toFixed(2)}L Cr
          </p>
        </div>

        {/* Card 3: Net Cost Overrun */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cost Escalation</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-400">
              +₹{(summary.total_cost_escalation_cr / 1000).toFixed(1)}k Cr
            </span>
          </div>
          <p className="text-xs text-amber-400/80 mt-1">+{escalationPct}% portfolio overrun</p>
        </div>

        {/* Card 4: Expenditure Utilization */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Expenditure</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">
              ₹{(summary.total_expenditure_cr / 100000).toFixed(2)}L Cr
            </span>
          </div>
          <p className="text-xs text-purple-300 mt-1">{expUtilization}% budget utilized</p>
        </div>

        {/* Card 5: Critical & High Risk */}
        <div className="bg-slate-900/80 border border-red-500/30 p-5 rounded-2xl shadow-sm bg-red-950/10">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Risk (RED)</span>
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-red-400">{redCount}</span>
            <span className="text-xs text-slate-400">({((redCount / summary.total_projects) * 100).toFixed(1)}%)</span>
          </div>
          <p className="text-xs text-orange-400 mt-1">+{orangeCount} High Risk (Orange)</p>
        </div>

        {/* Card 6: Deteriorating Trajectories */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Rapid Deterioration</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-400">{summary.deteriorating_count}</span>
          </div>
          <p className="text-xs text-rose-300 mt-1">Worsening in last quarter</p>
        </div>
      </div>

      {/* Risk Distribution Tier Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RAGB Portfolio Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-orange-400" />
            <span>Portfolio Risk Tier Distribution</span>
          </h2>

          <div className="space-y-4">
            {/* Red Tier */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-red-400 font-bold flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>RED Tier (Critical Risk: 75–100)</span>
                </span>
                <span className="text-slate-300 font-mono">
                  {redCount} ({((redCount / summary.total_projects) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-red-500 h-2.5 rounded-full"
                  style={{ width: `${(redCount / summary.total_projects) * 100}%` }}
                />
              </div>
            </div>

            {/* Orange Tier */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-orange-400 font-bold flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span>ORANGE Tier (High Risk: 50–74)</span>
                </span>
                <span className="text-slate-300 font-mono">
                  {orangeCount} ({((orangeCount / summary.total_projects) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-orange-500 h-2.5 rounded-full"
                  style={{ width: `${(orangeCount / summary.total_projects) * 100}%` }}
                />
              </div>
            </div>

            {/* Amber Tier */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-amber-400 font-bold flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>AMBER Tier (Moderate Risk: 25–49)</span>
                </span>
                <span className="text-slate-300 font-mono">
                  {amberCount} ({((amberCount / summary.total_projects) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full"
                  style={{ width: `${(amberCount / summary.total_projects) * 100}%` }}
                />
              </div>
            </div>

            {/* Green Tier */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>GREEN Tier (Healthy: 0–24)</span>
                </span>
                <span className="text-slate-300 font-mono">
                  {greenCount} ({((greenCount / summary.total_projects) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full"
                  style={{ width: `${(greenCount / summary.total_projects) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-400 leading-relaxed">
            💡 <strong className="text-slate-300">Composite Risk Model:</strong> Combines XGBoost Cost Overrun probability (35%), Time Overrun probability (35%), Trajectory Deterioration (20%), and Milestone Urgency (10%).
          </div>
        </div>

        {/* Top Sectors with Capex at Risk */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span>Sectors with Highest Capital at Risk</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Ranked by Critical (RED) Projects</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.top_sectors_at_risk?.map((sec) => (
              <div
                key={sec.sector}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white truncate max-w-[180px]">{sec.sector}</span>
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    {sec.red_count} Critical
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/50 pt-2">
                  <span>
                    Total: <strong className="text-slate-200">{sec.project_count}</strong> projects
                  </span>
                  <span>
                    Capex: <strong className="text-emerald-400">₹{(sec.total_revised_cost / 1000).toFixed(1)}k Cr</strong>
                  </span>
                  <span>
                    Avg Risk: <strong className="text-orange-400">{sec.avg_risk}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Early Warning Alerts Feed */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            <h2 className="text-base font-bold text-white">Active Early Warning Alerts (Critical Severity)</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {summary.active_alerts_count} total portfolio triggers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {alerts.slice(0, 6).map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectProject(alert.project_id)}
              className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 hover:border-red-500/50 cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-orange-400 group-hover:underline">
                    {alert.project_id}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    {alert.alert_code.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1.5 group-hover:text-orange-300 transition">
                  {alert.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{alert.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Month: {alert.report_month}</span>
                <span className="text-orange-400 font-semibold group-hover:translate-x-0.5 transition inline-flex items-center space-x-1">
                  <span>Inspect Trajectory</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
