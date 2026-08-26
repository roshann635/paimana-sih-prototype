import React, { useState, useEffect } from 'react';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { paimanaApi } from '../../services/api/paimanaApi';
import { AlertOctagon, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

export default function EarlyWarningCenter({ onSelectProject }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const loadAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 100 };
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Early Warning Center
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Automated anomaly detection and risk escalation alerts triggered by trajectory drift.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-gov-surface border border-gov-border rounded-gov-sm px-3.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand font-semibold shadow-gov"
          >
            <option value="ALL">All Severity Levels</option>
            <option value="CRITICAL">Critical Interventions ({criticalCount})</option>
            <option value="WARNING">Operational Warnings ({warningCount})</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-gov-surface border border-gov-border rounded-gov shadow-gov flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Active Bulletins</div>
            <div className="text-2xl font-bold font-mono text-text-primary mt-1">{alerts.length}</div>
          </div>
          <ShieldAlert className="w-6 h-6 text-text-secondary" />
        </div>

        <div className="p-5 bg-gov-surface border border-[#ECC4C1] rounded-gov shadow-gov flex items-center justify-between border-l-4 border-l-risk-critical">
          <div>
            <div className="text-[11px] font-semibold text-risk-critical uppercase tracking-wider">Critical Review Alerts</div>
            <div className="text-2xl font-bold font-mono text-risk-critical mt-1">{criticalCount}</div>
          </div>
          <AlertOctagon className="w-6 h-6 text-risk-critical" />
        </div>

        <div className="p-5 bg-gov-surface border border-[#EFCDB2] rounded-gov shadow-gov flex items-center justify-between border-l-4 border-l-risk-review">
          <div>
            <div className="text-[11px] font-semibold text-risk-review uppercase tracking-wider">Operational Warnings</div>
            <div className="text-2xl font-bold font-mono text-risk-review mt-1">{warningCount}</div>
          </div>
          <AlertTriangle className="w-6 h-6 text-risk-review" />
        </div>
      </div>

      {/* Alert Feed */}
      {loading ? (
        <LoadingSkeleton rows={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadAlerts} />
      ) : alerts.length === 0 ? (
        <div className="p-10 text-center text-xs text-text-muted bg-gov-surface border border-gov-border rounded-gov shadow-gov">
          No active early warning alerts matching criteria.
        </div>
      ) : (
        <div className="space-y-3.5">
          {alerts.map((alert, idx) => {
            const isCrit = alert.severity === 'CRITICAL';
            return (
              <div
                key={alert.id || idx}
                className={`bg-gov-surface border rounded-gov p-5 shadow-gov transition-colors ${
                  isCrit ? 'border-[#ECC4C1] hover:border-risk-critical' : 'border-gov-border hover:border-[#B8B8B3]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-gov-border">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge level={isCrit ? 'RED' : 'ORANGE'} size="sm" />
                    <span className="font-mono text-xs font-semibold text-text-primary">
                      Project {alert.project_id}
                    </span>
                    <span className="text-[11px] text-text-muted font-mono">
                      Cycle: {alert.report_month}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectProject && onSelectProject(alert.project_id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark hover:text-brand transition-colors self-start sm:self-auto"
                  >
                    <span>View Project Deep Dive</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-sm font-bold text-text-primary mb-1">
                  {alert.title}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-3">
                  {alert.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-text-muted font-mono bg-[#F7F7F4] p-2.5 rounded-gov-sm border border-gov-border">
                  <span>Trigger: {alert.alert_code}</span>
                  <span>•</span>
                  <span>Status: Active Monitoring</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
