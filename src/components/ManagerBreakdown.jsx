import React from 'react';
import { useData } from '../context/DataContext';
import { Building2, ChevronRight, UserCheck, Shield } from 'lucide-react';

function formatINR(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export default function ManagerBreakdown() {
  const { tickets, filteredTickets, selectedManager, setSelectedManager } = useData();

  // Aggregate by Senior Manager
  const managerStats = React.useMemo(() => {
    const map = {};
    for (const t of tickets) {
      const mgr = t.manager || 'Unassigned / Other';
      if (!map[mgr]) {
        map[mgr] = { name: mgr, count: 0, amount: 0, captains: new Set(), rms: new Set() };
      }
      map[mgr].count += 1;
      map[mgr].amount += t.finalTotalAmount || 0;
      if (t.captain) map[mgr].captains.add(t.captain);
      if (t.relationshipManager) map[mgr].rms.add(t.relationshipManager);
    }

    const totalRevenue = Object.values(map).reduce((sum, m) => sum + m.amount, 0);

    return Object.values(map)
      .map((m) => ({
        ...m,
        captainsCount: m.captains.size,
        rmsCount: m.rms.size,
        share: totalRevenue > 0 ? (m.amount / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [tickets]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            Senior Management Leadership Performance
          </h2>
          <p className="text-xs text-slate-400">
            Click on a Senior Manager card to drill down into their Pod Captains and RMs
          </p>
        </div>
        {selectedManager !== 'all' && (
          <button
            onClick={() => setSelectedManager('all')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4"
          >
            Show All Managers
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {managerStats.map((mgr) => {
          const isSelected = selectedManager === mgr.name;
          return (
            <div
              key={mgr.name}
              onClick={() => setSelectedManager(isSelected ? 'all' : mgr.name)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-indigo-500/10 shadow-lg ring-1 ring-indigo-500/30'
                  : 'bg-slate-800/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {mgr.name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {mgr.captainsCount} Captains • {mgr.rmsCount} RMs
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-lg font-extrabold text-white">
                  {formatINR(mgr.amount)}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {mgr.count} <span className="text-slate-500 font-normal">tickets</span>
                </span>
              </div>

              {/* Progress Bar of Revenue Contribution */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Revenue Share</span>
                  <span className="font-semibold text-indigo-400">{mgr.share.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, mgr.share))}%` }}
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
