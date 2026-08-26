import React from 'react';
import { 
  BarChart3, AlertTriangle, ListOrdered, FileSearch, 
  Activity, ShieldCheck, MessageSquare, Building2, Flame
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  selectedProjectId,
  openAssistant,
  alertCount,
}) => {
  const navItems = [
    { id: 'overview', label: 'National Portfolio', icon: BarChart3 },
    { id: 'priority-queue', label: 'Priority Queue (IPI)', icon: ListOrdered, badge: 'Key' },
    { id: 'deep-dive', label: 'Project Deep Dive', icon: FileSearch },
    { id: 'why-risk', label: 'Why Risk? (SHAP)', icon: Flame },
    { id: 'benchmarking', label: 'Benchmarking', icon: Activity },
    { id: 'model-health', label: 'Model Health & DQE', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">PAIMANA</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  AI Decision Support
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Early Warning & Intervention Priority Engine</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Active Alerts Button */}
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/40 border border-rose-800/40 text-rose-400 hover:bg-rose-900/40 transition"
              title="Critical Active Alerts"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{alertCount} Alerts</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={openAssistant}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Assistant</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
