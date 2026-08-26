import React from 'react';
import { 
  BarChart3, AlertTriangle, ListOrdered, FileSearch, 
  Activity, ShieldCheck, MessageSquare, Building, Printer
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  selectedProjectId,
  openAssistant,
  alertCount,
}) => {
  const navItems = [
    { id: 'overview', label: 'Portfolio Overview', icon: BarChart3 },
    { id: 'priority-queue', label: 'Priority Review Queue', icon: ListOrdered },
    { id: 'deep-dive', label: 'Project Appraisal', icon: FileSearch },
    { id: 'why-risk', label: 'Root Cause (SHAP)', icon: Activity },
    { id: 'benchmarking', label: 'Sector Benchmarking', icon: Activity },
    { id: 'model-health', label: 'Model Governance & DQA', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
      {/* Top Institutional Government Bar */}
      <div className="bg-slate-950 px-4 sm:px-6 lg:px-8 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-300">GOVERNMENT OF INDIA</span>
          <span>•</span>
          <span>Ministry of Statistics and Programme Implementation (MoSPI)</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="font-mono text-slate-400">Infrastructure Monitoring Division (OCMS / PAIMANA)</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Operational (April 2026 Cycle)</span>
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Identity */}
          <div 
            className="flex items-center space-x-3 cursor-pointer py-1" 
            onClick={() => setActiveTab('overview')}
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner">
              <Building className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight text-white">PAIMANA</span>
                <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50 uppercase">
                  Decision Support System
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Early Warning & Intervention Priority Engine</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Active Alerts Pill */}
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 border border-red-800/50 text-red-300 hover:bg-red-900/40 transition"
              title="Active Early Warning Alerts"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>{alertCount} Active Alerts</span>
            </button>

            {/* Print / Report Button */}
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Print Executive Review Summary"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Briefing</span>
            </button>

            {/* Grounded AI Assistant */}
            <button
              onClick={openAssistant}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white shadow transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
