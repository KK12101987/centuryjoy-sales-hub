import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Smartphone, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, Award } from 'lucide-react';

function formatINR(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export default function DigitalPodsSection() {
  const { scopedTickets, selectedCaptain, setSelectedCaptain, currentUser } = useData();
  const [expandedPod, setExpandedPod] = useState(null);

  const digitalPods = React.useMemo(() => {
    const map = {};
    for (const t of scopedTickets) {
      if (t.isPhysical) continue; // Only Digital Pods

      const cap = t.captain;
      if (!map[cap]) {
        map[cap] = {
          name: cap,
          manager: t.manager,
          count: 0,
          amount: 0,
          auditableAmount: 0,
          auditableCount: 0,
          nonAuditableAmount: 0,
          nonAuditableCount: 0,
          rms: {}
        };
      }
      map[cap].count += 1;
      map[cap].amount += t.finalTotalAmount || 0;

      const isNonAud = t.invType === 'Non-Auditable';
      if (isNonAud) {
        map[cap].nonAuditableCount += 1;
        map[cap].nonAuditableAmount += t.finalTotalAmount || 0;
      } else {
        map[cap].auditableCount += 1;
        map[cap].auditableAmount += t.finalTotalAmount || 0;
      }

      const rm = t.relationshipManager || 'Unknown';
      if (!map[cap].rms[rm]) {
        map[cap].rms[rm] = { 
          name: rm, 
          count: 0, 
          amount: 0,
          auditableAmount: 0,
          auditableCount: 0,
          nonAuditableAmount: 0,
          nonAuditableCount: 0
        };
      }
      map[cap].rms[rm].count += 1;
      map[cap].rms[rm].amount += t.finalTotalAmount || 0;
      if (isNonAud) {
        map[cap].rms[rm].nonAuditableCount += 1;
        map[cap].rms[rm].nonAuditableAmount += t.finalTotalAmount || 0;
      } else {
        map[cap].rms[rm].auditableCount += 1;
        map[cap].rms[rm].auditableAmount += t.finalTotalAmount || 0;
      }
    }

    return Object.values(map)
      .map(p => {
        const audShare = p.amount > 0 ? (p.auditableAmount / p.amount) * 100 : 0;
        const nonAudShare = p.amount > 0 ? (p.nonAuditableAmount / p.amount) * 100 : 0;
        const rmList = Object.values(p.rms)
          .map(rm => ({
            ...rm,
            audShare: rm.amount > 0 ? (rm.auditableAmount / rm.amount) * 100 : 0,
            nonAudShare: rm.amount > 0 ? (rm.nonAuditableAmount / rm.amount) * 100 : 0
          }))
          .sort((a, b) => b.amount - a.amount);

        return {
          ...p,
          audShare,
          nonAudShare,
          rmList,
          monogram: p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [scopedTickets]);

  const toggleExpand = (capName, e) => {
    e.stopPropagation();
    setExpandedPod(expandedPod === capName ? null : capName);
  };

  if (digitalPods.length === 0) return null;

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
              {digitalPods.length} Dedicated Pod {digitalPods.length === 1 ? 'Captain' : 'Captains'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Digital stream operations managed by dedicated Pod Captains under each Senior Manager.
          </p>
        </div>
        {selectedCaptain !== 'all' && (
          <button
            onClick={() => setSelectedCaptain('all')}
            className="text-xs text-[#e31e24] dark:text-red-400 font-bold hover:underline cursor-pointer"
          >
            Clear Pod Filter
          </button>
        )}
      </div>

      <div className={`grid gap-3.5 ${digitalPods.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {digitalPods.map((pod) => {
          const isSelected = selectedCaptain === pod.name;
          const isExpanded = expandedPod === pod.name;

          return (
            <div
              key={pod.name}
              onClick={() => setSelectedCaptain(isSelected ? 'all' : pod.name)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                isSelected
                  ? 'bg-red-50/90 dark:bg-red-950/40 border-[#e31e24] ring-2 ring-red-500/20 shadow-md'
                  : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
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
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
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
              </div>

              {/* Audit Split Pills with Exact Percentages */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-extrabold">
                    <ShieldCheck className="w-3 h-3" /> Aud: {pod.audShare.toFixed(0)}% ({pod.auditableCount} tix)
                  </span>
                  <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-extrabold">
                    <ShieldAlert className="w-3 h-3" /> Non-Aud: {pod.nonAudShare.toFixed(0)}% ({pod.nonAuditableCount} tix)
                  </span>
                  <span className="text-slate-400 font-semibold text-[10px]">
                    {pod.rmList.length} RMs
                  </span>
                </div>
                {/* Visual Ratio Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 flex overflow-hidden">
                  <div className="bg-emerald-500 h-1" style={{ width: `${pod.audShare}%` }} title={`Auditable: ${pod.audShare.toFixed(1)}%`} />
                  <div className="bg-amber-500 h-1" style={{ width: `${pod.nonAudShare}%` }} title={`Non-Auditable: ${pod.nonAudShare.toFixed(1)}%`} />
                </div>
              </div>

              {/* Expandable RM Drawer with Individual Auditable & Non-Auditable % */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 max-h-48 overflow-y-auto">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Relationship Managers ({pod.rmList.length}):
                  </div>
                  {pod.rmList.map(rm => (
                    <div key={rm.name} className="flex justify-between items-center text-[11px] p-2 rounded-lg bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[130px]">{rm.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{formatINR(rm.amount)} ({rm.count} tix)</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                          Aud: {rm.audShare.toFixed(0)}%
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                          Non-Aud: {rm.nonAudShare.toFixed(0)}%
                        </span>
                      </div>
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
