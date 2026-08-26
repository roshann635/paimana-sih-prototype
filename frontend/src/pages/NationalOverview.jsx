import React, { useEffect, useState } from 'react';
import { 
  Building, TrendingUp, AlertTriangle, IndianRupee, ShieldAlert,
  ArrowRight, ArrowUpRight, Activity, FileSpreadsheet, Download
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
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading National Infrastructure Portfolio...</p>
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
    <div className="space-y-6 pb-12">
      {/* Official Executive Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight">
                National Infrastructure Monitoring & Predictive Early Warning Overview
              </h1>
              <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                Official Report
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-4xl leading-relaxed">
              Consolidated trajectory analytics and early warning signals across all Central Sector Infrastructure Projects (₹150 Cr and above) monitored under the Ministry of Statistics and Programme Implementation (MoSPI).
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigateTab('priority-queue')}
              className="inline-flex items-center space-x-2 bg-blue-700 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-xs transition shadow-sm"
            >
              <span>View Priority Review Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* Card 1 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Monitored Projects</span>
            <Building className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-white font-mono">{summary.total_projects.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">17 Ministries • 22 Sectors</p>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Revised Sanctioned Capex</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-white font-mono">
              ₹{(summary.total_revised_cost_cr / 100000).toFixed(2)}L Cr
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Orig: ₹{(summary.total_original_cost_cr / 100000).toFixed(2)}L Cr
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Net Cost Escalation</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-amber-400 font-mono">
              +₹{(summary.total_cost_escalation_cr / 1000).toFixed(1)}k Cr
            </span>
          </div>
          <p className="text-[11px] text-amber-400/90 mt-1">+{escalationPct}% portfolio cost growth</p>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Cumulative Expenditure</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-white font-mono">
              ₹{(summary.total_expenditure_cr / 100000).toFixed(2)}L Cr
            </span>
          </div>
          <p className="text-[11px] text-indigo-300 mt-1">{expUtilization}% budget drawn</p>
        </div>

        {/* Card 5 */}
        <div className="bg-slate-900 border border-red-900/40 bg-red-950/20 p-4 rounded-xl">
          <div className="flex items-center justify-between text-red-300 text-xs font-semibold uppercase">
            <span>Critical Review (RED)</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-red-400 font-mono">{redCount}</span>
            <span className="text-xs text-slate-400 font-mono">({((redCount / summary.total_projects) * 100).toFixed(1)}%)</span>
          </div>
          <p className="text-[11px] text-amber-400 mt-1">+{orangeCount} High Risk (Orange)</p>
        </div>

        {/* Card 6 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Trajectory Deterioration</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-rose-400 font-mono">{summary.deteriorating_count}</span>
          </div>
          <p className="text-[11px] text-rose-300 mt-1">Slipping over last quarter</p>
        </div>
      </div>

      {/* Portfolio Risk Tiers & Sector Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Risk Tier Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span>Portfolio Risk Tier Breakdown</span>
            <span className="text-xs font-mono text-slate-400">RAGB Standard</span>
          </h2>

          <div className="space-y-4 text-xs">
            {/* Red Tier */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-red-300 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Critical Review (Score: 75–100)</span>
                </span>
                <span className="text-slate-300 font-mono">
                  {redCount} ({((redCount / summary.total_projects) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-md h-2 overflow-hidden">
                <div
                  className="bg-red-500 h-2 rounded-md"
                  style={{ width: `${(redCount / summary.total_projects) * 100}%` }}
                />
              </div>
            </div>

            {/* Orange Tier */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-amber-300 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>High Risk (Score: 50–74)</span>
                </span>
                <span className="text-slate-300 font-mono">
                  {orangeCount} ({((orangeCount / summary.total_projects) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-md h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-md"
                  style={{ width: `${(orangeCount / summary.total_projects) * 100}%` }}
                />
              </div>
            </div>

            {/* Amber Tier */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-yellow-300 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>Moderate Watch (Score: 25–49)</span>
                </span>
                <span className="text-slate-300 font-mono">
                  {amberCount} ({((amberCount / summary.total_projects) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-md h-2 overflow-hidden">
                <div
                  className="bg-yellow-500 h-2 rounded-md"
                  style={{ width: `${(amberCount / summary.total_projects) * 100}%` }}
                />
              </div>
            </div>

            {/* Green Tier */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-emerald-300 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>On Track / Normal (Score: 0–24)</span>
                </span>
                <span className="text-slate-300 font-mono">
                  {greenCount} ({((greenCount / summary.total_projects) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-md h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-md"
                  style={{ width: `${(greenCount / summary.total_projects) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Assessment Methodology:</strong> Composite scoring synthesizes XGBoost Lookahead Cost Probability (35%), Schedule Delay Probability (35%), Quarterly Deterioration Velocity (20%), and Stage Criticality (10%).
          </div>
        </div>

        {/* Right Column: Sectors with Highest Capex at Risk */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Sectors with Highest Capital at Risk</span>
            </h2>
            <span className="text-xs text-slate-400">Ranked by Critical Review Exposure</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {summary.top_sectors_at_risk?.map((sec) => (
              <div
                key={sec.sector}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white truncate max-w-[190px]">{sec.sector}</span>
                  <span className="text-[11px] font-mono font-bold text-red-300 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                    {sec.red_count} Critical
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                  <span>
                    Total: <strong className="text-slate-200">{sec.project_count}</strong>
                  </span>
                  <span>
                    Capex: <strong className="text-emerald-400">₹{(sec.total_revised_cost / 1000).toFixed(1)}k Cr</strong>
                  </span>
                  <span>
                    Avg Risk: <strong className="text-amber-400">{sec.avg_risk}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Early Warning Bulletins */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold text-white">Active Early Warning Administrative Bulletins</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {summary.active_alerts_count} total portfolio triggers recorded
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {alerts.slice(0, 6).map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectProject(alert.project_id)}
              className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-700/60 cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-400 group-hover:underline">
                    {alert.project_id}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 font-mono">
                    {alert.alert_code.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white mt-1.5 group-hover:text-blue-300 transition">
                  {alert.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{alert.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">Cycle: {alert.report_month}</span>
                <span className="text-blue-400 font-semibold group-hover:translate-x-0.5 transition inline-flex items-center space-x-1">
                  <span>Open Appraisal</span>
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
