import React from 'react';
import { AlertOctagon, ArrowRight, ShieldAlert } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import TrendBadge from '../common/TrendBadge';

export default function AttentionRequired({ projects = [], onSelectProject, onExploreQueue }) {
  const topCritical = projects.slice(0, 6);
  const count = projects.length;

  const countBadgeText = count === 0
    ? '0 CRITICAL FLAGS'
    : `${count} CRITICAL PROJECT${count > 1 ? 'S' : ''} REQUIRE REVIEW`;

  return (
    <div className="bg-gov-surface border border-gov-border rounded-gov p-6 shadow-gov border-l-[5px] border-l-risk-critical">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gov-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-gov bg-red-50 border border-red-200 flex items-center justify-center text-risk-critical shadow-xs">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-extrabold text-text-primary tracking-tight uppercase">
                Attention Required
              </h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                count > 0
                  ? 'bg-red-50 text-risk-critical border-[#F3BFBC] shadow-xs'
                  : 'bg-gov-secondary text-text-secondary border-gov-border'
              }`}>
                {countBadgeText}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Projects exhibiting acute schedule stagnation, persistent bottlenecks, or severe capex exposure.
            </p>
          </div>
        </div>

        <button
          onClick={onExploreQueue}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:text-brand transition-colors bg-brand-light px-3 py-1.5 rounded border border-brand-border shadow-xs"
        >
          <span>View Full Priority Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gov-border rounded-gov-sm shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#E6E8E1] text-[#4A5158] border-b border-gov-border text-[11px] uppercase tracking-wider">
              <th className="py-3 px-3.5 font-bold w-14 text-center">Rank</th>
              <th className="py-3 px-3.5 font-bold">Project Title & Code</th>
              <th className="py-3 px-3.5 font-bold">Ministry & Sector</th>
              <th className="py-3 px-3.5 text-right font-bold">Risk Score</th>
              <th className="py-3 px-3.5 text-right font-bold">IPI Priority</th>
              <th className="py-3 px-3.5 font-bold">Trajectory</th>
              <th className="py-3 px-3.5 text-center font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gov-border bg-white">
            {topCritical.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-text-muted">
                  No projects currently flagged for critical intervention.
                </td>
              </tr>
            ) : (
              topCritical.map((proj, idx) => (
                <tr
                  key={proj.project_id || idx}
                  onClick={() => onSelectProject && onSelectProject(proj.project_id)}
                  className="hover:bg-[#F6F7F2] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3.5 text-center font-mono font-bold text-text-secondary">
                    <span className="w-6 h-6 rounded-full bg-gov-secondary inline-flex items-center justify-center text-[11px] border border-gov-border">
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-text-primary group-hover:text-brand-dark transition-colors">
                      {proj.project_name}
                    </div>
                    <div className="text-[11px] font-mono text-text-muted mt-0.5">
                      {proj.project_code || proj.project_id}
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="text-text-primary font-medium truncate max-w-[200px]">{proj.ministry}</div>
                    <div className="text-[11px] text-text-secondary mt-0.5">{proj.sector}</div>
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-risk-critical text-sm">
                    {Math.round(proj.composite_risk_score || proj.risk_score || 0)}/100
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold">
                    <span className="bg-[#FBF2E3] text-[#964F0A] px-2 py-0.5 rounded border border-[#E8C89C] shadow-xs">
                      {proj.ipi_score ? proj.ipi_score.toFixed(1) : '—'}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <TrendBadge direction={proj.trend_direction} />
                  </td>
                  <td className="py-3 px-3.5 text-center">
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
