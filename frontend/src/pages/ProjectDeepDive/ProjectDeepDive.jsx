import React, { useState, useEffect } from 'react';
import TrajectoryCharts from '../../components/charts/TrajectoryCharts';
import ShapDiagnosisCard from '../../components/intelligence/ShapDiagnosisCard';
import StatusBadge from '../../components/common/StatusBadge';
import TrendBadge from '../../components/common/TrendBadge';
import InterventionModal from '../../components/common/InterventionModal';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { paimanaApi } from '../../services/api/paimanaApi';
import {
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  FileCheck,
  ChevronLeft
} from 'lucide-react';

export default function ProjectDeepDive({ projectId, onBack, onNavigate }) {
  const [project, setProject] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [explanation, setExplanation] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMemoOpen, setIsMemoOpen] = useState(false);

  const loadProjectDeepDive = async (pid) => {
    setLoading(true);
    setError(null);
    try {
      const [projData, trajData, expData, recData] = await Promise.all([
        paimanaApi.getProjectById(pid),
        paimanaApi.getProjectTrajectory(pid).catch(() => []),
        paimanaApi.getProjectExplanation(pid).catch(() => null),
        paimanaApi.getProjectRecommendations(pid).catch(() => [])
      ]);

      setProject(projData);
      setTrajectory(trajData || []);
      setExplanation(expData);
      setRecommendations(recData?.recommendations || []);
    } catch (err) {
      console.error('Failed to load project deep dive:', err);
      setError('Unable to load project details from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProjectDeepDive(projectId);
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gov-secondary rounded w-1/3 animate-pulse"></div>
        <LoadingSkeleton rows={12} />
      </div>
    );
  }

  if (error || !project) {
    return <ErrorState message={error || 'Project not found.'} onRetry={() => loadProjectDeepDive(projectId)} />;
  }

  const p = project;
  const snap = p.latest_snapshot || {};
  const pred = p.latest_prediction || {};

  const costOverrunCr = Math.max(0, (snap.revised_cost || p.original_cost) - p.original_cost);
  const costOverrunPct = p.original_cost > 0 ? (costOverrunCr / p.original_cost) * 100 : 0;
  const expUtilizationPct = snap.revised_cost > 0 ? ((snap.cumulative_expenditure || 0) / snap.revised_cost) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-gov-sm bg-gov-surface border border-gov-border text-text-secondary hover:text-text-primary transition-colors"
            title="Return to list"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-text-muted">
                {p.project_code || p.project_id}
              </span>
              <StatusBadge level={pred.risk_level || 'GREEN'} size="sm" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              {p.project_name}
            </h1>
          </div>
        </div>

        {/* Action Button: Record Administrative Review Memorandum */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMemoOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-gov-sm transition-colors shadow-gov"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Action Memorandum</span>
          </button>
        </div>
      </div>

      {/* Project Metadata Strip */}
      <div className="bg-gov-surface border border-gov-border rounded-gov p-4 shadow-gov grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-text-muted block text-[11px] uppercase font-medium">Ministry</span>
          <span className="font-semibold text-text-primary truncate block">{p.ministry}</span>
        </div>
        <div>
          <span className="text-text-muted block text-[11px] uppercase font-medium">Sector & Agency</span>
          <span className="font-semibold text-text-primary truncate block">{p.sector} · {p.implementing_agency}</span>
        </div>
        <div>
          <span className="text-text-muted block text-[11px] uppercase font-medium">State / Region</span>
          <span className="font-semibold text-text-primary block">{p.state || 'Multi-State'}</span>
        </div>
        <div>
          <span className="text-text-muted block text-[11px] uppercase font-medium">Intervention Priority</span>
          <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
            IPI: {pred.ipi_score ? pred.ipi_score.toFixed(1) : '—'} (#{pred.ipi_rank || 1})
          </span>
        </div>
      </div>

      {/* Financial & Schedule KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-gov-surface border border-gov-border rounded-gov shadow-gov">
          <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Original Sanction</div>
          <div className="text-lg font-bold font-mono text-text-primary mt-0.5">
            ₹{Number(p.original_cost || 0).toLocaleString()} Cr
          </div>
          <div className="text-[11px] text-text-muted">{p.original_start_date || 'N/A'}</div>
        </div>

        <div className="p-3.5 bg-gov-surface border border-gov-border rounded-gov shadow-gov">
          <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Revised Baseline</div>
          <div className="text-lg font-bold font-mono text-text-primary mt-0.5">
            ₹{Number(snap.revised_cost || p.original_cost).toLocaleString()} Cr
          </div>
          <div className="text-[11px] text-risk-review font-medium">
            {costOverrunPct > 0 ? `+${costOverrunPct.toFixed(1)}% overrun` : 'On Baseline'}
          </div>
        </div>

        <div className="p-3.5 bg-gov-surface border border-gov-border rounded-gov shadow-gov">
          <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Cumulative Capex</div>
          <div className="text-lg font-bold font-mono text-text-primary mt-0.5">
            ₹{Number(snap.cumulative_expenditure || 0).toLocaleString()} Cr
          </div>
          <div className="text-[11px] text-text-muted">{expUtilizationPct.toFixed(1)}% of revised cost</div>
        </div>

        <div className="p-3.5 bg-gov-surface border border-gov-border rounded-gov shadow-gov">
          <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Physical Milestone</div>
          <div className="text-lg font-bold font-mono text-text-primary mt-0.5">
            {Number(snap.physical_progress_pct || 0).toFixed(0)}%
          </div>
          <div className="text-[11px] text-text-muted">
            <TrendBadge direction={pred.trend_direction} />
          </div>
        </div>

        <div className="p-3.5 bg-gov-surface border border-gov-border rounded-gov shadow-gov">
          <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Schedule Slippage</div>
          <div className="text-lg font-bold font-mono text-risk-review mt-0.5">
            {snap.delay_days ? `${snap.delay_days} Days` : '0 Days'}
          </div>
          <div className="text-[11px] text-text-muted">Target: {snap.current_end_date || p.original_end_date}</div>
        </div>

        <div className="p-3.5 bg-gov-surface border border-gov-border rounded-gov shadow-gov">
          <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Composite ML Risk</div>
          <div className="text-lg font-bold font-mono text-risk-critical mt-0.5">
            {Math.round(pred.composite_risk_score || 0)} / 100
          </div>
          <div className="text-[11px] text-text-muted">Cost Risk: {(pred.cost_risk_probability * 100 || 0).toFixed(0)}%</div>
        </div>
      </div>

      {/* Middle Section: Trajectory S-Curves */}
      <TrajectoryCharts trajectory={trajectory} />

      {/* Bottom Section: TreeSHAP Factor Attribution & Diagnosis */}
      <ShapDiagnosisCard
        attributions={explanation?.attributions || []}
        diagnosis={explanation?.diagnosis}
        recommendations={recommendations}
        projectName={p.project_name}
        compositeRisk={pred.composite_risk_score}
      />

      {/* Action Memorandum Modal */}
      <InterventionModal
        isOpen={isMemoOpen}
        onClose={() => setIsMemoOpen(false)}
        project={p}
        onInterventionSaved={() => loadProjectDeepDive(projectId)}
      />
    </div>
  );
}
