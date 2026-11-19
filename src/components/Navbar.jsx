import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import UpdatePasswordModal from './UpdatePasswordModal';
import DeveloperUserModal from './DeveloperUserModal';
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
  Users,
  LogOut,
  KeyRound,
  Calendar,
  ChevronDown,
  Check
} from 'lucide-react';

export default function Navbar({ onOpenUpload }) {
  const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const monthDropdownRef = useRef(null);

  const { 
    filteredTickets, 
    scopedTickets,
    userScopedTickets,
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
    logout,
    // Month API
    selectedMonth,
    selectMonth,
    availableMonths,
    activeMonthInfo,
    scopedStreamCounts,
    scopedAuditCounts
  } = useData();

  // Close month dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setIsMonthDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

                  {/* Interactive Month Switcher in Header */}
                  <div className="relative" ref={monthDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight bg-red-50 hover:bg-red-100 text-[#e31e24] dark:bg-red-950/60 dark:hover:bg-red-900/80 dark:text-red-400 border border-red-200 dark:border-red-900/80 transition-all cursor-pointer shadow-2xs group"
                      title="Click to select month"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#e31e24] group-hover:scale-110 transition-transform" />
                      <span>{activeMonthInfo?.badgeText || activeMonthInfo?.label || 'October 2026 Live'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Month Dropdown Menu */}
                    {isMonthDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span>Select Month Period</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                            {availableMonths.length} available
                          </span>
                        </div>
                        <div className="py-1">
                          {availableMonths.map((m) => {
                            const isSelected = selectedMonth === m.key;
                            return (
                              <button
                                key={m.key}
                                type="button"
                                onClick={() => {
                                  selectMonth(m.key);
                                  setIsMonthDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between group cursor-pointer ${
                                  isSelected 
                                    ? 'bg-red-50/70 dark:bg-red-950/30 text-slate-900 dark:text-white font-bold' 
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={isSelected ? 'text-[#e31e24]' : 'text-slate-700 dark:text-slate-200'}>
                                      {m.label}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                                    {m.count.toLocaleString()} tickets • ₹{(m.amount / 10000000).toFixed(2)} Cr
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-[#e31e24] shrink-0" />
                                )}
                              </button>
                            );
                          })}
                          {availableMonths.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                selectMonth('all');
                                setIsMonthDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between border-t border-slate-100 dark:border-slate-800 group cursor-pointer ${
                                selectedMonth === 'all'
                                  ? 'bg-red-50/70 dark:bg-red-950/30 text-slate-900 dark:text-white font-bold' 
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                              }`}
                            >
                              <div>
                                <div className="text-slate-700 dark:text-slate-200">All Months (Consolidated)</div>
                                <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                                  {userScopedTickets.length.toLocaleString()} tickets • ₹{(userScopedTickets.reduce((s, t) => s + (t.finalTotalAmount || 0), 0) / 10000000).toFixed(2)} Cr
                                </div>
                              </div>
                              {selectedMonth === 'all' && (
                                <Check className="w-4 h-4 text-[#e31e24] shrink-0" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Executive Governance, Sales Approvals & Revenue Audit Tracking
                </p>
              </div>
            </div>
          </div>

          {/* Quick Search & Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Search Input */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket, RM, architect..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#e31e24] transition-all"
              />
            </div>

            {/* Reset Filters Button */}
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

            {/* Authenticated Manager Profile */}
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

                {/* Developer User & Access Control (Restricted to Developer) */}
                {currentUser && (currentUser.role === 'admin' || (currentUser.name && currentUser.name.toLowerCase().includes('kushal'))) && (
                  <button
                    onClick={() => setIsDeveloperModalOpen(true)}
                    title="Developer User & Access Management"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[#e31e24] dark:text-red-400 border border-red-500/30 transition-colors shadow-2xs text-xs font-bold cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-[#e31e24]" />
                    <span className="hidden md:inline">User & Access Control</span>
                  </button>
                )}

                {/* Update Password Button */}
                <button
                  onClick={() => setIsUpdatePasswordOpen(true)}
                  title="Update Password"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs text-xs font-bold cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#e31e24]" />
                  <span className="hidden sm:inline">Update Password</span>
                </button>

                {/* Sign Out Button */}
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-[#e31e24] dark:bg-slate-800 dark:hover:bg-red-950/40 dark:text-slate-300 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs text-xs font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Secondary Navigation & Filter Bar: Month Selector, Streams & Audit Pods */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Month Segmented Controls (Primary Month Selection) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-fit shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-2 pr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#e31e24]" />
              Month:
            </span>
            {availableMonths.map((m) => {
              const isSelected = selectedMonth === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => selectMonth(m.key)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 text-[#e31e24] shadow-sm border border-slate-200/80 dark:border-slate-700 font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {m.label} ({m.count.toLocaleString()})
                </button>
              );
            })}
            {availableMonths.length > 1 && (
              <button
                type="button"
                onClick={() => selectMonth('all')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  selectedMonth === 'all'
                    ? 'bg-white dark:bg-slate-800 text-[#e31e24] shadow-sm border border-slate-200/80 dark:border-slate-700 font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Months ({userScopedTickets.length.toLocaleString()})
              </button>
            )}
          </div>

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
              All Operations ({scopedTickets.length.toLocaleString()})
            </button>
            {scopedStreamCounts.digital > 0 && (
              <button
                onClick={() => setStreamFilter('digital')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  streamFilter === 'digital'
                    ? 'bg-[#e31e24] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Digital Stream • Captains ({scopedStreamCounts.digital.toLocaleString()})</span>
              </button>
            )}
            <button
              onClick={() => setStreamFilter('physical')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                streamFilter === 'physical'
                  ? 'bg-[#e31e24] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Physical Stream • Direct ({scopedStreamCounts.physical.toLocaleString()})</span>
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
              All ({scopedTickets.length.toLocaleString()})
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
              <span>Auditable Pod ({scopedAuditCounts.auditable.toLocaleString()})</span>
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
              <span>Non-Auditable Pod ({scopedAuditCounts.nonAuditable.toLocaleString()})</span>
            </button>
          </div>

        </div>

      </div>

      <UpdatePasswordModal
        isOpen={isUpdatePasswordOpen}
        onClose={() => setIsUpdatePasswordOpen(false)}
      />

      <DeveloperUserModal
        isOpen={isDeveloperModalOpen}
        onClose={() => setIsDeveloperModalOpen(false)}
        currentUser={currentUser}
      />
    </header>
  );
}
