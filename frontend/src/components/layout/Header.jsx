import React from 'react';
import { Search, Bell, Sparkles, User, Calendar, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function Header({
  latestReportMonth = 'Jun 2026',
  activeAlertsCount = 12,
  onOpenAssistant,
  onOpenAlerts,
  searchTerm = '',
  onSearchChange
}) {
  return (
    <header className="bg-[#07131F] border-b border-[#16324A] text-white select-none">
      {/* Top Telemetry Row */}
      <div className="px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#16324A]/60">
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold tracking-wide text-white uppercase">
            National Infrastructure Command Centre
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 font-normal">
            Continuous intelligence for early warning, risk forecasting & decision support
          </p>
        </div>

        {/* Status Telemetry & User Controls */}
        <div className="flex items-center gap-6">
          {/* Data Through */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-slate-300" />
            <div className="flex flex-col text-[11px] leading-tight">
              <span className="text-[10px] font-mono text-slate-300 uppercase font-bold">Data Through</span>
              <span className="font-mono text-white font-bold">JUN 2026</span>
            </div>
          </div>

          {/* System Operational */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-ping opacity-75 absolute"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]"></span>
            </div>
            <div className="flex flex-col text-[11px] leading-tight">
              <span className="text-[10px] font-mono text-slate-300 uppercase font-bold">System Operational</span>
              <span className="text-slate-300 text-[10px]">All systems normal</span>
            </div>
          </div>

          {/* Alert Notification Bell */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-lg bg-[#0D1E30] hover:bg-[#16324A] border border-[#16324A] text-slate-300 hover:text-white transition-colors"
            title="Active Bulletins"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-red-glow">
              {activeAlertsCount}
            </span>
          </button>

          {/* Officer Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#16324A]">
            <div className="w-8 h-8 rounded-full bg-[#0D1E30] border border-[#16324A] flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">
                Monitoring Officer
              </span>
              <span className="text-[10px] font-mono text-slate-300">MoSPI - IPMD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Reporting Cycle + Search + Ask PAIMANA Button */}
      <div className="px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B1A2A]">
        {/* Left: Reporting Cycle Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D1E30] border border-[#16324A] text-xs text-white cursor-pointer hover:border-[#1E4260] transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-300 uppercase">Reporting Cycle</span>
              <span className="font-bold font-mono text-white text-xs">Jun 2026 (Monthly)</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-300 ml-1" />
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
          <input
            type="text"
            placeholder="Search project ID, code, ministry, state..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full bg-[#07131F] border border-[#16324A] rounded-lg pl-10 pr-9 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20 transition-all font-sans"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-slate-300 bg-[#0D1E30] border border-[#16324A] px-1.5 py-0.5 rounded">
            /
          </kbd>
        </div>

        {/* Right: Ask PAIMANA AI Button */}
        <div>
          <button
            onClick={onOpenAssistant}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#0D1E30] hover:bg-[#16324A] border border-[#F59E0B] text-[#F59E0B] font-bold text-xs shadow-gold-glow transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <span>Ask PAIMANA AI</span>
          </button>
        </div>
      </div>
    </header>
  );
}
