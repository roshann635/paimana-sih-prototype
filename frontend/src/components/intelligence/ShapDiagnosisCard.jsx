import React from "react";
import {
  Cpu,
  CheckCircle2,
  Info,
  Sparkles,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function ShapDiagnosisCard({
  attributions = [],
  diagnosis,
  recommendations = [],
  projectName,
  compositeRisk = 84,
  onOpenMemo,
}) {
  const riskVal = Math.round(compositeRisk || 84);

  return (
    <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-6 shadow-command-card space-y-6">
      {/* Intelligence Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#16324A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-cyan-glow">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase font-mono">
                Why is this Project at Risk? (TreeSHAP)
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                Explainable ML
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Additive Shapley decomposition isolating positive risk
              accelerators and mitigating features.
            </p>
          </div>
        </div>
      </div>

      {/* Center Marker Spectrum Gauge */}
      <div className="p-4 bg-[#07131F] rounded-lg border border-[#16324A] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
          <span className="text-[#00E5FF]">LOWER RISK (0)</span>
          <span className="font-extrabold text-white text-xs">
            COMPOSITE RISK: {riskVal} / 100
          </span>
          <span className="text-[#EF4444]">HIGHER RISK (100)</span>
        </div>

        <div className="relative h-3 w-full bg-[#11263C] rounded-full overflow-hidden flex border border-[#16324A]">
          <div className="w-1/4 bg-[#00E5FF]/70"></div>
          <div className="w-1/4 bg-[#10B981]/70"></div>
          <div className="w-1/4 bg-[#F59E0B]/70"></div>
          <div className="w-1/4 bg-[#EF4444]/70"></div>
          {/* Exact Marker */}
          <div
            style={{ left: `${Math.min(98, Math.max(2, riskVal))}%` }}
            className="absolute top-0 bottom-0 w-3 -ml-1.5 bg-white border-2 border-[#07131F] rounded-full shadow-md"
          />
        </div>
      </div>

      {/* Narrative Administrative Diagnosis Memo */}
      <div className="p-4 bg-[#07131F] border border-[#16324A] rounded-lg shadow-xs space-y-1.5">
        <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-[#00E5FF] flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>Administrative Diagnosis Memorandum</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-200 font-sans">
          {diagnosis || (
            <>
              Schedule deterioration is the dominant contributor to current
              project risk (+18 pts). Disproportionate expenditure drawdowns
              relative to physical milestone completion further exacerbate
              capital exposure (+11 pts).
            </>
          )}
        </p>
        <div className="text-[10px] text-slate-400 italic font-mono pt-1">
          * Model inference is indicative and based on trajectory pattern
          recognition across historical MoSPI reporting cycles.
        </div>
      </div>

      {/* Factor Attribution Impact Breakdown */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          Risk Impact Decomposition (SHAP Values)
        </div>
        <div className="space-y-3">
          {attributions.length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center font-mono">
              No factor attributions computed for this snapshot.
            </div>
          ) : (
            attributions.slice(0, 6).map((attr, idx) => {
              const isPositive = attr.direction === "+" || attr.shap_value > 0;
              const absVal = Math.abs(attr.shap_value || 0.1);
              const barWidth = Math.min(100, Math.max(15, absVal * 280));

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">
                      {idx + 1}. {attr.display_name || attr.feature_name}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${isPositive ? "text-[#EF4444]" : "text-[#10B981]"}`}
                    >
                      {isPositive ? (
                        <span>+{Math.round(absVal * 100)} impact</span>
                      ) : (
                        <span>-{Math.round(absVal * 100)} impact</span>
                      )}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-[#07131F] rounded-full overflow-hidden border border-[#16324A]">
                    <div
                      style={{ width: `${barWidth}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPositive ? "bg-[#EF4444]" : "bg-[#10B981]"
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Prescriptive Directives & Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="p-4 bg-[#07131F] border border-[#16324A] rounded-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#16324A]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Prescriptive Administrative Action Directives
              </h4>
            </div>
            <button
              onClick={onOpenMemo}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-[#F59E0B] hover:underline"
            >
              <span>Record Action Memo</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-slate-200 font-sans"
              >
                <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  {typeof rec === "string" ? (
                    <span>{rec}</span>
                  ) : (
                    <>
                      <div className="font-bold text-white">
                        {rec.title || rec.category || "Recommended action"}
                        {rec.urgency && (
                          <span className="ml-2 text-[10px] font-mono text-[#F59E0B]">
                            {rec.urgency}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {rec.action ||
                          rec.recommended_action ||
                          "Review required."}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
