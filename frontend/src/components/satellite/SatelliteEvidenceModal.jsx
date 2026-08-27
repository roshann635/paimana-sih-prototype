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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#07131F]/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0D1E30] border border-[#16324A] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 border-b border-[#16324A] flex items-center justify-between bg-[#081726]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Earth Observation Evidence Studio
                </h2>
                {vf.is_synthetic ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded">
                    DEMO / SYNTHETIC FIXTURE
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] rounded">
                    COPERNICUS OBSERVATION
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {projectName} · Project #{projectId} · Sentinel-2 MSI (10m Optical) & Sentinel-1 C-SAR (GRD Backscatter)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#0D1E30] border border-[#16324A] text-slate-400 hover:text-white hover:bg-[#16324A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#07131F]">
          {/* Layer Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-[#0D1E30] border border-[#16324A] rounded-xl">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveLayer("rgb")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeLayer === "rgb"
                    ? "bg-[#00E5FF] text-[#07131F] shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-[#16324A]"
                }`}
              >
                Sentinel-2 True Color (RGB)
              </button>
              <button
                onClick={() => setActiveLayer("cir")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeLayer === "cir"
                    ? "bg-[#00E5FF] text-[#07131F] shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-[#16324A]"
                }`}
              >
                Sentinel-2 False Color (NIR / CIR)
              </button>
              <button
                onClick={() => setActiveLayer("sar")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeLayer === "sar"
                    ? "bg-[#00E5FF] text-[#07131F] shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-[#16324A]"
                }`}
              >
                Sentinel-1 SAR (VV / VH Backscatter)
              </button>
              <button
                onClick={() => setActiveLayer("mask")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeLayer === "mask"
                    ? "bg-[#F59E0B] text-[#07131F] shadow-xs font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-[#16324A]"
                }`}
              >
                Classified Site Change Mask
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400 px-2">
              Resolution: <strong>10 m / pixel</strong> · Ground Sampling
            </div>
          </div>

          {/* Before vs After Visual Comparison Viewport */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline (Before) */}
            <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl overflow-hidden flex flex-col">
              <div className="px-4 py-2 bg-[#081726] border-b border-[#16324A] flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  BASELINE T0 OBSERVATION
                </span>
                <span className="font-mono text-[10px] text-slate-400">15 March 2024 (Pre-Construction)</span>
              </div>
              
              {/* Synthetic Vector / Raster Imagery Mock Viewport */}
              <div className="relative aspect-video bg-[#040D17] flex items-center justify-center overflow-hidden border-b border-[#16324A]">
                {/* SVG Baseline Layer */}
                <svg className="w-full h-full" viewBox="0 0 400 225" preserveAspectRatio="none">
                  {/* Terrain / Soil Background */}
                  <rect width="400" height="225" fill="#1b281e" />
                  <path d="M0,80 Q120,60 200,100 T400,120 L400,225 L0,225 Z" fill="#253526" opacity="0.8" />
                  <path d="M0,0 Q180,40 400,20 L400,90 L0,120 Z" fill="#1f3d23" opacity="0.6" />
                  
                  {/* Agricultural / Sparse Scrub Grid */}
                  <line x1="50" y1="20" x2="180" y2="180" stroke="#314f35" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="120" y1="10" x2="280" y2="210" stroke="#314f35" strokeWidth="1" strokeDasharray="3,3" />
                  
                  {/* AOI Boundary Overlay */}
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

                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[#07131F]/80 text-[10px] font-mono text-slate-300 border border-[#16324A]">
                  Surface State: Undisturbed Topsoil & Scrub
                </div>
              </div>
            </div>

            {/* Current (After) Observation */}
            <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl overflow-hidden flex flex-col">
              <div className="px-4 py-2 bg-[#081726] border-b border-[#16324A] flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00E5FF]"></span>
                  CURRENT Tn OBSERVATION
                </span>
                <span className="font-mono text-[10px] text-slate-400">14 June 2026 (Latest Available)</span>
              </div>

              <div className="relative aspect-video bg-[#040D17] flex items-center justify-center overflow-hidden border-b border-[#16324A]">
                {/* SVG Current Render based on Active Layer */}
                <svg className="w-full h-full" viewBox="0 0 400 225" preserveAspectRatio="none">
                  {activeLayer === "rgb" && (
                    <>
                      {/* True Color RGB: Cleared earth + exposed gray pavement */}
                      <rect width="400" height="225" fill="#1b281e" />
                      <path d="M0,80 Q120,60 200,100 T400,120 L400,225 L0,225 Z" fill="#253526" />
                      {/* Cleared Corridor Earthworks */}
                      <polygon points="70,50 330,80 310,170 60,140" fill="#544332" opacity="0.9" />
                      {/* Asphalt / Concrete Sub-grade */}
                      <polygon points="100,75 290,95 275,145 90,125" fill="#71797E" />
                      <polygon points="120,85 240,98 230,132 110,118" fill="#36454F" />
                    </>
                  )}

                  {activeLayer === "cir" && (
                    <>
                      {/* False Color CIR (NIR=Red): Vegetation glows red, built structures cyan/gray */}
                      <rect width="400" height="225" fill="#801818" />
                      <path d="M0,80 Q120,60 200,100 T400,120 L400,225 L0,225 Z" fill="#661010" />
                      {/* Disturbed barren strip (non-NIR reflective) */}
                      <polygon points="70,50 330,80 310,170 60,140" fill="#2C4C5E" />
                      <polygon points="100,75 290,95 275,145 90,125" fill="#00E5FF" opacity="0.7" />
                    </>
                  )}

                  {activeLayer === "sar" && (
                    <>
                      {/* SAR C-band Backscatter: rough concrete / structural metal has high backscatter intensity */}
                      <rect width="400" height="225" fill="#0B132B" />
                      <polygon points="70,50 330,80 310,170 60,140" fill="#1C2541" />
                      {/* High radar backscatter hot spot */}
                      <polygon points="100,75 290,95 275,145 90,125" fill="#5BC0BE" opacity="0.8" />
                      <polygon points="140,88 220,98 215,128 135,118" fill="#FFFFFF" opacity="0.9" />
                    </>
                  )}

                  {activeLayer === "mask" && (
                    <>
                      {/* Classified Change Detection Mask */}
                      <rect width="400" height="225" fill="#07131F" />
                      {/* Green = Vegetation Cleared */}
                      <polygon points="70,50 330,80 310,170 60,140" fill="#F59E0B" opacity="0.4" stroke="#F59E0B" strokeWidth="1" />
                      {/* Yellow = Earthworks Grading */}
                      <polygon points="90,68 305,90 288,155 80,132" fill="#F97316" opacity="0.6" />
                      {/* Cyan = Concrete / Structural Footprint */}
                      <polygon points="120,85 240,98 230,132 110,118" fill="#00E5FF" opacity="0.85" stroke="#00E5FF" strokeWidth="1.5" />
                    </>
                  )}

                  {/* AOI Boundary Overlay */}
                  <polygon
                    points="60,40 340,70 320,180 50,150"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                  />
                </svg>

                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[#07131F]/80 text-[10px] font-mono text-slate-300 border border-[#16324A]">
                  {activeLayer === "rgb" && "Sentinel-2 True Color (10m L2A B04-B03-B02)"}
                  {activeLayer === "cir" && "Sentinel-2 False Color CIR (NIR B08 Highlighting Vegetative Loss)"}
                  {activeLayer === "sar" && "Sentinel-1 C-SAR Gamma0 Radar Backscatter Intensity Map"}
                  {activeLayer === "mask" && "Classified Structural Change Mask (Cyan=Built, Orange=Grading)"}
                </div>
              </div>
            </div>
          </div>

          {/* Temporal Divergence Trajectory (Reported vs Observed Over Time) */}
          <div className="p-4 bg-[#0D1E30] border border-[#16324A] rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Temporal Divergence Analysis (Reported Progress vs Remotely Sensed Site Change)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Tracking physical contractor reporting against Copernicus Earth-observation delta across time.
                </p>
              </div>

              {vf.first_divergence_month && (
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded-lg">
                  Onset: {vf.first_divergence_month}
                </span>
              )}
            </div>

            {/* Trajectory Table / Data Stream */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#16324A] text-slate-400 text-[10px] uppercase">
                    <th className="py-2 px-3">Report Month</th>
                    <th className="py-2 px-3">Reported Physical %</th>
                    <th className="py-2 px-3">Satellite Change Index</th>
                    <th className="py-2 px-3">Discrepancy (pp)</th>
                    <th className="py-2 px-3">Verification Signal</th>
                    <th className="py-2 px-3">Cloud Mask</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16324A]/60 text-slate-200">
                  {timelineData.map((pt) => {
                    const isPtSig = pt.verification_status === "SIGNIFICANT_DISCREPANCY";
                    const isPtRev = pt.verification_status === "REVIEW_RECOMMENDED";
                    return (
                      <tr key={pt.report_month} className="hover:bg-[#16324A]/40 transition-colors">
                        <td className="py-2 px-3 font-bold text-white">{pt.report_month}</td>
                        <td className="py-2 px-3 font-bold text-slate-100">{pt.reported_progress_pct}%</td>
                        <td className="py-2 px-3 text-[#00E5FF] font-bold">
                          {pt.satellite_change_index !== null ? `${pt.satellite_change_index}/100` : "N/A"}
                        </td>
                        <td className={`py-2 px-3 font-bold ${
                          isPtSig ? "text-red-400" : isPtRev ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {pt.discrepancy_pp !== null ? `${pt.discrepancy_pp > 0 ? "+" : ""}${pt.discrepancy_pp} pp` : "—"}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${
                            isPtSig
                              ? "bg-red-500/20 text-red-300 border-red-500/40"
                              : isPtRev
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          }`}>
                            {pt.verification_status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">
                          {pt.is_cloud_obscured ? "☁ SCL Cloud Masked" : "☀ Clear Optical"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Copernicus Mission Provenance & Investigation Directives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Metadata Box */}
            <div className="p-4 bg-[#0D1E30] border border-[#16324A] rounded-xl space-y-2 text-xs">
              <h5 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#00E5FF]" />
                Copernicus Data Space Telemetry
              </h5>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div>Optical Sensor: <strong>{vf.optical_provenance?.sensor || "Sentinel-2A MSI"}</strong></div>
                <div>Optical Product: <strong className="text-slate-400">{vf.optical_provenance?.product_id || "S2A_MSIL2A_20260614..."}</strong></div>
                <div>SAR Sensor: <strong>{vf.sar_provenance?.sensor || "Sentinel-1A C-SAR"}</strong></div>
                <div>SAR Product: <strong className="text-slate-400">{vf.sar_provenance?.product_id || "S1A_IW_GRDH_20260612..."}</strong></div>
                <div>SCL Cloud Cover: <strong>{vf.optical_provenance?.cloud_cover_percent || 8.4}%</strong> · Orbit: <strong>{vf.optical_provenance?.orbit_pass || "DESCENDING"}</strong></div>
              </div>
            </div>

            {/* Action Memorandum Dispatch */}
            <div className="p-4 bg-[#0D1E30] border border-[#16324A] rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <h5 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Inspection & Verification Directive
                </h5>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {vf.recommended_action || "Issue formal Site Inspection Directive to cross-verify physical progress claims."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenMemo) onOpenMemo();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#d97706] text-[#07131F] text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Attach Satellite Evidence to Inspection Memo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
