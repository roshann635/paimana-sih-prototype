import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck, Flame } from 'lucide-react';
import { recordIntervention, fetchInterventions } from '../services/api';

export const InterventionModal = ({ project, isOpen, onClose }) => {
  const [interventionType, setInterventionType] = useState('Schedule Recovery');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [assignedTo, setAssignedTo] = useState('Chief Monitoring Officer');
  const [status, setStatus] = useState('UNDER_REVIEW');
  const [pastInterventions, setPastInterventions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (project && isOpen) {
      setRecommendedAction(
        `Convene joint administrative review with Project Management Unit to audit milestone slippage and critical-path bottlenecks.`
      );
      loadHistory();
    }
  }, [project, isOpen]);

  async function loadHistory() {
    if (!project) return;
    try {
      const hist = await fetchInterventions(project.project_id);
      setPastInterventions(hist);
    } catch (err) {
      console.error('Error fetching intervention history:', err);
    }
  }

  if (!isOpen || !project) return null;

  const currentRisk = project.latest_prediction?.composite_risk_score || project.composite_risk_score || 80.0;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await recordIntervention({
        project_id: project.project_id,
        intervention_type: interventionType,
        recommended_action: recommendedAction,
        action_taken: actionTaken || 'Formal review order issued to implementing agency.',
        assigned_to: assignedTo,
        status: status,
        initial_risk_score: currentRisk,
      });
      setSuccessMsg('Intervention successfully logged and assigned!');
      await loadHistory();
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err) {
      console.error('Failed to log intervention:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Log Decision-Support Intervention</h3>
              <p className="text-xs text-slate-400 font-mono">
                Project: {project.project_id} • {project.project_name?.slice(0, 45)}...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Risk Level Warning */}
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/30 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Current Risk Score:</span>{' '}
              <strong className="text-red-400 text-sm font-mono">{currentRisk.toFixed(0)} / 100</strong>
            </div>
            <div className="text-slate-400">
              Expected Post-Review Mitigation:{' '}
              <strong className="text-emerald-400 text-sm font-mono">
                ~{Math.max(20, currentRisk - 18).toFixed(0)}
              </strong>
            </div>
          </div>

          {/* Intervention Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Intervention Category
            </label>
            <select
              value={interventionType}
              onChange={(e) => setInterventionType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
            >
              <option value="Schedule Recovery">Schedule Recovery (Critical Path Re-baselining)</option>
              <option value="Contractor Review">Contractor Capacity & Cash-flow Audit</option>
              <option value="Land & ROW Escalation">Land & Right-of-Way Nodal Escalation</option>
              <option value="Inter-Agency Coordination">PM GatiShakti Inter-Ministerial Approval Coordination</option>
              <option value="Financial Audit">Financial Sanction & Escalation Variation Review</option>
              <option value="Procurement Expediting">Procurement & Material Supply Chain Expediting</option>
            </select>
          </div>

          {/* Recommended Action */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Recommended Administrative Review Action
            </label>
            <textarea
              rows={2}
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          {/* Action Taken */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Action Taken / Directives Issued
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Formal directive issued to Joint Secretary / Implementing Agency Head for expedited review meeting..."
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Assigned Officer & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Assigned Monitoring Officer
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Workflow Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="RECOMMENDED">RECOMMENDED</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 shadow-md shadow-orange-500/20 disabled:opacity-50 transition"
            >
              {submitting ? 'Recording...' : 'Commit Intervention'}
            </button>
          </div>
        </form>

        {/* Historical Interventions Log */}
        {pastInterventions.length > 0 && (
          <div className="p-6 border-t border-slate-800 bg-slate-950/40">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Intervention History & Outcome Feedback
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {pastInterventions.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white">{inv.intervention_type}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">
                      {inv.action_taken || inv.recommended_action}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {inv.status}
                    </span>
                    {inv.post_risk_score && (
                      <div className="text-[10px] text-emerald-400 font-mono mt-1">
                        Risk: {inv.initial_risk_score} → {inv.post_risk_score}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
