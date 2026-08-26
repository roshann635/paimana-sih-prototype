import React from 'react';
import StatusBadge from '../common/StatusBadge';

export default function RiskDistribution({ distribution = {}, riskCounts = {} }) {
  // Support both risk_counts ({ RED, ORANGE, AMBER, GREEN }) and risk_distribution formats
  const normal = riskCounts.GREEN ?? distribution.normal_green ?? distribution.GREEN ?? 0;
  const watch = riskCounts.AMBER ?? distribution.watch_amber ?? distribution.AMBER ?? 0;
  const review = riskCounts.ORANGE ?? distribution.review_orange ?? distribution.ORANGE ?? 0;
  const critical = riskCounts.RED ?? distribution.critical_red ?? distribution.RED ?? 0;

  const total = normal + watch + review + critical;
  const isPending = total === 0;

  const pctNormal = total > 0 ? Math.round((normal / total) * 100) : 0;
  const pctWatch = total > 0 ? Math.round((watch / total) * 100) : 0;
  const pctReview = total > 0 ? Math.round((review / total) * 100) : 0;
  const pctCritical = total > 0 ? Math.round((critical / total) * 100) : 0;

  const categories = [
    { label: 'NORMAL (GREEN)', level: 'GREEN', count: normal, pct: pctNormal, color: '#3F7D58' },
    { label: 'WATCH (AMBER)', level: 'AMBER', count: watch, pct: pctWatch, color: '#B58A27' },
    { label: 'REVIEW (ORANGE)', level: 'ORANGE', count: review, pct: pctReview, color: '#C66A22' },
    { label: 'CRITICAL (RED)', level: 'RED', count: critical, pct: pctCritical, color: '#B63A32' },
  ];

  return (
    <div className="bg-gov-surface border border-gov-border rounded-gov p-6 shadow-gov">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gov-border">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Portfolio Risk Distribution</h3>
          <p className="text-xs text-text-secondary mt-0.5">Distribution of monitored projects across standard institutional risk tiers.</p>
        </div>
        <span className="text-xs font-mono text-text-secondary font-semibold bg-[#F7F7F4] px-2.5 py-1 rounded border border-gov-border">
          {isPending ? 'Risk classification pending' : `Total: ${total.toLocaleString()} Projects`}
        </span>
      </div>

      {isPending ? (
        <div className="p-6 text-center text-xs text-text-muted bg-[#F7F7F4] rounded-gov-sm border border-gov-border">
          Risk classification pending for active portfolio.
        </div>
      ) : (
        <>
          {/* Stacked Proportional Bar */}
          <div className="h-4 w-full bg-gov-secondary rounded-gov-sm overflow-hidden flex mb-4 border border-gov-border">
            <div style={{ width: `${pctNormal}%`, backgroundColor: '#3F7D58' }} title={`Normal: ${normal} (${pctNormal}%)`} />
            <div style={{ width: `${pctWatch}%`, backgroundColor: '#B58A27' }} title={`Watch: ${watch} (${pctWatch}%)`} />
            <div style={{ width: `${pctReview}%`, backgroundColor: '#C66A22' }} title={`Review: ${review} (${pctReview}%)`} />
            <div style={{ width: `${pctCritical}%`, backgroundColor: '#B63A32' }} title={`Critical: ${critical} (${pctCritical}%)`} />
          </div>

          {/* Detailed Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div key={cat.level} className="p-3 bg-[#F7F7F4] rounded-gov-sm border border-gov-border">
                <div className="mb-1.5">
                  <StatusBadge level={cat.level} size="sm" />
                </div>
                <div className="text-xl font-bold font-mono text-text-primary">{cat.count.toLocaleString()}</div>
                <div className="text-[11px] text-text-muted mt-0.5">{cat.pct}% of classified portfolio</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
