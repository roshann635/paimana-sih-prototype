import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { paimanaApi } from "../../services/api/paimanaApi";

export default function AppShell({
  currentPath,
  onNavigate,
  children,
  onOpenAssistant,
  searchTerm,
  onSearchChange,
}) {
  const [latestReportMonth, setLatestReportMonth] = useState("Jun 2026");
  const [activeAlertsCount, setActiveAlertsCount] = useState(12);

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

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col font-sans text-slate-800 antialiased">
      {/* Top 2-Tier Command Centre Header */}
      <Header
        latestReportMonth={latestReportMonth}
        activeAlertsCount={activeAlertsCount}
        onOpenAssistant={onOpenAssistant}
        onOpenAlerts={() => onNavigate && onNavigate("/early-warnings")}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#f4f7fb]">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
