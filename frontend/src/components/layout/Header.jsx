import React from "react";
import {
  Search,
  Bell,
  Sparkles,
  User,
  Calendar,
  ChevronDown,
  Menu,
  ArrowLeft,
} from "lucide-react";

const PAGE_METADATA = {
  "/": {
    title: "National Overview",
    subtitle: "Command Centre · High-level infrastructure portfolio health & intelligence",
  },
  "/overview": {
    title: "National Overview",
    subtitle: "Command Centre · High-level infrastructure portfolio health & intelligence",
  },
  "/projects": {
    title: "All Projects",
    subtitle: "Central sector infrastructure project registry (1,630 projects)",
  },
  "/priority-queue": {
    title: "Priority Queue",
    subtitle: "Intervention Priority Index (IPI) ranked decision queue",
  },
  "/map": {
    title: "State Risk Map",
    subtitle: "Spatial infrastructure capex exposure & risk distribution across 35 States & UTs",
  },
  "/analytics/portfolio": {
    title: "Risk Analytics",
    subtitle: "Sector-level risk distribution, schedule variance & baseline benchmarking",
  },
  "/satellite-observatory": {
    title: "Satellite Observatory",
    subtitle: "Independent Sentinel-1 SAR & Sentinel-2 Optical Earth observation verification",
  },
  "/analytics/ministries": {
    title: "Cost Risk Analysis",
    subtitle: "Ministry-wise cost escalation and capital expenditure drawdown tracking",
  },
  "/analytics/sectors": {
    title: "Schedule Risk Analysis",
    subtitle: "Sector-wise milestone delay and critical path deceleration tracking",
  },
  "/analytics/benchmarking": {
    title: "Benchmarking",
    subtitle: "Cross-sector empirical medians & comparative peer baselines",
  },
  "/early-warnings": {
    title: "Early Warning Surveillance",
    subtitle: "Real-time automated surveillance bulletins & operational drift flags",
  },
  "/intelligence/risk-diagnosis": {
    title: "Interventions Center",
    subtitle: "Executive administrative directives and audit-trailed action memos",
  },
  "/reports": {
    title: "Reports & Downloads",
    subtitle: "Comprehensive institutional dossiers and MoSPI flash report archives",
  },
  "/data-quality": {
    title: "Data Quality Center",
    subtitle: "Automated Data Quality Engine (DQE) validation and anomaly audits",
  },
  "/intelligence/model-health": {
    title: "Model Governance & Health",
    subtitle: "Out-of-time temporal ML calibration, PR-AUC and ROC-AUC benchmarks",
  },
};

export default function Header({
  currentPath = "/",
  onBack,
  canGoBack = false,
  latestReportMonth = "Jun 2026",
  activeAlertsCount = 12,
  onOpenAssistant,
  onOpenAlerts,
  searchTerm = "",
  onSearchChange,
  onToggleMobileMenu,
}) {
  const cleanPath = (currentPath || "/").split("?")[0].toLowerCase();
  let meta = PAGE_METADATA[cleanPath];
  if (!meta) {
    if (cleanPath.startsWith("/projects/")) {
      meta = {
        title: "Project Deep Dive",
        subtitle: "Longitudinal diagnostics, EVM performance & evidence analysis",
      };
    } else {
      meta = {
        title: "Command Centre",
        subtitle: "Infrastructure monitoring & intelligence",
      };
    }
  }

  const isNotRoot = cleanPath !== "/" && cleanPath !== "/overview" && cleanPath !== "/dashboard";

  return (
    <header className="bg-white border-b border-[#dbe3ed] text-[#142235] select-none w-full">
      {/* Top Telemetry Row */}
      <div className="px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 border-b border-[#edf1f5]">
        {/* Left: Mobile Menu + Back Button + Title & Subtitle */}
        <div className="min-w-0 flex items-center gap-2 sm:gap-3">
          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 -ml-1 rounded-md text-slate-600 hover:text-[#1668d8] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {(canGoBack || isNotRoot) && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md bg-[#f4f7fb] hover:bg-[#e2eaf4] border border-[#dbe3ed] text-[#142235] hover:text-[#1668d8] text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
              title="Go back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#1668d8]" />
              <span className="text-[11px] font-semibold hidden sm:inline">Back</span>
            </button>
          )}

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-[#142235] truncate">
              {meta.title}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-[#66758a] mt-0.5 font-normal truncate hidden sm:block">
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Status Telemetry & User Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Data Through */}
          <div className="hidden md:flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#66758a]" />
            <div className="flex flex-col text-[11px] leading-tight">
              <span className="text-[9px] font-mono text-[#66758a] uppercase font-bold">
                Data Through
              </span>
              <span className="font-mono text-[#142235] font-bold text-[10px]">
                {latestReportMonth}
              </span>
            </div>
          </div>

          {/* System Operational */}
          <div className="hidden xl:flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <span className="w-2 rounded-full bg-[#00E5FF] animate-ping opacity-75 absolute h-2"></span>
              <span className="w-2 h-2 rounded-full bg-[#00E5FF]"></span>
            </div>
            <div className="flex flex-col text-[11px] leading-tight">
              <span className="text-[9px] font-mono text-[#66758a] uppercase font-bold">
                Operational
              </span>
              <span className="text-[#66758a] text-[10px]">
                Live
              </span>
            </div>
          </div>

          {/* Alert Notification Bell */}
          <button
            onClick={onOpenAlerts}
            className="relative p-1.5 sm:p-2 rounded-md hover:bg-[#f1f5f9] border border-[#dbe3ed] text-[#66758a] hover:text-[#142235] transition-colors cursor-pointer"
            title="Active Bulletins"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-red-glow">
              {activeAlertsCount}
            </span>
          </button>

          {/* Officer Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#dbe3ed]">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#eaf1fb] border border-[#cddced] flex items-center justify-center text-[#1668d8] shrink-0">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#142235] leading-tight">
                Officer
              </span>
              <span className="text-[9px] font-mono text-[#66758a]">
                Monitoring
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Reporting Cycle + Search + Ask PARAKH AI Button */}
      <div className="px-3 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-3 bg-[#f8fafc]">
        {/* Left: Reporting Cycle Dropdown (desktop/tablet) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-[#dbe3ed] text-xs text-[#142235]">
            <Calendar className="w-3.5 h-3.5 text-[#66758a]" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-[#66758a] uppercase">
                Cycle
              </span>
              <span className="font-bold font-mono text-[#142235] text-xs">
                {latestReportMonth}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-300 ml-1" />
          </div>
        </div>

        {/* Center: Search Bar (expands flexibly) */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a98aa] w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search project ID, code, state..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full bg-white border border-[#dbe3ed] rounded-md pl-8 sm:pl-9 pr-7 sm:pr-8 py-1 sm:py-1.5 text-xs text-[#142235] placeholder:text-[#8a98aa] focus:outline-none focus:border-[#1668d8] focus:ring-1 focus:ring-[#1668d8]/10 transition-all font-sans"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#66758a] bg-[#edf1f5] border border-[#dbe3ed] px-1 py-0.5 rounded">
            /
          </kbd>
        </div>

        {/* Right: Ask PARAKH AI Button */}
        <div className="shrink-0">
          <button
            onClick={onOpenAssistant}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md bg-[#1668d8] hover:bg-[#0d56b8] border border-[#1668d8] text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="hidden xs:inline">Ask PARAKH AI</span>
            <span className="xs:hidden font-mono">AI</span>
          </button>
        </div>
      </div>
    </header>
  );
}
