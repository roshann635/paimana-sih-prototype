import React, { useState } from "react";
import { X, FileText, CheckCircle, ShieldAlert } from "lucide-react";
import { paimanaApi } from "../../services/api/paimanaApi";

export default function InterventionModal({
  isOpen,
  onClose,
  project,
  onInterventionSaved,
}) {
  const todayStr = new Date().toISOString().split("T")[0];
  const demoRef = `PARAKH/${project?.project_id || "PROJ"}/${todayStr}/01`;

  const [category, setCategory] = useState("INTER_MINISTERIAL_COORDINATION");
  const [assignedOfficer, setAssignedOfficer] = useState(
    "Deputy Secretary (IPMD)",
  );
  const [actionDirectives, setActionDirectives] = useState(
    "Convene bilateral coordination meeting with implementing agency and State authorities to resolve milestone stagnation.",
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (!isOpen || !project) return null;

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await paimanaApi.createIntervention({
        project_id: project.project_id,
        intervention_type: category,
        recommended_action: actionDirectives,
        assigned_to: assignedOfficer,
        status: "UNDER_REVIEW",
        initial_risk_score: Number(
          project.latest_prediction?.composite_risk_score ||
            project.composite_risk_score ||
            0,
        ),
      });
      setSuccess(true);
      if (onInterventionSaved) onInterventionSaved();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Failed to save intervention memorandum:", err);
      setSaveError(
        "Unable to record this action. Please review the fields and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-200">
        {/* Header */}
        <div className="parakh-modal-header p-4 border-b border-[#16324A] bg-[#0B1A2A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B] shadow-gold-glow">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase font-mono">
                Administrative Review Action Memorandum
              </h3>
              <p className="text-[10px] font-mono text-[#00E5FF]">
                Simulated Administrative Directive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#16324A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prototype Reference Notice */}
        <div className="px-4 py-2.5 bg-[#07131F] border-b border-[#16324A] text-slate-400 text-xs flex items-center gap-2 font-mono">
          <ShieldAlert className="w-4 h-4 shrink-0 text-[#F59E0B]" />
          <span>
            Prototype reference:{" "}
            <strong className="text-white">{demoRef}</strong> (Simulated)
          </span>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-mono font-bold mb-1">
              Target Infrastructure Project
            </label>
            <div className="p-3 bg-[#07131F] border border-[#16324A] rounded-lg">
              <div className="font-bold text-white text-xs">
                {project.project_name}
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                {project.project_code || project.project_id} ·{" "}
                {project.ministry} · State: {project.state || "Multi-State"}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-mono font-bold mb-1">
              Action Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#07131F] border border-[#16324A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF] font-sans"
            >
              <option value="INTER_MINISTERIAL_COORDINATION">
                Inter-Ministerial Project Coordination
              </option>
              <option value="LAND_ACQUISITION_ESCALATION">
                Land Acquisition / RoW Escalation
              </option>
              <option value="CONTRACTOR_CAPACITY_AUDIT">
                Contractor Capacity & Financial Audit
              </option>
              <option value="STATUTORY_CLEARANCE_EXPEDITION">
                Statutory / Environmental Clearance Expedition
              </option>
              <option value="REVISED_COST_SANCTION_REVIEW">
                Revised Cost Sanction Reconciliation
              </option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-mono font-bold mb-1">
              Assignee Officer / Section
            </label>
            <input
              type="text"
              value={assignedOfficer}
              onChange={(e) => setAssignedOfficer(e.target.value)}
              className="w-full bg-[#07131F] border border-[#16324A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF] font-sans"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-mono font-bold mb-1">
              Directives & Action Memorandum
            </label>
            <textarea
              rows={3}
              value={actionDirectives}
              onChange={(e) => setActionDirectives(e.target.value)}
              className="w-full bg-[#07131F] border border-[#16324A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF] font-sans"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#16324A] bg-[#0B1A2A] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">
            {success
              ? "✓ Action Recorded to Feedback Loop"
              : "Logged into Audit Trail"}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-[#07131F] border border-[#16324A] text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-[#16324A] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#07131F] text-xs font-mono font-bold transition-colors shadow-gold-glow"
            >
              {saving
                ? "Recording..."
                : success
                  ? "✓ Saved"
                  : "Record Action Memorandum"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
