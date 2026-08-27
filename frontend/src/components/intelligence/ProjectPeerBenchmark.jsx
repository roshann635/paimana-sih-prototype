import React, { useState, useEffect } from "react";
import {
  Scale,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { paimanaApi } from "../../services/api/paimanaApi";

export default function ProjectPeerBenchmark({ projectId, sector }) {
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      paimanaApi
        .getProjectBenchmark(projectId)
        .then((data) => setBenchmarkData(data))
        .catch((err) => console.error("Failed to load peer benchmarks:", err))
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card text-center font-mono text-xs text-slate-400">
        Loading Sector Peer Group Benchmarking Data...
      </div>
    );
  }

  if (!benchmarkData || !benchmarkData.metrics) {
    return null;
  }

  const metrics = benchmarkData.metrics || [];

  return (
    <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card space-y-4 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#16324A]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-cyan-glow">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                Cross-Project Sector Peer Benchmarking
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                Empirical MoSPI Medians
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Side-by-side performance comparison against{" "}
              {benchmarkData.peer_sample_size} monitored projects in{" "}
              <strong className="text-white">{benchmarkData.sector}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-[#07131F] px-3 py-1 rounded border border-[#16324A]">
          <Users className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>
            Peer Group:{" "}
            <strong className="text-white">{benchmarkData.sector}</strong>
          </span>
        </div>
      </div>

      {/* Comparative Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {metrics.map((m, idx) => {
          const isWorse = m.status === "WORSE";

          return (
            <div
              key={idx}
              className="p-3.5 bg-[#07131F] rounded-lg border border-[#16324A] space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold truncate">
                  {m.kpi}
                </div>
                <div className="text-lg font-mono font-bold text-white mt-1">
                  {m.project_value} {m.unit}
                </div>
              </div>

              <div className="pt-2 border-t border-[#16324A] text-xs font-mono space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Sector Median:</span>
                  <span className="text-slate-200">
                    {m.peer_median} {m.unit}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400">Position:</span>
                  <span
                    className={isWorse ? "text-[#EF4444]" : "text-[#10B981]"}
                  >
                    {isWorse ? "▼ Lagging Peers" : "▲ Outperforming"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
