import React, { useEffect, useState } from 'react';
import { 
  Activity, CheckCircle2, AlertCircle, ArrowUpRight, 
  ArrowDownRight, ShieldAlert, FileText, ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Cell 
} from 'recharts';
import { fetchProjectDetail, fetchProjectExplanation, fetchProjectRecommendations, fetchProjects } from '../services/api';
import { RAGBBadge } from '../components/RAGBBadge';

export const WhyRiskSHAP = ({
  projectId,
  onSelectProject,
  onOpenIntervention,
}) => {
  const [project, setProject] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [projData, expData, recData, listData] = await Promise.all([
          fetchProjectDetail(projectId),
          fetchProjectExplanation(projectId),
          fetchProjectRecommendations(projectId),
          fetchProjects({ limit: 100 }),
        ]);
        setProject(projData);
        setExplanation(expData);
        setRecommendations(recData);
        setAllProjects(listData.items);
      } catch (err) {
        console.error('Error fetching SHAP explanation:', err);
      } finally {
        setLoading(false);
      }
    }
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  if (loading || !project || !explanation) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Computing TreeSHAP Factor Attributions & Root Causes...</p>
        </div>
      </div>
    );
  }

  const latestPred = project.latest_prediction;

  return (
    <div className="space-y-5 pb-12">
      {/* Project Selector Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400 uppercase font-semibold">Select Infrastructure Project to Diagnose:</span>
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

      {/* Official Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-black text-white tracking-tight">
                Explainable AI (TreeSHAP) Root Cause Factor Attribution
              </h1>
              <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                Auditable Analysis
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Quantitative decomposition of risk escalation drivers for <strong className="text-white">{project.project_name}</strong> ({project.project_id}).
            </p>
          </div>

          <div>
            <RAGBBadge
              level={latestPred?.risk_level || 'GREEN'}
              score={latestPred?.composite_risk_score}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Official Root Cause Diagnostic Memorandum */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center space-x-2 text-slate-300 mb-2.5">
          <FileText className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">Diagnostic Summary Memorandum</h2>
        </div>
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed font-sans">
          "{explanation.diagnosis}"
        </div>
      </div>

      {/* SHAP Factor Attributions & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SHAP Horizontal Bar Chart */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Risk Factor Contribution Magnitude</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Shapley marginal contribution to risk escalation</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">TreeSHAP Engine</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={explanation.attributions}
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis
                  type="category"
                  dataKey="display_name"
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                  width={140}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }}
                  formatter={(val) => [`${Number(val) > 0 ? '+' : ''}${val}`, 'SHAP Value']}
                />
                <Bar dataKey="shap_value" radius={[0, 4, 4, 0]}>
                  {explanation.attributions.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.shap_value > 0 ? '#ef4444' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Drivers Table */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Ranked Factor Breakdown</h3>
              <span className="text-xs text-slate-400 font-medium">Marginal Impact</span>
            </div>

            <div className="space-y-2.5">
              {explanation.attributions.map((attr) => (
                <div
                  key={attr.feature_name}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                      #{attr.rank}
                    </span>
                    <div>
                      <div className="font-bold text-slate-200">{attr.display_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Observed Metric: <strong className="text-slate-300">{attr.value}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span
                      className={`inline-flex items-center space-x-1 font-bold text-xs px-2 py-0.5 rounded ${
                        attr.direction === '+'
                          ? 'bg-red-950/60 text-red-300 border border-red-800/40'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                      }`}
                    >
                      {attr.direction === '+' ? (
                        <ArrowUpRight className="w-3 h-3 text-red-400 stroke-[2]" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-emerald-400 stroke-[2]" />
                      )}
                      <span>
                        {attr.direction}
                        {attr.shap_value.toFixed(4)}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            <strong className="text-slate-300">Methodological Note:</strong> TreeSHAP ensures mathematical attribution consistency, ensuring the sum of local feature attributions equals the divergence from portfolio baseline risk.
          </div>
        </div>
      </div>

      {/* Targeted Administrative Review Directives */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Targeted Administrative Review Checklist & Recommended Directives</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Prescriptive decision-support actions generated from top observed risk bottlenecks.
            </p>
          </div>

          <button
            onClick={() => onOpenIntervention(project)}
            className="flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition"
          >
            <span>Record Directive / Intervention</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between text-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-400 uppercase tracking-wide text-[11px]">
                    {rec.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      rec.urgency === 'HIGH'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                    }`}
                  >
                    {rec.urgency} URGENCY
                  </span>
                </div>
                <h4 className="font-bold text-white mt-1 text-xs">{rec.title}</h4>
                <p className="text-slate-300 mt-1 leading-relaxed text-[11px]">{rec.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
