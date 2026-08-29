import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { paimanaApi } from "../../services/api/paimanaApi";

export default function AppShell({
  currentPath,
  onNavigate,
  onBack,
  canGoBack,
  children,
  onOpenAssistant,
  searchTerm,
  onSearchChange,
}) {
  const [latestReportMonth, setLatestReportMonth] = useState("Jun 2026");
  const [activeAlertsCount, setActiveAlertsCount] = useState(12);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    paimanaApi
      .getDashboardSummary()
      .then((summary) => {
        if (summary) {
          setLatestReportMonth(summary.latest_report_month || "Jun 2026");
          setActiveAlertsCount(summary.active_alerts_count || 12);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch header telemetry:", err);
      });
  }, []);

  const handleNavigate = (path) => {
    setIsMobileMenuOpen(false);
    if (onNavigate) onNavigate(path);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col font-sans text-slate-800 antialiased overflow-x-hidden">
      {/* Top 2-Tier Command Centre Header */}
      <Header
        currentPath={currentPath}
        onBack={onBack}
        canGoBack={canGoBack}
        latestReportMonth={latestReportMonth}
        activeAlertsCount={activeAlertsCount}
        onOpenAssistant={onOpenAssistant}
        onOpenAlerts={() => handleNavigate("/early-warnings")}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar (Desktop Static + Mobile Slide-over Drawer) */}
        <Sidebar
          currentPath={currentPath}
          onNavigate={handleNavigate}
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f4f7fb] w-full min-w-0">
          <div className="w-full min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
