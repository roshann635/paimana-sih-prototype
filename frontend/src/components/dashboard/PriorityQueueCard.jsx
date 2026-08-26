import React from "react";
import { ArrowRight } from "lucide-react";

export default function PriorityQueueCard({
  projects = [],
  onSelectProject,
  onExploreQueue,
}) {
  const displayItems = (projects && projects.length > 0)
    ? projects.slice(0, 5).map((p, idx) => ({
        id: p.project_id,
        rank: String(idx + 1).padStart(2, "0"),
        name: p.project_name,
        code: p.project_code || p.project_id,
        risk: Math.round(p.composite_risk_score || 75),
        exposure: p.revised_cost
          ? `₹${Math.round(p.revised_cost).toLocaleString()} Cr`
          : "—",
        ipi: p.ipi_score != null ? Math.round(p.ipi_score) : 80,
      }))
    : [];

  return (
    <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-4 shadow-command-card space-y-3 flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#16324A]/70">
        <span className="font-mono font-bold uppercase text-[11px] text-slate-300 tracking-wider">
          Intervention Priority Queue
        </span>
        <button
          onClick={onExploreQueue}
          className="inline-flex items-center gap-1 text-[11px] font-mono text-[#F59E0B] hover:underline"
        >
          <span>View Full Matrix</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] font-mono text-slate-400 uppercase border-b border-[#16324A]/60">
              <th className="pb-1.5 font-bold w-7">#</th>
              <th className="pb-1.5 font-bold">Project</th>
              <th className="pb-1.5 font-bold text-right">Risk</th>
              <th className="pb-1.5 font-bold text-right">Exposure</th>
              <th className="pb-1.5 font-bold text-right">IPI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#16324A]/40 font-mono text-xs">
            {displayItems.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelectProject && onSelectProject(item.id)}
                className="hover:bg-[#11263C] transition-colors cursor-pointer group"
              >
                <td className="py-2 text-slate-400 font-bold">{item.rank}</td>
                <td className="py-2 pr-2">
                  <div className="font-sans font-semibold text-slate-200 group-hover:text-[#00E5FF] transition-colors truncate max-w-[150px] sm:max-w-[180px]">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    {item.code}
                  </div>
                </td>
                <td className="py-2 text-right">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    item.risk >= 80 ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                  }`}>
                    {item.risk}
                  </span>
                </td>
                <td className="py-2 text-right text-slate-300 font-bold text-[11px]">
                  {item.exposure}
                </td>
                <td className="py-2 text-right">
                  <span className="font-bold text-[#F59E0B] text-xs">
                    {item.ipi}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-[#16324A]/70 text-center">
        <button
          onClick={onExploreQueue}
          className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
        >
          See all projects in queue →
        </button>
      </div>
    </div>
  );
}
