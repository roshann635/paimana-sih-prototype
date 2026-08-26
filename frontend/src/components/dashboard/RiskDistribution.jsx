import React from 'react';
import StatusBadge from '../common/StatusBadge';

export default function RiskDistribution({ distribution = {} }) {
  const normal = distribution.normal_green || 0;
  const watch = distribution.watch_amber || 0;
  const review = distribution.review_orange || 0;
  const critical = distribution.critical_red || 0;

  const total = normal + watch + review + critical || 1;

  const pctNormal = Math.round((normal / total) * 100);
  const pctWatch = Math.round((watch / total) * 100);
  const pctReview = Math.round((review / total) * 100);
  const pctCritical = Math.round((critical / total) * 100);

  const categories = [
    { label: 'NORMAL (GREEN)', level: 'GREEN', count: normal, pct: pctNormal, color: '#3F7D58' },
    { label: 'WATCH (AMBER)', level: 'AMBER', count: watch, pct: pctWatch, color: '#B58A27' },
    { label: 'REVIEW (ORANGE)', level: 'ORANGE', count: review, pct: pctReview, color: '#C66A22' },
    { label: 'CRITICAL (RED)', level: 'RED', count: critical, pct: pctCritical, color: '#B63A32' },
  ];

  return (
    <div className="bg-gov-surface border border-gov-border rounded-gov p-5 shadow-gov">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gov-border">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Portfolio Risk Distribution</h3>
          <p className="text-xs text-text-secondary">Distribution of projects across standard institutional monitoring tiers.</p>
        </div>
        <span className="text-xs font-mono text-text-muted">Total: {total.toLocaleString()}</span>
      </div>

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
          <div key={cat.level} className="p-3 bg-gov-secondary/40 rounded-gov-sm border border-gov-border/70">
            <div className="mb-2">
              <StatusBadge level={cat.level} size="sm" />
            </div>
            <div className="text-xl font-bold font-mono text-text-primary">{cat.count.toLocaleString()}</div>
            <div className="text-[11px] text-text-muted">{cat.pct}% of active portfolio</div>
          </div>
        ))}
      </div>
    </div>
  );
}
