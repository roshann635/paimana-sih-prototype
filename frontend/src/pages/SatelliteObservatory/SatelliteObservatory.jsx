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

export default function SatelliteObservatory({ onSelectProject }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("ALL"); // ALL, SIGNIFICANT, REVIEW, CONSISTENT

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
      <div className="p-6 space-y-5 bg-[#07131F] min-h-screen">
        <div className="h-8 bg-[#0D1E30] rounded-lg w-1/3 animate-pulse"></div>
        <LoadingSkeleton rows={10} />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6 bg-[#07131F] min-h-screen">
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
    <div className="p-6 space-y-6 bg-[#07131F] min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#16324A]">
        <div>
          <div className="flex items-center gap-2">
            <Satellite className="w-5 h-5 text-[#00E5FF]" />
            <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight uppercase">
              National Satellite Cross-Verification Observatory
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated multi-temporal Earth observation (Sentinel-2 Optical & Sentinel-1 C-SAR) cross-verifying reported construction progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 bg-[#0D1E30] border border-[#16324A] text-slate-300 rounded-lg">
            Evaluation Freshness: <strong>{s.data_freshness_month}</strong>
          </span>
        </div>
      </div>

      {/* 4 National Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Evaluated */}
        <div className="p-4 bg-[#0D1E30] border border-[#16324A] border-t-[3px] border-t-[#00E5FF] rounded-xl shadow-command-card">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Evaluated Projects
          </div>
          <div className="text-2xl font-extrabold font-mono text-white my-1">
            {s.total_projects_evaluated}
          </div>
          <div className="text-[11px] text-[#00E5FF] font-mono font-bold">
            {s.observable_projects_count} observable ({s.not_observable_count} not observable)
          </div>
        </div>

        {/* Consistent */}
        <div className="p-4 bg-[#0D1E30] border border-[#16324A] border-t-[3px] border-t-[#10B981] rounded-xl shadow-command-card">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Consistent Evidence
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#10B981] my-1">
            {s.consistent_count}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Broad agreement with reported progress
          </div>
        </div>

        {/* Review Recommended */}
        <div className="p-4 bg-[#0D1E30] border border-[#16324A] border-t-[3px] border-t-[#F59E0B] rounded-xl shadow-command-card">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Review Recommended
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#F59E0B] my-1">
            {s.review_recommended_count}
          </div>
          <div className="text-[11px] text-amber-400 font-mono font-bold">
            Gap −15 to −30 percentage points
          </div>
        </div>

        {/* Significant Discrepancy */}
        <div className="p-4 bg-[#0D1E30] border border-[#16324A] border-t-[3px] border-t-[#EF4444] rounded-xl shadow-command-card">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Significant Discrepancy
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#EF4444] my-1">
            {s.significant_discrepancy_count}
          </div>
          <div className="text-[11px] text-red-400 font-mono font-bold">
            Gap &lt; −30 percentage points (Audit Queue)
          </div>
        </div>
      </div>

      {/* High Discrepancy Investigation Priority Table */}
      <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#16324A]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
              <span>Satellite Discrepancy Investigation Queue</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Projects ranked by largest gap between contractor-reported physical completion and remotely sensed site change index.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedFilter("ALL")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedFilter === "ALL" ? "bg-[#00E5FF] text-[#07131F]" : "bg-[#16324A] text-slate-300 hover:text-white"
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => setSelectedFilter("SIGNIFICANT")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedFilter === "SIGNIFICANT" ? "bg-[#EF4444] text-white" : "bg-[#16324A] text-slate-300 hover:text-white"
              }`}
            >
              Significant Gap (&lt; −30 pp)
            </button>
            <button
              onClick={() => setSelectedFilter("REVIEW")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedFilter === "REVIEW" ? "bg-[#F59E0B] text-[#07131F]" : "bg-[#16324A] text-slate-300 hover:text-white"
              }`}
            >
              Review Recommended
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#16324A] text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Project Code / ID</th>
                <th className="py-2.5 px-3">Project Name & Sector</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3">Reported Physical %</th>
                <th className="py-2.5 px-3">Satellite Change Index</th>
                <th className="py-2.5 px-3">Discrepancy (pp)</th>
                <th className="py-2.5 px-3">Verification Signal</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16324A]/60 text-slate-200">
              {filteredProjects.map((p) => {
                const isSig = p.verification_status === "SIGNIFICANT_DISCREPANCY";
                const isRev = p.verification_status === "REVIEW_RECOMMENDED";
                return (
                  <tr key={p.project_id} className="hover:bg-[#16324A]/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#00E5FF]">{p.project_code || p.project_id}</td>
                    <td className="py-3 px-3">
                      <div className="font-sans font-bold text-white max-w-sm truncate">{p.project_name}</div>
                      <div className="text-[10px] text-slate-400">{p.sector}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{p.state}</td>
                    <td className="py-3 px-3 font-bold text-slate-100">{p.reported_progress_pct}%</td>
                    <td className="py-3 px-3 text-[#00E5FF] font-bold">{p.observed_site_change_index}/100</td>
                    <td className={`py-3 px-3 font-bold ${isSig ? "text-red-400" : isRev ? "text-amber-400" : "text-emerald-400"}`}>
                      {p.discrepancy_pp} pp
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${
                        isSig
                          ? "bg-red-500/20 text-red-300 border-red-500/40 font-bold"
                          : isRev
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}>
                        {p.verification_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectProject && onSelectProject(p.project_id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#16324A] hover:bg-[#00E5FF] hover:text-[#07131F] text-slate-200 text-[11px] font-sans font-bold rounded transition-colors"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3 h-3" />
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
      <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00E5FF]" />
          <span>Sector Spatial Resolution Suitability Matrix (Copernicus 10m Ground Sampling Distance)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Scientific classification of infrastructure asset classes according to spatial observability under 10m Sentinel-2 multi-spectral and Sentinel-1 C-SAR GRD.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(s.sector_suitability_distribution || {}).map(([secName, info]) => {
            const isHigh = info.suitability === "HIGH";
            const isMed = info.suitability === "MEDIUM";
            return (
              <div key={secName} className="p-3 bg-[#07131F] border border-[#16324A] rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{secName}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                    isHigh
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : isMed
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-slate-500/20 text-slate-300 border-slate-500/40"
                  }`}>
                    {info.suitability}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Total: {info.total} · Observable: {info.observable}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
