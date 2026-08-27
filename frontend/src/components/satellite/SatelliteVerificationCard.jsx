import React, { useState, useEffect } from "react";
import {
  Satellite,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  Radio,
  ExternalLink,
  FileCheck
} from "lucide-react";
import { paimanaApi } from "../../services/api/paimanaApi";

export default function SatelliteVerificationCard({
  projectId,
  projectName,
  onInspectEvidence,
  onOpenMemo
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useLiveCopernicus, setUseLiveCopernicus] = useState(false);

  const fetchSatelliteData = async (live = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await paimanaApi.getProjectSatelliteVerification(projectId, {
        use_live_copernicus: live
      });
      setData(res);
    } catch (err) {
      console.warn("Failed to load satellite verification:", err);
      setError("Satellite cross-verification signal temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchSatelliteData(useLiveCopernicus);
    }
  }, [projectId, useLiveCopernicus]);

  if (loading) {
    return (
      <div className="p-5 bg-[#0D1E30] border border-[#16324A] rounded-xl shadow-command-card animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-[#16324A] rounded w-1/3"></div>
          <div className="h-4 bg-[#16324A] rounded w-1/6"></div>
        </div>
        <div className="h-16 bg-[#16324A] rounded"></div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const d = data;
  const isDiscSig = d.verification_status === "SIGNIFICANT_DISCREPANCY";
  const isReview = d.verification_status === "REVIEW_RECOMMENDED";
  const isConsistent = d.verification_status === "CONSISTENT";
  const isNotObs = d.verification_status === "NOT_OBSERVABLE";
  const isInconclusive = d.verification_status === "INCONCLUSIVE";

  const statusBadgeColor = isDiscSig
    ? "bg-red-500/20 text-red-400 border-red-500/40"
    : isReview
    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
    : isConsistent
    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
    : "bg-slate-500/20 text-slate-300 border-slate-500/40";

  const statusBorderAccent = isDiscSig
    ? "border-t-[#EF4444]"
    : isReview
    ? "border-t-[#F59E0B]"
    : isConsistent
    ? "border-t-[#10B981]"
    : "border-t-[#64748B]";

  return (
    <div className={`bg-[#0D1E30] border border-[#16324A] border-t-[3px] ${statusBorderAccent} rounded-xl p-5 shadow-command-card space-y-4`}>
      {/* Top Header & Provenance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#16324A]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
            <Satellite className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Satellite Cross-Verification
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${statusBadgeColor}`}>
                {d.verification_status.replace("_", " ")}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Independent Earth Observation Evidence (Sentinel-2 Optical + Sentinel-1 SAR)
            </p>
          </div>
        </div>

        {/* Provenance Mode Toggle / Tag */}
        <div className="flex items-center gap-2">
          {d.is_synthetic ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded">
              <Sparkles className="w-3 h-3 text-amber-400" />
              DEMO / SYNTHETIC FIXTURE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] rounded">
              <Radio className="w-3 h-3 text-[#00E5FF]" />
              COPERNICUS OBSERVATION
            </span>
          )}

          <button
            onClick={() => setUseLiveCopernicus(!useLiveCopernicus)}
            className="text-[10px] font-mono text-slate-400 hover:text-slate-200 underline decoration-slate-600"
            title="Toggle Live Copernicus STAC vs Demo Fixture"
          >
            {useLiveCopernicus ? "Switch to Demo Fixture" : "Test Live STAC Discovery"}
          </button>
        </div>
      </div>

      {/* Main Comparative Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Metric 1: Reported Progress */}
        <div className="p-3 bg-[#07131F] border border-[#16324A] rounded-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Reported Progress</div>
          <div className="text-xl font-extrabold font-mono text-white mt-1">
            {d.reported_progress_pct}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Contractor submission</div>
        </div>

        {/* Metric 2: Observed Site Change */}
        <div className="p-3 bg-[#07131F] border border-[#16324A] rounded-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Observed Site Change</div>
          <div className="text-xl font-extrabold font-mono text-[#00E5FF] mt-1">
            {isNotObs ? "N/A" : `${d.observed_site_change_index}/100`}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isNotObs ? "Footprint < 10m" : "Multi-sensor index"}
          </div>
        </div>

        {/* Metric 3: Discrepancy */}
        <div className="p-3 bg-[#07131F] border border-[#16324A] rounded-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Discrepancy (pp)</div>
          <div className={`text-xl font-extrabold font-mono mt-1 ${isDiscSig ? "text-red-400" : isReview ? "text-amber-400" : "text-emerald-400"}`}>
            {isNotObs ? "—" : `${d.progress_discrepancy_pp > 0 ? "+" : ""}${d.progress_discrepancy_pp} pp`}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Observed − Reported</div>
        </div>

        {/* Metric 4: Evidence Quality */}
        <div className="p-3 bg-[#07131F] border border-[#16324A] rounded-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Evidence Confidence</div>
          <div className="text-xl font-extrabold font-mono text-white mt-1">
            {d.evidence_quality.overall_confidence}/100
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Clouds {d.optical_provenance?.cloud_cover_percent || 8}%
          </div>
        </div>

        {/* Metric 5: AOI Suitability */}
        <div className="p-3 bg-[#07131F] border border-[#16324A] rounded-lg col-span-2 sm:col-span-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">AOI Suitability</div>
          <div className="text-xl font-extrabold font-mono text-white mt-1">
            {d.spatial_suitability.level}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {d.spatial_suitability.aoi_area_sqkm} km² AOI
          </div>
        </div>
      </div>

      {/* Multi-Sensor Progress & Backscatter Breakdown */}
      {!isNotObs && (
        <div className="space-y-2 p-3.5 bg-[#07131F] border border-[#16324A] rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>MULTI-SENSOR EVIDENCE STREAMS</span>
            <span className="font-mono text-[10px] text-slate-400 font-normal">
              Acquisitions: Sentinel-2 L2A ({d.optical_provenance?.acquisition_datetime?.slice(0, 10)}) · Sentinel-1 GRD ({d.sar_provenance?.acquisition_datetime?.slice(0, 10)})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Sentinel-2 Optical */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  Sentinel-2 Optical (10m L2A NDVI / BSI)
                </span>
                <span className="font-mono font-bold text-white">{d.optical_evidence_score}/100</span>
              </div>
              <div className="w-full bg-[#16324A] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#10B981] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, d.optical_evidence_score))}%` }}
                ></div>
              </div>
            </div>

            {/* Sentinel-1 SAR */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00E5FF]"></span>
                  Sentinel-1 C-band SAR (VV / VH Gamma0)
                </span>
                <span className="font-mono font-bold text-white">{d.sar_evidence_score}/100</span>
              </div>
              <div className="w-full bg-[#16324A] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#00E5FF] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, d.sar_evidence_score))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Status Banner & Recommendation */}
      <div className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDiscSig
          ? "bg-red-500/10 border-red-500/30 text-red-200"
          : isReview
          ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
          : isConsistent
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
          : "bg-slate-500/10 border-slate-500/30 text-slate-200"
      }`}>
        <div className="space-y-0.5 text-xs">
          <div className="font-extrabold flex items-center gap-1.5">
            {isDiscSig || isReview ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
            <span>{d.status_headline}</span>
          </div>
          <p className="text-[11px] opacity-90 leading-relaxed">
            {d.status_description}
          </p>
          {d.first_divergence_month && (
            <p className="text-[10px] font-mono text-slate-300 pt-0.5">
              ⏱ <strong>{d.divergence_narrative}</strong>
            </p>
          )}
        </div>

        {/* Evidence Inspector Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onInspectEvidence}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00E5FF] hover:bg-[#00cce6] text-[#07131F] text-xs font-bold rounded-md transition-colors shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Inspect Satellite Evidence</span>
          </button>

          {(isReview || isDiscSig) && onOpenMemo && (
            <button
              onClick={onOpenMemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F59E0B] hover:bg-[#d97706] text-[#07131F] text-xs font-bold rounded-md transition-colors shadow-xs"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Inspection Memo</span>
            </button>
          )}
        </div>
      </div>

      {/* Institutional Disclaimer Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-[#16324A]">
        <span>
          {d.disclaimer}
        </span>
        <span className="font-mono text-slate-400">
          Evaluated against {d.evaluation_month} Copernicus pass
        </span>
      </div>
    </div>
  );
}
