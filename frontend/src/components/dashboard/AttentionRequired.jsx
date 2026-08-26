import React from 'react';
import { AlertOctagon, ArrowRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import TrendBadge from '../common/TrendBadge';

export default function AttentionRequired({ projects = [], onSelectProject, onExploreQueue }) {
  const topCritical = projects.slice(0, 6);

  return (
    <div className="bg-gov-surface border border-gov-border rounded-gov p-5 shadow-gov">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gov-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-gov-sm bg-risk-critical/10 border border-risk-critical/20 flex items-center justify-center text-risk-critical">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Attention Required
              </h3>
              <span className="bg-risk-critical text-white text-[10px] font-bold px-1.5 py-0.2 rounded-sm">
                {projects.length} High-Risk Flags
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Projects exhibiting acute schedule stagnation, persistent bottlenecks, or severe capex exposure.
            </p>
          </div>
        </div>

        <button
          onClick={onExploreQueue}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark hover:text-brand transition-colors"
        >
          <span>View Full Intervention Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gov-secondary/70 text-text-secondary border-b border-gov-border text-[11px] uppercase tracking-wider">
              <th className="py-2 px-3 font-semibold w-12 text-center">Rank</th>
              <th className="py-2 px-3 font-semibold">Project</th>
              <th className="py-2 px-3 font-semibold">Ministry / Sector</th>
              <th className="py-2 px-3 text-right font-semibold">Risk Score</th>
              <th className="py-2 px-3 text-right font-semibold">IPI Priority</th>
              <th className="py-2 px-3 font-semibold">Trajectory</th>
              <th className="py-2 px-3 text-center font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gov-border">
            {topCritical.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-xs text-text-muted">
                  No projects currently flagged for critical intervention.
                </td>
              </tr>
            ) : (
              topCritical.map((proj, idx) => (
                <tr
                  key={proj.project_id || idx}
                  onClick={() => onSelectProject && onSelectProject(proj.project_id)}
                  className="hover:bg-gov-secondary/40 transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-text-muted">
                    #{idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-text-primary group-hover:text-brand transition-colors">
                      {proj.project_name}
                    </div>
                    <div className="text-[11px] font-mono text-text-muted">
                      {proj.project_code || proj.project_id}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-text-primary truncate max-w-[200px]">{proj.ministry}</div>
                    <div className="text-[11px] text-text-muted">{proj.sector}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-risk-critical">
                    {Math.round(proj.composite_risk_score || proj.risk_score || 0)}/100
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-text-primary">
                    <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                      {proj.ipi_score ? proj.ipi_score.toFixed(1) : '—'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <TrendBadge direction={proj.trend_direction} />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <StatusBadge level={proj.risk_level} size="sm" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
