import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, FileText, Send } from 'lucide-react';
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
        `Issue directive to PMU and EPC Contractor for critical path re-baselining and weekly milestone escalation.`
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
  const fileRef = `MoSPI/IPMD/REV-2026/${project.project_id}/01`;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await recordIntervention({
        project_id: project.project_id,
        intervention_type: interventionType,
        recommended_action: recommendedAction,
        action_taken: actionTaken || 'Formal administrative order issued to implementing agency.',
        assigned_to: assignedTo,
        status: status,
        initial_risk_score: currentRisk,
      });
      setSuccessMsg('Administrative action memorandum recorded successfully.');
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Administrative Action Memorandum</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Ref: {fileRef} • Project: {project.project_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Risk Appraisal */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400">Current Appraised Risk:</span>{' '}
              <strong className="text-red-400 font-mono text-sm">{currentRisk.toFixed(0)} / 100</strong>
            </div>
            <div className="text-slate-400">
              Expected Post-Review Mitigation:{' '}
              <strong className="text-emerald-400 font-mono text-sm">
                ~{Math.max(20, currentRisk - 18).toFixed(0)}
              </strong>
            </div>
          </div>

          {/* Intervention Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
              Administrative Review Category
            </label>
            <select
              value={interventionType}
              onChange={(e) => setInterventionType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
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
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
              Recommended Administrative Directives
            </label>
            <textarea
              rows={2}
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
              required
            />
          </div>

          {/* Action Taken */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
              Actions Taken / Orders Issued
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Formal directive issued to Implementing Agency Head for expedited review meeting..."
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* Assigned Officer & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Assigned Nodal Officer
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Directives Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="RECOMMENDED">RECOMMENDED</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white disabled:opacity-50 transition"
            >
              {submitting ? 'Recording...' : 'Commit Directive'}
            </button>
          </div>
        </form>

        {/* Historical Interventions Log */}
        {pastInterventions.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Recorded Review History & Outcome Feedback
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto font-mono text-xs">
              {pastInterventions.map((inv) => (
                <div
                  key={inv.id}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white font-sans text-xs">{inv.intervention_type}</div>
                    <div className="text-slate-400 text-[11px] font-sans mt-0.5 line-clamp-1">
                      {inv.action_taken || inv.recommended_action}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      {inv.status}
                    </span>
                    {inv.post_risk_score && (
                      <div className="text-[10px] text-emerald-400 mt-1">
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
