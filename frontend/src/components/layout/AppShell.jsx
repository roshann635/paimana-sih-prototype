import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { paimanaApi } from '../../services/api/paimanaApi';

/**
 * AppShell Component
 * Primary layout shell enclosing Header, Sidebar, and Main Page view.
 * Uses #F6F6F3 canvas background and 32px padding.
 */
export default function AppShell({
  currentPath,
  onNavigate,
  children,
  onOpenAssistant,
  searchTerm,
  onSearchChange
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [latestReportMonth, setLatestReportMonth] = useState(null);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  useEffect(() => {
    paimanaApi.getDashboardSummary()
      .then((summary) => {
        if (summary) {
          setLatestReportMonth(summary.latest_report_month);
          setActiveAlertsCount(summary.active_alerts_count || 0);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch header cycle info:', err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gov-bg flex flex-col font-sans text-text-primary">
      {/* Top Institutional Header */}
      <Header
        latestReportMonth={latestReportMonth}
        activeAlertsCount={activeAlertsCount}
        onOpenAssistant={onOpenAssistant}
        onOpenAlerts={() => onNavigate && onNavigate('/early-warnings')}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Administrative Sidebar */}
        <Sidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Dynamic Page Content with 32px padding */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-gov-bg">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
