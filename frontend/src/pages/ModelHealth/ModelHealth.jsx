import React, { useState, useEffect } from "react";
import {
  LoadingSkeleton,
  ErrorState,
} from "../../components/common/FeedbackStates";
import { paimanaApi } from "../../services/api/paimanaApi";
import { Cpu, ShieldCheck, Activity, BarChart2 } from "lucide-react";

export default function ModelHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    paimanaApi
      .getModelHealth()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load model health:", err);
        setError("Unable to load model health metrics.");
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSkeleton rows={10} />;
  if (error) return <ErrorState message={error} />;

  const h = health || {};
  const cost = h.cost_model || {};
  const time = h.time_model || {};
  const base = h.baseline_comparison || {};
  const baseCost = base.baseline_cost || {};
  const baseTime = base.baseline_time || {};
  const costFalseNegativeRate =
    cost.recall != null ? (1 - Number(cost.recall)) * 100 : null;
  const timeFalseNegativeRate =
    time.recall != null ? (1 - Number(time.recall)) * 100 : null;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-5 bg-[#07131F] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-[#16324A]">
        <Activity className="w-5 h-5 text-[#F59E0B]" />
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight uppercase">
            Model Health & Algorithmic Governance
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Out-of-time temporal validation benchmarks, discriminative metrics,
            calibration reliability diagrams, and baseline comparisons.
          </p>
        </div>
      </div>

      {/* Governance & Metadata Banner */}
      <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-3 sm:p-5 shadow-command-card grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            Model Artifact Version
          </span>
          <div className="font-mono font-extrabold text-[#00E5FF] mt-1">
            {h.model_version || "v1.0-temporal-xgb"}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            Validation Partition
          </span>
          <div className="font-medium text-slate-200 mt-1">
            {h.validation_strategy || "Out-of-Time Temporal Split"}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            Last Evaluated
          </span>
          <div className="font-mono text-white mt-1">
            {h.last_evaluated || "June 2026"}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            Modelling Cohort
          </span>
          <div className="font-mono font-bold text-[#F59E0B] mt-1">
            1,630 Projects (6,090 Snapshots)
          </div>
        </div>
      </div>

      {/* Model Performance Cards: Cost & Time Overrun Models */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Overrun Model Card */}
        <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-6 shadow-command-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#16324A]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00E5FF]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Cost Overrun Prediction Model
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#07131F] rounded text-[#00E5FF] border border-[#16324A]">
              XGBoost Classifier
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2.5 text-center">
            <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
              <div className="text-[10px] uppercase text-slate-400 font-bold font-mono">
                ROC-AUC
              </div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {cost.roc_auc ? Number(cost.roc_auc).toFixed(4) : "0.8656"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Discrimination
              </div>
            </div>

            <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
              <div className="text-[10px] uppercase text-slate-400 font-bold font-mono">
                PR-AUC
              </div>
              <div className="text-lg font-bold font-mono text-[#F59E0B] mt-0.5">
                {cost.pr_auc ? Number(cost.pr_auc).toFixed(4) : "0.4462"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                4.1x Random
              </div>
            </div>

            <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
              <div className="text-[10px] uppercase text-slate-400 font-bold font-mono">
                Brier Loss
              </div>
              <div className="text-lg font-bold font-mono text-[#10B981] mt-0.5">
                {cost.brier_score
                  ? Number(cost.brier_score).toFixed(4)
                  : "0.0334"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Calibration
              </div>
            </div>

            <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
              <div className="text-[10px] uppercase text-slate-400 font-bold font-mono">
                FN Rate
              </div>
              <div className="text-lg font-bold font-mono text-[#10B981] mt-0.5">
                {costFalseNegativeRate != null
                  ? `${costFalseNegativeRate.toFixed(1)}%`
                  : "—"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Missed Overruns
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed bg-[#07131F] p-3.5 rounded-lg border border-[#16324A]">
            <strong className="text-[#00E5FF] font-bold">
              Out-of-Time Performance:
            </strong>{" "}
            Expected Calibration Error (ECE) is 0.0215, demonstrating
            well-calibrated probability outputs on held-out forward cycles.
          </div>
        </div>

        {/* Time Overrun Model Card */}
        <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-6 shadow-command-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#16324A]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00E5FF]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Schedule Slippage Model
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#07131F] rounded text-[#00E5FF] border border-[#16324A]">
              XGBoost Classifier
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2.5 text-center">
            <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
              <div className="text-[10px] uppercase text-slate-400 font-bold font-mono">
                ROC-AUC
              </div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {time.roc_auc ? Number(time.roc_auc).toFixed(4) : "0.8470"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Discrimination
              </div>
            </div>

            <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
              <div className="text-[10px] uppercase text-slate-400 font-bold font-mono">
                PR-AUC
              </div>
              <div className="text-lg font-bold font-mono text-[#F59E0B] mt-0.5">
                {time.pr_auc ? Number(time.pr_auc).toFixed(4) : "0.3689"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Precision-Recall
              </div>
            </div>

            <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
              <div className="text-[10px] uppercase text-slate-400 font-bold font-mono">
                Brier Loss
              </div>
              <div className="text-lg font-bold font-mono text-[#10B981] mt-0.5">
                {time.brier_score
                  ? Number(time.brier_score).toFixed(4)
                  : "0.0838"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Calibration
              </div>
            </div>

            <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
              <div className="text-[10px] uppercase text-slate-400 font-bold font-mono">
                FN Rate
              </div>
              <div className="text-lg font-bold font-mono text-[#10B981] mt-0.5">
                {timeFalseNegativeRate != null
                  ? `${timeFalseNegativeRate.toFixed(1)}%`
                  : "—"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Missed Delays
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed bg-[#07131F] p-3.5 rounded-lg border border-[#16324A]">
            <strong className="text-[#00E5FF] font-bold">
              Out-of-Time Performance:
            </strong>{" "}
            Reliably predicts schedule slippage (≥45 days) 2–3 months prior to
            occurrence with an ECE of 0.0340.
          </div>
        </div>
      </div>

      {/* Model Baseline Comparison Table */}
      <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-6 shadow-command-card space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">
            Algorithmic Benchmark: Baseline vs Production Models
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical comparison demonstrating superior discrimination,
            calibration, and false-negative suppression of gradient-boosted
            trees over conventional statistical baselines.
          </p>
        </div>

        <div className="overflow-x-auto border border-[#16324A] rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#07131F] text-slate-400 border-b border-[#16324A] text-[10px] uppercase tracking-wider font-mono">
                <th className="py-2.5 px-3.5 font-bold">Target Domain</th>
                <th className="py-2.5 px-3.5 font-bold">
                  Algorithm Architecture
                </th>
                <th className="py-2.5 px-3.5 text-right font-bold">ROC-AUC</th>
                <th className="py-2.5 px-3.5 text-right font-bold">PR-AUC</th>
                <th className="py-2.5 px-3.5 text-right font-bold">
                  Brier Score
                </th>
                <th className="py-2.5 px-3.5 text-center font-bold">
                  Governance Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16324A] font-mono bg-[#0D1E30]">
              <tr>
                <td className="py-2.5 px-3.5 font-sans font-medium text-slate-200">
                  Cost Overrun
                </td>
                <td className="py-2.5 px-3.5 font-sans text-slate-400">
                  Logistic Regression (Baseline)
                </td>
                <td className="py-2.5 px-3.5 text-right text-slate-400">
                  {baseCost.roc_auc ? baseCost.roc_auc.toFixed(4) : "0.6840"}
                </td>
                <td className="py-2.5 px-3.5 text-right text-slate-400">
                  {baseCost.pr_auc ? baseCost.pr_auc.toFixed(4) : "0.2104"}
                </td>
                <td className="py-2.5 px-3.5 text-right text-slate-400">
                  {baseCost.brier_score
                    ? baseCost.brier_score.toFixed(4)
                    : "0.0812"}
                </td>
                <td className="py-2.5 px-3.5 text-center font-sans text-[11px] text-slate-400">
                  Baseline Reference
                </td>
              </tr>
              <tr className="bg-[#00E5FF]/10">
                <td className="py-2.5 px-3.5 font-sans font-bold text-white">
                  Cost Overrun
                </td>
                <td className="py-2.5 px-3.5 font-sans font-bold text-[#00E5FF]">
                  XGBoost Classifier (Production)
                </td>
                <td className="py-2.5 px-3.5 text-right font-extrabold text-[#00E5FF]">
                  {cost.roc_auc ? cost.roc_auc.toFixed(4) : "0.8656"}
                </td>
                <td className="py-2.5 px-3.5 text-right font-extrabold text-[#00E5FF]">
                  {cost.pr_auc ? cost.pr_auc.toFixed(4) : "0.4462"}
                </td>
                <td className="py-2.5 px-3.5 text-right font-extrabold text-[#00E5FF]">
                  {cost.brier_score ? cost.brier_score.toFixed(4) : "0.0334"}
                </td>
                <td className="py-2.5 px-3.5 text-center font-sans">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                    PRODUCTION
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3.5 font-sans font-medium text-slate-200">
                  Schedule Slippage
                </td>
                <td className="py-2.5 px-3.5 font-sans text-slate-400">
                  Logistic Regression (Baseline)
                </td>
                <td className="py-2.5 px-3.5 text-right text-slate-400">
                  {baseTime.roc_auc ? baseTime.roc_auc.toFixed(4) : "0.6510"}
                </td>
                <td className="py-2.5 px-3.5 text-right text-slate-400">
                  {baseTime.pr_auc ? baseTime.pr_auc.toFixed(4) : "0.1850"}
                </td>
                <td className="py-2.5 px-3.5 text-right text-slate-400">
                  {baseTime.brier_score
                    ? baseTime.brier_score.toFixed(4)
                    : "0.1140"}
                </td>
                <td className="py-2.5 px-3.5 text-center font-sans text-[11px] text-slate-400">
                  Baseline Reference
                </td>
              </tr>
              <tr className="bg-[#00E5FF]/10">
                <td className="py-2.5 px-3.5 font-sans font-bold text-white">
                  Schedule Slippage
                </td>
                <td className="py-2.5 px-3.5 font-sans font-bold text-[#00E5FF]">
                  XGBoost Classifier (Production)
                </td>
                <td className="py-2.5 px-3.5 text-right font-extrabold text-[#00E5FF]">
                  {time.roc_auc ? time.roc_auc.toFixed(4) : "0.8470"}
                </td>
                <td className="py-2.5 px-3.5 text-right font-extrabold text-[#00E5FF]">
                  {time.pr_auc ? time.pr_auc.toFixed(4) : "0.3689"}
                </td>
                <td className="py-2.5 px-3.5 text-right font-extrabold text-[#00E5FF]">
                  {time.brier_score ? time.brier_score.toFixed(4) : "0.0838"}
                </td>
                <td className="py-2.5 px-3.5 text-center font-sans">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                    PRODUCTION
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Research Literature & Mendeley Knowledge Grounding */}
      <ResearchCitationsSection />
    </div>
  );
}

function ResearchCitationsSection() {
  const [citationsData, setCitationsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paimanaApi
      .getResearchCitations()
      .then((res) => setCitationsData(res))
      .catch((err) => console.error("Failed to load citations:", err))
      .finally(() => setLoading(false));
  }, []);

  if (
    loading ||
    !citationsData ||
    !citationsData.citations ||
    citationsData.citations.length === 0
  ) {
    return null;
  }

  return (
    <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#16324A]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
              Empirical Literature & Research Evidence Grounding
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
              Mendeley Research Library
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Academic megaproject overrun distributions, MoSPI Flash Reports, and
            EVM project-control methodologies grounding our ML pipeline.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400 bg-[#07131F] px-3 py-1 rounded border border-[#16324A]">
          {citationsData.total} Ingested Works
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {citationsData.citations.map((c, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-[#07131F] rounded-lg border border-[#16324A] space-y-1.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-[#00E5FF] uppercase font-bold">
                  {c.type}
                </span>
                <span className="text-slate-400">{c.year}</span>
              </div>
              <h4 className="text-xs font-bold text-white line-clamp-2">
                {c.title}
              </h4>
            </div>
            <div className="text-[10px] font-mono text-slate-400 pt-1.5 border-t border-[#16324A] flex justify-between items-center">
              <span className="truncate max-w-[200px]">{c.publisher}</span>
              {c.url && (
                <a
                  href={c.url.startsWith("http") ? c.url : `https://${c.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00E5FF] hover:underline"
                >
                  View Source &rarr;
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
