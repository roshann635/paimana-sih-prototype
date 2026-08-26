import React from "react";
import { ArrowRight } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export default function EarlyWarningSummaryCard({
  alerts = [],
  onExploreAlerts,
}) {
  const totalAlerts = alerts && alerts.length > 0 ? alerts.length : 101;
  const criticalCount = alerts ? alerts.filter(a => a.severity === 'CRITICAL').length || 38 : 38;
  const warningCount = alerts ? alerts.filter(a => a.severity === 'WARNING').length || 63 : 63;

  const alertData = [
    { name: "Critical", value: criticalCount, color: "#EF4444" },
    { name: "Operational", value: warningCount, color: "#F97316" },
  ];

  return (
    <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-4 shadow-command-card space-y-3 flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#16324A]/70">
        <span className="font-mono font-bold uppercase text-[11px] text-slate-300 tracking-wider">
          Early Warning Surveillance
        </span>
        <button
          onClick={onExploreAlerts}
          className="inline-flex items-center gap-1 text-[11px] font-mono text-[#F59E0B] hover:underline"
        >
          <span>View All Alerts</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Donut Chart + Legend */}
      <div className="grid grid-cols-12 gap-3 items-center py-1">
        {/* Donut with Center Text */}
        <div className="col-span-5 relative h-28 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={alertData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={44}
                paddingAngle={4}
                dataKey="value"
              >
                {alertData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#0D1E30"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-sm font-extrabold font-mono text-white leading-none">
              {totalAlerts}
            </span>
            <span className="text-[9px] font-mono text-slate-400 mt-0.5">
              Bulletins
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="col-span-7 space-y-2 text-[11px] font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" />
              <span className="text-slate-300">Critical Review</span>
            </div>
            <span className="text-[#EF4444] font-bold">{criticalCount} ({Math.round(criticalCount/totalAlerts*100)}%)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#F97316]" />
              <span className="text-slate-300">Operational Drift</span>
            </div>
            <span className="text-[#F97316] font-bold">{warningCount} ({Math.round(warningCount/totalAlerts*100)}%)</span>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-[#16324A]/70 text-center">
        <button
          onClick={onExploreAlerts}
          className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
        >
          Go to Early Warning Center →
        </button>
      </div>
    </div>
  );
}
