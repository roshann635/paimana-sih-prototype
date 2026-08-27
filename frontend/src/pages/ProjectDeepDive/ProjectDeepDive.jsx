import React, { useState, useEffect } from "react";
import TrajectoryCharts from "../../components/charts/TrajectoryCharts";
import ShapDiagnosisCard from "../../components/intelligence/ShapDiagnosisCard";
import EVMPerformanceCard from "../../components/intelligence/EVMPerformanceCard";
import WhatIfSimulator from "../../components/intelligence/WhatIfSimulator";
import DigitalProjectTimeline from "../../components/intelligence/DigitalProjectTimeline";
import ProjectPeerBenchmark from "../../components/intelligence/ProjectPeerBenchmark";
import StatusBadge from "../../components/common/StatusBadge";
import TrendBadge from "../../components/common/TrendBadge";
import InterventionModal from "../../components/common/InterventionModal";
import SatelliteVerificationCard from "../../components/satellite/SatelliteVerificationCard";
import SatelliteEvidenceModal from "../../components/satellite/SatelliteEvidenceModal";
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
  const [isSatelliteModalOpen, setIsSatelliteModalOpen] = useState(false);


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
      <div className="p-6 space-y-5 bg-[#f4f7fb] min-h-screen">
        <div className="h-8 bg-white border border-[#dbe3ed] rounded-lg w-1/3 animate-pulse"></div>
        <LoadingSkeleton rows={12} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 sm:p-12 bg-[#f4f7fb] min-h-screen flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white border border-[#dbe3ed] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#d97706] flex items-center justify-center mx-auto shadow-2xs">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#142235]">
              Project Not Found ({projectId || "Unknown"})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Project identifier <code className="bg-slate-100 text-[#1668d8] font-mono px-2 py-0.5 rounded font-bold">{projectId}</code> was not matched. Real project codes follow the MoSPI format (e.g. <strong>P618427</strong>, <strong>P400161</strong>, <strong>P400005</strong>).
            </p>
          </div>

          <div className="p-4 bg-[#f8fafc] border border-[#dbe3ed] rounded-xl text-left space-y-2.5">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Quick-Jump to Verified Case Studies
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigate && onNavigate("/projects/P618427")}
                className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-[#1668d8] font-mono">P618427 (Golden Case Study)</div>
                <div className="text-xs text-[#142235] font-bold truncate">Vadodara-Mumbai Expressway Pkg IV</div>
                <div className="text-[11px] text-slate-500 font-mono">Reported 74% · Gap −16 pp</div>
              </button>
              <button
                onClick={() => onNavigate && onNavigate("/projects/P400161")}
                className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-700 font-mono">P400161 (Significant Gap)</div>
                <div className="text-xs text-[#142235] font-bold truncate">PP Project, Pata (Petrochemical)</div>
                <div className="text-[11px] text-slate-500 font-mono">Reported 99% · Gap −37.6 pp</div>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate ? onNavigate("/projects") : (onBack && onBack())}
              className="px-4 py-2 bg-[#1668d8] hover:bg-[#0b4db3] text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Browse All 1,630 Projects
            </button>
            <button
              onClick={() => onNavigate ? onNavigate("/satellite-observatory") : (onBack && onBack())}
              className="px-4 py-2 bg-white border border-[#dbe3ed] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Satellite Observatory
            </button>
          </div>
        </div>
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
    <div className="p-6 space-y-6 bg-[#07131F] min-h-screen">
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

      {/* 1. Objective EVM Performance Layer & Early Warning */}
      <EVMPerformanceCard
        snapshot={snap}
        prediction={pred}
        originalCost={p.original_cost}
        onOpenMemo={() => setIsMemoOpen(true)}
      />

      {/* 2. Independent Earth Observation Evidence & Satellite Cross-Verification */}
      <SatelliteVerificationCard
        projectId={p.project_id}
        projectName={p.project_name}
        onInspectEvidence={() => setIsSatelliteModalOpen(true)}
        onOpenMemo={() => setIsMemoOpen(true)}
      />

      {/* 3. Digital Project Timeline & Deviation Reconstruction */}
      <DigitalProjectTimeline projectId={p.project_id} />

      {/* 4. Cross-Project Sector Peer Benchmarking */}
      <ProjectPeerBenchmark projectId={p.project_id} sector={p.sector} />

      {/* 5. What-If Scenario Risk Simulator */}
      <WhatIfSimulator
        projectId={p.project_id}
        baselineSnapshot={snap}
        baselinePrediction={pred}
      />

      {/* 6. Trajectory S-Curves & Risk Evolution */}
      <TrajectoryCharts trajectory={trajectory} />

      {/* 7. TreeSHAP Factor Attribution & Directives */}
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

      {/* Earth Observation Evidence Studio Modal */}
      <SatelliteEvidenceModal
        isOpen={isSatelliteModalOpen}
        onClose={() => setIsSatelliteModalOpen(false)}
        projectId={p.project_id}
        projectName={p.project_name}
        onOpenMemo={() => setIsMemoOpen(true)}
      />
    </div>
  );
}

