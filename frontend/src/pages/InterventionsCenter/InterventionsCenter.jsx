import React, { useState, useEffect } from "react";
import DataTable from "../../components/tables/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import {
  LoadingSkeleton,
  ErrorState,
} from "../../components/common/FeedbackStates";
import { paimanaApi } from "../../services/api/paimanaApi";
import {
  Cpu,
  CheckCircle2,
  TrendingDown,
  FileText,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const SAMPLE_INTERVENTIONS = [
  {
    id: 1,
    project_id: "PAI-001",
    project_name: "Western Dedicated Freight Corridor (Phase II)",
    intervention_type: "Schedule Recovery Plan",
    recommended_action:
      "Direct EPC contractor to add double shift and expedite signaling procurement.",
    assigned_to: "Joint Secretary (Railways)",
    initial_risk: 92.4,
    post_risk: 74.2,
    risk_delta: -18.2,
    status: "ACTION_ASSIGNED",
    recorded_at: "2026-04-12",
  },
  {
    id: 2,
    project_id: "PAI-002",
    project_name: "National Highway Corridor Package 4A",
    intervention_type: "Land Acquisition Clearance",
    recommended_action:
      "Escalate pending state RoW clearance to State Empowered Committee.",
    assigned_to: "Principal Secretary (PWD)",
    initial_risk: 86.0,
    post_risk: 68.5,
    risk_delta: -17.5,
    status: "UNDER_REVIEW",
    recorded_at: "2026-04-18",
  },
  {
    id: 3,
    project_id: "PAI-003",
    project_name: "Paradip-Hyderabad Multi-Product Pipeline",
    intervention_type: "Capex Drawdown Audit",
    recommended_action:
      "Initiate physical-financial milestone audit on pumping stations.",
    assigned_to: "Director (Project Monitoring, MoPNG)",
    initial_risk: 81.2,
    post_risk: 62.0,
    risk_delta: -19.2,
    status: "RESOLVED",
    recorded_at: "2026-03-29",
  },
  {
    id: 4,
    project_id: "PAI-004",
    project_name: "Chennai Metro Rail Phase II Development",
    intervention_type: "Contractor Capacity Review",
    recommended_action:
      "PMC to review underground tunneling progress velocity and site staffing.",
    assigned_to: "Managing Director (CMRL)",
    initial_risk: 79.5,
    post_risk: 75.0,
    risk_delta: -4.5,
    status: "UNDER_REVIEW",
    recorded_at: "2026-04-22",
  },
  {
    id: 5,
    project_id: "PAI-005",
    project_name: "Ghatampur Thermal Power Project (3x660 MW)",
    intervention_type: "Boiler Synchronization Review",
    recommended_action:
      "Expedite OEM technical dispatch team for balance-of-plant works.",
    assigned_to: "Advisor (Thermal, MoP)",
    initial_risk: 84.8,
    post_risk: 65.4,
    risk_delta: -19.4,
    status: "RESOLVED",
    recorded_at: "2026-03-15",
  },
];

export default function InterventionsCenter({ onSelectProject }) {
  const [interventions, setInterventions] = useState(SAMPLE_INTERVENTIONS);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      key: "project_id",
      header: "Code",
      render: (val) => (
        <span className="font-mono text-xs font-bold text-[#00E5FF]">
          {val}
        </span>
      ),
    },
    {
      key: "project_name",
      header: "Project Title",
      render: (val) => (
        <div className="font-semibold text-white truncate max-w-xs">{val}</div>
      ),
    },
    {
      key: "intervention_type",
      header: "Intervention Type",
      render: (val) => (
        <span className="font-mono text-xs font-bold text-[#F59E0B]">
          {val}
        </span>
      ),
    },
    {
      key: "assigned_to",
      header: "Assigned Officer",
      render: (val) => <span className="text-xs text-slate-300">{val}</span>,
    },
    {
      key: "initial_risk",
      header: "Initial Risk",
      align: "right",
      render: (val) => (
        <span className="font-mono font-bold text-[#EF4444] text-xs">
          {Number(val).toFixed(1)}
        </span>
      ),
    },
    {
      key: "post_risk",
      header: "Post Risk",
      align: "right",
      render: (val) => (
        <span className="font-mono font-bold text-[#10B981] text-xs">
          {Number(val).toFixed(1)}
        </span>
      ),
    },
    {
      key: "risk_delta",
      header: "Risk Delta",
      align: "right",
      render: (val) => (
        <span className="font-mono font-extrabold text-[#10B981] text-xs px-2 py-0.5 rounded bg-[#10B981]/15 border border-[#10B981]/30">
          {val > 0 ? `+${val}` : `${val}`} pts
        </span>
      ),
    },
    {
      key: "status",
      header: "Lifecycle Status",
      align: "center",
      render: (val) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
            val === "RESOLVED"
              ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
              : val === "ACTION_ASSIGNED"
                ? "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
                : "bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30"
          }`}
        >
          {val}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-5 bg-[#07131F] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#16324A]">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#F59E0B]" />
            <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight uppercase">
              Administrative Interventions & Risk Outcomes
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional feedback loop tracking administrative action
            memorandums and before/after risk score trajectory reductions.
          </p>
        </div>
      </div>

      {/* 4 Feedback Loop Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#0D1E30] border border-[#16324A] rounded-xl shadow-command-card space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Total Interventions
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">43</div>
          <div className="text-[11px] text-slate-400">
            Formal action memos recorded
          </div>
        </div>

        <div className="p-5 bg-[#0D1E30] border border-[#10B981]/40 rounded-xl shadow-command-card space-y-1 border-t-2 border-t-[#10B981]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#10B981] font-bold">
            Risk Reduced
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#10B981]">
            29 (67.4%)
          </div>
          <div className="text-[11px] text-slate-400">
            Average reduction: -16.4 pts
          </div>
        </div>

        <div className="p-5 bg-[#0D1E30] border border-[#F59E0B]/40 rounded-xl shadow-command-card space-y-1 border-t-2 border-t-[#F59E0B]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
            Neutral / In Progress
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#F59E0B]">
            10 (23.3%)
          </div>
          <div className="text-[11px] text-slate-400">Under PMC review</div>
        </div>

        <div className="p-5 bg-[#0D1E30] border border-[#EF4444]/40 rounded-xl shadow-command-card space-y-1 border-t-2 border-t-[#EF4444]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#EF4444] font-bold">
            Escalated Risk
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#EF4444]">
            4 (9.3%)
          </div>
          <div className="text-[11px] text-slate-400">
            Referred to Empowered Committee
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={interventions}
        onRowClick={(row) => onSelectProject && onSelectProject(row.project_id)}
        exportFilename="paimana_interventions_outcomes.csv"
        itemsPerPage={15}
        searchPlaceholder="Search intervention, project code, officer..."
      />
    </div>
  );
}
