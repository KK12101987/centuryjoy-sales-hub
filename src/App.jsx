import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import Navbar from './components/Navbar';
import KPICards from './components/KPICards';
import ManagerBreakdown from './components/ManagerBreakdown';
import CaptainDrilldown from './components/CaptainDrilldown';
import L2ApproverOperations from './components/L2ApproverOperations';
import AnalyticsCharts from './components/AnalyticsCharts';
import TicketExplorer from './components/TicketExplorer';
import UploadModal from './components/UploadModal';
import Watermark from './components/Watermark';

export default function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <DataProvider>
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Navigation & Header */}
        <Navbar onOpenUpload={() => setIsUploadOpen(true)} />

        {/* Main Dashboard Canvas */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* Executive KPI Cards */}
          <KPICards />

          {/* Senior Management Leadership View */}
          <ManagerBreakdown />

          {/* Pod Captain Workload & RM Drilldown */}
          <CaptainDrilldown />

          {/* L2 Reviewer Operations & SLA Workload */}
          <L2ApproverOperations />

          {/* Daily Trends & Channel Analytics */}
          <AnalyticsCharts />

          {/* Searchable & Filterable Ticket Explorer */}
          <TicketExplorer />

        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900/80 bg-[#070a12] py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>CenturyJoy Operations • L2 Approvals Reconciliation Hub</span>
            <span className="text-[11px] text-slate-600">Confidential Internal Portal</span>
          </div>
        </footer>

        {/* Upload & Normalization Modal */}
        <UploadModal 
          isOpen={isUploadOpen} 
          onClose={() => setIsUploadOpen(false)} 
        />

        {/* Anti-Tamper Watermark with continuous integrity check (Rule 19) */}
        <Watermark />

      </div>
    </DataProvider>
  );
}
