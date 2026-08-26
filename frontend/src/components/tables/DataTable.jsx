import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Download, ArrowRight, Layers } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import TrendBadge from '../common/TrendBadge';

export default function DataTable({
  columns,
  data = [],
  onRowClick,
  title,
  subtitle,
  enableExport = true,
  exportFilename = 'paimana_export.csv',
  itemsPerPage = 15,
  initialSortKey = 'ipi_score',
  initialSortOrder = 'desc'
}) {
  const [sortKey, setSortKey] = useState(initialSortKey);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState('');

  // Filtering
  const filteredData = useMemo(() => {
    if (!filterQuery) return data;
    const q = filterQuery.toLowerCase();
    return data.filter(item => {
      return (
        item.project_id?.toLowerCase().includes(q) ||
        item.project_code?.toLowerCase().includes(q) ||
        item.project_name?.toLowerCase().includes(q) ||
        item.ministry?.toLowerCase().includes(q) ||
        item.sector?.toLowerCase().includes(q) ||
        item.state?.toLowerCase().includes(q)
      );
    });
  }, [data, filterQuery]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!sortedData || sortedData.length === 0) return;
    const headers = columns.map(c => c.header).join(',');
    const rows = sortedData.map(row => {
      return columns.map(c => {
        let val = row[c.key];
        if (typeof val === 'string') {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val ?? '';
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gov-surface border border-gov-border rounded-gov shadow-gov overflow-hidden">
      {/* Table Header & Controls */}
      {(title || enableExport) && (
        <div className="p-5 border-b border-gov-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gov-surface">
          <div>
            {title && <h3 className="text-sm font-bold text-text-primary">{title}</h3>}
            {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2.5">
            <input
              type="text"
              placeholder="Filter current view..."
              value={filterQuery}
              onChange={(e) => {
                setFilterQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-gov-surface border border-gov-border rounded-gov-sm focus:outline-none focus:border-brand text-text-primary placeholder:text-text-muted shadow-sm"
            />
            {enableExport && (
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-primary bg-gov-surface hover:bg-[#F7F7F4] rounded-gov-sm border border-gov-border transition-colors shadow-gov"
                title="Download table data as CSV"
              >
                <Download className="w-3.5 h-3.5 text-text-secondary" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gov-secondary text-text-secondary border-b border-gov-border select-none">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const isNumeric = col.align === 'right';

                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={`py-3 px-3.5 font-semibold text-[11px] uppercase tracking-wider ${
                      isNumeric ? 'text-right' : 'text-left'
                    } ${col.sortable !== false ? 'cursor-pointer hover:text-text-primary' : ''}`}
                  >
                    <div className={`inline-flex items-center gap-1 ${isNumeric ? 'justify-end' : 'justify-start'}`}>
                      <span>{col.header}</span>
                      {col.sortable !== false && isSorted && (
                        sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-brand" /> : <ChevronDown className="w-3.5 h-3.5 text-brand" />
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="py-3 px-3.5 text-right text-[11px] uppercase font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gov-border bg-gov-surface">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-10 text-center text-xs text-text-muted">
                  No records match your query.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.project_id || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className="hover:bg-[#F7F7F4] transition-colors cursor-pointer group"
                >
                  {columns.map((col) => {
                    const isNumeric = col.align === 'right';
                    const val = row[col.key];

                    return (
                      <td
                        key={col.key}
                        className={`py-3 px-3.5 text-text-primary ${isNumeric ? 'text-right font-mono' : 'text-left'}`}
                      >
                        {col.render ? col.render(val, row) : (val ?? '—')}
                      </td>
                    );
                  })}
                  <td className="py-3 px-3.5 text-right">
                    <span className="inline-flex items-center text-xs text-brand-dark font-medium group-hover:translate-x-0.5 transition-transform">
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-gov-border flex items-center justify-between text-xs text-text-secondary bg-gov-surface">
        <div>
          Showing <span className="font-semibold text-text-primary">{sortedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
          <span className="font-semibold text-text-primary">
            {Math.min(currentPage * itemsPerPage, sortedData.length)}
          </span>{' '}
          of <span className="font-semibold text-text-primary">{sortedData.length}</span> records
        </div>
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 rounded-gov-sm border border-gov-border bg-gov-surface text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F7F4] transition-colors text-xs"
          >
            Prev
          </button>
          <span className="px-2 font-mono text-xs text-text-secondary">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded-gov-sm border border-gov-border bg-gov-surface text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F7F4] transition-colors text-xs"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
