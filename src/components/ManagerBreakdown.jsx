import React from 'react';
import { useData } from '../context/DataContext';
import { ChevronRight, Shield, Smartphone, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-colors">
      
      {/* Hero Header with Accent Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 text-[#e31e24] flex items-center justify-center border border-red-200 dark:border-red-900/60">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Senior Management Leadership • 4 Senior Managers
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Executive supervisors overseeing both <strong>Digital Pods (Captain-Led)</strong> and <strong>Physical Teams (Direct Supervision)</strong>.
          </p>
        </div>

        {selectedManager !== 'all' && (
          <button
            onClick={() => setSelectedManager('all')}
            className="text-xs text-[#e31e24] dark:text-red-400 font-bold hover:underline underline-offset-4 self-start sm:self-center"
          >
            Show All Senior Managers
          </button>
        )}
      </div>

      {/* 4 Senior Manager Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {managerStats.map((mgr) => {
          const isSelected = selectedManager === mgr.name;
          const isAmitSingal = mgr.name === 'Amit Singal';

          return (
            <div
              key={mgr.name}
              onClick={() => setSelectedManager(isSelected ? 'all' : mgr.name)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                isSelected
                  ? 'bg-red-50/80 dark:bg-red-950/40 border-[#e31e24] ring-2 ring-red-500/20 shadow-md'
                  : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
              }`}
            >
              <div>
                {/* Header: Monogram Avatar & Manager Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs tracking-wider transition-colors shadow-2xs ${
                      isSelected
                        ? 'bg-[#e31e24] text-white'
                        : isAmitSingal
                        ? 'bg-slate-800 text-white dark:bg-slate-700'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-[#e31e24] group-hover:text-white'
                    }`}>
                      {mgr.monogram}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#e31e24] dark:group-hover:text-red-400 transition-colors">
                        {mgr.name}
                      </h3>
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {isAmitSingal ? (
                          <span className="text-slate-700 dark:text-slate-300 font-bold">Physical Team Only • 6 RMs</span>
                        ) : (
                          <span>Senior Manager • {mgr.rmsCount} RMs</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#e31e24] text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Primary Financial Metric */}
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatINR(mgr.totalAmount)}
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800">
                    {mgr.totalCount} <span className="font-normal text-slate-400">tickets</span>
                  </span>
                </div>
              </div>

              {/* Big Spacious Stream Capsules */}
              <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
                
                {/* CASE 1: Amit Singal (Physical Team Only) */}
                {isAmitSingal ? (
                  <>
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-extrabold">
                        <Building2 className="w-4 h-4 text-[#e31e24]" />
                        <span>Physical Team Only</span>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatINR(mgr.physicalAmount)} <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">({mgr.physicalCount} tix)</span>
                      </span>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Direct Supervision</span>
                      </div>
                      <span className="font-black text-emerald-700 dark:text-emerald-400 text-[11px]">
                        100% Physical Team
                      </span>
                    </div>

                    {/* 100% Physical Progress Meter */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                        <span>Physical Team: 100%</span>
                        <span className="text-slate-400 font-normal">No Digital Stream</span>
                      </div>
                      <div className="w-full bg-slate-700 dark:bg-slate-600 rounded-full h-2"></div>
                    </div>
                  </>
                ) : (
                  /* CASE 2: Niladri Bhadra, Surajit Laha, Arijit Nath (Digital + Physical) */
                  <>
                    <div className="px-3.5 py-2 rounded-xl bg-red-50/90 dark:bg-red-950/40 border border-red-200/90 dark:border-red-900/60 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-extrabold">
                        <Smartphone className="w-3.5 h-3.5 text-[#e31e24]" />
                        <span>Digital Stream</span>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatINR(mgr.digitalAmount)} <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">({mgr.digitalCount} tix)</span>
                      </span>
                    </div>

                    <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-extrabold">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Physical Team</span>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatINR(mgr.physicalAmount)} <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">({mgr.physicalCount} tix)</span>
                      </span>
                    </div>

                    {/* Dual Progress Bar of Digital vs Physical */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                        <span className="text-red-600 dark:text-red-400">Digital: {mgr.digitalShare.toFixed(0)}%</span>
                        <span className="text-slate-700 dark:text-slate-300">Physical: {mgr.physicalShare.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 flex overflow-hidden">
                        <div
                          className="bg-[#e31e24] h-2 transition-all duration-500"
                          style={{ width: `${mgr.digitalShare}%` }}
                          title={`Digital: ${mgr.digitalShare.toFixed(1)}%`}
                        ></div>
                        <div
                          className="bg-slate-600 dark:bg-slate-400 h-2 transition-all duration-500"
                          style={{ width: `${mgr.physicalShare}%` }}
                          title={`Physical: ${mgr.physicalShare.toFixed(1)}%`}
                        ></div>
                      </div>
                    </div>
                  </>
                )}

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
