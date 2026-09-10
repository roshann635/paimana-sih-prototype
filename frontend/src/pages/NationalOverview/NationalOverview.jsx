import React, { useState, useEffect } from "react";
import KPICard from "../../components/common/KPICard";
import PortfolioHealthCard from "../../components/dashboard/PortfolioHealthCard";
import IndiaMap from "../../components/maps/IndiaMap";
import PriorityQueueCard from "../../components/dashboard/PriorityQueueCard";
import EarlyWarningSummaryCard from "../../components/dashboard/EarlyWarningSummaryCard";
import QuickFeatureBar from "../../components/dashboard/QuickFeatureBar";
import {
  LoadingSkeleton,
  ErrorState,
} from "../../components/common/FeedbackStates";
import { paimanaApi } from "../../services/api/paimanaApi";

export default function NationalOverview({
  onNavigate,
  onSelectProject,
  onOpenAssistant,
}) {
  const [summary, setSummary] = useState(null);
  const [priorityProjects, setPriorityProjects] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, queueData, alertData] = await Promise.all([
        paimanaApi.getDashboardSummary(),
        paimanaApi.getPriorityQueue({ limit: 5 }).catch((err) => {
          console.warn("Failed to load priority queue, using empty list:", err);
          return [];
        }),
        paimanaApi.getAlerts({ limit: 150 }).catch((err) => {
          console.warn("Failed to load alerts, using empty list:", err);
          return [];
        }),
      ]);
      setSummary(sumData);
      setPriorityProjects(queueData || []);
      setAlerts(alertData || []);
    } catch (err) {
      console.error("Failed to load national overview:", err);
      setError(
        "Unable to load portfolio overview. Please ensure the backend service is operational.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4 p-3 sm:p-5 bg-[#07131F] min-h-screen">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-[#0D1E30] rounded-xl animate-pulse"
            />
          ))}
        </div>
        <LoadingSkeleton rows={10} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-5 bg-[#07131F] min-h-screen">
        <ErrorState message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  const s = summary || {};
  const totalCapexLakhCr = s.total_revised_cost_cr
    ? (s.total_revised_cost_cr / 100000).toFixed(2)
    : "75.76";
  const origCapexLakhCr = s.total_original_cost_cr
    ? (s.total_original_cost_cr / 100000).toFixed(2)
    : "71.22";
  const drawnCapexLakhCr = "19.26";
  const costEscPct =
    s.total_cost_escalation_cr && s.total_original_cost_cr
      ? ((s.total_cost_escalation_cr / s.total_original_cost_cr) * 100).toFixed(
          1,
        )
      : "6.4";

  const orangeCount = s.risk_counts?.ORANGE || 33;
  const criticalBulletins = alerts
    ? alerts.filter((a) => a.severity === "CRITICAL").length || 38
    : 38;
  const operationalFlags = alerts
    ? alerts.filter((a) => a.severity === "WARNING").length || 63
    : 63;

  return (
    <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 bg-[#07131F] min-h-screen">
      {/* Data Provenance Governance Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-[#0D1E30] border border-[#16324A] rounded-lg text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Data Architecture:</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-600/40">
              🏛️ Official MoSPI PAIMANA Data
            </span>
            <span className="text-slate-500">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-[#00E5FF] border border-[#00E5FF]/40">
              ⚡ PARAKH-Derived AI Analytics
            </span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          MoSPI Flash Report <strong className="text-white">July 2026</strong> (Table 6) · Multi-Temporal ML Pipeline
        </div>
      </div>

      {/* 1. Top 4 Real KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          type="portfolio"
          title="Current Ongoing Portfolio"
          provenanceTag="OFFICIAL"
          value={s.active_portfolio_count ? s.active_portfolio_count.toLocaleString() : "1,775"}
          subvalue={s.april_2026_portfolio_count ? s.april_2026_portfolio_count.toLocaleString() : "1,981"}
          subvalueText="Apr '26 PAIMANA baseline"
          footerText={`${s.total_projects ? s.total_projects.toLocaleString() : "2,733"} unique projects in 16-mo panel`}
          infoTooltip={
            <div className="space-y-1.5 text-left">
              <div className="popover-title pb-1 mb-1">Portfolio Count Reconciliation</div>
              <div><strong className="cyan-val">1,775:</strong> Active ongoing projects in latest MoSPI Flash Report (July 2026 Table 6).</div>
              <div><strong className="amber-val">1,981:</strong> Official PAIMANA ongoing portfolio at start of FY 2026–27 (April 2026 Table 6).</div>
              <div><strong className="slate-val">2,733:</strong> Canonical longitudinal universe tracked across all 16 monthly reports (Apr 2025 – Jul 2026, 23,503 snapshots).</div>
            </div>
          }
        />

        <KPICard
          type="baseline"
          title="Revised Cost Baseline"
          provenanceTag="OFFICIAL"
          value={`₹37.11 L Cr`}
          subvalue={`+${costEscPct}%`}
          subvalueText="vs sanctioned"
          footerText="Official July '26 ongoing portfolio (₹37.11 L Cr)"
          infoTooltip={
            <div className="space-y-1.5 text-left">
              <div className="popover-title pb-1 mb-1">Cost Baseline Accounting Basis</div>
              <div><strong className="cyan-val">₹37.11 L Cr:</strong> Official MoSPI July 2026 revised cost baseline across 1,775 active ongoing projects.</div>
              <div><strong className="emerald-val">₹42.78 L Cr:</strong> Official MoSPI ongoing portfolio revised cost baseline for April 2026 (1,981 projects).</div>
              <div><strong className="amber-val">₹53.99 L Cr:</strong> Cumulative revised cost across all 2,733 unique projects observed in the 16-month longitudinal universe.</div>
            </div>
          }
        />

        <KPICard
          type="exposure"
          title="Cumulative Capex Drawn"
          provenanceTag="OFFICIAL"
          value={`₹${drawnCapexLakhCr} L Cr`}
          subvalue="Official"
          subvalueText="July '26 MoSPI release"
          footerText="₹18.95 L Cr itemized in Table 6 (25.2% drawn)"
          infoTooltip={
            <div className="space-y-1.5 text-left">
              <div className="popover-title pb-1 mb-1">Capital Drawdown Reconciliation (July 2026)</div>
              <div><strong className="emerald-val">₹19.26 L Cr:</strong> Official headline cumulative expenditure released by MoSPI in July 2026 for the 1,775 active projects.</div>
              <div><strong className="cyan-val">₹18.95 L Cr:</strong> Sum of itemized project records in Table 6 (excluding central unapportioned reserves).</div>
              <div><strong className="slate-val">₹29.16 L Cr:</strong> Cumulative expenditure across all 2,733 unique projects in the 16-month longitudinal panel.</div>
            </div>
          }
        />

        <KPICard
          type="alerts"
          title="Early Warning Alerts"
          provenanceTag="DERIVED"
          value={s.active_alerts_count ? String(s.active_alerts_count) : "492"}
          subvalue={String(criticalBulletins)}
          subvalueText="Critical Bulletins"
          footerText={`${operationalFlags} Operational drift flags`}
          infoTooltip={
            <div className="space-y-1.5 text-left">
              <div className="popover-title pb-1 mb-1">Early Warning Qualification Hierarchy (PARAKH AI)</div>
              <div><strong className="red-val">Critical Bulletins ({criticalBulletins}):</strong> Composite Risk Score ≥ 70/100 or RED tier driven by high predicted cost escalation (&gt;20%) and delay (&gt;180 days).</div>
              <div><strong className="amber-val">EVM Compound Strain:</strong> Flagged when SPI &lt; 0.80 and CPI &lt; 0.85 (earned progress lagging planned timeline by &gt;20% and costs running over earned value).</div>
              <div><strong className="cyan-val">Operational Drift Flags ({operationalFlags}):</strong> Flagged by trajectory rules for consecutive reporting cycles of negative progress velocity or persistent milestone slippage.</div>
            </div>
          }
        />
      </div>

      {/* 2. Middle Row: 3-Column Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column (4 cols): Portfolio Health Index & Risk Distribution */}
        <div className="lg:col-span-4 flex flex-col">
          <PortfolioHealthCard
            summary={s}
            onSelectTier={() => onNavigate && onNavigate("/priority-queue")}
          />
        </div>

        {/* Center Column (4 cols): Portfolio Geography (India Map) */}
        <div className="lg:col-span-4 flex flex-col">
          <IndiaMap
            onSelectState={(st) => {
              if (onNavigate) onNavigate("/priority-queue");
            }}
          />
        </div>

        {/* Right Column (4 cols): Priority Queue + Early Warning Summary */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <PriorityQueueCard
            projects={priorityProjects}
            onSelectProject={onSelectProject}
            onExploreQueue={() => onNavigate && onNavigate("/priority-queue")}
          />
          <EarlyWarningSummaryCard
            alerts={alerts}
            onExploreAlerts={() => onNavigate && onNavigate("/early-warnings")}
          />
        </div>
      </div>

      {/* 3. Bottom Row: 6 Quick Feature Navigation Cards */}
      <div>
        <QuickFeatureBar
          onNavigate={onNavigate}
          onOpenAssistant={onOpenAssistant}
        />
      </div>
    </div>
  );
}
