import React, { useState, useEffect } from 'react';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { paimanaApi } from '../../services/api/paimanaApi';
import { Scale, Info, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Benchmarking() {
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    paimanaApi.getBenchmarks()
      .then((data) => {
        setBenchmarks(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load sector benchmarks:', err);
        setError('Unable to load sector baselines.');
        setLoading(false);
      });
  }, []);

  const columns = [
    {
      key: 'sector',
      header: 'Sector',
      render: (val) => <div className="font-semibold text-text-primary text-xs">{val}</div>
    },
    {
      key: 'sample_size',
      header: 'Monitored Sample',
      align: 'right',
      render: (val) => <span className="font-mono text-xs font-semibold">{val} Projects</span>
    },
    {
      key: 'median_cost_escalation_pct',
      header: 'Median Cost Growth',
      align: 'right',
      render: (val) => `${Number(val || 0).toFixed(1)}%`
    },
    {
      key: 'median_delay_months',
      header: 'Median Slippage',
      align: 'right',
      render: (val) => `${Number(val || 0).toFixed(1)} Months`
    },
    {
      key: 'median_progress_velocity',
      header: 'Median Monthly Velocity',
      align: 'right',
      render: (val) => `${Number(val || 0).toFixed(2)}% / mo`
    },
    {
      key: 'median_risk_score',
      header: 'Median Risk Score',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-text-primary">
          {Math.round(val || 40)}/100
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-gov-border">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Sector Peer Benchmarking & Baselines
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Empirical baseline medians computed across peer central infrastructure groups to identify anomalous cost and schedule drift.
        </p>
      </div>

      {/* Conceptual Peer Comparison Box */}
      <div className="bg-gov-surface border border-gov-border rounded-gov p-5 shadow-gov">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gov-border">
          <Scale className="w-4 h-4 text-brand" />
          <h3 className="text-sm font-bold text-text-primary">Peer Deviation Evaluation Standard</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-gov-secondary/40 border border-gov-border rounded-gov-sm space-y-1">
            <div className="font-semibold text-text-primary">Progress Velocity Deviation</div>
            <p className="text-text-secondary text-[11px]">
              Compares a project's 3-month physical progress velocity against the sector median baseline. Negative deviations identify stagnation.
            </p>
          </div>

          <div className="p-3.5 bg-gov-secondary/40 border border-gov-border rounded-gov-sm space-y-1">
            <div className="font-semibold text-text-primary">Capex Drawdown Disparity</div>
            <p className="text-text-secondary text-[11px]">
              Evaluates cumulative financial utilization against actual physical milestone completion relative to peer medians.
            </p>
          </div>

          <div className="p-3.5 bg-gov-secondary/40 border border-gov-border rounded-gov-sm space-y-1">
            <div className="font-semibold text-text-primary">Schedule Expansion Velocity</div>
            <p className="text-text-secondary text-[11px]">
              Flags projects whose completion targets move further out faster than the historical sector median pace.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={8} />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <DataTable
          columns={columns}
          data={benchmarks}
          title="Sector Empirical Baseline Matrix"
          subtitle="Reference standards derived from multi-month historical MoSPI Flash Report records."
          exportFilename="paimana_sector_benchmarks.csv"
          itemsPerPage={15}
        />
      )}
    </div>
  );
}
