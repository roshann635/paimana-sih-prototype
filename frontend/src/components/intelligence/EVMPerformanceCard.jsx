import React from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function EVMPerformanceCard({
  snapshot = {},
  prediction = {},
  originalCost = 0,
  onOpenMemo,
  onScrollToExplainability,
}) {
  const snap = snapshot || {};
  const pred = prediction || {};

  const revisedCost = snap.revised_cost || originalCost || 100.0;
  const physProg =
    snap.physical_progress_pct != null ? snap.physical_progress_pct : 45.0;
  const planProg =
    snap.planned_progress_pct != null ? snap.planned_progress_pct : 60.0;
  const cumExp =
    snap.cumulative_expenditure != null
      ? snap.cumulative_expenditure
      : revisedCost * 0.7;
  const expUtilization = revisedCost > 0 ? (cumExp / revisedCost) * 100.0 : 0.0;

  // EVM Calculations
  const pv =
    snap.pv != null && snap.pv > 0 ? snap.pv : revisedCost * (planProg / 100.0);
  const ev =
    snap.ev != null && snap.ev > 0 ? snap.ev : revisedCost * (physProg / 100.0);
  const ac = snap.ac != null && snap.ac > 0 ? snap.ac : cumExp;
  const sv = snap.sv != null ? snap.sv : ev - pv;
  const cv = snap.cv != null ? snap.cv : ev - ac;
  const spi =
    snap.spi != null
      ? snap.spi
      : pv > 0
        ? Math.min(2.5, Math.max(0.05, ev / pv))
        : 1.0;
  const cpi =
    snap.cpi != null
      ? snap.cpi
      : ac > 0
        ? Math.min(2.5, Math.max(0.05, ev / ac))
        : 1.0;
  const criticalRatio =
    snap.critical_ratio != null ? snap.critical_ratio : spi * cpi;

  // Status Tiers
  const isSpiCritical = spi < 0.85;
  const isSpiWarning = spi >= 0.85 && spi < 1.0;
  const isCpiCritical = cpi < 0.9;
  const isCpiWarning = cpi >= 0.9 && cpi < 1.0;
  const isDrawdownOutpacing = ac > ev * 1.2;

  return (
    <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card space-y-5 text-slate-200">
      {/* 1. Header with Project Health Tier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#16324A]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-cyan-glow">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                Objective EVM Performance Layer
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                Earned Value Analytics
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Automated Earned Value Management baseline and performance indices
              per MoSPI guidelines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-slate-400">
            Critical Ratio (CR):
          </span>
          <span
            className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${
              criticalRatio < 0.8
                ? "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40"
                : criticalRatio < 1.0
                  ? "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40"
                  : "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40"
            }`}
          >
            {criticalRatio.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 2. Three-Way Progress & Expenditure Distribution Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-[#07131F] rounded-lg border border-[#16324A]">
        {/* Physical Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-400">Actual Physical Progress</span>
            <span className="text-white font-bold">{physProg.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-[#11263C] rounded-full overflow-hidden border border-[#16324A]">
            <div
              style={{ width: `${Math.min(100, Math.max(0, physProg))}%` }}
              className="h-full bg-[#00E5FF] rounded-full"
            />
          </div>
        </div>

        {/* Planned Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-400">Target Planned Progress</span>
            <span className="text-[#F59E0B] font-bold">
              {planProg.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full bg-[#11263C] rounded-full overflow-hidden border border-[#16324A]">
            <div
              style={{ width: `${Math.min(100, Math.max(0, planProg))}%` }}
              className="h-full bg-[#F59E0B] rounded-full"
            />
          </div>
        </div>

        {/* Cumulative Capex Drawn */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-400">Expenditure Utilization</span>
            <span className="text-[#EF4444] font-bold">
              {expUtilization.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full bg-[#11263C] rounded-full overflow-hidden border border-[#16324A]">
            <div
              style={{
                width: `${Math.min(100, Math.max(0, expUtilization))}%`,
              }}
              className="h-full bg-[#EF4444] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* 3. EVM Performance Metrics Grid: PV, EV, AC + SPI, CPI, SV, CV */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* PV: Planned Value */}
        <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
            Planned Value (PV)
          </div>
          <div className="text-lg font-mono font-bold text-white mt-1">
            ₹
            {Number(pv).toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
            Cr
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Budgeted work scheduled
          </div>
        </div>

        {/* EV: Earned Value */}
        <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
            Earned Value (EV)
          </div>
          <div className="text-lg font-mono font-bold text-[#00E5FF] mt-1">
            ₹
            {Number(ev).toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
            Cr
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Budgeted work performed
          </div>
        </div>

        {/* AC: Actual Cost */}
        <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
            Actual Cost (AC)
          </div>
          <div className="text-lg font-mono font-bold text-[#F59E0B] mt-1">
            ₹
            {Number(ac).toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
            Cr
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Cumulative expenditure
          </div>
        </div>

        {/* Schedule Variance (SV) */}
        <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
            Schedule Variance (SV)
          </div>
          <div
            className={`text-lg font-mono font-bold mt-1 ${sv < 0 ? "text-[#EF4444]" : "text-[#10B981]"}`}
          >
            {sv < 0
              ? `-₹${Math.abs(sv).toLocaleString(undefined, { maximumFractionDigits: 1 })} Cr`
              : `+₹${sv.toLocaleString(undefined, { maximumFractionDigits: 1 })} Cr`}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            EV − PV ({sv < 0 ? "Behind Schedule" : "Ahead"})
          </div>
        </div>

        {/* SPI: Schedule Performance Index */}
        <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              SPI Index
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${isSpiCritical ? "bg-[#EF4444] shadow-red-glow" : isSpiWarning ? "bg-[#F59E0B]" : "bg-[#10B981]"}`}
            />
          </div>
          <div
            className={`text-xl font-mono font-extrabold mt-1 ${isSpiCritical ? "text-[#EF4444]" : isSpiWarning ? "text-[#F59E0B]" : "text-[#10B981]"}`}
          >
            {spi.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {isSpiCritical
              ? "🔴 Schedule Review (< 0.85)"
              : isSpiWarning
                ? "🟡 Schedule Lag (< 1.0)"
                : "🟢 On Schedule (≥ 1.0)"}
          </div>
        </div>

        {/* CPI: Cost Performance Index */}
        <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              CPI Index
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${isCpiCritical ? "bg-[#EF4444] shadow-red-glow" : isCpiWarning ? "bg-[#F59E0B]" : "bg-[#10B981]"}`}
            />
          </div>
          <div
            className={`text-xl font-mono font-extrabold mt-1 ${isCpiCritical ? "text-[#EF4444]" : isCpiWarning ? "text-[#F59E0B]" : "text-[#10B981]"}`}
          >
            {cpi.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {isCpiCritical
              ? "🔴 Cost Inefficient (< 0.90)"
              : isCpiWarning
                ? "🟡 Cost Strain (< 1.0)"
                : "🟢 Cost Efficient (≥ 1.0)"}
          </div>
        </div>

        {/* Cost Variance (CV) */}
        <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
            Cost Variance (CV)
          </div>
          <div
            className={`text-lg font-mono font-bold mt-1 ${cv < 0 ? "text-[#EF4444]" : "text-[#10B981]"}`}
          >
            {cv < 0
              ? `-₹${Math.abs(cv).toLocaleString(undefined, { maximumFractionDigits: 1 })} Cr`
              : `+₹${cv.toLocaleString(undefined, { maximumFractionDigits: 1 })} Cr`}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            EV − AC ({cv < 0 ? "Cost Overrun" : "Under Budget"})
          </div>
        </div>

        {/* Progress Gap */}
        <div className="p-3 bg-[#07131F] rounded-lg border border-[#16324A]">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
            Progress Gap
          </div>
          <div
            className={`text-lg font-mono font-bold mt-1 ${physProg - planProg < 0 ? "text-[#EF4444]" : "text-[#10B981]"}`}
          >
            {(physProg - planProg).toFixed(1)}% pts
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Physical vs Planned
          </div>
        </div>
      </div>

      {/* 4. AI Early Warning Synthesis Callout Box */}
      <div className="p-3.5 bg-[#07131F] border border-[#16324A] rounded-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              EVM-Informed Predictive Early Warning
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Calibrated XGBoost + TreeSHAP Synthesis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="space-y-1 font-sans text-slate-300">
            {isSpiCritical && (
              <div className="flex items-center gap-1.5 text-[#EF4444]">
                <span>•</span>
                <span>
                  Schedule deterioration detected: Earned progress lagging plan
                  by ₹{Math.abs(sv).toFixed(1)} Cr (SPI: {spi.toFixed(2)})
                </span>
              </div>
            )}
            {isCpiCritical && (
              <div className="flex items-center gap-1.5 text-[#EF4444]">
                <span>•</span>
                <span>
                  Cost efficiency deteriorating: Yielding only ₹{cpi.toFixed(2)}{" "}
                  of earned output per ₹1.00 spent (CPI: {cpi.toFixed(2)})
                </span>
              </div>
            )}
            {isDrawdownOutpacing && (
              <div className="flex items-center gap-1.5 text-[#F59E0B]">
                <span>•</span>
                <span>
                  Financial expenditure is significantly outpacing physical
                  milestone verification.
                </span>
              </div>
            )}
            {!isSpiCritical && !isCpiCritical && (
              <div className="flex items-center gap-1.5 text-[#10B981]">
                <span>•</span>
                <span>
                  Project EVM parameters operate within normal monitoring
                  thresholds.
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center sm:items-end gap-2 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Future Delay Risk:</span>
              <strong className="text-[#EF4444] font-bold">
                {Math.round((pred.time_risk_probability || 0.71) * 100)}%
              </strong>
              <span className="text-slate-400">|</span>
              <span className="text-slate-400">Cost Overrun Risk:</span>
              <strong className="text-[#F97316] font-bold">
                {Math.round((pred.cost_risk_probability || 0.78) * 100)}%
              </strong>
            </div>

            <div className="flex items-center gap-2 mt-1">
              {onOpenMemo && (
                <button
                  onClick={onOpenMemo}
                  className="px-3 py-1 bg-[#F59E0B] text-[#07131F] text-[10px] font-mono font-bold rounded shadow-gold-glow hover:bg-[#D97706] transition-colors"
                >
                  Create Action Memorandum
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
