import React, { useState, useEffect } from 'react';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { paimanaApi } from '../../services/api/paimanaApi';
import { AlertOctagon, AlertTriangle, ArrowRight, ShieldAlert, Bell } from 'lucide-react';

export default function EarlyWarningCenter({ onSelectProject }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const loadAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 150 };
      if (severityFilter !== 'ALL') params.severity = severityFilter;
      const data = await paimanaApi.getAlerts(params);
      setAlerts(data || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError('Unable to load early warning alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter]);

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;

  return (
    <div className="p-6 space-y-5 bg-[#07131F] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#16324A]">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#EF4444]" />
            <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight uppercase">
              Early Warning Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated anomaly detection and risk escalation alerts triggered by trajectory drift.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#0D1E30] border border-[#16324A] rounded-lg px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5FF] font-mono shadow-xs"
          >
            <option value="ALL">All Severity Levels</option>
            <option value="CRITICAL">Critical Interventions ({criticalCount})</option>
            <option value="WARNING">Operational Warnings ({warningCount})</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#0D1E30] border border-[#16324A] rounded-xl shadow-command-card flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Active Bulletins</div>
            <div className="text-2xl font-extrabold font-mono text-white mt-1">{alerts.length}</div>
          </div>
          <ShieldAlert className="w-6 h-6 text-slate-400" />
        </div>

        <div className="p-5 bg-[#0D1E30] border border-[#EF4444]/40 rounded-xl shadow-command-card flex items-center justify-between border-l-4 border-l-[#EF4444]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#EF4444] font-bold">Critical Review Alerts</div>
            <div className="text-2xl font-extrabold font-mono text-[#EF4444] mt-1">{criticalCount}</div>
          </div>
          <AlertOctagon className="w-6 h-6 text-[#EF4444]" />
        </div>

        <div className="p-5 bg-[#0D1E30] border border-[#F59E0B]/40 rounded-xl shadow-command-card flex items-center justify-between border-l-4 border-l-[#F59E0B]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#F59E0B] font-bold">Operational Warnings</div>
            <div className="text-2xl font-extrabold font-mono text-[#F59E0B] mt-1">{warningCount}</div>
          </div>
          <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
        </div>
      </div>

      {/* Alert Feed */}
      {loading ? (
        <LoadingSkeleton rows={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadAlerts} />
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono bg-[#0D1E30] border border-[#16324A] rounded-xl shadow-command-card">
          No active early warning alerts matching criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            const isCrit = alert.severity === 'CRITICAL';
            return (
              <div
                key={alert.id || idx}
                className={`bg-[#0D1E30] border rounded-xl p-5 shadow-command-card transition-all ${
                  isCrit ? 'border-[#EF4444]/40 hover:border-[#EF4444]' : 'border-[#16324A] hover:border-[#1E4260]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-[#16324A]">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge level={isCrit ? 'CRITICAL' : 'HIGH'} size="sm" />
                    <span className="font-mono text-xs font-bold text-[#00E5FF]">
                      Project {alert.project_id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Cycle: {alert.report_month}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectProject && onSelectProject(alert.project_id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#F59E0B] hover:text-[#D97706] transition-colors self-start sm:self-auto"
                  >
                    <span>View Project Deep Dive</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-sm font-bold text-white mb-1">
                  {alert.title}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3 font-sans">
                  {alert.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono bg-[#07131F] p-2.5 rounded-lg border border-[#16324A]">
                  <span className="text-slate-300">Trigger: <strong className="text-[#00E5FF]">{alert.alert_code}</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="text-[#10B981]">Active Surveillance</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
