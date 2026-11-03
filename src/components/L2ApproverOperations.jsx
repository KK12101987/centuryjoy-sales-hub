import React from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle, Clock, BarChart3, Filter } from 'lucide-react';

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
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            L2 Reviewer Operations & SLA Workload
          </h2>
          <p className="text-xs text-slate-400">
            Workload distribution, total financial sign-offs, and Turnaround Time (L1 $\rightarrow$ L2)
          </p>
        </div>
        {selectedL2Assign !== 'all' && (
          <button
            onClick={() => setSelectedL2Assign('all')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
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
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/30'
                  : 'bg-slate-800/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                  {app.name}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {app.count} tickets
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-base font-extrabold text-white">
                  {formatINR(app.amount)}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  TAT: <span className="text-slate-200 font-medium">{app.avgTat} d</span>
                </span>
              </div>

              {/* Workload Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Workload Share</span>
                  <span className="font-semibold text-emerald-400">{app.share.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(4, app.share))}%` }}
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
