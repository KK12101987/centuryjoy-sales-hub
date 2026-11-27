import React, { lazy, Suspense } from 'react';
import { DataProvider, useData } from './context/DataContext';
import Navbar from './components/Common/Navbar';
import LoginPage from './components/Common/LoginPage';
import Watermark from './components/Common/Watermark';
import UploadCenterModal from './components/Common/UploadCenterModal';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Route-Based Code Splitting (React.lazy) for Optimal Bundle Delivery
const ConsolidatedDashboard = lazy(() => import('./components/ConsolidatedDashboard/ConsolidatedDashboard'));
const ManagerHub = lazy(() => import('./components/ManagerHub/ManagerHub'));
const L2DashboardMain = lazy(() => import('./components/L2Dashboard/L2DashboardMain'));
const RMProductivity = lazy(() => import('./components/RMProductivity/RMProductivity'));
const QaDashboard = lazy(() => import('./components/QaDashboard/QaDashboard'));
const UserManagement = lazy(() => import('./components/UserManagement/UserManagement'));

function ModuleLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] space-y-4">
      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <div className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase animate-pulse">
        Loading Module Operations...
      </div>
    </div>
  );
}

function AppContent() {
  const { 
    currentUser, 
    activeModule, 
    isUploadModalOpen, 
    closeUploadModal, 
    uploadModalTab, 
    effectiveZoom,
    isDevDevice,
    previewPublicMode 
  } = useData();

  if (!currentUser) {
    return <LoginPage />;
  }

  // Staging / Public Lock Gate: Outside devices (and developer preview mode) can strictly ONLY view L2 Approvals
  const isPublicDeviceLocked = !isDevDevice || previewPublicMode;

  return (
    <div 
      id="app-scale-root"
      style={{ zoom: effectiveZoom }}
      className="min-h-screen w-full bg-slate-50 dark:bg-[#070a12] text-slate-800 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-150"
    >
      {/* Print zoom reset stylesheet */}
      <style>{`
        @media print {
          #app-scale-root, body, html {
            zoom: 1 !important;
          }
        }
      `}</style>

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

      {/* Main Content Viewport with Suspense Code Splitting */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 2xl:px-10 py-5">
        <Suspense fallback={<ModuleLoadingFallback />}>
          {(isPublicDeviceLocked || activeModule === 'l2') && <L2DashboardMain />}
          {!isPublicDeviceLocked && activeModule === 'consolidated' && <ConsolidatedDashboard />}
          {!isPublicDeviceLocked && activeModule === 'divisions' && <ManagerHub />}
          {!isPublicDeviceLocked && activeModule === 'productivity' && <RMProductivity />}
          {!isPublicDeviceLocked && activeModule === 'qa' && <QaDashboard />}
          {!isPublicDeviceLocked && activeModule === 'users' && <UserManagement />}
        </Suspense>
      </main>

      {/* Executive Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d16] py-4 text-center text-xs text-slate-500 transition-colors print:hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-10 flex flex-col sm:flex-row justify-between items-center gap-2">
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
