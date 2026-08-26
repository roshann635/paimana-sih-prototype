import React, { useEffect, useState } from 'react';
import { 
  Flame, HelpCircle, CheckCircle2, AlertCircle, ArrowUpRight, 
  ArrowDownRight, ShieldAlert, Sparkles, Building2, ChevronRight
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
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Computing TreeSHAP Feature Attributions & Root Causes...</p>
        </div>
      </div>
    );
  }

  const latestPred = project.latest_prediction;

  return (
    <div className="space-y-6 pb-12">
      {/* Project Selector Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider">Select Project to Explain:</span>
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

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 p-6 rounded-2xl border border-red-900/30 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Explainable AI (XAI) Root Cause Diagnosis
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                TreeSHAP Feature Attribution
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-2">
              Auditable mathematical breakdown explaining exactly why{' '}
              <strong className="text-white">{project.project_name}</strong> was classified as{' '}
              <strong className="text-red-400">{latestPred?.risk_level || 'HIGH'} RISK</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <RAGBBadge
              level={latestPred?.risk_level || 'GREEN'}
              score={latestPred?.composite_risk_score}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Plain-English Root Cause Diagnosis Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm">
        <div className="flex items-center space-x-2 text-orange-400 mb-3">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">Natural Language AI Diagnosis</h2>
        </div>
        <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-800/40 text-slate-200 text-sm leading-relaxed font-sans">
          "{explanation.diagnosis}"
        </div>
      </div>

      {/* SHAP Feature Contribution Waterfall & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Horizontal Bar Chart */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Top Feature Risk Contributors</h3>
              <p className="text-xs text-slate-400 mt-0.5">SHAP value contribution to risk escalation</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">TreeSHAP Explainer</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={explanation.attributions}
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="display_name"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  width={150}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val) => [`${Number(val) > 0 ? '+' : ''}${val}`, 'SHAP Impact']}
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

        {/* Feature Attribution Detail Table */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Feature Drivers Breakdown</h3>
              <span className="text-xs text-slate-400 font-medium">Ranked by Impact</span>
            </div>

            <div className="space-y-3">
              {explanation.attributions.map((attr) => (
                <div
                  key={attr.feature_name}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                      #{attr.rank}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-slate-200">{attr.display_name}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        Observed Value: <strong className="text-slate-300">{attr.value}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center space-x-1 font-mono font-bold text-xs px-2.5 py-1 rounded-lg ${
                        attr.direction === '+'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {attr.direction === '+' ? (
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
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

          <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
            ℹ️ <strong className="text-slate-300">SHAP (SHapley Additive exPlanations):</strong> Local game-theoretic feature importance ensuring additive attribution consistency for tree ensemble predictions.
          </div>
        </div>
      </div>

      {/* Prescriptive Recommended Review Actions */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Targeted Administrative Review Checklist</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Prescriptive decision-support actions generated dynamically from top SHAP risk triggers.
            </p>
          </div>

          <button
            onClick={() => onOpenIntervention(project)}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-md shadow-orange-500/20 text-xs transition"
          >
            <span>Log Administrative Intervention</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">
                    {rec.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rec.urgency === 'HIGH'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {rec.urgency} Urgency
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1.5">{rec.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rec.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
