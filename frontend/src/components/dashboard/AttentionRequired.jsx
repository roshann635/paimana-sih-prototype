import React, { useState } from 'react';
import { AlertOctagon, ArrowRight, ShieldAlert, BarChart3 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import TrendBadge from '../common/TrendBadge';

export default function AttentionRequired({ projects = [], onSelectProject, onExploreQueue }) {
  const topCritical = projects.slice(0, 5);
  const count = projects.length;
  const [selectedIdx, setSelectedIdx] = useState(0);

  const activeProj = topCritical[selectedIdx] || topCritical[0] || {};

  return (
    <div className="bg-white border border-[#E1E4E7] rounded-gov-lg p-6 shadow-gov border-l-[4px] border-l-risk-critical">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-[#E1E4E7]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-gov-sm bg-risk-critical/10 border border-risk-critical/20 flex items-center justify-center text-risk-critical">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-extrabold text-ink tracking-tight uppercase">
                Intervention Priority Queue
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-risk-criticalBg text-risk-critical border border-risk-criticalBorder">
                {count > 0 ? `${count} CRITICAL CANDIDATES` : '0 CRITICAL FLAGS'}
              </span>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              Ranked operations matrix prioritizing projects by Composite Risk × Financial Exposure × Urgency.
            </p>
          </div>
        </div>

        <button
          onClick={onExploreQueue}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-midnight hover:text-gold transition-colors bg-ivory px-3.5 py-1.5 rounded-gov-sm border border-[#E1E4E7] shadow-xs"
        >
          <span>Full Priority Matrix</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid: Operations Table + "WHY PRIORITIZED?" Breakdown Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table */}
        <div className="lg:col-span-8 overflow-x-auto border border-[#E1E4E7] rounded-gov-sm shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-midnight text-slate-300 border-b border-navy-light text-[11px] font-mono uppercase tracking-wider">
                <th className="py-3 px-3.5 font-bold w-12 text-center">Rank</th>
                <th className="py-3 px-3.5 font-bold">Project Title & Sector</th>
                <th className="py-3 px-3.5 text-right font-bold">Risk</th>
                <th className="py-3 px-3.5 text-right font-bold">Exposure</th>
                <th className="py-3 px-3.5 text-right font-bold">IPI</th>
                <th className="py-3 px-3.5 text-center font-bold">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E4E7] bg-white">
              {topCritical.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-ink-muted">
                    No critical projects flagged in current cycle.
                  </td>
                </tr>
              ) : (
                topCritical.map((proj, idx) => {
                  const isSelected = selectedIdx === idx;
                  return (
                    <tr
                      key={proj.project_id || idx}
                      onClick={() => {
                        setSelectedIdx(idx);
                        if (onSelectProject) onSelectProject(proj.project_id);
                      }}
                      className={`hover:bg-ivory transition-colors cursor-pointer group ${
                        isSelected ? 'bg-ivory/80 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5 text-center font-mono font-bold text-gold">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-ink group-hover:text-midnight transition-colors truncate max-w-[240px]">
                          {proj.project_name}
                        </div>
                        <div className="text-[11px] text-ink-secondary mt-0.5">
                          {proj.ministry} · {proj.sector}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-extrabold text-risk-critical">
                        {Math.round(proj.composite_risk_score || proj.risk_score || 0)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-ink">
                        {proj.revised_cost ? `₹${Number(proj.revised_cost).toLocaleString()} Cr` : '—'}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-extrabold">
                        <span className="bg-gold-light text-gold-dark px-2 py-0.5 rounded border border-gold-border">
                          {proj.ipi_score ? Number(proj.ipi_score).toFixed(0) : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <StatusBadge level={proj.risk_level} size="sm" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Right Side: "WHY PRIORITIZED?" Decomposition Panel */}
        <div className="lg:col-span-4 bg-midnight text-white border border-navy-light rounded-gov-sm p-4 shadow-command space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-navy-light">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gold" />
              <span className="text-xs font-mono font-bold text-gold uppercase tracking-wider">
                Why Prioritized?
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {activeProj.project_code || activeProj.project_id || 'PAI-001'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Risk Factor */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-medium">Predictive Risk Level</span>
                <span className="font-mono text-gold font-bold">{Math.round(activeProj.composite_risk_score || 92)}/100</span>
              </div>
              <div className="h-1.5 bg-navy rounded-full overflow-hidden">
                <div className="h-full bg-risk-critical rounded-full" style={{ width: `${Math.min(100, activeProj.composite_risk_score || 92)}%` }}></div>
              </div>
            </div>

            {/* Financial Exposure */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-medium">Financial Exposure</span>
                <span className="font-mono text-gold font-bold">88/100</span>
              </div>
              <div className="h-1.5 bg-navy rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>

            {/* Urgency */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-medium">Timeline Urgency</span>
                <span className="font-mono text-gold font-bold">82/100</span>
              </div>
              <div className="h-1.5 bg-navy rounded-full overflow-hidden">
                <div className="h-full bg-risk-high rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            {/* Strategic Criticality */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-medium">Strategic Criticality</span>
                <span className="font-mono text-gold font-bold">94/100</span>
              </div>
              <div className="h-1.5 bg-navy rounded-full overflow-hidden">
                <div className="h-full bg-teal rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-navy-light">
            <button
              onClick={() => onSelectProject && onSelectProject(activeProj.project_id)}
              className="w-full py-2 px-3 bg-gold hover:bg-gold-dark text-midnight font-bold text-xs rounded-gov-sm transition-colors text-center shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Inspect Project Diagnostic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
