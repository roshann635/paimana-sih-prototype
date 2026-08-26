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
      { path: '/priority-queue', label: 'Priority Queue', icon: AlertTriangle, badge: '142' },
      { path: '/projects', label: 'Projects Explorer', icon: Layers },
      { path: '/early-warnings', label: 'Early Warnings', icon: AlertTriangle, badge: '101', badgeColor: 'bg-red-100 text-risk-critical' },
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
      className={`bg-[#E6E8E1] border-r border-gov-border flex flex-col transition-all duration-200 select-none ${
        isCollapsed ? 'w-16' : 'w-[250px]'
      } shrink-0 min-h-[calc(100vh-4rem)] shadow-sm`}
    >
      {/* Navigation Groups */}
      <div className="flex-1 py-5 px-3 overflow-y-auto space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-extrabold tracking-wider text-[#5A6158] uppercase mb-1.5 flex items-center justify-between">
                <span>{section.title}</span>
              </div>
            )}
            <div className="space-y-1">
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
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-gov-sm text-xs font-semibold transition-all relative ${
                      isActive
                        ? 'bg-[#FBF2E3] text-[#964F0A] shadow-xs border border-[#E8C89C]'
                        : 'text-[#2C332A] hover:bg-[#FAFBF8] hover:text-text-primary'
                    } ${isCollapsed ? 'justify-center px-0' : 'text-left'}`}
                  >
                    {/* Active Left Accent Bar */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1 bottom-1 w-[4px] bg-brand rounded-r"
                        aria-hidden="true"
                      />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-dark' : 'text-text-secondary'}`} />
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between truncate">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            item.badgeColor || 'bg-gov-secondary text-text-secondary border border-gov-border'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-gov-border bg-[#DFE2D9]">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-[#FAFBF8] rounded-gov-sm transition-colors shadow-xs"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px] text-text-secondary font-semibold">Collapse Navigation</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
