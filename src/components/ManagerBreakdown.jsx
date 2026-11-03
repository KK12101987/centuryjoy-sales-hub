import React from 'react';
import { useData } from '../context/DataContext';
import { ChevronRight, Shield, Smartphone, Building2, ShieldCheck } from 'lucide-react';

function formatINR(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

const MONOGRAMS = {
  'Niladri Bhadra': 'NB',
  'Surajit Laha': 'SL',
  'Arijit Nath': 'AN',
  'Amit Singal': 'AS'
};

export default function ManagerBreakdown() {
  const { tickets, selectedManager, setSelectedManager } = useData();

  const managerStats = React.useMemo(() => {
    const managers = ['Niladri Bhadra', 'Surajit Laha', 'Arijit Nath', 'Amit Singal'];
    const map = {};
    for (const m of managers) {
      map[m] = {
        name: m,
        monogram: MONOGRAMS[m] || m.substring(0, 2).toUpperCase(),
        totalAmount: 0,
        totalCount: 0,
        digitalAmount: 0,
        digitalCount: 0,
        physicalAmount: 0,
        physicalCount: 0,
        auditableAmount: 0,
        nonAuditableAmount: 0,
        rms: new Set()
      };
    }

    for (const t of tickets) {
      const mgr = t.manager;
      if (!map[mgr]) continue;
      map[mgr].totalAmount += t.finalTotalAmount || 0;
      map[mgr].totalCount += 1;
      if (t.relationshipManager) map[mgr].rms.add(t.relationshipManager);

      if (t.isPhysical) {
        map[mgr].physicalAmount += t.finalTotalAmount || 0;
        map[mgr].physicalCount += 1;
      } else {
        map[mgr].digitalAmount += t.finalTotalAmount || 0;
        map[mgr].digitalCount += 1;
      }

      if (t.invType === 'Non-Auditable') {
        map[mgr].nonAuditableAmount += t.finalTotalAmount || 0;
      } else {
        map[mgr].auditableAmount += t.finalTotalAmount || 0;
      }
    }

    const totalRevenue = Object.values(map).reduce((sum, m) => sum + m.totalAmount, 0) || 1;

    return Object.values(map).map(m => ({
      ...m,
      rmsCount: m.rms.size,
      share: (m.totalAmount / totalRevenue) * 100,
      digitalShare: m.totalAmount > 0 ? (m.digitalAmount / m.totalAmount) * 100 : 0,
      physicalShare: m.totalAmount > 0 ? (m.physicalAmount / m.totalAmount) * 100 : 0
    })).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [tickets]);

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#e31e24]" />
            Senior Management Leadership • 4 Senior Managers
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Managers are executive supervisors overseeing both <strong>Digital Pods (Captains)</strong> and <strong>Physical Teams (Direct)</strong>.
          </p>
        </div>
        {selectedManager !== 'all' && (
          <button
            onClick={() => setSelectedManager('all')}
            className="text-xs text-[#e31e24] dark:text-red-400 font-bold hover:underline underline-offset-4"
          >
            Show All Senior Managers
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {managerStats.map((mgr) => {
          const isSelected = selectedManager === mgr.name;
          return (
            <div
              key={mgr.name}
              onClick={() => setSelectedManager(isSelected ? 'all' : mgr.name)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-red-50/80 dark:bg-red-950/40 border-[#e31e24] ring-2 ring-red-500/20 shadow-md'
                  : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  {/* Clean Monogram Badge - NO PHOTOS */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs tracking-wider transition-colors ${
                    isSelected
                      ? 'bg-[#e31e24] text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-[#e31e24] group-hover:text-white'
                  }`}>
                    {mgr.monogram}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#e31e24] dark:group-hover:text-red-400 transition-colors">
                      {mgr.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Senior Manager • {mgr.rmsCount} RMs
                    </div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-[#e31e24] text-white' : 'text-slate-400 group-hover:text-slate-600'
                }`}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="mt-3.5 flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatINR(mgr.totalAmount)}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {mgr.totalCount} <span className="font-normal text-slate-400">tickets</span>
                </span>
              </div>

              {/* Stream Breakdown Sub-metrics */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1 text-[11px]">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-[#e31e24]" />
                    Digital Stream:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatINR(mgr.digitalAmount)} <span className="font-normal text-slate-400">({mgr.digitalCount})</span>
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    Physical Team:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatINR(mgr.physicalAmount)} <span className="font-normal text-slate-400">({mgr.physicalCount})</span>
                  </span>
                </div>
              </div>

              {/* Dual Progress Bar of Digital vs Physical */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Digital: {mgr.digitalShare.toFixed(0)}%</span>
                  <span>Physical: {mgr.physicalShare.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 flex overflow-hidden">
                  <div
                    className="bg-[#e31e24] h-1.5 transition-all duration-500"
                    style={{ width: `${mgr.digitalShare}%` }}
                    title={`Digital: ${mgr.digitalShare.toFixed(1)}%`}
                  ></div>
                  <div
                    className="bg-slate-600 dark:bg-slate-400 h-1.5 transition-all duration-500"
                    style={{ width: `${mgr.physicalShare}%` }}
                    title={`Physical: ${mgr.physicalShare.toFixed(1)}%`}
                  ></div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
