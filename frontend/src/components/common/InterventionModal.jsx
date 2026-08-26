import React, { useState } from 'react';
import { X, FileText, CheckCircle, ShieldAlert } from 'lucide-react';
import { paimanaApi } from '../../services/api/paimanaApi';

export default function InterventionModal({
  isOpen,
  onClose,
  project,
  onInterventionSaved
}) {
  if (!isOpen || !project) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const demoRef = `PAIMANA-DEMO/${project.project_id || 'PROJ'}/${todayStr}/01`;

  const [category, setCategory] = useState('INTER_MINISTERIAL_COORDINATION');
  const [assignedOfficer, setAssignedOfficer] = useState('Deputy Secretary (IPMD)');
  const [actionDirectives, setActionDirectives] = useState(
    'Convene bilateral coordination meeting with implementing agency and State authorities to resolve milestone stagnation.'
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await paimanaApi.createIntervention({
        project_id: project.project_id,
        action_category: category,
        assigned_officer: assignedOfficer,
        action_directives: actionDirectives,
        reference_number: demoRef,
        status: 'PENDING_REVIEW'
      });
      setSuccess(true);
      if (onInterventionSaved) onInterventionSaved();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to save intervention memorandum:', err);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 flex items-center justify-center p-4">
      <div className="bg-gov-surface border border-gov-border rounded-gov shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-gov-border bg-gov-secondary flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-gov-sm bg-brand-light border border-brand/30 flex items-center justify-center text-brand-dark">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Administrative Review Action Memorandum
              </h3>
              <p className="text-[11px] text-text-secondary">
                Simulated Administrative Directive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-gov-sm text-text-secondary hover:text-text-primary hover:bg-gov-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prototype Reference Notice */}
        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700" />
          <span>Prototype reference: <span className="font-mono">{demoRef}</span> — not an official government document.</span>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-text-secondary font-semibold mb-1">Target Infrastructure Project</label>
            <div className="p-3 bg-[#F7F7F4] border border-gov-border rounded-gov-sm">
              <div className="font-semibold text-text-primary">{project.project_name}</div>
              <div className="text-[11px] font-mono text-text-muted mt-0.5">
                {project.project_code || project.project_id} · {project.ministry}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-text-secondary font-semibold mb-1">Action Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gov-surface border border-gov-border rounded-gov-sm px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand shadow-sm"
            >
              <option value="INTER_MINISTERIAL_COORDINATION">Inter-Ministerial Project Coordination</option>
              <option value="CONTRACTOR_PERFORMANCE_AUDIT">Contractor Performance Audit & Dispute Resolution</option>
              <option value="LAND_ACQUISITION_ACCELERATION">Land Acquisition & Right-of-Way Facilitation</option>
              <option value="STATUTORY_CLEARANCE_EXPEDITION">Statutory Regulatory Clearance Expedition</option>
              <option value="BUDGET_RECONCILIATION">Capex Drawdown & Financial Re-estimation</option>
            </select>
          </div>

          <div>
            <label className="block text-text-secondary font-semibold mb-1">Assignee Officer / Section</label>
            <input
              type="text"
              value={assignedOfficer}
              onChange={(e) => setAssignedOfficer(e.target.value)}
              className="w-full bg-gov-surface border border-gov-border rounded-gov-sm px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand shadow-sm"
            />
          </div>

          <div>
            <label className="block text-text-secondary font-semibold mb-1">Directives & Action Memorandum</label>
            <textarea
              rows={3}
              value={actionDirectives}
              onChange={(e) => setActionDirectives(e.target.value)}
              className="w-full bg-gov-surface border border-gov-border rounded-gov-sm p-3 text-xs text-text-primary focus:outline-none focus:border-brand shadow-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gov-border bg-gov-secondary flex items-center justify-between">
          <div className="text-[11px] text-text-muted font-medium">
            Status: <span className="text-text-secondary">Simulated Record</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-gov-surface border border-gov-border rounded-gov-sm text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-[#F7F7F4] transition-colors shadow-gov"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || success}
              className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-gov-sm text-xs font-semibold transition-colors shadow-gov flex items-center gap-1.5"
            >
              {success ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                  <span>Memorandum Recorded</span>
                </>
              ) : saving ? (
                <span>Recording...</span>
              ) : (
                <span>Record Action Memorandum</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
