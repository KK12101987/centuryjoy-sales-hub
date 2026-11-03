import React from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle, Clock } from 'lucide-react';

function formatINR(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export default function L2ApproverOperations() {
  const { tickets, selectedL2Assign, setSelectedL2Assign } = useData();

  const approverStats = React.useMemo(() => {
    const map = {};
    for (const t of tickets) {
      const user = t.l2Assign || 'Unassigned';
      if (!map[user]) {
        map[user] = {
          name: user,
          count: 0,
          amount: 0,
          tatSum: 0,
          tatCount: 0
        };
      }
      map[user].count += 1;
      map[user].amount += t.finalTotalAmount || 0;
      if (t.tatL1ToL2Days !== null && t.tatL1ToL2Days >= 0) {
        map[user].tatSum += t.tatL1ToL2Days;
        map[user].tatCount += 1;
      }
    }

    const totalTickets = tickets.length || 1;

    return Object.values(map)
      .map((u) => ({
        ...u,
        avgAmount: u.count > 0 ? u.amount / u.count : 0,
        avgTat: u.tatCount > 0 ? (u.tatSum / u.tatCount).toFixed(1) : 'N/A',
        share: (u.count / totalTickets) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }, [tickets]);

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#e31e24]" />
            L2 Reviewer Operations & SLA Workload
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Workload distribution and Turnaround Time (L1 to L2 signoff) across all 8 approvers.
          </p>
        </div>
        {selectedL2Assign !== 'all' && (
          <button
            onClick={() => setSelectedL2Assign('all')}
            className="text-xs text-[#e31e24] dark:text-red-400 font-bold hover:underline"
          >
            Clear Approver Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {approverStats.map((app) => {
          const isSelected = selectedL2Assign === app.name;
          return (
            <div
              key={app.name}
              onClick={() => setSelectedL2Assign(isSelected ? 'all' : app.name)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-red-50/90 dark:bg-red-950/40 border-[#e31e24] ring-2 ring-red-500/20 shadow-sm'
                  : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#e31e24]' : 'bg-slate-400'}`}></span>
                  {app.name}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {app.count} tickets
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {formatINR(app.amount)}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  TAT: <strong className="text-slate-700 dark:text-slate-200">{app.avgTat} d</strong>
                </span>
              </div>

              {/* Workload Progress Bar */}
              <div className="mt-2.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Workload Share</span>
                  <span className="text-[#e31e24] font-black">{app.share.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#e31e24] h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(3, app.share))}%` }}
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
