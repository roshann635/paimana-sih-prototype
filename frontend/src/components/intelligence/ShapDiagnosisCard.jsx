import React from 'react';
import { Cpu, CheckCircle2, Info } from 'lucide-react';

export default function ShapDiagnosisCard({
  attributions = [],
  diagnosis,
  recommendations = [],
  projectName,
  compositeRisk = 0
}) {
  return (
    <div className="bg-gov-surface border border-gov-border rounded-gov p-6 shadow-gov space-y-6">
      {/* Intelligence Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gov-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-gov-sm bg-intel-light border border-[#C9DFDD] flex items-center justify-center text-intel">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              TreeSHAP Factor Attribution & Root-Cause Diagnosis
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Decomposition of risk drivers evaluated by out-of-time XGBoost gradient-boosted trees.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-intel-light rounded-gov-sm text-[11px] font-semibold text-intel border border-[#C9DFDD]">
          <Info className="w-3.5 h-3.5" />
          <span>Explainable ML Model</span>
        </div>
      </div>

      {/* Narrative Synthesis Memo */}
      <div className="p-4 bg-intel-light border border-[#C9DFDD] rounded-gov">
        <div className="text-[11px] font-bold uppercase tracking-wider text-intel mb-1.5">
          Administrative Diagnosis Memorandum
        </div>
        <p className="text-xs leading-relaxed text-text-primary">
          {diagnosis || (
            <>
              Schedule deterioration is the dominant contributor to current project risk. Disproportionate expenditure drawdowns relative to physical milestone completion further exacerbate capital exposure.
            </>
          )}
        </p>
        <div className="mt-2.5 text-[10px] text-text-muted italic">
          * Model inference is indicative and based on trajectory pattern recognition across historical MoSPI reporting cycles.
        </div>
      </div>

      {/* Horizontal Factor Attribution Bars */}
      <div>
        <div className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
          Top Risk Driving Factors (SHAP Values)
        </div>
        <div className="space-y-3.5">
          {attributions.length === 0 ? (
            <div className="text-xs text-text-muted py-4 text-center">
              No factor attributions computed for this snapshot.
            </div>
          ) : (
            attributions.slice(0, 5).map((attr, idx) => {
              const isPositive = attr.direction === '+' || attr.shap_value > 0;
              const absVal = Math.abs(attr.shap_value || 0.1);
              const barWidth = Math.min(100, Math.max(14, absVal * 280));

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text-primary">
                      {idx + 1}. {attr.display_name || attr.feature_name}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-text-secondary">
                      {isPositive ? `+${absVal.toFixed(3)}` : `-${absVal.toFixed(3)}`} ({attr.impact || (isPositive ? 'Increases Risk' : 'Mitigates Risk')})
                    </span>
                  </div>

                  <div className="w-full bg-gov-secondary h-2.5 rounded overflow-hidden flex border border-gov-border">
                    <div
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: isPositive ? '#C66A22' : '#3F7D58'
                      }}
                      className="h-full rounded-sm"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Prescriptive Directives Checklist */}
      {recommendations && recommendations.length > 0 && (
        <div className="pt-4 border-t border-gov-border">
          <div className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
            Recommended Administrative Directives
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-text-secondary bg-[#F7F7F4] p-3 rounded-gov-sm border border-gov-border">
                <CheckCircle2 className="w-4 h-4 text-intel shrink-0 mt-0.5" />
                <span className="text-text-primary">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
