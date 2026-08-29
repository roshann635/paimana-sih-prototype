import React, { useState, useEffect } from "react";
import {
  Satellite,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Filter,
  ArrowUpRight,
  Sparkles,
  Radio,
  MapPin,
  TrendingDown,
  Info,
  ShieldAlert
} from "lucide-react";
import { paimanaApi } from "../../services/api/paimanaApi";
import { LoadingSkeleton, ErrorState } from "../../components/common/FeedbackStates";
import SatelliteEvidenceModal from "../../components/satellite/SatelliteEvidenceModal";

export default function SatelliteObservatory({ onSelectProject }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("ALL"); // ALL, SIGNIFICANT, REVIEW, CONSISTENT
  const [inspectingProject, setInspectingProject] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paimanaApi.getPortfolioSatelliteOverview();
      setSummary(res);
    } catch (err) {
      console.warn("Failed to load satellite summary:", err);
      setError("Unable to load satellite observatory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-5 bg-[#f4f7fb] min-h-screen">
        <div className="h-8 bg-white border border-[#dbe3ed] rounded-lg w-1/3 animate-pulse"></div>
        <LoadingSkeleton rows={10} />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6 bg-[#f4f7fb] min-h-screen">
        <ErrorState message={error || "Satellite data unavailable."} onRetry={loadData} />
      </div>
    );
  }

  const s = summary;
  const filteredProjects = (s.high_discrepancy_projects || []).filter((p) => {
    if (selectedFilter === "ALL") return true;
    if (selectedFilter === "SIGNIFICANT") return p.verification_status === "SIGNIFICANT_DISCREPANCY";
    if (selectedFilter === "REVIEW") return p.verification_status === "REVIEW_RECOMMENDED";
    return true;
  });

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#f4f7fb] min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#dbe3ed]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#1668d8]/10 rounded-lg text-[#1668d8]">
              <Satellite className="w-5 h-5" />
            </div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-[#142235] tracking-tight uppercase">
              National Satellite Cross-Verification Observatory
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Automated multi-temporal Earth observation (Sentinel-2 Optical & Sentinel-1 C-SAR) cross-verifying reported construction progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 bg-white border border-[#dbe3ed] text-slate-700 rounded-lg shadow-2xs">
            Evaluation Freshness: <strong className="text-[#1668d8]">{s.data_freshness_month}</strong>
          </span>
        </div>
      </div>

      {/* 4 National Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Evaluated */}
        <div className="p-4 bg-white border border-[#dbe3ed] border-t-4 border-t-[#1668d8] rounded-xl shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Evaluated Projects
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#142235] my-1">
            {s.total_projects_evaluated}
          </div>
          <div className="text-xs text-[#1668d8] font-mono font-bold">
            {s.observable_projects_count} observable ({s.not_observable_count} not observable)
          </div>
        </div>

        {/* Consistent */}
        <div className="p-4 bg-white border border-[#dbe3ed] border-t-4 border-t-[#16a34a] rounded-xl shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Consistent Evidence
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#16a34a] my-1">
            {s.consistent_count}
          </div>
          <div className="text-xs text-slate-600 font-medium">
            Broad agreement with reported progress
          </div>
        </div>

        {/* Review Recommended */}
        <div className="p-4 bg-white border border-[#dbe3ed] border-t-4 border-t-[#d97706] rounded-xl shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Review Recommended
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#d97706] my-1">
            {s.review_recommended_count}
          </div>
          <div className="text-xs text-amber-700 font-mono font-bold">
            Gap −15 to −30 percentage points
          </div>
        </div>

        {/* Significant Discrepancy */}
        <div className="p-4 bg-white border border-[#dbe3ed] border-t-4 border-t-[#dc2626] rounded-xl shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Significant Discrepancy
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#dc2626] my-1">
            {s.significant_discrepancy_count}
          </div>
          <div className="text-xs text-red-700 font-mono font-bold">
            Gap &lt; −30 percentage points (Audit Queue)
          </div>
        </div>
      </div>

      {/* High Discrepancy Investigation Priority Table */}
      <div className="bg-white border border-[#dbe3ed] rounded-xl p-3 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#dbe3ed]">
          <div>
            <h3 className="text-sm font-bold text-[#142235] uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#d97706]" />
              <span>Satellite Discrepancy Investigation Queue</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Projects ranked by largest gap between contractor-reported physical completion and remotely sensed site change index.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedFilter === "ALL"
                  ? "bg-[#1668d8] text-white shadow-xs"
                  : "bg-[#f4f7fb] text-slate-700 border border-[#dbe3ed] hover:bg-slate-100"
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => setSelectedFilter("SIGNIFICANT")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedFilter === "SIGNIFICANT"
                  ? "bg-[#dc2626] text-white shadow-xs"
                  : "bg-[#f4f7fb] text-slate-700 border border-[#dbe3ed] hover:bg-slate-100"
              }`}
            >
              Significant Gap (&lt; −30 pp)
            </button>
            <button
              onClick={() => setSelectedFilter("REVIEW")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedFilter === "REVIEW"
                  ? "bg-[#d97706] text-white shadow-xs"
                  : "bg-[#f4f7fb] text-slate-700 border border-[#dbe3ed] hover:bg-slate-100"
              }`}
            >
              Review Recommended
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#dbe3ed] bg-[#f8fafc] text-slate-600 text-[10px] font-mono uppercase tracking-wider">
                <th className="py-3 px-3.5 font-bold">Project Code / ID</th>
                <th className="py-3 px-3.5 font-bold">Project Name & Sector</th>
                <th className="py-3 px-3.5 font-bold">State</th>
                <th className="py-3 px-3.5 font-bold text-right">Reported %</th>
                <th className="py-3 px-3.5 font-bold text-right">Satellite Change</th>
                <th className="py-3 px-3.5 font-bold text-right">Discrepancy</th>
                <th className="py-3 px-3.5 font-bold text-center">Verification Signal</th>
                <th className="py-3 px-3.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7] text-slate-800">
              {filteredProjects.map((p) => {
                const isSig = p.verification_status === "SIGNIFICANT_DISCREPANCY";
                const isRev = p.verification_status === "REVIEW_RECOMMENDED";
                return (
                  <tr key={p.project_id} className="hover:bg-[#f1f5f9] transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-[#1668d8]">
                      {p.project_code || p.project_id}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-[#142235] max-w-sm truncate">{p.project_name}</div>
                      <div className="text-[11px] text-slate-500">{p.sector}</div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 font-medium">{p.state}</td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                      {p.reported_progress_pct}%
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-[#142235]">
                      {p.observed_site_change_index}/100
                    </td>
                    <td className={`py-3 px-3.5 text-right font-mono font-extrabold ${
                      isSig ? "text-[#dc2626]" : isRev ? "text-[#d97706]" : "text-[#16a34a]"
                    }`}>
                      {p.discrepancy_pp} pp
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                        isSig
                          ? "bg-red-50 text-red-700 border-red-200"
                          : isRev
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {p.verification_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={() => setInspectingProject(p)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1668d8] hover:bg-[#0b4db3] text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sector Resolution Suitability Matrix */}
      <div className="bg-white border border-[#dbe3ed] rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#142235] uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#1668d8]" />
          <span>Sector Spatial Resolution Suitability Matrix (Copernicus 10m Ground Sampling Distance)</span>
        </h3>
        <p className="text-xs text-slate-500">
          Scientific classification of infrastructure asset classes according to spatial observability under 10m Sentinel-2 multi-spectral and Sentinel-1 C-SAR GRD.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(s.sector_suitability_distribution || {}).map(([secName, info]) => {
            const isHigh = info.suitability === "HIGH";
            const isMed = info.suitability === "MEDIUM";
            return (
              <div key={secName} className="p-3 bg-[#f8fafc] border border-[#dbe3ed] rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#142235] truncate">{secName}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isHigh
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : isMed
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-700 border-slate-300"
                  }`}>
                    {info.suitability}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Total: <strong className="text-slate-800">{info.total}</strong> · Observable: <strong className="text-[#1668d8]">{info.observable}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Evidence Modal */}
      {inspectingProject && (
        <SatelliteEvidenceModal
          isOpen={Boolean(inspectingProject)}
          onClose={() => setInspectingProject(null)}
          projectId={inspectingProject.project_id}
          projectName={inspectingProject.project_name}
          onOpenMemo={() => {
            const pid = inspectingProject.project_id;
            setInspectingProject(null);
            if (onSelectProject) onSelectProject(pid);
          }}
        />
      )}
    </div>
  );
}


