import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Ticket as TicketIcon,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function TicketExplorer() {
  const { filteredTickets } = useData();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState('l2ApprovedDate');
  const [sortAsc, setSortAsc] = useState(false);

  // Sorting
  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      let vA = a[sortField];
      let vB = b[sortField];
      if (typeof vA === 'string') vA = vA.toLowerCase();
      if (typeof vB === 'string') vB = vB.toLowerCase();

      if (vA < vB) return sortAsc ? -1 : 1;
      if (vA > vB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredTickets, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedTickets.length / pageSize) || 1;
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTickets.slice(start, start + pageSize);
  }, [sortedTickets, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredTickets.length) return;

    const headers = [
      'Ticket No',
      'L2 Approved Date',
      'Created Date',
      'Architect Name',
      'User Code',
      'Relationship Manager',
      'Pod Captain',
      'Senior Manager',
      'L2 Assignee',
      'Final Total Amount',
      'Source',
      'Invoice Type',
      'L1 Approved User',
      'L1 to L2 TAT (Days)'
    ];

    const rows = filteredTickets.map((t) => [
      `"${t.ticketNo}"`,
      `"${t.l2ApprovedDate}"`,
      `"${t.createdDate}"`,
      `"${(t.architectName || '').replace(/"/g, '""')}"`,
      `"${t.userCode || ''}"`,
      `"${t.relationshipManager || ''}"`,
      `"${t.captain || ''}"`,
      `"${t.manager || ''}"`,
      `"${t.l2Assign || ''}"`,
      t.finalTotalAmount,
      `"${t.source || ''}"`,
      `"${t.invType || ''}"`,
      `"${t.l1ApprovedUser || ''}"`,
      t.tatL1ToL2Days ?? ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `L2_Tickets_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
      
      {/* Table Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <TicketIcon className="w-4 h-4 text-indigo-400" />
            L2 Transaction Explorer
          </h2>
          <p className="text-xs text-slate-400">
            Showing {paginatedTickets.length} of {filteredTickets.length.toLocaleString()} matching records
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Page size dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => handleSort('ticketNo')}>
                <div className="flex items-center gap-1">
                  Ticket No <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => handleSort('l2ApprovedDate')}>
                <div className="flex items-center gap-1">
                  Approved Date <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3">Architect & User Code</th>
              <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => handleSort('relationshipManager')}>
                <div className="flex items-center gap-1">
                  Relationship Mgr <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3">Pod Captain & Manager</th>
              <th className="py-2.5 px-3 cursor-pointer select-none text-right" onClick={() => handleSort('finalTotalAmount')}>
                <div className="flex items-center justify-end gap-1">
                  Amount (INR) <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">Approver</th>
              <th className="py-2.5 px-3 text-center">Audit Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
            {paginatedTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500">
                  No tickets found matching the active filter criteria.
                </td>
              </tr>
            ) : (
              paginatedTickets.map((t) => (
                <tr key={t.ticketNo} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-indigo-400 whitespace-nowrap">
                    {t.ticketNo}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap font-mono text-[11px]">
                    {t.l2ApprovedDate}
                  </td>
                  <td className="py-2.5 px-3 max-w-[200px] truncate" title={t.architectName}>
                    <div className="font-medium text-slate-200 truncate">{t.architectName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{t.userCode}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                    {t.relationshipManager}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="text-slate-200 font-medium">{t.captain}</div>
                    <div className="text-[10px] text-slate-400">{t.manager}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-white whitespace-nowrap">
                    ₹{t.finalTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {t.l2Assign}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      t.invType === 'Auditable'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.invType}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 text-xs text-slate-400">
        <div>
          Page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{totalPages}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
