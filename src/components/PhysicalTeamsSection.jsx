import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Building2, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, UserCheck } from 'lucide-react';

function formatINR(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export default function PhysicalTeamsSection() {
  const { scopedTickets, selectedCaptain, setSelectedCaptain, currentUser } = useData();
  const [expandedTeam, setExpandedTeam] = useState(null);

  const physicalTeams = React.useMemo(() => {
    const managers = currentUser?.role === 'manager'
      ? [currentUser.managerKey]
      : ['Niladri Bhadra', 'Surajit Laha', 'Arijit Nath', 'Amit Singal'];

    const map = {};

    for (const m of managers) {
      map[m] = {
        name: `${m} - Physical Team`,
        manager: m,
        count: 0,
        amount: 0,
        auditableCount: 0,
        nonAuditableCount: 0,
        rms: {}
      };
    }

    for (const t of scopedTickets) {
      if (!t.isPhysical) continue; // Only Physical Teams

      const m = t.manager;
      if (!map[m]) continue;

      map[m].count += 1;
      map[m].amount += t.finalTotalAmount || 0;

      if (t.invType === 'Non-Auditable') {
        map[m].nonAuditableCount += 1;
      } else {
        map[m].auditableCount += 1;
      }

      const rm = t.relationshipManager || 'Unknown';
      if (!map[m].rms[rm]) {
        map[m].rms[rm] = { name: rm, count: 0, amount: 0 };
      }
      map[m].rms[rm].count += 1;
      map[m].rms[rm].amount += t.finalTotalAmount || 0;
    }

    return Object.values(map)
      .filter(pt => pt.count > 0)
      .map(pt => ({
        ...pt,
        rmList: Object.values(pt.rms).sort((a, b) => b.amount - a.amount),
        monogram: pt.manager.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [scopedTickets, currentUser]);

  const toggleExpand = (teamName, e) => {
    e.stopPropagation();
    setExpandedTeam(expandedTeam === teamName ? null : teamName);
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 dark:bg-slate-300"></span>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              Physical Teams • Direct Manager Supervision
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              {physicalTeams.length} Direct Field {physicalTeams.length === 1 ? 'Team' : 'Teams'} • NO CAPTAINS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Physical teams have <strong>no captains</strong>. Field executives report directly to the Senior Manager.
          </p>
        </div>
        {selectedCaptain !== 'all' && (
          <button
            onClick={() => setSelectedCaptain('all')}
            className="text-xs text-[#e31e24] dark:text-red-400 font-bold hover:underline"
          >
            Clear Team Filter
          </button>
        )}
      </div>

      <div className={`grid gap-3.5 ${physicalTeams.length === 1 ? 'grid-cols-1 max-w-xl' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
        {physicalTeams.map((team) => {
          const isSelected = selectedCaptain === team.name;
          const isExpanded = expandedTeam === team.name;

          return (
            <div
              key={team.name}
              onClick={() => setSelectedCaptain(isSelected ? 'all' : team.name)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-slate-100/90 dark:bg-slate-800/80 border-slate-700 ring-2 ring-slate-400/20 shadow-md'
                  : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-[#e31e24] transition-colors">
                      {team.name}
                    </h3>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                      Direct: {team.manager}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => toggleExpand(team.name, e)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  title="Expand RM List"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {formatINR(team.amount)}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {team.count} <span className="font-normal text-slate-400">tickets</span>
                </span>
              </div>

              {/* Audit Split Pills */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3 h-3" /> Aud: {team.auditableCount}
                </span>
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                  <ShieldAlert className="w-3 h-3" /> Non-Aud: {team.nonAuditableCount}
                </span>
                <span className="text-slate-500 font-medium">
                  {team.rmList.length} Field RMs
                </span>
              </div>

              {/* Expandable RM Drawer */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 max-h-36 overflow-y-auto">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Direct Field RMs ({team.rmList.length}):
                  </div>
                  {team.rmList.map(rm => (
                    <div key={rm.name} className="flex justify-between items-center text-[11px] p-1.5 rounded bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-750">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">{rm.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatINR(rm.amount)} ({rm.count})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
