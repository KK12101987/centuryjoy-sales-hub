import React from 'react';
import { useData } from '../context/DataContext';
import { ShieldCheck, ShieldAlert, Check, AlertCircle, ArrowRight } from 'lucide-react';

function formatINR(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export default function AuditPodsSection() {
  const { scopedTickets, auditPodFilter, setAuditPodFilter, currentUser } = useData();

  const auditStats = React.useMemo(() => {
    let auditable = { count: 0, amount: 0, digitalCount: 0, physicalCount: 0, byManager: {} };
    let nonAuditable = { count: 0, amount: 0, digitalCount: 0, physicalCount: 0, byManager: {} };

    for (const t of scopedTickets) {
      const isAud = t.invType !== 'Non-Auditable';
      const target = isAud ? auditable : nonAuditable;

      target.count += 1;
      target.amount += t.finalTotalAmount || 0;

      if (t.isPhysical) {
        target.physicalCount += 1;
      } else {
        target.digitalCount += 1;
      }

      const mgr = t.manager || 'Unassigned';
      if (!target.byManager[mgr]) target.byManager[mgr] = { count: 0, amount: 0 };
      target.byManager[mgr].count += 1;
      target.byManager[mgr].amount += t.finalTotalAmount || 0;
    }

    const totalAmt = auditable.amount + nonAuditable.amount || 1;
    const totalCount = auditable.count + nonAuditable.count || 1;

    return {
      auditable: {
        ...auditable,
        share: (auditable.amount / totalAmt) * 100,
        volumeShare: (auditable.count / totalCount) * 100
      },
      nonAuditable: {
        ...nonAuditable,
        share: (nonAuditable.amount / totalAmt) * 100,
        volumeShare: (nonAuditable.count / totalCount) * 100
      }
    };
  }, [scopedTickets]);

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Invoice Audit Compliance PODs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dedicated operational classification for <strong>Auditable</strong> vs <strong>Non-Auditable</strong> invoices across all streams.
          </p>
        </div>
        {auditPodFilter !== 'all' && (
          <button
            onClick={() => setAuditPodFilter('all')}
            className="text-xs text-[#e31e24] dark:text-red-400 font-bold hover:underline"
          >
            Clear Audit POD Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* POD 1: Auditable POD */}
        <div
          onClick={() => setAuditPodFilter(auditPodFilter === 'Auditable' ? 'all' : 'Auditable')}
          className={`p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
            auditPodFilter === 'Auditable'
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
              : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Auditable Invoices POD
                </h3>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              auditPodFilter === 'Auditable'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
            }`}>
              {auditStats.auditable.volumeShare.toFixed(1)}% of volume
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatINR(auditStats.auditable.amount)}
              </span>
              <span className="text-xs font-bold text-slate-500 ml-2">
                ({auditStats.auditable.share.toFixed(1)}% revenue)
              </span>
            </div>
            <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
              {auditStats.auditable.count.toLocaleString()} tickets
            </div>
          </div>

          {/* Stream Split inside Auditable */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span>Digital Pods: <strong>{auditStats.auditable.digitalCount}</strong> tickets</span>
            <span>Physical Teams: <strong>{auditStats.auditable.physicalCount}</strong> tickets</span>
          </div>

          {/* Manager Breakdown inside Auditable - Admin / Developer Only */}
          {currentUser?.role === 'admin' && (
            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px]">
              {Object.entries(auditStats.auditable.byManager).map(([m, data]) => (
                <div key={m} className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-300">{m}:</span>
                  <span>{formatINR(data.amount)} ({data.count} tickets)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* POD 2: Non-Auditable POD */}
        <div
          onClick={() => setAuditPodFilter(auditPodFilter === 'Non-Auditable' ? 'all' : 'Non-Auditable')}
          className={`p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
            auditPodFilter === 'Non-Auditable'
              ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
              : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-800 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Non-Auditable Invoices POD
                </h3>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              auditPodFilter === 'Non-Auditable'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
            }`}>
              {auditStats.nonAuditable.volumeShare.toFixed(1)}% of volume
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatINR(auditStats.nonAuditable.amount)}
              </span>
              <span className="text-xs font-bold text-slate-500 ml-2">
                ({auditStats.nonAuditable.share.toFixed(1)}% revenue)
              </span>
            </div>
            <div className="text-sm font-extrabold text-amber-700 dark:text-amber-400">
              {auditStats.nonAuditable.count.toLocaleString()} tickets
            </div>
          </div>

          {/* Stream Split inside Non-Auditable */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span>Digital Pods: <strong>{auditStats.nonAuditable.digitalCount}</strong> tickets</span>
            <span>Physical Teams: <strong>{auditStats.nonAuditable.physicalCount}</strong> tickets</span>
          </div>

          {/* Manager Breakdown inside Non-Auditable - Admin / Developer Only */}
          {currentUser?.role === 'admin' && (
            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px]">
              {Object.entries(auditStats.nonAuditable.byManager).map(([m, data]) => (
                <div key={m} className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-300">{m}:</span>
                  <span>{formatINR(data.amount)} ({data.count} tickets)</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
