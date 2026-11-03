import React from 'react';
import { useData } from '../context/DataContext';
import { 
  FileSpreadsheet, 
  RotateCcw, 
  UploadCloud, 
  Search, 
  Filter, 
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function Navbar({ onOpenUpload }) {
  const { 
    tickets, 
    filteredTickets, 
    metrics, 
    searchQuery, 
    setSearchQuery, 
    resetFilters,
    selectedManager,
    selectedCaptain,
    selectedL2Assign,
    selectedSource,
    selectedAudit
  } = useData();

  const isFiltered = 
    selectedManager !== 'all' || 
    selectedCaptain !== 'all' || 
    selectedL2Assign !== 'all' || 
    selectedSource !== 'all' || 
    selectedAudit !== 'all' || 
    Boolean(searchQuery);

  return (
    <header className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg ring-1 ring-white/20">
            L2
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                CenturyJoy L2 Operations Hub
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                Oct 2026 Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Executive Analytics, SLA Tracking & Revenue Reconciliation
            </p>
          </div>
        </div>

        {/* Global Search & Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Ticket, Architect, RM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors"
              title="Reset all active filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}

          {/* Upload Data Button */}
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all border border-indigo-400/20 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload L2 Data</span>
          </button>
        </div>
      </div>
    </header>
  );
}
