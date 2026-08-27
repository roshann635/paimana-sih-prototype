import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";

export default function DataTable({
  columns = [],
  data = [],
  onRowClick,
  title,
  subtitle,
  exportFilename = "paimana_export.csv",
  itemsPerPage = 10,
  searchable = true,
  searchPlaceholder = "Filter records...",
  initialSearchTerm = "",
  onSearchChange,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // Sync initialSearchTerm if changed from outside
  React.useEffect(() => {
    if (initialSearchTerm !== undefined) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // Filtering

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some(
      (val) => val && String(val).toLowerCase().includes(term),
    );
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [data, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // CSV Export
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = columns.map((c) => c.header).join(",");
    const rows = filteredData.map((row) =>
      columns
        .map((c) => {
          let val = row[c.key];
          if (typeof val === "string") val = `"${val.replace(/"/g, '""')}"`;
          return val ?? "";
        })
        .join(","),
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl shadow-command-card overflow-hidden">
      {/* Table Controls Header */}
      {(title || searchable) && (
        <div className="p-4 border-b border-[#16324A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B1A2A]">
          <div>
            {title && (
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase font-mono">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {searchable && (
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                    if (onSearchChange) onSearchChange(e.target.value);
                  }}
                  className="w-full bg-[#07131F] border border-[#16324A] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00E5FF] transition-colors font-sans"
                />
              </div>
            )}

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#07131F] hover:bg-[#11263C] text-slate-200 text-xs font-mono font-bold rounded-lg border border-[#16324A] transition-colors shadow-xs"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#07131F] text-slate-400 border-b border-[#16324A] text-[10px] font-mono uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`py-3 px-3.5 font-bold ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#16324A]/60 bg-[#0D1E30]">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-xs text-slate-400 font-mono"
                >
                  No matching records found in this view.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-[#eaf2fc] transition-colors ${
                    onRowClick ? "cursor-pointer group" : ""
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`py-3 px-3.5 text-slate-200 ${
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                            ? "text-center"
                            : "text-left"
                      }`}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-[#16324A] bg-[#07131F] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-400">
        <div>
          Showing{" "}
          <span className="font-bold text-white">
            {filteredData.length === 0 ? 0 : startIndex + 1}
          </span>{" "}
          to{" "}
          <span className="font-bold text-white">
            {Math.min(startIndex + itemsPerPage, filteredData.length)}
          </span>{" "}
          of <span className="font-bold text-white">{filteredData.length}</span>{" "}
          entries
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md bg-[#0D1E30] border border-[#16324A] text-slate-300 disabled:opacity-30 hover:bg-[#16324A] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2.5 py-1 text-xs font-bold text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md bg-[#0D1E30] border border-[#16324A] text-slate-300 disabled:opacity-30 hover:bg-[#16324A] transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
