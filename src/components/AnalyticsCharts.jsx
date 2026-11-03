import React from 'react';
import { useData } from '../context/DataContext';
import { Calendar, Smartphone, Building2 } from 'lucide-react';

function formatINR(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export default function AnalyticsCharts() {
  const { filteredTickets, streamFilter, setStreamFilter } = useData();

  const dailyData = React.useMemo(() => {
    const map = {};
    for (const t of filteredTickets) {
      const d = t.l2ApprovedDate;
      if (!d) continue;
      if (!map[d]) map[d] = { date: d, count: 0, amount: 0, digital: 0, physical: 0 };
      map[d].count += 1;
      map[d].amount += t.finalTotalAmount || 0;
      if (t.isPhysical) map[d].physical += 1;
      else map[d].digital += 1;
    }
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTickets]);

  const maxDailyCount = Math.max(...dailyData.map(d => d.count), 1);

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#e31e24]" />
            October 2026 Daily L2 Approval Velocity & Cadence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Day-by-day transaction throughput across all 22 active approval days with peak surge on Oct 29–31.
          </p>
        </div>
        <span className="text-xs font-bold text-[#e31e24] bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 px-2.5 py-1 rounded-full">
          Peak Day: Oct 31 (538 tickets)
        </span>
      </div>

      {/* Bar Chart Visualization */}
      <div className="h-44 flex items-end gap-1.5 pt-4 pb-2 border-b border-slate-200 dark:border-slate-800 px-1">
        {dailyData.map((d) => {
          const heightPct = Math.max(8, (d.count / maxDailyCount) * 100);
          const isPeak = d.count >= 200;
          const dateLabel = d.date.split('-')[2];

          return (
            <div 
              key={d.date}
              className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-slate-900 dark:bg-black border border-slate-700 text-white text-[10px] px-2.5 py-1 rounded-lg shadow-xl z-20 whitespace-nowrap pointer-events-none">
                <span className="font-extrabold text-[#e31e24]">{d.date}</span>
                <span>{d.count} tickets • {formatINR(d.amount)}</span>
                <span className="text-[9px] text-slate-400">Dig: {d.digital} | Phys: {d.physical}</span>
              </div>

              {/* Bar */}
              <div
                style={{ height: `${heightPct}%` }}
                className={`w-full rounded-t-sm transition-all duration-300 ${
                  isPeak 
                    ? 'bg-gradient-to-t from-[#e31e24] to-[#ef4444] group-hover:brightness-110' 
                    : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-[#e31e24]'
                }`}
              ></div>

              <span className="text-[10px] text-slate-400 font-mono mt-1 group-hover:text-[#e31e24] font-semibold">
                {dateLabel}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#e31e24]"></span>
            High Surge Days (&gt;200)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-700"></span>
            Standard Velocity
          </span>
        </div>
        <span className="font-bold text-slate-700 dark:text-slate-300">
          Showing {filteredTickets.length.toLocaleString()} tickets in active view
        </span>
      </div>
    </div>
  );
}
