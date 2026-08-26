import React, { useEffect, useState } from 'react';
import { 
  Building2, MapPin, Calendar, IndianRupee, Clock, ShieldAlert,
  Flame, TrendingUp, AlertTriangle, ChevronRight, Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { fetchProjectDetail, fetchProjectTrajectory, fetchProjects } from '../services/api';
import { RAGBBadge } from '../components/RAGBBadge';
import { TrendIndicator } from '../components/TrendIndicator';

export const ProjectDeepDive = ({
  projectId,
  onSelectProject,
  onOpenWhyRisk,
  onOpenIntervention,
}) => {
  const [project, setProject] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      try {
        const [projData, trajData, listData] = await Promise.all([
          fetchProjectDetail(projectId),
          fetchProjectTrajectory(projectId),
          fetchProjects({ limit: 100 }),
        ]);
        setProject(projData);
        setTrajectory(trajData);
        setAllProjects(listData.items);
      } catch (err) {
        console.error('Error fetching deep dive:', err);
      } finally {
        setLoading(false);
      }
    }
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3 text-slate-400">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading Project Trajectory & Analytics...</p>
        </div>
      </div>
    );
  }

  const latestSnap = project.latest_snapshot;
  const latestPred = project.latest_prediction;

  const costEscalationCr = (latestSnap?.revised_cost || project.original_cost) - project.original_cost;
  const costEscalationPct = ((costEscalationCr / Math.max(1, project.original_cost)) * 100).toFixed(1);
  const budgetRemainingCr = (latestSnap?.revised_cost || project.original_cost) - (latestSnap?.cumulative_expenditure || 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Project Selector Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider">Select Project:</span>
        </div>
        <select
          value={projectId}
          onChange={(e) => onSelectProject(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
        >
          {allProjects.map((p) => (
            <option key={p.project_id} value={p.project_id}>
              {p.project_id} • {p.project_name.slice(0, 45)}... (Risk: {p.composite_risk_score.toFixed(0)})
            </option>
          ))}
        </select>
      </div>

      {/* Main Project Header Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-sm font-bold px-2.5 py-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {project.project_id}
              </span>
              <span className="text-xs font-mono text-slate-400">{project.project_code}</span>
              <RAGBBadge
                level={latestPred?.risk_level || 'GREEN'}
                score={latestPred?.composite_risk_score}
                size="md"
              />
              <TrendIndicator trend={latestPred?.trend_direction || 'stable'} />
            </div>

            <h1 className="text-2xl font-black text-white mt-2 tracking-tight">
              {project.project_name}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 mt-3">
              <span className="flex items-center space-x-1 text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{project.ministry}</span>
              </span>
              <span>•</span>
              <span className="text-slate-300 font-semibold">{project.sector}</span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{project.state}</span>
              </span>
              <span>•</span>
              <span className="text-amber-400 font-medium">Agency: {project.implementing_agency}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenWhyRisk(project.project_id)}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-red-500/20 text-sm transition"
            >
              <Flame className="w-4 h-4 text-white" />
              <span>Why is this High Risk? (SHAP)</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenIntervention(project)}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold px-4 py-2.5 rounded-xl border border-slate-700 text-sm transition"
            >
              <span>Log Review Action</span>
            </button>
          </div>
        </div>

        {/* Project KPI Highlight Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          {/* IPI Score */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Priority Index (IPI)</span>
            <div className="text-xl font-black text-orange-400 mt-1">
              {latestPred?.ipi_score?.toFixed(1) || '0.0'}
            </div>
            <span className="text-[10px] text-slate-400">Rank #{latestPred?.ipi_rank || 0}</span>
          </div>

          {/* Cost Risk Probability */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Cost Escalation Risk</span>
            <div className="text-xl font-black text-rose-400 mt-1">
              {((latestPred?.cost_risk_probability || 0) * 100).toFixed(0)}%
            </div>
            <span className="text-[10px] text-slate-400">ML Lookahead Prob</span>
          </div>

          {/* Time Risk Probability */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Schedule Delay Risk</span>
            <div className="text-xl font-black text-amber-400 mt-1">
              {((latestPred?.time_risk_probability || 0) * 100).toFixed(0)}%
            </div>
            <span className="text-[10px] text-slate-400">ML Lookahead Prob</span>
          </div>

          {/* Physical Progress */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Physical Progress</span>
            <div className="text-xl font-black text-emerald-400 mt-1">
              {latestSnap?.physical_progress_pct || 0}%
            </div>
            <span className="text-[10px] text-slate-400">Current Cumulative</span>
          </div>

          {/* Schedule Delay */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Schedule Slippage</span>
            <div className="text-xl font-black text-rose-400 mt-1">
              {latestSnap?.delay_days || 0} days
            </div>
            <span className="text-[10px] text-slate-400">
              ~{((latestSnap?.delay_days || 0) / 30.4).toFixed(1)} months
            </span>
          </div>

          {/* Revised Cost */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Revised Capex</span>
            <div className="text-xl font-black text-white mt-1">
              ₹{latestSnap?.revised_cost?.toLocaleString() || project.original_cost} Cr
            </div>
            <span className="text-[10px] text-amber-400">+{costEscalationPct}% escalation</span>
          </div>
        </div>
      </div>

      {/* Trajectory Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: S-Curve Physical Progress vs Timeline */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>S-Curve Physical Progress Trajectory</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Physical milestone completion % over reporting months</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              Current: {latestSnap?.physical_progress_pct}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="report_month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val) => [`${val}%`, 'Physical Progress']}
                />
                <Area
                  type="monotone"
                  dataKey="physical_progress_pct"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorProgress)"
                  name="Progress %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cost & Expenditure Trajectory */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <IndianRupee className="w-5 h-5 text-amber-400" />
                <span>Capex & Expenditure Trajectory (₹ Cr)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Original vs Revised Sanctions vs Cumulative Utilization</p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
              Exp: ₹{latestSnap?.cumulative_expenditure?.toLocaleString()} Cr
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectory} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="report_month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val) => [`₹${Number(val).toLocaleString()} Cr`, '']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revised_cost"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                  name="Revised Cost"
                />
                <Line
                  type="monotone"
                  dataKey="cumulative_expenditure"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={false}
                  name="Expenditure"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Composite Risk Trajectory */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Predictive Risk Score Progression (0–100)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Historical evolution of multi-dimensional risk score over time</p>
          </div>
          <RAGBBadge
            level={latestPred?.risk_level || 'GREEN'}
            score={latestPred?.composite_risk_score}
            size="md"
          />
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="report_month" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val) => [val, 'Risk Score']}
              />
              <Line
                type="monotone"
                dataKey="composite_risk_score"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 3, fill: '#ef4444' }}
                name="Risk Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
