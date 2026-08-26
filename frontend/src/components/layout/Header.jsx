import React from 'react';
import { Search, Bell, Sparkles, User, ShieldCheck } from 'lucide-react';

function formatReportMonth(monthStr) {
  if (!monthStr) return null;
  const parts = monthStr.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (monthNum >= 1 && monthNum <= 12) {
      return `${months[monthNum - 1]} ${year}`;
    }
  }
  return monthStr;
}

export default function Header({
  latestReportMonth,
  activeAlertsCount = 0,
  onOpenAssistant,
  onOpenAlerts,
  searchTerm = '',
  onSearchChange
}) {
  const formattedMonth = formatReportMonth(latestReportMonth);
  const formattedCycle = formattedMonth
    ? `Reporting Cycle: ${formattedMonth}`
    : 'DEMO DATA · Simulated reporting cycle';

  return (
    <header className="bg-white border-b border-gov-border sticky top-0 z-30 shadow-gov select-none">
      {/* Top subtle tri-accent hairline bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-brand via-[#E8A54B] to-intel" />

      <div className="h-16 px-6 flex items-center justify-between">
        {/* Left: Official Brand & SIH Prototype Identifier */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-gov bg-brand-light border border-brand-border flex items-center justify-center text-brand-dark shadow-sm">
              <span className="font-bold text-sm tracking-tighter">पै</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-text-primary">
                  PAIMANA
                </span>
                <span className="w-1 h-1 rounded-full bg-text-muted"></span>
                <span className="text-xs font-semibold text-text-secondary hidden sm:inline">
                  Infrastructure Project Monitoring & Analytics
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-text-muted">
                <span className="bg-brand-light text-brand-dark px-1.5 py-0.2 rounded font-bold text-[10px] uppercase tracking-wider border border-brand-border">
                  SIH PROTOTYPE / CONCEPT DEMONSTRATOR
                </span>
                <span className="hidden md:inline text-text-muted">•</span>
                <span className="hidden md:inline font-mono text-[11px] text-text-secondary font-medium">
                  {formattedCycle}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3.5">
          {/* Quick Search */}
          <div className="relative hidden lg:block w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search project ID, code, ministry..."
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full bg-[#FAFBF8] border border-gov-border rounded-gov-sm pl-9 pr-8 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:bg-white transition-colors shadow-sm"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-text-muted bg-white border border-gov-border px-1.5 py-0.5 rounded shadow-xs">
              /
            </kbd>
          </div>

          {/* Ask PAIMANA Decision Assistant Trigger */}
          <button
            onClick={onOpenAssistant}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-gov-sm text-xs font-bold text-intel bg-intel-light border border-intel-border hover:bg-[#DFEFED] transition-colors shadow-sm"
            title="Open AI Decision Support Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-intel" />
            <span>Ask PAIMANA</span>
          </button>

          {/* Alerts Bulletin Button */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-[#FAFBF8] rounded-gov-sm border border-gov-border/60 hover:border-gov-border transition-colors shadow-xs"
            title="Active Early Warning Bulletins"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-risk-critical text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {activeAlertsCount > 99 ? '99+' : activeAlertsCount}
              </span>
            )}
          </button>

          {/* Officer Profile Badge */}
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gov-border">
            <div className="w-8 h-8 rounded-full bg-gov-secondary border border-gov-borderStrong flex items-center justify-center text-text-secondary shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-text-primary leading-tight">
                Monitoring Unit
              </span>
              <span className="text-[10px] font-mono text-text-muted">Officer ID: IPMD-2026</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
