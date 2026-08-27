import React, { useState, useEffect } from "react";
import TrajectoryCharts from "../../components/charts/TrajectoryCharts";
import ShapDiagnosisCard from "../../components/intelligence/ShapDiagnosisCard";
import EVMPerformanceCard from "../../components/intelligence/EVMPerformanceCard";
import StatusBadge from "../../components/common/StatusBadge";

import TrendBadge from "../../components/common/TrendBadge";
import InterventionModal from "../../components/common/InterventionModal";
import {
  LoadingSkeleton,
  ErrorState,
} from "../../components/common/FeedbackStates";
import { paimanaApi } from "../../services/api/paimanaApi";
import {
  FileCheck,
  ChevronLeft,
  Building2,
  Calendar,
  Layers,
  MapPin,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

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
        paimanaApi.getProjectRecommendations(pid).catch(() => []),
      ]);

      setProject(projData);
      setTrajectory(trajData || []);
      setExplanation(expData);
      setRecommendations(
        Array.isArray(recData) ? recData : recData?.recommendations || [],
      );
    } catch (err) {
      console.error("Failed to load project deep dive:", err);
      setError("Unable to load project details from backend.");
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
      <div className="p-6 space-y-5 bg-[#07131F] min-h-screen">
        <div className="h-8 bg-[#0D1E30] rounded-lg w-1/3 animate-pulse"></div>
        <LoadingSkeleton rows={12} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 bg-[#07131F] min-h-screen">
        <ErrorState
          message={error || "Project not found."}
          onRetry={() => loadProjectDeepDive(projectId)}
        />
      </div>
    );
  }

  const p = project;
  const snap = p.latest_snapshot || {};
  const pred = p.latest_prediction || {};

  const costOverrunCr = Math.max(
    0,
    (snap.revised_cost || p.original_cost) - p.original_cost,
  );
  const expUtilizationPct =
    snap.revised_cost > 0
      ? ((snap.cumulative_expenditure || 0) / snap.revised_cost) * 100
      : 0;

  return (
    <div className="p-6 space-y-5 bg-[#07131F] min-h-screen">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#16324A]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-[#0D1E30] border border-[#16324A] text-slate-400 hover:text-white hover:bg-[#16324A] transition-colors shadow-xs"
            title="Return to projects list"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-xs font-bold text-[#00E5FF] bg-[#0D1E30] px-2 py-0.5 rounded border border-[#16324A]">
                {p.project_code || p.project_id}
              </span>
              <StatusBadge level={pred.risk_level || "CRITICAL"} size="sm" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {p.project_name}
            </h1>
            <div className="text-xs text-slate-400 mt-0.5">
              {p.ministry} · {p.sector} · State:{" "}
              <strong className="text-slate-200">
                {p.state || "Multi-State"}
              </strong>{" "}
              · Agency:{" "}
              <strong className="text-slate-200">
                {p.implementing_agency}
              </strong>
            </div>
          </div>
        </div>

        {/* Action Button: Record Administrative Action Memo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMemoOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#07131F] text-xs font-bold rounded-lg transition-colors shadow-gold-glow"
          >
            <FileCheck className="w-4 h-4" />
            <span>Create Action Memorandum</span>
          </button>
        </div>
      </div>

      {/* 4 Core Command Metric Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0D1E30] border border-[#16324A] border-t-[3px] border-t-[#F97316] rounded-xl shadow-command-card flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Cost Overrun Risk
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#F97316] my-1">
            {Math.round((pred.cost_risk_probability || 0.78) * 100)}%
          </div>
          <div className="text-[11px] font-mono text-[#F97316] font-bold">
            +{(pred.expected_cost_overrun_pct || 14.8).toFixed(1)}% expected
            overrun
          </div>
        </div>

        <div className="p-4 bg-[#0D1E30] border border-[#16324A] border-t-[3px] border-t-[#EF4444] rounded-xl shadow-command-card flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Schedule Delay Risk
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#EF4444] my-1">
            {Math.round((pred.time_risk_probability || 0.71) * 100)}%
          </div>
          <div className="text-[11px] font-mono text-[#EF4444] font-bold">
            +{pred.expected_delay_days || 146} days expected delay
          </div>
        </div>

        <div className="p-4 bg-[#0D1E30] border border-[#16324A] border-t-[3px] border-t-[#F59E0B] rounded-xl shadow-command-card flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Financial Exposure
          </div>
          <div className="text-2xl font-extrabold font-mono text-white my-1">
            ₹{Number(snap.revised_cost || p.original_cost).toLocaleString()} Cr
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            ₹{Number(snap.cumulative_expenditure || 0).toLocaleString()} Cr
            drawn ({expUtilizationPct.toFixed(0)}%)
          </div>
        </div>

        <div className="p-4 bg-[#0D1E30] border border-[#16324A] border-t-[3px] border-t-[#00E5FF] rounded-xl shadow-command-card flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Intervention Priority
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#F59E0B] my-1">
            #{pred.ipi_rank || 3}
          </div>
          <div className="text-[11px] font-mono font-bold text-[#00E5FF]">
            IPI Index: {pred.ipi_score ? pred.ipi_score.toFixed(1) : "91.2"} /
            100
          </div>
        </div>
      </div>

      {/* Objective EVM Performance Layer & Early Warning */}
      <EVMPerformanceCard
        snapshot={snap}
        prediction={pred}
        originalCost={p.original_cost}
        onOpenMemo={() => setIsMemoOpen(true)}
      />

      {/* Trajectory S-Curves & Risk Evolution */}
      <TrajectoryCharts trajectory={trajectory} />


      {/* TreeSHAP Factor Attribution & Directives */}
      <ShapDiagnosisCard
        attributions={explanation?.attributions || []}
        diagnosis={explanation?.diagnosis}
        recommendations={recommendations}
        projectName={p.project_name}
        compositeRisk={pred.composite_risk_score}
        onOpenMemo={() => setIsMemoOpen(true)}
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
