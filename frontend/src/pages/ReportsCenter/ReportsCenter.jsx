import React, { useState } from 'react';
import { FileText, Download, Printer, ShieldAlert, Layers } from 'lucide-react';
import { paimanaApi } from '../../services/api/paimanaApi';

const REPORT_TYPES = [
  {
    id: 'portfolio_executive',
    title: 'National Infrastructure Executive Portfolio Briefing',
    desc: 'Comprehensive summary of 1,630 central projects, total capex commitments, and overall cost overrun distribution.',
    records: '1,630 Projects',
    cycle: 'June 2026 Cycle'
  },
  {
    id: 'critical_watchlist',
    title: 'High-Risk & Critical Intervention Dossier',
    desc: 'Detailed breakdown of projects in Critical Review tier with accumulated slippage and root-cause TreeSHAP attributions.',
    records: '38 Critical Projects',
    cycle: 'June 2026 Cycle'
  },
  {
    id: 'ministry_dossier',
    title: 'Inter-Ministerial Capex & Milestone Performance Report',
    desc: 'Comparative evaluation across Road Transport, Railways, Petroleum, Power, Coal, and Urban Development.',
    records: '17+ Ministries',
    cycle: 'June 2026 Cycle'
  },
  {
    id: 'sector_baseline',
    title: 'Sector Empirical Peer Baselines & Velocity Matrix',
    desc: 'Median progress velocities, cost escalation baselines, and peer deviation thresholds across 22+ sectors.',
    records: '25 Sectors',
    cycle: 'June 2026 Cycle'
  }
];

export default function ReportsCenter() {
  const [downloadingId, setDownloadingId] = useState(null);

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
        link.setAttribute('download', `${report.id}_paimana_export.csv`);
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
    <div className="p-6 space-y-5 bg-[#07131F] min-h-screen">
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

        <button
          onClick={handlePrintBriefing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0D1E30] hover:bg-[#16324A] border border-[#16324A] rounded-lg text-xs font-bold text-white transition-colors shadow-xs"
        >
          <Printer className="w-3.5 h-3.5 text-slate-400" />
          <span>Print Executive Dossier</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {REPORT_TYPES.map((rep) => (
          <div
            key={rep.id}
            className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-6 shadow-command-card flex flex-col justify-between space-y-4 hover:border-[#1E4260] transition-all"
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

            <div className="pt-3 border-t border-[#16324A] flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">CSV Export Ready</span>
              <button
                onClick={() => handleDownloadCSV(rep)}
                disabled={downloadingId === rep.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#07131F] hover:bg-[#11263C] text-white text-xs font-mono font-bold rounded-lg border border-[#16324A] transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>{downloadingId === rep.id ? 'Generating...' : 'Export Dataset'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
