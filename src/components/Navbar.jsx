import React from 'react';
import { useData } from '../context/DataContext';
import { 
  RotateCcw, 
  UploadCloud, 
  Search, 
  Sun, 
  Moon, 
  Layers, 
  ShieldCheck, 
  ShieldAlert,
  Building2,
  Smartphone,
  User,
  LogOut
} from 'lucide-react';

export default function Navbar({ onOpenUpload }) {
  const { 
    filteredTickets, 
    tickets,
    metrics, 
    theme, 
    toggleTheme,
    streamFilter,
    setStreamFilter,
    auditPodFilter,
    setAuditPodFilter,
    searchQuery, 
    setSearchQuery, 
    resetFilters,
    selectedManager,
    selectedCaptain,
    selectedL2Assign,
    currentUser,
    logout
  } = useData();

  const isFiltered = 
    streamFilter !== 'all' ||
    auditPodFilter !== 'all' ||
    selectedManager !== 'all' || 
    selectedCaptain !== 'all' || 
    selectedL2Assign !== 'all' || 
    Boolean(searchQuery);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors duration-200">
      
      {/* CenturyPly Red Top Accent Line */}
      <div className="h-1 bg-gradient-to-r from-[#e31e24] via-[#c4161c] to-[#991b1b] w-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          
          {/* Brand & Typographic Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e31e24] text-white flex items-center justify-center font-black text-lg tracking-wider shadow-md shadow-red-600/20">
                CJ
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Century Joy Sales & Revenue Hub
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-[#e31e24] dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/60">
                    October 2026 Live
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Executive Governance, Sales Approvals & Revenue Audit Tracking
                </p>
              </div>
            </div>

            {/* Mobile Theme Toggle */}
            <div className="lg:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>

          {/* Action Controls & Navigation */}
          <div className="flex items-center flex-wrap gap-2.5">
            
            {/* Global Search Bar */}
            <div className="relative min-w-[210px] flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket, RM, architect..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-[#e31e24] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Reset Filters */}
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {/* Light / Dark Mode Toggle (Desktop) */}
            <button
              onClick={toggleTheme}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={`Switch to ${theme === 'light' ? 'Dark Mode' : 'Light Mode'}`}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              )}
            </button>

            {/* Upload L2 Data Button */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#e31e24]" />
              <span>Upload L2 Data</span>
            </button>

            {/* Authenticated Manager Profile (Full Name, No Monograms, No Restricted Badge) */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 sm:pl-3 sm:border-l border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center">
                    <User className="w-3 h-3 text-[#e31e24]" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">
                      • {currentUser.designation}
                    </span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-[#e31e24] dark:bg-slate-800 dark:hover:bg-red-950/40 dark:text-slate-300 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Secondary Stream & Audit Pod Navigation Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Stream Segmented Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
            <button
              onClick={() => setStreamFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                streamFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-[#e31e24] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Operations ({tickets.length.toLocaleString()})
            </button>
            <button
              onClick={() => setStreamFilter('digital')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                streamFilter === 'digital'
                  ? 'bg-[#e31e24] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Digital Stream • Captains (1,834)</span>
            </button>
            <button
              onClick={() => setStreamFilter('physical')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                streamFilter === 'physical'
                  ? 'bg-[#e31e24] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Physical Stream • Direct (854)</span>
            </button>
          </div>

          {/* Audit Pod Quick Pills */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Audit Pods:
            </span>
            <button
              onClick={() => setAuditPodFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                auditPodFilter === 'all'
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              All ({filteredTickets.length.toLocaleString()})
            </button>
            <button
              onClick={() => setAuditPodFilter(auditPodFilter === 'Auditable' ? 'all' : 'Auditable')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                auditPodFilter === 'Auditable'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Auditable Pod ({metrics.auditableCount})</span>
            </button>
            <button
              onClick={() => setAuditPodFilter(auditPodFilter === 'Non-Auditable' ? 'all' : 'Non-Auditable')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                auditPodFilter === 'Non-Auditable'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Non-Auditable Pod ({metrics.nonAuditableCount})</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
