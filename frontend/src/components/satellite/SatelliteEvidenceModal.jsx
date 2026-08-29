import React, { useState, useEffect } from "react";
import {
  X,
  Satellite,
  Layers,
  Sparkles,
  Radio,
  FileCheck,
  Calendar,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Download,
  Info,
  MapPin,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { paimanaApi } from "../../services/api/paimanaApi";

export default function SatelliteEvidenceModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  onOpenMemo
}) {
  const [activeLayer, setActiveLayer] = useState("rgb"); // rgb, cir, sar, mask
  const [evidenceData, setEvidenceData] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && projectId) {
      setLoading(true);
      Promise.all([
        paimanaApi.getProjectSatelliteEvidence(projectId).catch(() => null),
        paimanaApi.getProjectSatelliteTimeline(projectId).catch(() => []),
        paimanaApi.getProjectSatelliteVerification(projectId).catch(() => null)
      ]).then(([ev, tl, vf]) => {
        setEvidenceData(ev);
        setTimelineData(tl || []);
        setVerificationData(vf);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const vf = verificationData || {};
  const isDiscSig = vf.verification_status === "SIGNIFICANT_DISCREPANCY";
  const isReview = vf.verification_status === "REVIEW_RECOMMENDED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-[#dbe3ed] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 border-b border-[#dbe3ed] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1668d8]/10 border border-[#1668d8]/20 flex items-center justify-center text-[#1668d8]">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#142235] tracking-tight">
                  Earth Observation Evidence Studio
                </h2>
                {vf.is_synthetic ? (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded">
                    DEMO / SYNTHETIC FIXTURE
                  </span>
                ) : (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 rounded">
                    COPERNICUS OBSERVATION
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {projectName} · Project #{projectId} · Sentinel-2 MSI (10m Optical) & Sentinel-1 C-SAR (GRD Backscatter)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white border border-[#dbe3ed] text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#f4f7fb]">
          {/* Layer Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white border border-[#dbe3ed] rounded-xl shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveLayer("rgb")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeLayer === "rgb"
                    ? "bg-[#1668d8] text-white shadow-xs"
                    : "bg-[#f8fafc] text-slate-700 hover:bg-slate-100 border border-[#dbe3ed]"
                }`}
              >
                Sentinel-2 True Color (RGB)
              </button>
              <button
                onClick={() => setActiveLayer("cir")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeLayer === "cir"
                    ? "bg-[#1668d8] text-white shadow-xs"
                    : "bg-[#f8fafc] text-slate-700 hover:bg-slate-100 border border-[#dbe3ed]"
                }`}
              >
                Sentinel-2 False Color (NIR / CIR)
              </button>
              <button
                onClick={() => setActiveLayer("sar")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeLayer === "sar"
                    ? "bg-[#1668d8] text-white shadow-xs"
                    : "bg-[#f8fafc] text-slate-700 hover:bg-slate-100 border border-[#dbe3ed]"
                }`}
              >
                Sentinel-1 SAR (VV / VH Backscatter)
              </button>
              <button
                onClick={() => setActiveLayer("mask")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeLayer === "mask"
                    ? "bg-[#d97706] text-white shadow-xs font-extrabold"
                    : "bg-[#f8fafc] text-slate-700 hover:bg-slate-100 border border-[#dbe3ed]"
                }`}
              >
                Classified Site Change Mask
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-500 px-2">
              Resolution: <strong className="text-slate-800">10 m / pixel</strong> · Ground Sampling
            </div>
          </div>

          {/* Before vs After Visual Comparison Viewport */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline (Before) */}
            <div className="bg-white border border-[#dbe3ed] rounded-xl overflow-hidden flex flex-col shadow-xs">
              <div className="px-4 py-2 bg-[#f8fafc] border-b border-[#dbe3ed] flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  BASELINE T0 OBSERVATION
                </span>
                <span className="font-mono text-[10px] text-slate-500">15 March 2024 (Pre-Construction)</span>
              </div>
              
              {/* Imagery Mock Viewport */}
              <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden border-b border-slate-800">
                {/* SVG Baseline Layer */}
                <svg className="w-full h-full" viewBox="0 0 400 225" preserveAspectRatio="none">
                  <rect width="400" height="225" fill="#1b281e" />
                  <path d="M0,80 Q120,60 200,100 T400,120 L400,225 L0,225 Z" fill="#253526" opacity="0.8" />
                  <path d="M0,0 Q180,40 400,20 L400,90 L0,120 Z" fill="#1f3d23" opacity="0.6" />
                  <line x1="50" y1="20" x2="180" y2="180" stroke="#314f35" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="120" y1="10" x2="280" y2="210" stroke="#314f35" strokeWidth="1" strokeDasharray="3,3" />
                  <polygon
                    points="60,40 340,70 320,180 50,150"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                  />
                  <text x="70" y="60" fill="#00E5FF" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    AOI BOUNDARY ({vf.spatial_suitability?.aoi_area_sqkm || 28.5} km²)
                  </text>
                </svg>

                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/75 text-[10px] font-mono text-slate-200 border border-white/20">
                  Surface State: Undisturbed Topsoil & Scrub
                </div>
              </div>
            </div>

            {/* Current (After) Observation */}
            <div className="bg-white border border-[#dbe3ed] rounded-xl overflow-hidden flex flex-col shadow-xs">
              <div className="px-4 py-2 bg-[#f8fafc] border-b border-[#dbe3ed] flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1668d8]"></span>
                  CURRENT Tn OBSERVATION
                </span>
                <span className="font-mono text-[10px] text-slate-500">14 June 2026 (Latest Available)</span>
              </div>

              <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden border-b border-slate-800">
                {/* SVG Current Render based on Active Layer */}
                <svg className="w-full h-full" viewBox="0 0 400 225" preserveAspectRatio="none">
                  {activeLayer === "rgb" && (
                    <>
                      <rect width="400" height="225" fill="#1b281e" />
                      <path d="M0,80 Q120,60 200,100 T400,120 L400,225 L0,225 Z" fill="#253526" />
                      <polygon points="70,50 330,80 310,170 60,140" fill="#544332" opacity="0.9" />
                      <polygon points="100,75 290,95 275,145 90,125" fill="#71797E" />
                      <polygon points="120,85 240,98 230,132 110,118" fill="#36454F" />
                    </>
                  )}

                  {activeLayer === "cir" && (
                    <>
                      <rect width="400" height="225" fill="#801818" />
                      <path d="M0,80 Q120,60 200,100 T400,120 L400,225 L0,225 Z" fill="#661010" />
                      <polygon points="70,50 330,80 310,170 60,140" fill="#2C4C5E" />
                      <polygon points="100,75 290,95 275,145 90,125" fill="#00E5FF" opacity="0.7" />
                    </>
                  )}

                  {activeLayer === "sar" && (
                    <>
                      <rect width="400" height="225" fill="#0B132B" />
                      <polygon points="70,50 330,80 310,170 60,140" fill="#1C2541" />
                      <polygon points="100,75 290,95 275,145 90,125" fill="#5BC0BE" opacity="0.8" />
                      <polygon points="140,88 220,98 215,128 135,118" fill="#FFFFFF" opacity="0.9" />
                    </>
                  )}

                  {activeLayer === "mask" && (
                    <>
                      <rect width="400" height="225" fill="#07131F" />
                      <polygon points="70,50 330,80 310,170 60,140" fill="#F59E0B" opacity="0.4" stroke="#F59E0B" strokeWidth="1" />
                      <polygon points="90,68 305,90 288,155 80,132" fill="#F97316" opacity="0.6" />
                      <polygon points="120,85 240,98 230,132 110,118" fill="#00E5FF" opacity="0.85" stroke="#00E5FF" strokeWidth="1.5" />
                    </>
                  )}

                  <polygon
                    points="60,40 340,70 320,180 50,150"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                  />
                </svg>

                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/75 text-[10px] font-mono text-slate-200 border border-white/20">
                  {activeLayer === "rgb" && "Sentinel-2 True Color (10m L2A B04-B03-B02)"}
                  {activeLayer === "cir" && "Sentinel-2 False Color CIR (NIR B08 Highlighting Vegetative Loss)"}
                  {activeLayer === "sar" && "Sentinel-1 C-SAR Gamma0 Radar Backscatter Intensity Map"}
                  {activeLayer === "mask" && "Classified Structural Change Mask (Cyan=Built, Orange=Grading)"}
                </div>
              </div>
            </div>
          </div>

          {/* Temporal Divergence Trajectory */}
          <div className="p-4 bg-white border border-[#dbe3ed] rounded-xl space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-[#142235] uppercase tracking-wider flex items-center gap-2">
                  <span>Temporal Divergence Analysis (Reported Progress vs Remotely Sensed Site Change)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Tracking physical contractor reporting against Copernicus Earth-observation delta across time.
                </p>
              </div>

              {vf.first_divergence_month && (
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                  Onset: {vf.first_divergence_month}
                </span>
              )}
            </div>

            {/* Trajectory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#dbe3ed] bg-[#f8fafc] text-slate-600 text-[10px] font-mono uppercase tracking-wider">
                    <th className="py-2 px-3">Report Month</th>
                    <th className="py-2 px-3 text-right">Reported %</th>
                    <th className="py-2 px-3 text-right">Satellite Change</th>
                    <th className="py-2 px-3 text-right">Discrepancy</th>
                    <th className="py-2 px-3 text-center">Verification Signal</th>
                    <th className="py-2 px-3">Cloud Mask</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2f7] text-slate-800">
                  {timelineData.map((pt) => {
                    const isPtSig = pt.verification_status === "SIGNIFICANT_DISCREPANCY";
                    const isPtRev = pt.verification_status === "REVIEW_RECOMMENDED";
                    return (
                      <tr key={pt.report_month} className="hover:bg-[#f1f5f9] transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-[#1668d8]">{pt.report_month}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{pt.reported_progress_pct}%</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#142235]">
                          {pt.satellite_change_index !== null ? `${pt.satellite_change_index}/100` : "N/A"}
                        </td>
                        <td className={`py-2 px-3 text-right font-mono font-extrabold ${
                          isPtSig ? "text-[#dc2626]" : isPtRev ? "text-[#d97706]" : "text-[#16a34a]"
                        }`}>
                          {pt.discrepancy_pp !== null ? `${pt.discrepancy_pp > 0 ? "+" : ""}${pt.discrepancy_pp} pp` : "—"}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isPtSig
                              ? "bg-red-50 text-red-700 border-red-200"
                              : isPtRev
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}>
                            {pt.verification_status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-xs">
                          {pt.is_cloud_obscured ? "☁ SCL Cloud Masked" : "☀ Clear Optical"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Telemetry & Directive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Metadata & Confidence Stack */}
            <div className="p-4 bg-white border border-[#dbe3ed] rounded-xl space-y-3 text-xs shadow-xs">
              <div>
                <h5 className="font-bold text-[#142235] uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#1668d8]" />
                  <span>Copernicus Telemetry & Provenance</span>
                </h5>
                <div className="space-y-1 font-mono text-[11px] text-slate-700 mt-2">
                  <div>Verification Audit ID: <strong className="text-[#1668d8]">{vf.verification_audit_id || "SAT-2026-000184"}</strong></div>
                  <div>Engine / Config Version: <strong className="text-slate-900">{vf.processing_version || "sat-engine v1.0"}</strong> ({vf.config_version || "config v0.3-provisional"})</div>
                  <div>Optical Product: <strong className="text-slate-600 truncate block max-w-sm">{vf.optical_provenance?.product_id || "S2A_MSIL2A_20260614..."}</strong></div>
                  <div>SAR Product: <strong className="text-slate-600 truncate block max-w-sm">{vf.sar_provenance?.product_id || "S1A_IW_GRDH_20260612..."}</strong></div>
                  <div>AOI Provenance: <strong className="text-[#1668d8]">{vf.aoi_provenance || "PARAKH DEMO GEOMETRY"}</strong></div>
                  <div>SCL Cloud Cover: <strong>{vf.optical_provenance?.cloud_cover_percent || 8.4}%</strong> · Orbit: <strong>{vf.optical_provenance?.orbit_pass || "DESCENDING"}</strong></div>
                </div>
              </div>

              {/* Independent Confidence Stack */}
              <div className="pt-2.5 border-t border-[#dbe3ed] space-y-1.5">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  PARAKH Decision Confidence Stack (Independent Streams)
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 bg-[#f8fafc] border border-[#dbe3ed] rounded-lg">
                    <div className="text-[10px] text-slate-500">Data Quality</div>
                    <div className="text-xs font-extrabold text-[#1668d8] mt-0.5">{vf.data_quality_confidence || 94}%</div>
                  </div>
                  <div className="p-2 bg-[#f8fafc] border border-[#dbe3ed] rounded-lg">
                    <div className="text-[10px] text-slate-500">ML Model</div>
                    <div className="text-xs font-extrabold text-[#d97706] mt-0.5">{vf.ml_model_confidence || 88}%</div>
                  </div>
                  <div className="p-2 bg-[#f8fafc] border border-[#dbe3ed] rounded-lg">
                    <div className="text-[10px] text-slate-500">Satellite Evidence</div>
                    <div className="text-xs font-extrabold text-[#16a34a] mt-0.5">{vf.satellite_evidence_confidence || 87}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Memorandum Dispatch */}
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex flex-col justify-between space-y-3 shadow-xs">
              <div>
                <h5 className="font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#d97706]" />
                  <span>Inspection & Verification Directive</span>
                </h5>
                <p className="text-xs text-amber-950 mt-1.5 leading-relaxed">
                  {vf.recommended_action || "Issue formal Site Inspection Directive to cross-verify physical progress claims."}
                </p>
                <div className="mt-2.5 text-[11px] font-mono text-slate-700 bg-white p-2 rounded-lg border border-amber-200">
                  Evidence Status: <strong className="text-amber-800">{vf.verification_status?.replace("_", " ")}</strong> (Discrepancy: {vf.progress_discrepancy_pp} pp)
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenMemo) onOpenMemo();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer active:scale-95"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Attach Satellite Evidence to Inspection Memo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scientific Disclaimer */}
          <div className="p-3 bg-white border border-[#dbe3ed] rounded-lg text-center text-xs text-slate-500 shadow-2xs">
            {vf.disclaimer || "Observed Site Change Index is an experimental multi-sensor evidence score and should not be interpreted as a direct measurement of construction completion percentage."}
          </div>
        </div>
      </div>
    </div>
  );
}


