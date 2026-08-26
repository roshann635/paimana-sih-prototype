import React from 'react';
import { FileText, Coins, Landmark, Bell, ArrowUp } from 'lucide-react';

export default function KPICard({
  type = 'portfolio', // 'portfolio' | 'baseline' | 'exposure' | 'alerts'
  title,
  value,
  subvalue,
  subvalueText,
  footerText,
  badgeColor = 'cyan',
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
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#00E5FF]">
          <ArrowUp className="w-3 h-3" />
          <span className="font-bold">24</span>
          <span className="text-slate-400 font-sans">this reporting cycle</span>
        </span>
      );
    }
    if (type === 'baseline') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#F59E0B]">
          <ArrowUp className="w-3 h-3" />
          <span className="font-bold">6.4%</span>
          <span className="text-slate-400 font-sans">vs sanctioned</span>
        </span>
      );
    }
    if (type === 'exposure') {
      return (
        <span className="text-[11px] font-sans text-slate-300">
          <strong className="text-white font-mono">33</strong> projects at risk
        </span>
      );
    }
    if (type === 'alerts') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-[10px] font-mono font-bold">
          38 Critical Bulletins
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card flex items-center justify-between hover:border-[#1E4260] transition-all">
      <div className="space-y-1.5 flex-1 pr-3">
        <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
          {title}
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
