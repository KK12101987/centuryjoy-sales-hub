import React from 'react';
import { useData } from '../../context/DataContext';
import KPICards from './KPICards';
import ManagerBreakdown from './ManagerBreakdown';
import AuditPodsSection from './AuditPodsSection';
import DigitalPodsSection from './DigitalPodsSection';
import PhysicalTeamsSection from './PhysicalTeamsSection';
import AnalyticsCharts from './AnalyticsCharts';
import MonetaryBifurcationSection from './MonetaryBifurcationSection';
import { UploadCloud, Search, RotateCcw, Calendar } from 'lucide-react';

export default function L2DashboardMain() {
  const { 
    currentUser, 
    openUploadModal, 
    activeDatasetMeta, 
    searchQuery, 
    setSearchQuery,
    resetFilters,
    streamFilter,
    auditPodFilter,
    selectedManager,
    selectedCaptain,
    selectedL2Assign
  } = useData();

  const isFiltered = 
    streamFilter !== 'all' ||
    auditPodFilter !== 'all' ||
    selectedManager !== 'all' || 
    selectedCaptain !== 'all' || 
    selectedL2Assign !== 'all' || 
    Boolean(searchQuery);

  const isLeadership = currentUser?.role === 'admin' || currentUser?.role === 'upload_view_all' || currentUser?.role === 'view_all' || currentUser?.role === 'manager';
  const canUpload = !currentUser || currentUser.role === 'admin' || currentUser.role === 'manager' || (currentUser.name && currentUser.name.toLowerCase().includes('kushal'));

  return (
    <div className="space-y-6">
      
      {/* L2 Action & Ingestion Toolbar */}
      <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
              L2 Financial Reconciliation
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-[#e31e24] dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/60">
              <Calendar className="w-3 h-3" />
              <span>{activeDatasetMeta?.badgeText || 'October 2026 Live'}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticket, RM, architect..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#e31e24] transition-all"
            />
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Direct Upload L2 Data Button */}
          {canUpload && (
            <button
              onClick={() => openUploadModal('l2')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#e31e24] to-[#b91c1c] hover:brightness-110 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload L2 Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Executive KPI Summary Cards */}
      <KPICards />

      {/* Senior Management Leadership View */}
      <ManagerBreakdown />

      {/* Dedicated Invoice Audit Compliance PODs */}
      <AuditPodsSection />

      {/* Dual Stream Presentation: Digital Pods & Physical Teams */}
      <div className="space-y-6">
        <DigitalPodsSection />
        <PhysicalTeamsSection />
      </div>



      {/* Daily Velocity & Approval Cadence Timeline */}
      {isLeadership && <AnalyticsCharts />}

      {/* Monetary Value Bifurcation (Auditable vs Non-Auditable) */}
      <MonetaryBifurcationSection />

    </div>
  );
}
