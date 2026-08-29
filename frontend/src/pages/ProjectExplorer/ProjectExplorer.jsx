import React, { useState, useEffect } from "react";
import DataTable from "../../components/tables/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import {
  LoadingSkeleton,
  ErrorState,
} from "../../components/common/FeedbackStates";
import { paimanaApi } from "../../services/api/paimanaApi";
import { Layers } from "lucide-react";

export default function ProjectExplorer({
  onSelectProject,
  initialSearch = "",
}) {
  const [projects, setProjects] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 2500, search: searchTerm.trim() };
      if (sectorFilter !== "ALL") params.sector = sectorFilter;

      const res = await paimanaApi.getProjects(params);
      if (res && res.items) {
        setProjects(res.items);
        setTotalCount(res.total || res.items.length);
      } else if (Array.isArray(res)) {
        setProjects(res);
        setTotalCount(res.length);
      }
    } catch (err) {
      console.error("Failed to load projects list:", err);
      setError("Unable to load project explorer directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [sectorFilter, searchTerm]);

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const columns = [
    {
      key: "project_code",
      header: "Project Code",
      render: (val, row) => (
        <span className="font-mono text-xs font-bold text-[#00E5FF]">
          {val || row.project_id}
        </span>
      ),
    },
    {
      key: "project_name",
      header: "Project Title",
      render: (val) => (
        <div className="font-semibold text-white truncate max-w-sm">{val}</div>
      ),
    },
    {
      key: "ministry",
      header: "Ministry & Sector",
      render: (val, row) => (
        <div className="text-xs">
          <div className="text-slate-200 truncate max-w-[220px]">{val}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            {row.sector}
          </div>
        </div>
      ),
    },
    {
      key: "state",
      header: "State",
      render: (val) => (
        <span className="text-xs text-slate-300">{val || "Multi-State"}</span>
      ),
    },
    {
      key: "original_cost",
      header: "Original Cost",
      align: "right",
      render: (val) => (
        <span className="font-mono text-slate-300">
          {val ? `₹${Number(val).toLocaleString()} Cr` : "—"}
        </span>
      ),
    },
    {
      key: "revised_cost",
      header: "Revised Cost",
      align: "right",
      render: (val) => (
        <span className="font-mono font-bold text-white">
          {val ? `₹${Number(val).toLocaleString()} Cr` : "—"}
        </span>
      ),
    },
    {
      key: "physical_progress_pct",
      header: "Progress",
      align: "right",
      render: (val) => (
        <span className="font-mono text-xs font-bold text-[#00E5FF]">
          {val != null ? `${Number(val).toFixed(0)}%` : "—"}
        </span>
      ),
    },
    {
      key: "risk_level",
      header: "Status",
      align: "center",
      render: (val) => <StatusBadge level={val || "NORMAL"} size="sm" />,
    },
  ];

  if (loading && projects.length === 0) return <LoadingSkeleton rows={10} />;
  if (error && projects.length === 0)
    return <ErrorState message={error} onRetry={loadProjects} />;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-5 bg-[#07131F] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#16324A]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#F59E0B]" />
            <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight uppercase">
              Central Infrastructure Project Explorer
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Searchable repository of all sanctioned central sector
            infrastructure projects (Cost ≥ ₹150 Crore).
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-[#0D1E30] px-3.5 py-1.5 rounded-lg border border-[#16324A]">
          <span>Total Projects:</span>
          <strong className="text-white font-bold">
            {totalCount ? totalCount.toLocaleString() : "1,630"}
          </strong>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={projects}
        onRowClick={(row) => onSelectProject && onSelectProject(row.project_id)}
        exportFilename="parakh_projects_explorer.csv"
        itemsPerPage={15}
        searchPlaceholder="Search project code, name, ministry, state..."
        initialSearchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </div>
  );
}
