import React, { useState, useEffect } from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { paimanaApi } from "../../services/api/paimanaApi";

export default function DigitalProjectTimeline({ projectId }) {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      paimanaApi
        .getProjectTimeline(projectId)
        .then((data) => setTimelineData(data))
        .catch((err) => console.error("Failed to load project timeline:", err))
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card text-center font-mono text-xs text-slate-400">
        Reconstructing Digital Project Timeline & Milestone Deviation points...
      </div>
    );
  }

  if (!timelineData || !timelineData.milestones) {
    return null;
  }

  const milestones = timelineData.milestones || [];
  const firstDev = timelineData.first_deviation;
  const trend = timelineData.trend_direction || "stable";
  const confidence = timelineData.data_confidence_score || 94.0;

  return (
    <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card space-y-5 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#16324A]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-cyan-glow">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                Digital Project Timeline & Deviation Analysis
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                Timeline Reconstruction
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tracks the first point of milestone divergence, schedule
              trajectory, and baseline execution phases.
            </p>
          </div>
        </div>

        {/* Confidence & Trend Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#07131F] border border-[#16324A]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-slate-400">Data Confidence:</span>
            <strong className="text-white font-bold">
              {confidence.toFixed(0)}%
            </strong>
          </div>

          <div
            className={`px-2.5 py-1 rounded border font-bold text-[11px] ${
              trend === "worsening"
                ? "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40"
                : trend === "recovering"
                  ? "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40"
                  : "bg-[#07131F] text-slate-300 border-[#16324A]"
            }`}
          >
            {trend === "worsening"
              ? "↑ Trajectory Worsening"
              : trend === "recovering"
                ? "↓ Recovering"
                : "↔ Stable Trajectory"}
          </div>
        </div>
      </div>

      {/* First Point of Deviation Callout Banner */}
      {firstDev && firstDev.delay_days > 0 && (
        <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#EF4444] shrink-0" />
            <div>
              <span className="font-mono font-bold text-[#EF4444]">
                First Point of Deviation Detected:{" "}
              </span>
              <strong className="text-white font-mono">
                {firstDev.report_month}
              </strong>
              <span className="text-slate-300 font-sans">
                {" "}
                — {firstDev.trigger_cause} (Delay: {firstDev.delay_days} days,
                SPI: {firstDev.spi})
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#07131F] text-[#EF4444] rounded border border-[#EF4444]/40 shrink-0">
            Initial Drift Origin
          </span>
        </div>
      )}

      {/* Horizontal Milestone Tracker Flow */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center min-w-[720px] gap-2 pt-2">
          {milestones.map((m, idx) => {
            const isDev = m.is_deviation;
            const isLast = idx === milestones.length - 1;

            return (
              <React.Fragment key={idx}>
                {/* Milestone Node */}
                <div
                  className={`p-3 rounded-lg border flex-1 min-w-[140px] space-y-1.5 transition-all ${
                    isDev
                      ? "bg-[#EF4444]/15 border-[#EF4444] shadow-red-glow"
                      : m.phase === "COMPLETION"
                        ? "bg-[#07131F] border-[#16324A] border-dashed"
                        : "bg-[#07131F] border-[#16324A]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 font-bold uppercase">
                      {m.phase}
                    </span>
                    <span
                      className={
                        isDev ? "text-[#EF4444] font-bold" : "text-slate-400"
                      }
                    >
                      {m.date}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white truncate font-sans">
                    {m.title}
                  </div>

                  {m.phase === "SNAPSHOT" && (
                    <div className="text-[10px] font-mono text-slate-400 space-y-0.5 pt-1 border-t border-[#16324A]">
                      <div className="flex justify-between">
                        <span>Physical:</span>
                        <strong className="text-[#00E5FF]">
                          {m.physical_progress?.toFixed(0)}%
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>SPI / CPI:</span>
                        <strong
                          className={
                            m.spi < 0.85 ? "text-[#EF4444]" : "text-white"
                          }
                        >
                          {m.spi} / {m.cpi}
                        </strong>
                      </div>
                    </div>
                  )}

                  {m.phase === "SANCTION" && (
                    <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-[#16324A]">
                      Sanctioned: ₹{Number(m.cost_cr).toFixed(0)} Cr
                    </div>
                  )}

                  {m.phase === "COMPLETION" && (
                    <div className="text-[10px] font-mono text-[#F59E0B] pt-1 border-t border-[#16324A]">
                      +{m.delay_days} days delay
                    </div>
                  )}
                </div>

                {/* Connector Arrow */}
                {!isLast && (
                  <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
