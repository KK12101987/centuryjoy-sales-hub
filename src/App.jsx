import React from 'react';
import { DataProvider, useData } from './context/DataContext';
import Navbar from './components/Common/Navbar';
import LoginPage from './components/Common/LoginPage';
import Watermark from './components/Common/Watermark';
import UploadCenterModal from './components/Common/UploadCenterModal';
import ConsolidatedDashboard from './components/ConsolidatedDashboard/ConsolidatedDashboard';
import ManagerHub from './components/ManagerHub/ManagerHub';
import L2DashboardMain from './components/L2Dashboard/L2DashboardMain';
import RMProductivity from './components/RMProductivity/RMProductivity';
import QaDashboard from './components/QaDashboard/QaDashboard';
import UserManagement from './components/UserManagement/UserManagement';

import ErrorBoundary from './components/Common/ErrorBoundary';

function AppContent() {
  const { currentUser, activeModule, isUploadModalOpen, closeUploadModal, uploadModalTab } = useData();

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a12] text-slate-800 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-150">
      
      {/* Global Navigation Header */}
      <Navbar />

      {/* Mandatory Rule 19 DRM Watermark verification */}
      <Watermark />

      {/* Universal Upload Center Modal */}
      <UploadCenterModal 
        isOpen={isUploadModalOpen} 
        onClose={closeUploadModal} 
        initialTab={uploadModalTab} 
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeModule === 'consolidated' && <ConsolidatedDashboard />}
        {activeModule === 'divisions' && <ManagerHub />}
        {activeModule === 'l2' && <L2DashboardMain />}
        {activeModule === 'productivity' && <RMProductivity />}
        {activeModule === 'qa' && <QaDashboard />}
        {activeModule === 'users' && <UserManagement />}
      </main>

      {/* Executive Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d16] py-4 text-center text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Century Joy Enterprise System
            </span>
            <span className="text-[10px] text-slate-400 font-mono">v5.0 Unified Release</span>
          </div>

          <div className="text-[11px] text-slate-400">
            CenturyPly • Financial Reconciliation, Telephony & QA
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ErrorBoundary>
  );
}
