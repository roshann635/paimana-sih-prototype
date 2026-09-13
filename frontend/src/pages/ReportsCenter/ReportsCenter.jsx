import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, ShieldAlert, Layers, Search } from 'lucide-react';
import { paimanaApi } from '../../services/api/paimanaApi';

const REPORT_TYPES = [
  {
    id: 'portfolio_executive',
    title: 'National Infrastructure Executive Portfolio Briefing',
    desc: 'Comprehensive summary of 2,733 unique central projects (1,775 active July 2026 / 1,981 April 2026 baseline), total capex commitments, and overall cost overrun distribution.',
    records: '2,733 Universe (1,775 Active)',
    cycle: 'July 2026 Cycle'
  },
  {
    id: 'critical_watchlist',
    title: 'High-Risk & Critical Intervention Dossier',
    desc: 'Detailed breakdown of projects in Critical Review tier with accumulated slippage and root-cause TreeSHAP attributions.',
    records: '38 Critical Projects',
    cycle: 'July 2026 Cycle'
  },
  {
    id: 'ministry_dossier',
    title: 'Inter-Ministerial Capex & Milestone Performance Report',
    desc: 'Comparative evaluation across Road Transport, Railways, Petroleum, Power, Coal, and Urban Development.',
    records: '17+ Ministries',
    cycle: 'July 2026 Cycle'
  },
  {
    id: 'sector_baseline',
    title: 'Sector Empirical Peer Baselines & Velocity Matrix',
    desc: 'Median progress velocities, cost escalation baselines, and peer deviation thresholds across 22+ sectors.',
    records: '25 Sectors',
    cycle: 'July 2026 Cycle'
  }
];

