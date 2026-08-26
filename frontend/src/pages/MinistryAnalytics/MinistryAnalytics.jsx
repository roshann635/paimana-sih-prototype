import React, { useState, useEffect } from 'react';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { paimanaApi } from '../../services/api/paimanaApi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function MinistryAnalytics({ onNavigate }) {
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    paimanaApi.getProjects({ limit: 1630 })
      .then((res) => {
        const items = res?.items || (Array.isArray(res) ? res : []);
        const grouped = {};

        items.forEach(p => {
          const m = p.ministry || 'Ministry of Infrastructure';
          if (!grouped[m]) {
            grouped[m] = {
              ministry: m,
              project_count: 0,
              original_cost: 0,
              revised_cost: 0,
              critical_count: 0,
              total_progress: 0,
            };
          }
          grouped[m].project_count += 1;
          grouped[m].original_cost += (p.original_cost || 0);
          grouped[m].revised_cost += (p.revised_cost || p.original_cost || 0);
          grouped[m].total_progress += (p.physical_progress_pct || 0);
          if (p.risk_level === 'RED' || p.risk_level === 'CRITICAL') {
            grouped[m].critical_count += 1;
          }
        });

        const data = Object.values(grouped).map(g => ({
          ministry: g.ministry,
          project_count: g.project_count,
          total_capex: Math.round(g.original_cost),
          revised_cost: Math.round(g.revised_cost),
          critical_count: g.critical_count,
          high_risk_pct: g.project_count > 0 ? Math.round((g.critical_count / g.project_count) * 100) : 0,
          capex_at_risk: Math.round(g.critical_count > 0 ? g.revised_cost * (g.critical_count / g.project_count) : 0),
          avg_progress: g.project_count > 0 ? Math.round(g.total_progress / g.project_count) : 0,
        })).sort((a, b) => b.revised_cost - a.revised_cost);

        setMinistries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load ministry analytics:', err);
        setError('Unable to load ministry portfolio metrics.');
        setLoading(false);
      });
  }, []);

  const columns = [
    {
      key: 'ministry',
      header: 'Central Ministry / Department',
      render: (val) => (
        <div className="font-semibold text-text-primary text-xs truncate max-w-xs">{val}</div>
      )
    },
    {
      key: 'project_count',
      header: 'Projects',
      align: 'right',
      render: (val) => <span className="font-mono text-xs font-semibold">{val}</span>
    },
    {
      key: 'total_capex',
      header: 'Sanctioned Capex',
      align: 'right',
      render: (val) => `₹${Number(val).toLocaleString()} Cr`
    },
    {
      key: 'revised_cost',
      header: 'Revised Baseline',
      align: 'right',
      render: (val) => `₹${Number(val).toLocaleString()} Cr`
    },
    {
      key: 'avg_progress',
      header: 'Mean Progress',
      align: 'right',
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-text-primary">
          {val}%
        </span>
      )
    },
    {
      key: 'critical_count',
      header: 'Critical Flags',
      align: 'right',
      render: (val, row) => (
        <span className="font-mono font-bold text-risk-critical">
          {val} ({row.high_risk_pct}%)
        </span>
      )
    },
    {
      key: 'capex_at_risk',
      header: 'Capex at Risk',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-risk-review">
          ₹${Number(val).toLocaleString()} Cr
        </span>
      )
    }
  ];

  const topMinistriesChart = ministries.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-gov-border">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Ministry Portfolio Analytics
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Comparative capital deployment, milestone performance, and risk concentration across central infrastructure ministries.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton rows={8} />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          {/* Top Ministries Capex Comparison Chart */}
          <div className="bg-gov-surface border border-gov-border rounded-gov p-6 shadow-gov">
            <div className="pb-3 mb-4 border-b border-gov-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Top Capital Deploying Ministries</h3>
                <p className="text-xs text-text-secondary mt-0.5">Revised baseline capital exposure vs Capex at critical risk.</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMinistriesChart} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E1" vertical={false} />
                  <XAxis dataKey="ministry" tick={{ fontSize: 10, fill: '#5F6368' }} interval={0} angle={-15} textAnchor="end" stroke="#D9D9D6" />
                  <YAxis tick={{ fontSize: 11, fill: '#5F6368' }} tickLine={false} stroke="#D9D9D6" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D9D9D6', color: '#252525', fontSize: '12px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                    formatter={(val, name) => [`₹${Number(val).toLocaleString()} Cr`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="revised_cost" name="Revised Capital Baseline (₹ Cr)" fill="#347B78" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capex_at_risk" name="Capex at Critical Risk (₹ Cr)" fill="#C66A22" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ministry Data Table */}
          <DataTable
            columns={columns}
            data={ministries}
            title="Inter-Ministerial Portfolio Matrix"
            subtitle="Sorted by total revised capital expenditure exposure."
            exportFilename="paimana_ministry_analytics.csv"
            itemsPerPage={15}
          />
        </>
      )}
    </div>
  );
}
