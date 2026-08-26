import React, { useState, useEffect } from 'react';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { paimanaApi } from '../../services/api/paimanaApi';
import { AlertOctagon, AlertTriangle, Info, ArrowRight, ShieldAlert } from 'lucide-react';

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
            className="bg-gov-surface border border-gov-border rounded-gov-sm px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand font-medium"
          >
            <option value="ALL">All Severity Levels</option>
            <option value="CRITICAL">Critical Interventions ({criticalCount})</option>
            <option value="WARNING">Operational Warnings ({warningCount})</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-gov-surface border border-gov-border rounded-gov shadow-gov flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Active Bulletins</div>
            <div className="text-2xl font-bold font-mono text-text-primary mt-0.5">{alerts.length}</div>
          </div>
          <ShieldAlert className="w-6 h-6 text-text-muted" />
        </div>

        <div className="p-4 bg-gov-surface border border-risk-critical/30 rounded-gov shadow-gov flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-risk-critical uppercase tracking-wider">Critical Review Alerts</div>
            <div className="text-2xl font-bold font-mono text-risk-critical mt-0.5">{criticalCount}</div>
          </div>
          <AlertOctagon className="w-6 h-6 text-risk-critical" />
        </div>

        <div className="p-4 bg-gov-surface border border-risk-review/30 rounded-gov shadow-gov flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-risk-review uppercase tracking-wider">Operational Warnings</div>
            <div className="text-2xl font-bold font-mono text-risk-review mt-0.5">{warningCount}</div>
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
        <div className="p-8 text-center text-xs text-text-muted bg-gov-surface border border-gov-border rounded-gov">
          No active early warning alerts matching criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            const isCrit = alert.severity === 'CRITICAL';
            return (
              <div
                key={alert.id || idx}
                className={`bg-gov-surface border rounded-gov p-4 shadow-gov transition-colors ${
                  isCrit ? 'border-risk-critical/40 hover:border-risk-critical' : 'border-gov-border hover:border-text-muted'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-gov-border/60">
                  <div className="flex items-center gap-2">
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
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-dark transition-colors self-start sm:self-auto"
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

                <div className="flex items-center gap-4 text-[11px] text-text-muted font-mono bg-gov-secondary/50 p-2 rounded-gov-sm border border-gov-border/40">
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