export default function ReportsCenter() {
  const [downloadingId, setDownloadingId] = useState(null);

  // Single Project PDF Selector State
  const [selectedProjectId, setSelectedProjectId] = useState('P_NUM_618427');
  const [projectSearch, setProjectSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!projectSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await paimanaApi.getProjects({ search: projectSearch, limit: 10 });
        setSearchResults(res?.items || (Array.isArray(res) ? res : []));
      } catch (e) {
        console.error("Project search failed:", e);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [projectSearch]);

  const handleDownloadCSV = async (report) => {
    setDownloadingId(report.id);
    try {
      let data = [];
      if (report.id === 'critical_watchlist') {
        data = await paimanaApi.getPriorityQueue({ risk_level: 'RED', limit: 100 });
      } else {
        const res = await paimanaApi.getProjects({ limit: 500 });
        data = res?.items || (Array.isArray(res) ? res : []);
      }

      if (data && data.length > 0) {
        const keys = Object.keys(data[0]);
        const headers = keys.join(',');
        const rows = data.map(row => keys.map(k => {
          let val = row[k];
          if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`;
          return val ?? '';
        }).join(','));

        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${report.id}_parakh_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Report export failed:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePrintBriefing = () => {
    window.print();
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-5 bg-[#07131F] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#16324A]">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#F59E0B]" />
            <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight uppercase">
              Official Reports & Executive Downloads
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Exportable monitoring dossiers, ministerial briefings, and priority matrices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={paimanaApi.getPortfolioPDFUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded-lg text-xs font-bold text-slate-950 transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Download Portfolio PDF</span>
          </a>
          <button
            onClick={handlePrintBriefing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0D1E30] hover:bg-[#16324A] border border-[#16324A] rounded-lg text-xs font-bold text-white transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Executive Dossier</span>
          </button>
        </div>
      </div>

      {/* Individual Project PDF Generator Card */}
      <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-4 sm:p-6 shadow-command-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#16324A] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#00E5FF]" />
              <h2 className="text-base font-bold text-white uppercase tracking-tight">
                Single-Project Executive PDF Dossier Generator (2,733 Projects)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select or search any project across all 17+ ministries to generate a publication-grade, minute-detail PDF dossier.
            </p>
          </div>
          <a
            href={paimanaApi.getProjectPDFUrl(selectedProjectId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#07131F] rounded-lg text-xs font-extrabold transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#07131F]" />
            <span>Download Project PDF ({selectedProjectId})</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Quick Select Buttons */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 mb-2 uppercase">
              Quick Select Featured Projects:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setSelectedProjectId('P_NUM_618427'); setProjectSearch(''); }}
                className={`px-2.5 py-1.5 rounded text-xs font-mono font-bold border transition-colors cursor-pointer ${selectedProjectId === 'P_NUM_618427' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]' : 'bg-[#07131F] text-slate-300 border-[#16324A] hover:bg-[#11263C]'}`}
              >
                P618427 (Highway Express)
              </button>
              <button
                onClick={() => { setSelectedProjectId('P_NUM_400161'); setProjectSearch(''); }}
                className={`px-2.5 py-1.5 rounded text-xs font-mono font-bold border transition-colors cursor-pointer ${selectedProjectId === 'P_NUM_400161' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]' : 'bg-[#07131F] text-slate-300 border-[#16324A] hover:bg-[#11263C]'}`}
              >
                P400161 (Petrochemical)
              </button>
              <button
                onClick={() => { setSelectedProjectId('P_NUM_400005'); setProjectSearch(''); }}
                className={`px-2.5 py-1.5 rounded text-xs font-mono font-bold border transition-colors cursor-pointer ${selectedProjectId === 'P_NUM_400005' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]' : 'bg-[#07131F] text-slate-300 border-[#16324A] hover:bg-[#11263C]'}`}
              >
                P400005 (Railways)
              </button>
              <button
                onClick={() => { setSelectedProjectId('P_NUM_400275'); setProjectSearch(''); }}
                className={`px-2.5 py-1.5 rounded text-xs font-mono font-bold border transition-colors cursor-pointer ${selectedProjectId === 'P_NUM_400275' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]' : 'bg-[#07131F] text-slate-300 border-[#16324A] hover:bg-[#11263C]'}`}
              >
                P400275 (Coal Belt)
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <label className="block text-xs font-mono font-bold text-slate-400 mb-1.5 uppercase">
              Or Search Any Project (Code or Name):
            </label>
            <input
              type="text"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              placeholder="Search e.g. Ramganjmundi, Expressway, P400161..."
              className="w-full bg-[#07131F] border border-[#16324A] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
            />
            {searching && (
              <div className="absolute right-3 top-8 text-xs text-slate-400 animate-pulse font-mono">
                Searching...
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#0D1E30] border border-[#16324A] rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-[#16324A]">
                {searchResults.map((p) => (
                  <button
                    key={p.project_id}
                    onClick={() => {
                      setSelectedProjectId(p.project_id);
                      setProjectSearch('');
                      setSearchResults([]);
                    }}
                    className="w-full text-left p-2.5 hover:bg-[#16324A] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{p.project_name}</div>
                      <div className="text-[10.5px] font-mono text-slate-400">{p.project_code || p.project_id} · {p.ministry}</div>
                    </div>
                    <span className="text-[10px] font-mono text-[#00E5FF] px-1.5 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 shrink-0">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
        {REPORT_TYPES.map((rep) => (
          <div
            key={rep.id}
            className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-4 sm:p-6 shadow-command-card flex flex-col justify-between space-y-4 hover:border-[#1E4260] transition-all"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-[#16324A]">
                <span className="font-mono text-[#00E5FF] font-bold">{rep.records}</span>
                <span className="font-mono">{rep.cycle}</span>
              </div>

              <h3 className="text-base font-bold text-white mt-3 mb-1">
                {rep.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {rep.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-[#16324A] flex items-center justify-between gap-2">
              <a
                href={rep.id === 'critical_watchlist' ? paimanaApi.getProjectPDFUrl('P_NUM_400275') : paimanaApi.getPortfolioPDFUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#00E5FF] hover:underline"
              >
                <FileText className="w-3 h-3" />
                <span>PDF Document</span>
              </a>
              <button
                onClick={() => handleDownloadCSV(rep)}
                disabled={downloadingId === rep.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#07131F] hover:bg-[#11263C] text-white text-xs font-mono font-bold rounded-lg border border-[#16324A] transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>{downloadingId === rep.id ? 'Generating...' : 'Export Dataset CSV'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
