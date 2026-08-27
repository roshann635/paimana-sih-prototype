import React from "react";
import {
  LayoutDashboard,
  AlertTriangle,
  Layers,
  MapPin,
  PieChart,
  DollarSign,
  Clock,
  Scale,
  Cpu,
  Activity,
  FileText,
  Database,
  Building2,
  Boxes,
  Bell,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    title: "PORTFOLIO",
    items: [
      { path: "/projects", label: "All Projects", icon: Layers },
      {
        path: "/priority-queue",
        label: "Priority Queue",
        icon: AlertTriangle,
        badge: "184",
        badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
      },
      { path: "/map", label: "State Map", icon: MapPin },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { path: "/analytics/portfolio", label: "Risk Analytics", icon: PieChart },
      { path: "/analytics/ministries", label: "Cost Risk", icon: DollarSign },
      { path: "/analytics/sectors", label: "Schedule Risk", icon: Clock },
      { path: "/analytics/benchmarking", label: "Benchmarking", icon: Scale },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        path: "/early-warnings",
        label: "Early Warnings",
        icon: AlertTriangle,
        badge: "101",
        badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
      },
      {
        path: "/intelligence/risk-diagnosis",
        label: "Interventions",
        icon: Cpu,
      },
      { path: "/reports", label: "Reports & Downloads", icon: FileText },
    ],
  },
  {
    title: "GOVERNANCE",
    items: [
      { path: "/data-quality", label: "Data Quality", icon: Database },
      {
        path: "/intelligence/model-health",
        label: "Model Health",
        icon: Activity,
      },
    ],
  },
];

export default function Sidebar({ currentPath = "/", onNavigate }) {
  const isOverview = currentPath === "/";

  return (
    <aside className="w-[184px] bg-[#06295b] text-white flex flex-col justify-between shrink-0 min-h-screen select-none">
      {/* Top Section */}
      <div className="py-4 px-2.5 space-y-4 overflow-y-auto">
        {/* Brand Header with Indian Emblem */}
        <div className="flex items-center gap-2 px-2 pb-2 border-b border-white/10">
          {/* Gold Emblem Badge */}
          <div className="w-8 h-8 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 2L15 8H9L12 2ZM12 6L13.5 9H10.5L12 6ZM5 9L8 10V14L5 15V9ZM19 9V15L16 14V10L19 9ZM12 11L14 13V17L12 18L10 17V13L12 11ZM7 16L10 18.5V21L7 19V16ZM17 16V19L14 21V18.5L17 16Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-wider text-white leading-tight">
              PAIMANA
            </span>
            <span className="text-[9px] text-blue-100/70 font-medium leading-tight">
              Infrastructure Intelligence
            </span>
          </div>
        </div>

        {/* Overview Active Button */}
        <div>
          <button
            onClick={() => onNavigate && onNavigate("/")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              isOverview
                ? "bg-[#1668d8] text-white"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            <div
              className={`p-1 rounded ${isOverview ? "text-white" : "text-blue-100/70"}`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span>Overview</span>
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[9px] font-mono font-bold tracking-wider text-blue-100/50 uppercase">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    currentPath === item.path ||
                    (item.path !== "/" && currentPath.startsWith(item.path));

                  return (
                    <button
                      key={item.path}
                      onClick={() => onNavigate && onNavigate(item.path)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#1668d8] text-white"
                          : "text-blue-100 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-blue-100/70"}`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Institutional Emblem Footer */}
      <div className="p-3 border-t border-white/10 bg-[#041e46] flex items-center gap-2.5">
        <div className="w-6 h-6 text-white shrink-0 opacity-80">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
          >
            <path d="M12 2L15 8H9L12 2ZM12 11L14 13V17L12 18L10 17V13L12 11ZM7 16L10 18.5V21L7 19V16ZM17 16V19L14 21V18.5L17 16Z" />
          </svg>
        </div>
        <div className="flex flex-col text-[11px] leading-tight">
          <span className="text-white font-bold">Government of India</span>
          <span className="text-[10px] text-blue-100/60 font-mono">
            MoSPI / IPMD
          </span>
        </div>
      </div>
    </aside>
  );
}
