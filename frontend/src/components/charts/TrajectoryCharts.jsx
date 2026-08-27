import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function TrajectoryCharts({ trajectory = [] }) {
  if (!trajectory || trajectory.length === 0) {
    return (
      <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-6 text-center text-xs text-slate-400 font-mono shadow-command-card">
        No longitudinal historical trajectory data available for this project.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. S-Curve: Physical Progress vs Cumulative Capex */}
      <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#16324A]">
          <div>
            <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">Physical S-Curve & Capital Drawdown</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Cumulative milestone progression against expenditure drawdowns.</p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#07131F] rounded text-[#00E5FF] border border-[#16324A]">
            {trajectory.length} Snapshots
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16324A" vertical={false} />
              <XAxis dataKey="report_month" tick={{ fontSize: 10, fill: '#8F99A6', fontFamily: 'JetBrains Mono' }} stroke="#16324A" tickLine={false} />
              <YAxis yAxisId="left" unit="%" domain={[0, 100]} tick={{ fontSize: 10, fill: '#8F99A6', fontFamily: 'JetBrains Mono' }} stroke="#16324A" tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#8F99A6', fontFamily: 'JetBrains Mono' }} stroke="#16324A" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#07131F', borderColor: '#16324A', color: '#FFFFFF', fontSize: '11px', borderRadius: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', fontFamily: 'JetBrains Mono' }}
                formatter={(val, name) => [
                  name.includes('%') ? `${Number(val).toFixed(1)}%` : `₹${Number(val).toLocaleString()} Cr`,
                  name
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontFamily: 'JetBrains Mono' }} />
              <Line yAxisId="left" type="monotone" dataKey="physical_progress_pct" name="Actual Physical %" stroke="#00E5FF" strokeWidth={3} dot={{ r: 4, fill: '#00E5FF' }} />
              <Line yAxisId="left" type="monotone" dataKey="planned_progress_pct" name="Planned Progress %" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#94A3B8' }} />
              <Line yAxisId="right" type="monotone" dataKey="cumulative_expenditure" name="Cumulative Capex (₹ Cr)" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: '#F59E0B' }} />
            </LineChart>

          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Longitudinal Risk Trajectory & Drift Velocity */}
      <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#16324A]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">Longitudinal Risk Trajectory</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#EF4444]/20 text-[#EF4444] rounded border border-[#EF4444]/40">
                Surveillance Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Composite risk score evolution highlighting tier transition thresholds.</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16324A" vertical={false} />
              <XAxis dataKey="report_month" tick={{ fontSize: 10, fill: '#8F99A6', fontFamily: 'JetBrains Mono' }} stroke="#16324A" tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#8F99A6', fontFamily: 'JetBrains Mono' }} stroke="#16324A" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#07131F', borderColor: '#16324A', color: '#FFFFFF', fontSize: '11px', borderRadius: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', fontFamily: 'JetBrains Mono' }}
                formatter={(val) => [`${Math.round(val)}/100`, 'Composite Risk Score']}
              />
              <ReferenceLine y={75} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'CRITICAL (75)', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'HIGH (50)', fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontFamily: 'JetBrains Mono' }} />
              <Line type="monotone" dataKey="composite_risk_score" name="Composite Risk Score" stroke="#EF4444" strokeWidth={3.5} dot={{ r: 5, fill: '#EF4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
