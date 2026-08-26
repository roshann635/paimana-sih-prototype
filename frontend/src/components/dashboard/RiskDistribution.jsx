import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { ShieldAlert, PieChart } from 'lucide-react';

export default function RiskDistribution({ distribution = {}, riskCounts = {} }) {
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
    { label: 'NORMAL (GREEN)', level: 'GREEN', count: normal, pct: pctNormal, color: '#2B6E44', bg: 'bg-[#EDF7F1]', border: 'border-[#BDDFCB]' },
    { label: 'WATCH (AMBER)', level: 'AMBER', count: watch, pct: pctWatch, color: '#916812', bg: 'bg-[#FEF9EB]', border: 'border-[#EBD9A0]' },
    { label: 'REVIEW (ORANGE)', level: 'ORANGE', count: review, pct: pctReview, color: '#B55214', bg: 'bg-[#FEF3EB]', border: 'border-[#F5CDAF]' },
    { label: 'CRITICAL (RED)', level: 'RED', count: critical, pct: pctCritical, color: '#A82420', bg: 'bg-[#FDF0EF]', border: 'border-[#F3BFBC]' },
  ];

  return (
    <div className="bg-gov-surface border border-gov-border rounded-gov p-6 shadow-gov flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gov-border">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-brand-dark" />
            <div>
              <h3 className="text-sm font-bold text-text-primary">Portfolio Risk Distribution</h3>
              <p className="text-xs text-text-secondary mt-0.5">Categorization across standard institutional risk tiers.</p>
            </div>
          </div>
          <span className="text-xs font-mono text-text-primary font-bold bg-[#FAFBF8] px-2.5 py-1 rounded border border-gov-border shadow-xs">
            {isPending ? 'Risk classification pending' : `Total: ${total.toLocaleString()} Projects`}
          </span>
        </div>

        {isPending ? (
          <div className="p-8 text-center text-xs text-text-muted bg-[#FAFBF8] rounded-gov-sm border border-gov-border">
            Risk classification pending for active portfolio.
          </div>
        ) : (
          <>
            {/* Multi-tone stacked proportional bar */}
            <div className="h-5 w-full bg-gov-secondary rounded-gov-sm overflow-hidden flex mb-4 border border-gov-border shadow-xs">
              <div style={{ width: `${pctNormal}%`, backgroundColor: '#2B6E44' }} title={`Normal: ${normal} (${pctNormal}%)`} />
              <div style={{ width: `${pctWatch}%`, backgroundColor: '#916812' }} title={`Watch: ${watch} (${pctWatch}%)`} />
              <div style={{ width: `${pctReview}%`, backgroundColor: '#B55214' }} title={`Review: ${review} (${pctReview}%)`} />
              <div style={{ width: `${pctCritical}%`, backgroundColor: '#A82420' }} title={`Critical: ${critical} (${pctCritical}%)`} />
            </div>

            {/* Detailed Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <div key={cat.level} className={`p-3.5 rounded-gov-sm border ${cat.bg} ${cat.border} shadow-xs flex flex-col justify-between`}>
                  <div className="mb-2">
                    <StatusBadge level={cat.level} size="sm" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold font-mono text-text-primary tracking-tight">{cat.count.toLocaleString()}</div>
                    <div className="text-[11px] text-text-secondary mt-0.5 font-medium">{cat.pct}% of active portfolio</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
