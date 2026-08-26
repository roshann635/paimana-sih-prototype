import React from "react";
import { Info, TrendingDown, ShieldAlert } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const HEALTH_TRAJECTORY = [
  { month: "Aug '25", health: 81.2 },
  { month: "Sep '25", health: 79.8 },
  { month: "Oct '25", health: 77.4 },
  { month: "Nov '25", health: 75.0 },
  { month: "Dec '25", health: 72.4 },
];

export default function PortfolioHealthCard({ summary, onSelectTier }) {
  const s = summary || {};
  const riskCounts = s.risk_counts || { RED: 0, ORANGE: 33, AMBER: 492, GREEN: 1105 };
  const total = s.total_projects || 1630;

  const orangeCount = riskCounts.ORANGE || 33;
  const amberCount = riskCounts.AMBER || 492;
  const greenCount = riskCounts.GREEN || 1105;

  const orangePct = Math.round((orangeCount / total) * 100);
  const amberPct = Math.round((amberCount / total) * 100);
  const greenPct = Math.round((greenCount / total) * 100);

  const riskTiers = [
    { label: "High Risk", pct: orangePct || 2, count: orangeCount, color: "#F97316" },
    { label: "Moderate", pct: amberPct || 30, count: amberCount, color: "#F59E0B" },
    { label: "Stable / Low", pct: greenPct || 68, count: greenCount, color: "#10B981" },
  ];

  return (
    <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card space-y-4 flex-1 flex flex-col justify-between">
      {/* Header & Main Metric */}
      <div>
        <div className="flex items-center justify-between text-slate-400 pb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
            <span>Portfolio Health Index</span>
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-[10px] font-mono font-bold">
            <TrendingDown className="w-3 h-3" />
            <span>-2.6 pts MoM</span>
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl lg:text-4xl font-extrabold font-mono text-[#00E5FF] tracking-tight">
            72.4
          </span>
          <span className="text-slate-400 text-sm font-mono">/ 100</span>
        </div>
        <div className="text-xs font-bold text-[#F59E0B] mt-0.5">
          Moderate Institutional Health Tier
        </div>
      </div>

      {/* Trajectory Line Chart */}
      <div className="h-32 w-full -ml-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={HEALTH_TRAJECTORY}
            margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#16324A"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{
                fontSize: 10,
                fill: "#8F99A6",
                fontFamily: "JetBrains Mono",
              }}
              tickLine={false}
              stroke="#16324A"
            />
            <YAxis
              domain={[60, 90]}
              tick={{
                fontSize: 9,
                fill: "#8F99A6",
                fontFamily: "JetBrains Mono",
              }}
              tickLine={false}
              stroke="#16324A"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#07131F",
                borderColor: "#16324A",
                color: "#FFFFFF",
                fontSize: "11px",
                borderRadius: "6px",
                fontFamily: "JetBrains Mono",
              }}
            />
            <Line
              type="monotone"
              dataKey="health"
              stroke="#00E5FF"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#00E5FF", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#F59E0B" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Real Segmented Risk Distribution Bar */}
      <div className="space-y-2 pt-2 border-t border-[#16324A]">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="font-bold text-slate-300 uppercase">
            Risk Distribution (By Projects)
          </span>
          <span className="text-slate-400">Total: {total.toLocaleString()}</span>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="h-3 w-full bg-[#07131F] rounded-full overflow-hidden flex border border-[#16324A]">
          {riskTiers.map((tier, idx) => (
            <div
              key={idx}
              style={{
                width: `${tier.pct}%`,
                backgroundColor: tier.color,
              }}
              title={`${tier.label}: ${tier.count} projects (${tier.pct}%)`}
              className="h-full transition-all duration-300"
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono text-slate-300 pt-1">
          {riskTiers.map((tier, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tier.color }}
              />
              <span className="text-slate-400">{tier.label}</span>
              <strong className="text-white font-bold">{tier.count}</strong>
              <span className="text-slate-500 font-normal">({tier.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
