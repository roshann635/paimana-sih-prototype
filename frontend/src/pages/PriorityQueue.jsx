import React, { useEffect, useState } from 'react';
import { 
  Search, Filter, MapPin, Eye, FileText, Download, Building
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

  // Filters
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

  function exportCSV() {
    if (!projects.length) return;
    const headers = ['Rank', 'Project ID', 'Code', 'Project Name', 'Ministry', 'Sector', 'Agency', 'State', 'Original Cost (Cr)', 'Revised Cost (Cr)', 'Progress %', 'Delay (Days)', 'Risk Score', 'Risk Level', 'IPI Score', 'Trend'];
    const rows = projects.map((p, idx) => [
      (page - 1) * limit + idx + 1,
      p.project_id,
      p.project_code,
      `"${p.project_name.replace(/"/g, '""')}"`,
      `"${p.ministry}"`,
      `"${p.sector}"`,
      p.implementing_agency,
      p.state,
      p.original_cost,
      p.revised_cost,
      p.physical_progress_pct,
      p.delay_days,
      p.composite_risk_score,
      p.risk_level,
      p.ipi_score,
      p.trend_direction
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PAIMANA_Priority_Queue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Official Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight">
                Intervention Priority Queue (IPI)
              </h1>
              <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                Ranked by Decision Urgency
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Provides administrative decision support by ordering projects based on composite risk probability weighted by capital outlay at stake, timeline criticality, and quarterly deterioration velocity.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold transition"
              title="Download CSV of current queue"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 shadow-sm text-xs">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by project identifier, name, or agency..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
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
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
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
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="All">All Risk Tiers</option>
            <option value="RED">RED (Critical Review: 75–100)</option>
            <option value="ORANGE">ORANGE (High Risk: 50–74)</option>
            <option value="AMBER">AMBER (Moderate Watch: 25–49)</option>
            <option value="GREEN">GREEN (On Track: 0–24)</option>
          </select>
        </div>

        {/* Sort Field */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="ipi_score">Sort: IPI Score (Urgency)</option>
            <option value="composite_risk_score">Sort: Risk Score</option>
            <option value="revised_cost">Sort: Revised Capex</option>
            <option value="delay_days">Sort: Schedule Delay</option>
          </select>
        </div>
      </div>

      {/* Official Data Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-3.5 text-center w-12"># Rank</th>
                <th className="py-3 px-3.5">Project Details & Agency</th>
                <th className="py-3 px-3.5">Sector & State</th>
                <th className="py-3 px-3.5 text-right">Revised Capex</th>
                <th className="py-3 px-3.5 text-center">Progress / Slippage</th>
                <th className="py-3 px-3.5 text-center">Risk Tier</th>
                <th className="py-3 px-3.5 text-center">Trajectory</th>
                <th className="py-3 px-3.5 text-center">IPI Score</th>
                <th className="py-3 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading priority queue records...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No infrastructure records match current filter parameters.
                  </td>
                </tr>
              ) : (
                projects.map((proj, idx) => {
                  const globalRank = (page - 1) * limit + idx + 1;
                  const isTop5 = globalRank <= 5;
                  return (
                    <tr
                      key={proj.project_id}
                      className={`hover:bg-slate-800/60 transition cursor-pointer ${
                        isTop5 ? 'bg-red-950/15' : ''
                      }`}
                      onClick={() => onSelectProject(proj.project_id)}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold font-mono ${
                            isTop5
                              ? 'bg-red-700 text-white font-black'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {globalRank}
                        </span>
                      </td>

                      {/* Project Details */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-bold text-white group-hover:text-blue-300 transition line-clamp-1 max-w-sm">
                          {proj.project_name}
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                          <span className="text-blue-400 font-bold">{proj.project_id}</span>
                          <span>•</span>
                          <span className="text-slate-300 font-sans">{proj.implementing_agency}</span>
                        </div>
                      </td>

                      {/* Sector & State */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-medium text-slate-200">{proj.sector}</div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{proj.state}</span>
                        </div>
                      </td>

                      {/* Revised Capex */}
                      <td className="py-3.5 px-3.5 text-right font-mono">
                        <div className="font-bold text-white">₹{proj.revised_cost.toLocaleString()} Cr</div>
                        {proj.revised_cost > proj.original_cost && (
                          <div className="text-[10px] text-amber-400">
                            +₹{(proj.revised_cost - proj.original_cost).toFixed(0)} Cr (
                            {(((proj.revised_cost - proj.original_cost) / proj.original_cost) * 100).toFixed(0)}%)
                          </div>
                        )}
                      </td>

                      {/* Progress / Delay */}
                      <td className="py-3.5 px-3.5 text-center font-mono">
                        <div className="font-bold text-slate-200">{proj.physical_progress_pct}%</div>
                        <div className="text-[10px] text-red-400">
                          {proj.delay_days > 0 ? `+${proj.delay_days}d delay` : 'On Schedule'}
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-3.5 px-3.5 text-center">
                        <RAGBBadge level={proj.risk_level} score={proj.composite_risk_score} size="sm" />
                      </td>

                      {/* Trajectory */}
                      <td className="py-3.5 px-3.5 text-center">
                        <TrendIndicator trend={proj.trend_direction} showLabel={false} />
                      </td>

                      {/* IPI Score */}
                      <td className="py-3.5 px-3.5 text-center">
                        <span
                          className={`inline-flex items-center font-black text-xs font-mono px-2.5 py-1 rounded border ${
                            proj.ipi_score >= 80
                              ? 'bg-red-950 text-red-300 border-red-700/80'
                              : proj.ipi_score >= 60
                              ? 'bg-amber-950 text-amber-300 border-amber-700/80'
                              : 'bg-slate-950 text-slate-300 border-slate-700'
                          }`}
                        >
                          {proj.ipi_score.toFixed(1)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onSelectProject(proj.project_id)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Open Appraisal Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenIntervention(proj)}
                            className="px-2 py-1 rounded text-[11px] font-semibold bg-blue-900/40 text-blue-300 border border-blue-700/60 hover:bg-blue-800 hover:text-white transition"
                          >
                            Issue Directive
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
        <div className="bg-slate-950 p-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Displaying {(page - 1) * limit + 1}–{Math.min(page * limit, totalCount)} of {totalCount} monitored projects
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition"
            >
              Previous
            </button>
            <span className="px-2 font-mono font-bold text-slate-200">{page}</span>
            <button
              disabled={page * limit >= totalCount}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
