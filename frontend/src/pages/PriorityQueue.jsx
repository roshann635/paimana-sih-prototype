import React, { useEffect, useState } from 'react';
import { 
  Flame, Search, Building2, MapPin, Eye
} from 'lucide-react';
import { fetchProjects } from '../services/api';
import { RAGBBadge } from '../components/RAGBBadge';
import { TrendIndicator } from '../components/TrendIndicator';

export const PriorityQueue = ({
  onSelectProject,
  onOpenIntervention,
}) => {
  const [projects, setProjects] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortBy, setSortBy] = useState('ipi_score');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = 25;

  useEffect(() => {
    async function loadQueue() {
      setLoading(true);
      try {
        const res = await fetchProjects({
          search: search || undefined,
          sector: sectorFilter !== 'All' ? sectorFilter : undefined,
          risk_level: riskFilter !== 'All' ? riskFilter : undefined,
          sort_by: sortBy,
          order: order,
          limit: limit,
          offset: (page - 1) * limit,
        });
        setProjects(res.items);
        setTotalCount(res.total);
      } catch (err) {
        console.error('Error fetching priority queue:', err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(loadQueue, 200);
    return () => clearTimeout(timer);
  }, [search, sectorFilter, riskFilter, sortBy, order, page]);

  return (
    <div className="space-y-6 pb-12">
      {/* Priority Queue Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-red-950/40 p-6 rounded-2xl border border-red-900/30 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                <Flame className="w-5 h-5 text-red-400 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Intervention Priority Queue (IPI)
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                Ranked by Decision Urgency
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Prioritizes projects requiring high-level administrative review by synthesizing{' '}
              <strong className="text-white">Predictive Risk</strong> ×{' '}
              <strong className="text-emerald-400">Capital Exposure</strong> ×{' '}
              <strong className="text-amber-400">Schedule Criticality</strong> ×{' '}
              <strong className="text-rose-400">Deterioration Velocity</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
            <div>
              <span className="text-slate-400">Total Candidates:</span>{' '}
              <strong className="text-white text-sm">{totalCount}</strong>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <span className="text-slate-400">Showing Top:</span>{' '}
              <strong className="text-orange-400 text-sm">
                {(page - 1) * limit + 1}–{Math.min(page * limit, totalCount)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 shadow-sm">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by project code, name, or agency..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        {/* Sector Filter */}
        <div>
          <select
            value={sectorFilter}
            onChange={(e) => {
              setSectorFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-orange-500 transition"
          >
            <option value="All">All Sectors</option>
            <option value="Railways">Railways</option>
            <option value="National Highways">National Highways</option>
            <option value="Metro Rail">Metro Rail</option>
            <option value="Power Transmission">Power Transmission</option>
            <option value="Thermal Power">Thermal Power</option>
            <option value="Petroleum Refining">Petroleum Refining</option>
            <option value="Oil & Gas Pipelines">Oil & Gas Pipelines</option>
            <option value="Ports & Waterways">Ports & Waterways</option>
            <option value="Airports">Airports</option>
            <option value="Coal Mining">Coal Mining</option>
            <option value="Atomic Energy">Atomic Energy</option>
          </select>
        </div>

        {/* Risk Level Filter */}
        <div>
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-orange-500 transition"
          >
            <option value="All">All Risk Tiers</option>
            <option value="RED">RED Tier (Critical: 75–100)</option>
            <option value="ORANGE">ORANGE Tier (High: 50–74)</option>
            <option value="AMBER">AMBER Tier (Moderate: 25–49)</option>
            <option value="GREEN">GREEN Tier (Healthy: 0–24)</option>
          </select>
        </div>

        {/* Sort Field */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-orange-500 transition"
          >
            <option value="ipi_score">Sort by IPI Score (Urgency)</option>
            <option value="composite_risk_score">Sort by Risk Score</option>
            <option value="revised_cost">Sort by Revised Capex</option>
            <option value="delay_days">Sort by Schedule Delay</option>
          </select>
        </div>
      </div>

      {/* Ranked Priority Queue Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 text-center w-12"># Rank</th>
                <th className="py-3.5 px-4">Project & Agency</th>
                <th className="py-3.5 px-4">Sector & State</th>
                <th className="py-3.5 px-4 text-right">Revised Capex</th>
                <th className="py-3.5 px-4 text-center">Progress / Delay</th>
                <th className="py-3.5 px-4 text-center">Risk Score</th>
                <th className="py-3.5 px-4 text-center">Trend</th>
                <th className="py-3.5 px-4 text-center">IPI Score</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading ranked intervention queue...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No projects match current filter criteria.
                  </td>
                </tr>
              ) : (
                projects.map((proj, idx) => {
                  const globalRank = (page - 1) * limit + idx + 1;
                  const isTop5 = globalRank <= 5;
                  return (
                    <tr
                      key={proj.project_id}
                      className={`hover:bg-slate-800/50 transition cursor-pointer ${
                        isTop5 ? 'bg-red-950/10' : ''
                      }`}
                      onClick={() => onSelectProject(proj.project_id)}
                    >
                      {/* Rank */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black font-mono ${
                            isTop5
                              ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {globalRank}
                        </span>
                      </td>

                      {/* Project & Agency */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white group-hover:text-orange-400 transition line-clamp-1 max-w-xs">
                          {proj.project_name}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                          <span className="font-mono text-orange-400/90 font-semibold">{proj.project_id}</span>
                          <span>•</span>
                          <span className="text-slate-300">{proj.implementing_agency}</span>
                        </div>
                      </td>

                      {/* Sector & State */}
                      <td className="py-4 px-4">
                        <div className="text-xs font-medium text-slate-200">{proj.sector}</div>
                        <div className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{proj.state}</span>
                        </div>
                      </td>

                      {/* Revised Capex */}
                      <td className="py-4 px-4 text-right font-mono">
                        <div className="font-bold text-white">₹{proj.revised_cost.toLocaleString()} Cr</div>
                        {proj.revised_cost > proj.original_cost && (
                          <div className="text-[11px] text-amber-400">
                            +₹{(proj.revised_cost - proj.original_cost).toFixed(0)} Cr (
                            {(((proj.revised_cost - proj.original_cost) / proj.original_cost) * 100).toFixed(0)}%)
                          </div>
                        )}
                      </td>

                      {/* Physical Progress / Delay */}
                      <td className="py-4 px-4 text-center font-mono">
                        <div className="font-bold text-slate-200">{proj.physical_progress_pct}%</div>
                        <div className="text-[11px] text-rose-400">
                          {proj.delay_days > 0 ? `+${proj.delay_days} days delay` : 'On Schedule'}
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-4 px-4 text-center">
                        <RAGBBadge level={proj.risk_level} score={proj.composite_risk_score} size="md" />
                      </td>

                      {/* Trend */}
                      <td className="py-4 px-4 text-center">
                        <TrendIndicator trend={proj.trend_direction} showLabel={false} />
                      </td>

                      {/* IPI Score */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 font-black text-sm font-mono px-3 py-1 rounded-xl shadow-sm ${
                            proj.ipi_score >= 85
                              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-500/20'
                              : proj.ipi_score >= 65
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>{proj.ipi_score.toFixed(1)}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => onSelectProject(proj.project_id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Inspect Deep Dive & SHAP"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenIntervention(proj)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500 hover:text-slate-950 transition"
                          >
                            Intervene
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} projects
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition"
            >
              Previous
            </button>
            <span className="px-2 font-mono font-bold text-slate-200">{page}</span>
            <button
              disabled={page * limit >= totalCount}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
