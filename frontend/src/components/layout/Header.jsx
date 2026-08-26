import React from 'react';
import { Search, Bell, Sparkles, User } from 'lucide-react';

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
    ? `Latest reporting cycle: ${formattedMonth}`
    : 'DEMO DATA · Simulated reporting cycle';

  return (
    <header className="h-16 bg-gov-surface border-b border-gov-border sticky top-0 z-30 px-6 flex items-center justify-between shadow-gov select-none">
      {/* Left: Brand & Prototype Tag */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-text-primary">
              PAIMANA
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand"></span>
            <span className="text-xs font-medium text-text-secondary hidden sm:inline">
              Infrastructure Project Monitoring & Analytics
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-text-muted">
            <span className="bg-brand-light text-brand-dark px-1.5 py-0.2 rounded font-semibold text-[10px] uppercase tracking-wider border border-brand/30">
              SIH PROTOTYPE / CONCEPT DEMONSTRATOR
            </span>
            <span className="hidden md:inline text-text-muted">•</span>
            <span className="hidden md:inline font-mono text-[11px] text-text-secondary font-medium">
              {formattedCycle}
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden lg:block w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search projects by ID, code, name..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full bg-gov-surface border border-gov-border rounded-gov-sm pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors shadow-sm"
          />
        </div>

        {/* Ask PAIMANA Trigger */}
        <button
          onClick={onOpenAssistant}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-gov-sm text-xs font-semibold text-intel bg-intel-light border border-[#C9DFDD] hover:bg-intel/15 transition-colors shadow-gov"
          title="Open AI Decision Support Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-intel" />
          <span>Ask PAIMANA</span>
        </button>

        {/* Alerts Bulletin Button */}
        <button
          onClick={onOpenAlerts}
          className="relative p-1.5 text-text-secondary hover:text-text-primary hover:bg-gov-secondary rounded-gov-sm border border-transparent hover:border-gov-border transition-colors"
          title="Active Early Warning Bulletins"
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-risk-critical text-white text-[9px] font-bold flex items-center justify-center">
              {activeAlertsCount > 99 ? '99+' : activeAlertsCount}
            </span>
          )}
        </button>

        {/* Officer Profile Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-2.5 border-l border-gov-border">
          <div className="w-7 h-7 rounded-full bg-gov-secondary border border-gov-border flex items-center justify-center text-text-secondary">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-text-primary leading-tight">
              Monitoring Unit
            </span>
            <span className="text-[10px] text-text-muted">Officer ID: IPMD-2026</span>
          </div>
        </div>
      </div>
    </header>
  );
}
