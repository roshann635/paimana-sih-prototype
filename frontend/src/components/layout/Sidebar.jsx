import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Layers,
  MapPin,
  PieChart,
  Building2,
  Boxes,
  Scale,
  Cpu,
  Activity,
  FileText,
  Database,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'MONITORING',
    items: [
      { path: '/priority-queue', label: 'Priority Queue', icon: AlertTriangle },
      { path: '/projects', label: 'Projects Explorer', icon: Layers },
      { path: '/early-warnings', label: 'Early Warnings', icon: AlertTriangle },
      { path: '/map', label: 'National Map', icon: MapPin }
    ]
  },
  {
    title: 'ANALYTICS',
    items: [
      { path: '/analytics/portfolio', label: 'Portfolio Analytics', icon: PieChart },
      { path: '/analytics/ministries', label: 'Ministry Analytics', icon: Building2 },
      { path: '/analytics/sectors', label: 'Sector Analytics', icon: Boxes },
      { path: '/analytics/benchmarking', label: 'Peer Benchmarking', icon: Scale }
    ]
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { path: '/intelligence/risk-diagnosis', label: 'Risk Diagnosis (SHAP)', icon: Cpu },
      { path: '/intelligence/model-health', label: 'Model Health & Governance', icon: Activity }
    ]
  },
  {
    title: 'REPORTS',
    items: [
      { path: '/reports', label: 'Reports & Downloads', icon: FileText }
    ]
  },
  {
    title: 'DATA',
    items: [
      { path: '/data-quality', label: 'Data Quality Engine', icon: Database }
    ]
  }
];

export default function Sidebar({
  currentPath = '/',
  onNavigate,
  isCollapsed = false,
  onToggleCollapse
}) {
  return (
    <aside
      className={`bg-gov-secondary border-r border-gov-border flex flex-col transition-all duration-200 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      } shrink-0 min-h-[calc(100vh-4rem)]`}
    >
      {/* Navigation Groups */}
      <div className="flex-1 py-4 px-2 overflow-y-auto space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold tracking-wider text-text-muted uppercase mb-1.5">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentPath === item.path ||
                  (item.path !== '/' && currentPath.startsWith(item.path));

                return (
                  <button
                    key={item.path}
                    onClick={() => onNavigate && onNavigate(item.path)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-gov-sm text-xs font-medium transition-colors relative ${
                      isActive
                        ? 'bg-brand-light text-brand-dark font-semibold shadow-gov'
                        : 'text-text-primary hover:bg-gov-surface/60 hover:text-text-primary'
                    } ${isCollapsed ? 'justify-center px-0' : 'text-left'}`}
                  >
                    {/* Active Left Indicator */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-brand rounded-r"
                        aria-hidden="true"
                      />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand' : 'text-text-secondary'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-gov-border">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-gov-surface/60 rounded-gov-sm transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px]">Collapse View</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
