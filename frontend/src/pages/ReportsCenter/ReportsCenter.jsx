import React, { useState } from 'react';
import { FileText, Download, Printer, ShieldAlert } from 'lucide-react';
import { paimanaApi } from '../../services/api/paimanaApi';

const REPORT_TYPES = [
  {
    id: 'portfolio_executive',
    title: 'National Infrastructure Executive Portfolio Briefing',
    desc: 'Comprehensive summary of 1,630 central projects, total capex commitments, and overall cost overrun distribution.',
    records: '1,630 Projects',
    cycle: 'December 2025 Cycle'
  },
  {
    id: 'critical_watchlist',
    title: 'High-Risk & Critical Intervention Dossier',
    desc: 'Detailed breakdown of projects in Critical Review tier with accumulated slippage and root-cause TreeSHAP attributions.',
    records: '38 Critical Projects',
    cycle: 'December 2025 Cycle'
  },
  {
    id: 'ministry_dossier',
    title: 'Inter-Ministerial Capex & Milestone Performance Report',
    desc: 'Comparative evaluation across Road Transport, Railways, Petroleum, Power, Coal, and Urban Development.',
    records: '17+ Ministries',
    cycle: 'December 2025 Cycle'
  },
  {
    id: 'sector_baseline',
    title: 'Sector Empirical Peer Baselines & Velocity Matrix',
    desc: 'Median progress velocities, cost escalation baselines, and peer deviation thresholds across 22+ sectors.',
    records: '25 Sectors',
    cycle: 'December 2025 Cycle'
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
        const res = await paimanaApi.getProjects({ limit: 150 });
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
        link.setAttribute('download', `${report.id}_paimana_demo.csv`);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Official Reports & Executive Downloads
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Exportable monitoring dossiers, ministerial briefings, and priority matrices.
          </p>
        </div>

        <button
          onClick={handlePrintBriefing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gov-surface border border-gov-border rounded-gov-sm text-xs font-semibold text-text-primary hover:bg-[#F7F7F4] transition-colors shadow-gov"
        >
          <Printer className="w-3.5 h-3.5 text-text-secondary" />
          <span>Print Executive Dossier</span>
        </button>
      </div>

      {/* Prototype Reference Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-gov text-amber-900 text-xs flex items-center gap-2.5 font-medium shadow-gov">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700" />
        <span>
          <strong>PAIMANA SIH Prototype:</strong> Exported documents and CSV tables are simulated decision-support dossiers generated for evaluation.
        </span>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_TYPES.map((rep) => (
          <div key={rep.id} className="bg-gov-surface border border-gov-border rounded-gov p-6 shadow-gov flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand" />
                  <h3 className="text-sm font-bold text-text-primary">{rep.title}</h3>
                </div>
                <span className="text-[10px] font-mono text-text-muted">{rep.cycle}</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                {rep.desc}
              </p>
              <div className="text-[11px] font-mono text-text-muted">
                Scope: <span className="font-semibold text-text-primary">{rep.records}</span>
              </div>
            </div>

            <div className="pt-3.5 border-t border-gov-border flex items-center justify-end gap-2">
              <button
                onClick={() => handleDownloadCSV(rep)}
                disabled={downloadingId === rep.id}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gov-surface hover:bg-[#F7F7F4] text-text-primary text-xs font-semibold rounded-gov-sm border border-gov-border transition-colors shadow-gov"
              >
                <Download className="w-3.5 h-3.5 text-text-secondary" />
                <span>{downloadingId === rep.id ? 'Generating...' : 'Download CSV'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
