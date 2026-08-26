import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Representative monthly historical aggregation across the 9-month MoSPI portfolio
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
    <div className="bg-gov-surface border border-gov-border rounded-gov p-5 shadow-gov">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-gov-border">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Portfolio Trajectory & Time-Series Drift</h3>
          <p className="text-xs text-text-secondary">Historical multi-month progression across central infrastructure portfolio.</p>
        </div>

        <div className="flex items-center gap-1 bg-gov-secondary p-0.5 rounded-gov-sm border border-gov-border">
          <button
            onClick={() => setMetricMode('progress_exp')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-gov-sm transition-colors ${
              metricMode === 'progress_exp'
                ? 'bg-white text-text-primary shadow-gov'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Progress vs Capex
          </button>
          <button
            onClick={() => setMetricMode('slippage')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-gov-sm transition-colors ${
              metricMode === 'slippage'
                ? 'bg-white text-text-primary shadow-gov'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Delay & High-Risk Drift
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metricMode === 'progress_exp' ? (
            <AreaChart data={MACRO_MONTHLY_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D9D9D6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5F6368' }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#5F6368' }} unit="%" tickLine={false} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#5F6368' }} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D9D9D6', fontSize: '12px', borderRadius: '6px' }}
                formatter={(val, name) => [
                  name === 'avg_progress' ? `${val}%` : `₹${Number(val).toLocaleString()} Cr`,
                  name === 'avg_progress' ? 'Average Physical Progress' : 'Cumulative Capex Drawdown'
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area yAxisId="left" type="monotone" dataKey="avg_progress" name="Physical Progress %" stroke="#347B78" fill="#E7F1F0" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="expenditure_cr" name="Cumulative Capex (₹ Cr)" stroke="#C97919" strokeWidth={2} dot={{ r: 3 }} />
            </AreaChart>
          ) : (
            <LineChart data={MACRO_MONTHLY_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D9D9D6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5F6368' }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#5F6368' }} unit=" d" tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#5F6368' }} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D9D9D6', fontSize: '12px', borderRadius: '6px' }}
                formatter={(val, name) => [
                  name === 'avg_delay_days' ? `${val} Days` : `${val} Projects`,
                  name === 'avg_delay_days' ? 'Mean Delay' : 'High-Risk Review Watchlist'
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="avg_delay_days" name="Mean Schedule Slippage (Days)" stroke="#B58A27" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="high_risk_count" name="High Risk Projects Count" stroke="#B63A32" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
