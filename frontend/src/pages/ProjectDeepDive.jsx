import React, { useEffect, useState } from 'react';
import { 
  Building, MapPin, Calendar, IndianRupee, Clock, ShieldAlert,
  TrendingUp, AlertTriangle, ChevronRight, Activity, FileText
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
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading Project Appraisal Dossier...</p>
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
    <div className="space-y-5 pb-12">
      {/* Project Selector Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400 uppercase font-semibold">Select Infrastructure Project to Appraise:</span>
        <select
          value={projectId}
          onChange={(e) => onSelectProject(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
        >
          {allProjects.map((p) => (
            <option key={p.project_id} value={p.project_id}>
              {p.project_id} • {p.project_name.slice(0, 48)}... (Risk: {p.composite_risk_score.toFixed(0)})
            </option>
          ))}
        </select>
      </div>

      {/* Main Dossier Header */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
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

            <h1 className="text-xl font-black text-white mt-2 tracking-tight">
              {project.project_name}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-400 mt-2.5">
              <span className="text-slate-300">{project.ministry}</span>
              <span>•</span>
              <span className="text-blue-300 font-medium">{project.sector}</span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{project.state}</span>
              </span>
              <span>•</span>
              <span className="text-slate-300">Nodal Agency: <strong className="text-white font-mono">{project.implementing_agency}</strong></span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenWhyRisk(project.project_id)}
              className="flex items-center space-x-1.5 bg-red-900/60 hover:bg-red-800 text-red-100 font-bold px-3.5 py-2 rounded-lg border border-red-700/60 text-xs transition"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Root Cause Diagnosis (SHAP)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onOpenIntervention(project)}
              className="flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold px-3.5 py-2 rounded-lg text-xs transition"
            >
              <span>Issue Administrative Directive</span>
            </button>
          </div>
        </div>

        {/* Project KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 pt-5 border-t border-slate-800">
          {/* IPI */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Priority Index (IPI)</span>
            <div className="text-lg font-black text-amber-400 mt-0.5 font-mono">
              {latestPred?.ipi_score?.toFixed(1) || '0.0'}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Rank #{latestPred?.ipi_rank || 0}</span>
          </div>

          {/* Cost Risk */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cost Overrun Risk</span>
            <div className="text-lg font-black text-red-400 mt-0.5 font-mono">
              {((latestPred?.cost_risk_probability || 0) * 100).toFixed(0)}%
            </div>
            <span className="text-[10px] text-slate-400">ML Lookahead Prob</span>
          </div>

          {/* Time Risk */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Schedule Delay Risk</span>
            <div className="text-lg font-black text-amber-400 mt-0.5 font-mono">
              {((latestPred?.time_risk_probability || 0) * 100).toFixed(0)}%
            </div>
            <span className="text-[10px] text-slate-400">ML Lookahead Prob</span>
          </div>

          {/* Physical Progress */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Physical Progress</span>
            <div className="text-lg font-black text-emerald-400 mt-0.5 font-mono">
              {latestSnap?.physical_progress_pct || 0}%
            </div>
            <span className="text-[10px] text-slate-400">Milestone Complete</span>
          </div>

          {/* Delay */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Accumulated Delay</span>
            <div className="text-lg font-black text-rose-400 mt-0.5 font-mono">
              {latestSnap?.delay_days || 0} days
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              ~{((latestSnap?.delay_days || 0) / 30.4).toFixed(1)} months
            </span>
          </div>

          {/* Revised Cost */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Revised Outlay</span>
            <div className="text-lg font-black text-white mt-0.5 font-mono">
              ₹{latestSnap?.revised_cost?.toLocaleString() || project.original_cost} Cr
            </div>
            <span className="text-[10px] text-amber-400">+{costEscalationPct}% escalation</span>
          </div>
        </div>
      </div>

      {/* Trajectory Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* S-Curve */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>S-Curve Physical Milestone Execution Profile</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Cumulative completion progress over reporting periods</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Current: {latestSnap?.physical_progress_pct}%
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="report_month" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }}
                  formatter={(val) => [`${val}%`, 'Physical Progress']}
                />
                <Area
                  type="monotone"
                  dataKey="physical_progress_pct"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorProgress)"
                  name="Progress %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Capex vs Expenditure */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <IndianRupee className="w-4 h-4 text-amber-400" />
                <span>Sanctioned Outlay vs Expenditure Accrual (₹ Cr)</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Budget sanction revisions vs cumulative utilization</p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              Drawn: ₹{latestSnap?.cumulative_expenditure?.toLocaleString()} Cr
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectory} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="report_month" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }}
                  formatter={(val) => [`₹${Number(val).toLocaleString()} Cr`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="revised_cost"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name="Revised Cost"
                />
                <Line
                  type="monotone"
                  dataKey="cumulative_expenditure"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={false}
                  name="Cumulative Expenditure"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Trajectory Progression */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Predictive Risk Score Progression (0–100 Timeline)</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Historical evolution of multi-dimensional risk score across reporting months</p>
          </div>
          <RAGBBadge
            level={latestPred?.risk_level || 'GREEN'}
            score={latestPred?.composite_risk_score}
            size="md"
          />
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="report_month" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }}
                formatter={(val) => [val, 'Composite Risk Score']}
              />
              <Line
                type="monotone"
                dataKey="composite_risk_score"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#ef4444' }}
                name="Risk Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
