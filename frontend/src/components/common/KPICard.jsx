import React from 'react';
import { FileText, Coins, Landmark, Bell, ArrowUp, Info } from 'lucide-react';

export default function KPICard({
  type = 'portfolio', // 'portfolio' | 'baseline' | 'exposure' | 'alerts'
  title,
  value,
  subvalue,
  subvalueText,
  footerText,
  badgeColor = 'cyan',
  infoTooltip,
  provenanceTag, // 'OFFICIAL' | 'DERIVED' | 'DEMO'
}) {
  const getIcon = () => {
    switch (type) {
      case 'portfolio':
        return (
          <div className="w-12 h-12 rounded-full bg-[#07131F] border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-cyan-glow shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        );
      case 'baseline':
        return (
          <div className="w-12 h-12 rounded-full bg-[#07131F] border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B] shadow-gold-glow shrink-0">
            <Coins className="w-5 h-5" />
          </div>
        );
      case 'exposure':
        return (
          <div className="w-12 h-12 rounded-full bg-[#07131F] border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-cyan-glow shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
        );
      case 'alerts':
        return (
          <div className="w-12 h-12 rounded-full bg-[#07131F] border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] shadow-red-glow shrink-0">
            <Bell className="w-5 h-5" />
          </div>
        );
      default:
        return null;
    }
  };

  const getSubvalueBadge = () => {
    if (type === 'portfolio') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[10.5px] font-mono text-[#00E5FF]">
          <span className="font-bold">{subvalue || '1,981'}</span>
          <span className="text-slate-300 font-sans">{subvalueText || 'Apr 2026 Baseline'}</span>
        </span>
      );
    }
    if (type === 'baseline') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#F59E0B]">
          <ArrowUp className="w-3 h-3" />
          <span className="font-bold">{subvalue || '6.4%'}</span>
          <span className="text-slate-400 font-sans">{subvalueText || 'vs sanctioned'}</span>
        </span>
      );
    }
    if (type === 'exposure') {
      return (
        <span className="text-[11px] font-sans text-slate-300">
          <strong className="text-white font-mono">{subvalue || '33'}</strong> {subvalueText || 'projects at risk'}
        </span>
      );
    }
    if (type === 'alerts') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-[10px] font-mono font-bold">
          {subvalue || '38'} {subvalueText || 'Critical Bulletins'}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card flex items-center justify-between hover:border-[#1E4260] transition-all relative">
      <div className="space-y-1.5 flex-1 pr-3">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
              {title}
            </span>
            {provenanceTag === 'OFFICIAL' && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-950/80 text-sky-300 border border-sky-600/40">
                🏛️ MoSPI Official
              </span>
            )}
            {provenanceTag === 'DERIVED' && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 text-[#00E5FF] border border-[#00E5FF]/40">
                ⚡ PARAKH Derived
              </span>
            )}
            {provenanceTag === 'DEMO' && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                🛰️ Demo Fixture
              </span>
            )}
          </div>
          {infoTooltip && (
            <div className="group relative">
              <button
                type="button"
                className="text-slate-400 hover:text-[#1668d8] transition-colors p-0.5 cursor-help"
                aria-label="Provenance details"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <div
                className={`hidden group-hover:block absolute ${
                  type === 'portfolio' || type === 'baseline' ? 'left-0' : 'right-0'
                } top-6 z-50 w-80 p-3.5 kpi-provenance-popover text-[11.5px] pointer-events-none leading-relaxed`}
              >
                {infoTooltip}
              </div>
            </div>
          )}
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold font-mono text-white tracking-tight leading-tight">
          {value}
        </div>
        <div className="pt-0.5">
          {getSubvalueBadge()}
        </div>
        <div className="text-[11px] text-slate-400 font-sans">
          {footerText}
        </div>
      </div>

      {getIcon()}
    </div>
  );
}
