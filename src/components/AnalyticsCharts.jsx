import React from 'react';
import { useData } from '../context/DataContext';
import { Calendar, Smartphone, Globe, ShieldAlert, BarChart2 } from 'lucide-react';

function formatINR(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export default function AnalyticsCharts() {
  const { 
    filteredTickets, 
    selectedSource, 
    setSelectedSource, 
    selectedAudit, 
    setSelectedAudit 
  } = useData();

  // Daily trend aggregation
  const dailyData = React.useMemo(() => {
    const map = {};
    for (const t of filteredTickets) {
      const d = t.l2ApprovedDate;
      if (!d) continue;
      if (!map[d]) map[d] = { date: d, count: 0, amount: 0 };
      map[d].count += 1;
      map[d].amount += t.finalTotalAmount || 0;
    }
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTickets]);

  const maxDailyCount = Math.max(...dailyData.map(d => d.count), 1);

  // Source Distribution
  const sourceStats = React.useMemo(() => {
    let cj = 0;
    let app = 0;
    let cjAmt = 0;
    let appAmt = 0;
    for (const t of filteredTickets) {
      if (t.source === 'CenturyJoyApp') {
        app += 1;
        appAmt += t.finalTotalAmount || 0;
      } else {
        cj += 1;
        cjAmt += t.finalTotalAmount || 0;
      }
    }
    const total = filteredTickets.length || 1;
    return {
      centuryJoy: { count: cj, amount: cjAmt, pct: (cj / total) * 100 },
      centuryJoyApp: { count: app, amount: appAmt, pct: (app / total) * 100 }
    };
  }, [filteredTickets]);

  // Audit Type Distribution
  const auditStats = React.useMemo(() => {
    let auditable = 0;
    let nonAuditable = 0;
    for (const t of filteredTickets) {
      if (t.invType === 'Non-Auditable') {
        nonAuditable += 1;
      } else {
        auditable += 1;
      }
    }
    const total = filteredTickets.length || 1;
    return {
      auditable: { count: auditable, pct: (auditable / total) * 100 },
      nonAuditable: { count: nonAuditable, pct: (nonAuditable / total) * 100 }
    };
  }, [filteredTickets]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      
      {/* Daily Approval Trend Timeline (2 Cols) */}
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Daily L2 Approval Velocity & Surge (October 2026)
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">
              Peak: Oct 31 (538 tickets)
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Approval cadence across all active operational days, showing end-of-month volume surge.
          </p>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end gap-1.5 pt-4 pb-2 border-b border-slate-800 px-1">
            {dailyData.map((d) => {
              const heightPct = Math.max(6, (d.count / maxDailyCount) * 100);
              const isPeak = d.count >= 200;
              const dateLabel = d.date.split('-')[2]; // Extract day number e.g. "31"

              return (
                <div 
                  key={d.date}
                  className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-slate-950 border border-slate-700 text-white text-[10px] px-2 py-1 rounded shadow-xl z-20 whitespace-nowrap pointer-events-none">
                    <span className="font-bold">{d.date}</span>
                    <span>{d.count} tickets • {formatINR(d.amount)}</span>
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-sm transition-all duration-300 group-hover:opacity-100 ${
                      isPeak 
                        ? 'bg-gradient-to-t from-indigo-600 to-violet-400 opacity-95 group-hover:brightness-125' 
                        : 'bg-indigo-900/70 opacity-70 group-hover:bg-indigo-600'
                    }`}
                  ></div>

                  <span className="text-[9px] text-slate-500 mt-1 font-mono group-hover:text-indigo-400">
                    {dateLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-indigo-600 to-violet-400"></span>
              High Volume Surge (&gt;200)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-900/70"></span>
              Standard Day
            </span>
          </div>
          <span className="font-semibold text-slate-300">
            Total {filteredTickets.length.toLocaleString()} tickets in view
          </span>
        </div>
      </div>

      {/* Channel & Auditability Breakdown (1 Col) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between gap-5">
        
        {/* Channel Source Filter & Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              Source Platform
            </h3>
            {selectedSource !== 'all' && (
              <button 
                onClick={() => setSelectedSource('all')}
                className="text-[10px] text-indigo-400 hover:text-indigo-300"
              >
                Reset
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div
              onClick={() => setSelectedSource(selectedSource === 'CenturyJoy' ? 'all' : 'CenturyJoy')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selectedSource === 'CenturyJoy'
                  ? 'bg-indigo-950/60 border-indigo-500'
                  : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  CenturyJoy (Web)
                </span>
                <span className="font-bold text-slate-200">
                  {sourceStats.centuryJoy.pct.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>{sourceStats.centuryJoy.count.toLocaleString()} tickets</span>
                <span>{formatINR(sourceStats.centuryJoy.amount)}</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedSource(selectedSource === 'CenturyJoyApp' ? 'all' : 'CenturyJoyApp')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selectedSource === 'CenturyJoyApp'
                  ? 'bg-indigo-950/60 border-indigo-500'
                  : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-violet-400" />
                  CenturyJoyApp (Mobile)
                </span>
                <span className="font-bold text-slate-200">
                  {sourceStats.centuryJoyApp.pct.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>{sourceStats.centuryJoyApp.count.toLocaleString()} tickets</span>
                <span>{formatINR(sourceStats.centuryJoyApp.amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auditability Filter & Breakdown */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              Invoice Audit Type
            </h3>
            {selectedAudit !== 'all' && (
              <button 
                onClick={() => setSelectedAudit('all')}
                className="text-[10px] text-emerald-400 hover:text-emerald-300"
              >
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={() => setSelectedAudit(selectedAudit === 'Auditable' ? 'all' : 'Auditable')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                selectedAudit === 'Auditable'
                  ? 'bg-emerald-950/60 border-emerald-500'
                  : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-semibold text-white">Auditable</div>
              <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                {auditStats.auditable.count.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">{auditStats.auditable.pct.toFixed(0)}%</div>
            </div>

            <div
              onClick={() => setSelectedAudit(selectedAudit === 'Non-Auditable' ? 'all' : 'Non-Auditable')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                selectedAudit === 'Non-Auditable'
                  ? 'bg-emerald-950/60 border-emerald-500'
                  : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-semibold text-white">Non-Auditable</div>
              <div className="text-base font-extrabold text-slate-300 mt-0.5">
                {auditStats.nonAuditable.count.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">{auditStats.nonAuditable.pct.toFixed(0)}%</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
