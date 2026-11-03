import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Users, ChevronDown, ChevronUp, Filter, Award } from 'lucide-react';

function formatINR(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export default function CaptainDrilldown() {
  const { 
    tickets, 
    selectedManager, 
    selectedCaptain, 
    setSelectedCaptain 
  } = useData();

  const [expandedCaptain, setExpandedCaptain] = useState(null);

  // Group by Captain
  const captainStats = React.useMemo(() => {
    const map = {};
    for (const t of tickets) {
      if (selectedManager !== 'all' && t.manager !== selectedManager) continue;
      
      const cap = t.captain || 'Unassigned';
      if (!map[cap]) {
        map[cap] = { 
          name: cap, 
          manager: t.manager, 
          count: 0, 
          amount: 0, 
          rms: {} 
        };
      }
      map[cap].count += 1;
      map[cap].amount += t.finalTotalAmount || 0;

      const rm = t.relationshipManager || 'Unknown';
      if (!map[cap].rms[rm]) {
        map[cap].rms[rm] = { name: rm, count: 0, amount: 0 };
      }
      map[cap].rms[rm].count += 1;
      map[cap].rms[rm].amount += t.finalTotalAmount || 0;
    }

    return Object.values(map)
      .map(c => ({
        ...c,
        avgAmount: c.count > 0 ? c.amount / c.count : 0,
        rmList: Object.values(c.rms).sort((a, b) => b.amount - a.amount)
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [tickets, selectedManager]);

  const toggleExpand = (capName, e) => {
    e.stopPropagation();
    setExpandedCaptain(expandedCaptain === capName ? null : capName);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-violet-400" />
            Pod Captain Workload & Team Performance
          </h2>
          <p className="text-xs text-slate-400">
            {selectedManager === 'all' 
              ? 'Showing all 10 Pod Captains across all Senior Managers' 
              : `Showing Captains reporting to ${selectedManager}`}
          </p>
        </div>
        {selectedCaptain !== 'all' && (
          <button
            onClick={() => setSelectedCaptain('all')}
            className="text-xs text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4"
          >
            Clear Captain Filter
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Pod Captain</th>
              <th className="py-2.5 px-3">Senior Manager</th>
              <th className="py-2.5 px-3 text-right">Tickets</th>
              <th className="py-2.5 px-3 text-right">Approved Revenue</th>
              <th className="py-2.5 px-3 text-right">Avg Ticket Size</th>
              <th className="py-2.5 px-3 text-center">RMs</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {captainStats.map((cap) => {
              const isSelected = selectedCaptain === cap.name;
              const isExpanded = expandedCaptain === cap.name;

              return (
                <React.Fragment key={cap.name}>
                  <tr
                    onClick={() => setSelectedCaptain(isSelected ? 'all' : cap.name)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected 
                        ? 'bg-violet-950/40 text-white font-semibold' 
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-medium text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-violet-400 ring-2 ring-violet-500/30' : 'bg-slate-600'}`}></span>
                      {cap.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {cap.manager}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      {cap.count.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      {formatINR(cap.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {formatINR(cap.avgAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => toggleExpand(cap.name, e)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        {cap.rmList.length} RMs
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isSelected 
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' 
                          : 'bg-slate-800 text-slate-400 group-hover:text-white'
                      }`}>
                        {isSelected ? 'Active Filter' : 'Filter'}
                      </span>
                    </td>
                  </tr>

                  {/* Expandable RM List Drawer */}
                  {isExpanded && (
                    <tr className="bg-slate-950/80">
                      <td colSpan={7} className="p-3 pl-8">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Relationship Managers under {cap.name} ({cap.rmList.length} RMs):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {cap.rmList.map((rm) => (
                            <div 
                              key={rm.name}
                              className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center text-xs"
                            >
                              <span className="font-medium text-slate-300 truncate max-w-[140px]" title={rm.name}>
                                {rm.name}
                              </span>
                              <div className="text-right">
                                <span className="font-semibold text-indigo-300">{formatINR(rm.amount)}</span>
                                <span className="text-[10px] text-slate-500 ml-1">({rm.count})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
