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

export default function TrajectoryCharts({ trajectory = [] }) {
  const [activeTab, setActiveTab] = useState('progress_exp'); // 'progress_exp' | 'cost_risk'

  if (!trajectory || trajectory.length === 0) {
    return (
      <div className="bg-gov-surface border border-gov-border rounded-gov p-6 text-center text-xs text-text-muted">
        No multi-month historical snapshots available for this project.
      </div>
    );
  }

  const chartData = trajectory.map(t => ({
    month: t.report_month,
    progress: t.physical_progress_pct || 0,
    expenditure: t.cumulative_expenditure || 0,
    revised_cost: t.revised_cost || 0,
    delay: t.delay_days || 0,
    risk: t.composite_risk_score ? Math.round(t.composite_risk_score) : 40,
  }));

  return (
    <div className="bg-gov-surface border border-gov-border rounded-gov p-6 shadow-gov space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <h3 className="text-sm font-bold text-text-primary">
            Multi-Month Project Trajectory S-Curves
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Tracking chronological physical milestone progress, capex drawdowns, cost revisions, and predictive risk evolution.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-gov-secondary p-1 rounded-gov-sm border border-gov-border">
          <button
            onClick={() => setActiveTab('progress_exp')}
            className={`px-3 py-1 text-xs font-semibold rounded-gov-sm transition-colors ${
              activeTab === 'progress_exp'
                ? 'bg-white text-text-primary shadow-gov'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            S-Curve: Progress vs Cost
          </button>
          <button
            onClick={() => setActiveTab('cost_risk')}
            className={`px-3 py-1 text-xs font-semibold rounded-gov-sm transition-colors ${
              activeTab === 'cost_risk'
                ? 'bg-white text-text-primary shadow-gov'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Risk Score & Schedule Delay
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'progress_exp' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E1" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5F6368' }} tickLine={false} stroke="#D9D9D6" />
              <YAxis yAxisId="pct" tick={{ fontSize: 11, fill: '#5F6368' }} unit="%" domain={[0, 100]} tickLine={false} stroke="#D9D9D6" />
              <YAxis yAxisId="cr" orientation="right" tick={{ fontSize: 11, fill: '#5F6368' }} tickLine={false} stroke="#D9D9D6" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D9D9D6', color: '#252525', fontSize: '12px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                formatter={(val, name) => [
                  name === 'Physical Progress' ? `${val}%` : `₹${Number(val).toLocaleString()} Cr`,
                  name
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line yAxisId="pct" type="monotone" dataKey="progress" name="Physical Progress" stroke="#347B78" strokeWidth={2.5} dot={{ r: 3.5, fill: '#347B78' }} />
              <Line yAxisId="cr" type="monotone" dataKey="expenditure" name="Cumulative Capex" stroke="#C97919" strokeWidth={2} dot={{ r: 3, fill: '#C97919' }} />
              <Line yAxisId="cr" type="monotone" dataKey="revised_cost" name="Revised Cost Baseline" stroke="#8A8175" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
            </LineChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E1" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5F6368' }} tickLine={false} stroke="#D9D9D6" />
              <YAxis yAxisId="risk" tick={{ fontSize: 11, fill: '#5F6368' }} domain={[0, 100]} tickLine={false} stroke="#D9D9D6" />
              <YAxis yAxisId="delay" orientation="right" tick={{ fontSize: 11, fill: '#5F6368' }} unit=" d" tickLine={false} stroke="#D9D9D6" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D9D9D6', color: '#252525', fontSize: '12px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                formatter={(val, name) => [
                  name === 'Composite Risk Score' ? `${val} / 100` : `${val} Days Delay`,
                  name
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line yAxisId="risk" type="monotone" dataKey="risk" name="Composite Risk Score" stroke="#B63A32" strokeWidth={2.5} dot={{ r: 3.5, fill: '#B63A32' }} />
              <Line yAxisId="delay" type="monotone" dataKey="delay" name="Cumulative Delay (Days)" stroke="#B58A27" strokeWidth={2} dot={{ r: 3, fill: '#B58A27' }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
