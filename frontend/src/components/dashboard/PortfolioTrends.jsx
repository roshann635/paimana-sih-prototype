import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

const MACRO_MONTHLY_TRENDS = [
  { month: '2025-04', avg_progress: 38.2, expenditure_cr: 112000, avg_delay_days: 118, high_risk_count: 98 },
  { month: '2025-05', avg_progress: 39.8, expenditure_cr: 116500, avg_delay_days: 122, high_risk_count: 104 },
  { month: '2025-06', avg_progress: 41.5, expenditure_cr: 121000, avg_delay_days: 128, high_risk_count: 110 },
  { month: '2025-07', avg_progress: 43.1, expenditure_cr: 128400, avg_delay_days: 134, high_risk_count: 118 },
  { month: '2025-08', avg_progress: 44.9, expenditure_cr: 133200, avg_delay_days: 139, high_risk_count: 124 },
  { month: '2025-09', avg_progress: 46.4, expenditure_cr: 137800, avg_delay_days: 142, high_risk_count: 129 },
  { month: '2025-10', avg_progress: 47.9, expenditure_cr: 141200, avg_delay_days: 145, high_risk_count: 135 },
  { month: '2025-11', avg_progress: 49.3, expenditure_cr: 144500, avg_delay_days: 147, high_risk_count: 139 },
  { month: '2025-12', avg_progress: 51.0, expenditure_cr: 148900, avg_delay_days: 148, high_risk_count: 142 },
];

export default function PortfolioTrends() {
  const [metricMode, setMetricMode] = useState('progress_exp'); // 'progress_exp' | 'slippage'

  return (
    <div className="bg-gov-surface border border-gov-border rounded-gov p-6 shadow-gov">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-gov-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-dark" />
          <div>
            <h3 className="text-sm font-bold text-text-primary">Portfolio Trajectory & Drift Dynamics</h3>
            <p className="text-xs text-text-secondary mt-0.5">Historical multi-month progression across central infrastructure portfolio.</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#FAFBF8] p-1 rounded-gov-sm border border-gov-border">
          <button
            onClick={() => setMetricMode('progress_exp')}
            className={`px-3 py-1 text-xs font-bold rounded-gov-sm transition-all ${
              metricMode === 'progress_exp'
                ? 'bg-brand text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Progress vs Capex
          </button>
          <button
            onClick={() => setMetricMode('slippage')}
            className={`px-3 py-1 text-xs font-bold rounded-gov-sm transition-all ${
              metricMode === 'slippage'
                ? 'bg-brand text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Delay & Risk Drift
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metricMode === 'progress_exp' ? (
            <LineChart data={MACRO_MONTHLY_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D3D6CE" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4A5158', fontWeight: 500 }} tickLine={false} stroke="#B8BDB0" />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#4A5158', fontWeight: 500 }} unit="%" tickLine={false} domain={[0, 100]} stroke="#B8BDB0" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#4A5158', fontWeight: 500 }} tickLine={false} stroke="#B8BDB0" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D3D6CE', color: '#1C1F23', fontSize: '12px', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(val, name) => [
                  name === 'Physical Progress %' ? `${val}%` : `₹${Number(val).toLocaleString()} Cr`,
                  name
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="avg_progress" name="Physical Progress %" stroke="#2D726F" strokeWidth={3} dot={{ r: 4, fill: '#2D726F' }} />
              <Line yAxisId="right" type="monotone" dataKey="expenditure_cr" name="Cumulative Capex (₹ Cr)" stroke="#C97919" strokeWidth={2.5} dot={{ r: 4, fill: '#C97919' }} />
            </LineChart>
          ) : (
            <LineChart data={MACRO_MONTHLY_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D3D6CE" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4A5158', fontWeight: 500 }} tickLine={false} stroke="#B8BDB0" />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#4A5158', fontWeight: 500 }} unit=" d" tickLine={false} stroke="#B8BDB0" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#4A5158', fontWeight: 500 }} tickLine={false} stroke="#B8BDB0" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D3D6CE', color: '#1C1F23', fontSize: '12px', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(val, name) => [
                  name === 'Mean Schedule Slippage (Days)' ? `${val} Days` : `${val} Projects`,
                  name
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="avg_delay_days" name="Mean Schedule Slippage (Days)" stroke="#916812" strokeWidth={3} dot={{ r: 4, fill: '#916812' }} />
              <Line yAxisId="right" type="monotone" dataKey="high_risk_count" name="High Risk Projects Count" stroke="#A82420" strokeWidth={2.5} dot={{ r: 4, fill: '#A82420' }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
