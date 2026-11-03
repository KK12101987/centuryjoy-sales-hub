import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Smartphone, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, Award } from 'lucide-react';

function formatINR(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export default function DigitalPodsSection() {
  const { tickets, selectedManager, selectedCaptain, setSelectedCaptain } = useData();
  const [expandedPod, setExpandedPod] = useState(null);

  const digitalPods = React.useMemo(() => {
    const map = {};
    for (const t of tickets) {
      if (t.isPhysical) continue; // Only Digital Pods
      if (selectedManager !== 'all' && t.manager !== selectedManager) continue;

      const cap = t.captain;
      if (!map[cap]) {
        map[cap] = {
          name: cap,
          manager: t.manager,
          count: 0,
          amount: 0,
          auditableCount: 0,
          nonAuditableCount: 0,
          rms: {}
        };
      }
      map[cap].count += 1;
      map[cap].amount += t.finalTotalAmount || 0;

      if (t.invType === 'Non-Auditable') {
        map[cap].nonAuditableCount += 1;
      } else {
        map[cap].auditableCount += 1;
      }

      const rm = t.relationshipManager || 'Unknown';
      if (!map[cap].rms[rm]) {
        map[cap].rms[rm] = { name: rm, count: 0, amount: 0 };
      }
      map[cap].rms[rm].count += 1;
      map[cap].rms[rm].amount += t.finalTotalAmount || 0;
    }

    return Object.values(map)
      .map(p => ({
        ...p,
        rmList: Object.values(p.rms).sort((a, b) => b.amount - a.amount),
        monogram: p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [tickets, selectedManager]);

  const toggleExpand = (capName, e) => {
    e.stopPropagation();
    setExpandedPod(expandedPod === capName ? null : capName);
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e31e24]"></span>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#e31e24]" />
              Digital Teams • Captain-Led Pods
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#e31e24] dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/60">
              7 Dedicated Pod Captains
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Digital stream operations managed by dedicated Pod Captains under each Senior Manager.
          </p>
        </div>
        {selectedCaptain !== 'all' && (
          <button
            onClick={() => setSelectedCaptain('all')}
            className="text-xs text-[#e31e24] dark:text-red-400 font-bold hover:underline"
          >
            Clear Pod Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {digitalPods.map((pod) => {
          const isSelected = selectedCaptain === pod.name;
          const isExpanded = expandedPod === pod.name;

          return (
            <div
              key={pod.name}
              onClick={() => setSelectedCaptain(isSelected ? 'all' : pod.name)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-red-50/90 dark:bg-red-950/40 border-[#e31e24] ring-2 ring-red-500/20 shadow-md'
                  : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#e31e24] text-white' : 'bg-red-100 text-[#e31e24] dark:bg-red-950/80 dark:text-red-300'
                  }`}>
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-[#e31e24] transition-colors">
                      {pod.name}
                    </h3>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Senior Manager: {pod.manager}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => toggleExpand(pod.name, e)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  title="Expand RM List"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {formatINR(pod.amount)}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {pod.count} <span className="font-normal text-slate-400">tickets</span>
                </span>
              </div>

              {/* Audit Split Pills */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3 h-3" /> Aud: {pod.auditableCount}
                </span>
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                  <ShieldAlert className="w-3 h-3" /> Non-Aud: {pod.nonAuditableCount}
                </span>
                <span className="text-slate-500 font-medium">
                  {pod.rmList.length} RMs
                </span>
              </div>

              {/* Expandable RM Drawer */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 max-h-36 overflow-y-auto">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Relationship Managers ({pod.rmList.length}):
                  </div>
                  {pod.rmList.map(rm => (
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
