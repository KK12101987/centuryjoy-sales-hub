import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import KPICards from './components/KPICards';
import ManagerBreakdown from './components/ManagerBreakdown';
import AuditPodsSection from './components/AuditPodsSection';
import DigitalPodsSection from './components/DigitalPodsSection';
import PhysicalTeamsSection from './components/PhysicalTeamsSection';
import L2ApproverOperations from './components/L2ApproverOperations';
import AnalyticsCharts from './components/AnalyticsCharts';
import MonetaryBifurcationSection from './components/MonetaryBifurcationSection';
import UploadModal from './components/UploadModal';
import Watermark from './components/Watermark';

function DashboardContent({ onOpenUpload }) {
  const { currentUser } = useData();

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200">
      
      {/* Navigation & Header with Light/Dark Mode Toggle and Manager Profile */}
      <Navbar onOpenUpload={onOpenUpload} />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Executive KPI Summary Cards */}
        <KPICards />

        {/* Senior Management Leadership View */}
        <ManagerBreakdown />

        {/* Dedicated Invoice Audit Compliance PODs */}
        <AuditPodsSection />

        {/* Dual Stream Presentation: Digital Pods & Physical Teams */}
        <div className="space-y-6">
          {/* Digital Teams (Captain-Led Pods) */}
          <DigitalPodsSection />

          {/* Physical Teams (No Captain - Direct Manager Supervision) */}
          <PhysicalTeamsSection />
        </div>

        {/* L2 Reviewer Operations & SLA Workload */}
        <L2ApproverOperations />

        {/* Daily Velocity & Approval Cadence Timeline */}
        <AnalyticsCharts />

        {/* Monetary Value Bifurcation (Auditable vs Non-Auditable) */}
        <MonetaryBifurcationSection />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070a12] py-4 text-center text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Century Joy Sales & Revenue Hub • Performance & Governance Portal</span>
          <span className="text-[11px] text-slate-400">Strictly Internal & Confidential</span>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <DataProvider>
      <DashboardContent onOpenUpload={() => setIsUploadOpen(true)} />

      {/* Dynamic Upload Modal */}
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />

      {/* Rule 19 Author Watermark: Always active */}
      <Watermark />
    </DataProvider>
  );
}
