import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { ROLE_DEFINITIONS, ROLES, getPermittedModules, getAllowedUploadTabs } from '../../utils/auth';
import { 
  LayoutDashboard, 
  CreditCard, 
  PhoneCall, 
  CheckCircle2, 
  Users, 
  Moon, 
  Sun, 
  LogOut, 
  ShieldCheck, 
  Building2,
  ChevronDown,
  Calendar,
  Check,
  UploadCloud,
  RefreshCw
} from 'lucide-react';

export default function Navbar() {
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const monthDropdownRef = useRef(null);

  const { 
    currentUser, 
    logout, 
    activeModule, 
    switchModule, 
    theme, 
    toggleTheme,
    tickets,
    scopedTickets,
    telephony,
    scopedTelephony,
    qaAudits,
    scopedQaAudits,
    selectedMonth,
    selectMonth,
    availableMonths,
    activeDatasetMeta,
    openUploadModal
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

  if (!currentUser) return null;

  const isDeveloperOrAdmin = currentUser.role === ROLES.ADMIN;
  const isManager = currentUser.role === ROLES.MANAGER;
  const permittedModules = getPermittedModules(currentUser);
  const allowedUploadTabs = getAllowedUploadTabs(currentUser);
  const canUpload = allowedUploadTabs.length > 0;
  const roleConfig = ROLE_DEFINITIONS[currentUser.role] || ROLE_DEFINITIONS[ROLES.VIEWER];

  // Auto-redirect if current active module is restricted under the user's supervisory scope
  useEffect(() => {
    if (permittedModules.length > 0 && !permittedModules.includes(activeModule)) {
      switchModule(permittedModules[0]);
    }
  }, [permittedModules, activeModule, switchModule]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand & Title */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-indigo-600 to-blue-500 text-white font-bold text-lg shadow-md shadow-brand-500/20 shrink-0">
              CJ
            </div>
            <div className="shrink-0">
              <div className="flex items-center space-x-2 shrink-0 whitespace-nowrap">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg whitespace-nowrap shrink-0">
                  Century Joy
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 whitespace-nowrap shrink-0">
                  Operations Suite
                </span>

                {/* Interactive Month Switcher in Header */}
                <div className="relative inline-block ml-1 shrink-0" ref={monthDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight bg-red-50 hover:bg-red-100 text-[#e31e24] dark:bg-red-950/60 dark:hover:bg-red-900/80 dark:text-red-400 border border-red-200 dark:border-red-900/80 transition-all cursor-pointer shadow-2xs group whitespace-nowrap shrink-0"
                    title="Click to select month"
                  >
                    <Calendar className="w-3 h-3 text-[#e31e24] group-hover:scale-110 transition-transform" />
                    <span>{activeDatasetMeta?.badgeText || activeDatasetMeta?.label || 'October 2026 Live'}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Month Dropdown Menu */}
                  {isMonthDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Select Operational Month</span>
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
                                {tickets.length.toLocaleString()} tickets • ₹{(tickets.reduce((s, t) => s + (t.finalTotalAmount || 0), 0) / 10000000).toFixed(2)} Cr
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
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden xl:block whitespace-nowrap">
                Unified L2 Financials • RM Productivity • Quality Assurance
              </p>
            </div>
          </div>

          {/* Module Switcher Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shrink-0">
            
            {/* 1. Consolidated Executive Dashboard */}
            {permittedModules.includes('consolidated') && (
              <button
                onClick={() => switchModule('consolidated')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeModule === 'consolidated'
                    ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                <span>Consolidated</span>
              </button>
            )}

            {/* 2. L2 Financial Reconciliation */}
            {permittedModules.includes('l2') && (
              <button
                onClick={() => switchModule('l2')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeModule === 'l2'
                    ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>L2 Approvals</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono shrink-0">
                  {(scopedTickets || tickets).length}
                </span>
              </button>
            )}

            {/* 3. RM Calling Productivity */}
            {permittedModules.includes('productivity') && (
              <button
                onClick={() => switchModule('productivity')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeModule === 'productivity'
                    ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                <span>RM Telephony</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono shrink-0">
                  {(scopedTelephony || telephony).length}
                </span>
              </button>
            )}

            {/* 4. QA Auditing & QC Tools */}
            {permittedModules.includes('qa') && (
              <button
                onClick={() => switchModule('qa')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeModule === 'qa'
                    ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>QA & QC Tools</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono shrink-0">
                  {(scopedQaAudits || qaAudits).length}
                </span>
              </button>
            )}

            {/* 5. User & Scope Management (Admin only) */}
            {permittedModules.includes('users') && (
              <button
                onClick={() => switchModule('users')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeModule === 'users'
                    ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Users & Scope</span>
              </button>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
            
            {/* Upload Data Button */}
            {canUpload && (
              <button
                onClick={() => {
                  let defaultTab = 'l2';
                  if (activeModule === 'productivity' && allowedUploadTabs.includes('telephony')) {
                    defaultTab = 'telephony';
                  } else if (activeModule === 'qa' && (allowedUploadTabs.includes('qa') || allowedUploadTabs.includes('dialer'))) {
                    defaultTab = allowedUploadTabs.includes('dialer') ? 'dialer' : 'qa';
                  } else if (!allowedUploadTabs.includes(defaultTab)) {
                    defaultTab = allowedUploadTabs[0];
                  }
                  openUploadModal(defaultTab);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
                title="Open Universal Data Ingestion Center"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#e31e24] shrink-0" />
                <span className="hidden sm:inline">Upload Data</span>
              </button>
            )}

            {/* Hard Refresh App Button */}
            <button
              onClick={() => {
                if ('caches' in window) {
                  caches.keys().then((names) => {
                    names.forEach((name) => caches.delete(name));
                  });
                }
                window.location.reload(true);
              }}
              title="Force Refresh App (Clear Cache & Load Latest Version)"
              className="p-2 rounded-xl text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 bg-slate-100 hover:bg-purple-50 dark:bg-slate-900 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile & Scope Pill */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
              <div className="text-right hidden sm:block shrink-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-end space-x-1 whitespace-nowrap">
                  <span>{currentUser.name}</span>
                  {isDeveloperOrAdmin && <ShieldCheck className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                  {currentUser.designation || roleConfig.label}
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/50 transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto space-x-1">
          {permittedModules.includes('consolidated') && (
            <button
              onClick={() => switchModule('consolidated')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                activeModule === 'consolidated' ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Consolidated
            </button>
          )}
          {permittedModules.includes('l2') && (
            <button
              onClick={() => switchModule('l2')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                activeModule === 'l2' ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              L2
            </button>
          )}
          {permittedModules.includes('productivity') && (
            <button
              onClick={() => switchModule('productivity')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                activeModule === 'productivity' ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Telephony
            </button>
          )}
          {permittedModules.includes('qa') && (
            <button
              onClick={() => switchModule('qa')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                activeModule === 'qa' ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              QA
            </button>
          )}
          {permittedModules.includes('users') && (
            <button
              onClick={() => switchModule('users')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                activeModule === 'users' ? 'bg-purple-50 text-purple-700 dark:bg-slate-800 dark:text-purple-300' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Users
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
