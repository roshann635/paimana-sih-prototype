import React, { useState, useEffect } from 'react';
import KPICard from '../../components/common/KPICard';
import AttentionRequired from '../../components/dashboard/AttentionRequired';
import RiskDistribution from '../../components/dashboard/RiskDistribution';
import PortfolioTrends from '../../components/dashboard/PortfolioTrends';
import IndiaMap from '../../components/maps/IndiaMap';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { paimanaApi } from '../../services/api/paimanaApi';
import { Filter, RefreshCw } from 'lucide-react';

export default function NationalOverview({ onNavigate, onSelectProject }) {
  const [summary, setSummary] = useState(null);
  const [criticalProjects, setCriticalProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedMinistry, setSelectedMinistry] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, queueData] = await Promise.all([
        paimanaApi.getDashboardSummary(),
        paimanaApi.getPriorityQueue({ limit: 10, risk_level: 'RED' })
      ]);
      setSummary(sumData);
      setCriticalProjects(queueData || []);
    } catch (err) {
      console.error('Failed to load national overview:', err);
      setError('Unable to load portfolio overview. Please ensure the backend service is operational.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gov-secondary rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <KPICard key={i} loading={true} />
          ))}
        </div>
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />;
  }

  const s = summary || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gov-border">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-bold text-text-primary tracking-tight">
            National Infrastructure Overview
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Portfolio monitoring, risk intelligence and early-warning indicators across central infrastructure.
          </p>
        </div>

        {/* Refresh Action */}
        <button
          onClick={loadDashboardData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gov-surface border border-gov-border rounded-gov-sm text-text-secondary hover:text-text-primary hover:bg-gov-secondary transition-colors shadow-gov"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 5 Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <KPICard
          label="Total Projects Monitored"
          value={s.total_projects ? s.total_projects.toLocaleString() : '—'}
          context="Central Sector Projects (>= ₹150 Cr)"
        />
        <KPICard
          label="Total Approved Capex"
          value={s.total_approved_cost_cr ? `₹${(s.total_approved_cost_cr / 1000).toFixed(1)}k Cr` : '—'}
          context="Original Sanctioned Cost"
        />
        <KPICard
          label="Revised Cost Baseline"
          value={s.total_revised_cost_cr ? `₹${(s.total_revised_cost_cr / 1000).toFixed(1)}k Cr` : '—'}
          trend={s.overall_cost_overrun_pct ? `+${s.overall_cost_overrun_pct.toFixed(1)}% escalation` : undefined}
          status={s.overall_cost_overrun_pct > 15 ? 'review' : 'normal'}
        />
        <KPICard
          label="High-Risk Projects"
          value={s.high_risk_projects_count ?? '—'}
          context={`${s.critical_risk_projects_count || 0} in Critical Review`}
          status="critical"
        />
        <KPICard
          label="Capex at Severe Risk"
          value={s.total_capex_at_risk_cr ? `₹${(s.total_capex_at_risk_cr / 1000).toFixed(1)}k Cr` : '—'}
          context="High Risk Capital Exposure"
          status="review"
        />
      </div>

      {/* Attention Required Section */}
      <AttentionRequired
        projects={criticalProjects}
        onSelectProject={onSelectProject}
        onExploreQueue={() => onNavigate && onNavigate('/priority-queue')}
      />

      {/* Middle Grid: Risk Distribution & Macro Portfolio Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <RiskDistribution distribution={s.risk_distribution} />
        </div>
        <div className="lg:col-span-7">
          <PortfolioTrends />
        </div>
      </div>

      {/* India Interactive Map */}
      <IndiaMap
        onSelectState={(st) => {
          if (onNavigate) onNavigate('/priority-queue');
        }}
      />
    </div>
  );
}
