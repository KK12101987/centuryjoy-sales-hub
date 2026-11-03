import React from 'react';
import { useData } from '../context/DataContext';
import { 
  IndianRupee, 
  Ticket, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Building2,
  Smartphone
} from 'lucide-react';

function formatINR(val) {
  if (!val && val !== 0) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export default function KPICards() {
  const { metrics, filteredTickets, tickets } = useData();
  const isFiltered = filteredTickets.length !== tickets.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Metric 1: Total Revenue */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
        <div className="absolute top-0 left-0 h-1 bg-[#e31e24] w-full"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Approved Revenue
          </span>
          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 text-[#e31e24] flex items-center justify-center border border-red-200/80 dark:border-red-900/50">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatINR(metrics.totalAmount)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Raw: ₹{metrics.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            {isFiltered && (
              <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">Filtered</span>
            )}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <Smartphone className="w-3 h-3 text-[#e31e24]" />
            Dig: {formatINR(metrics.digitalAmount)}
          </span>
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <Building2 className="w-3 h-3 text-slate-500" />
            Phys: {formatINR(metrics.physicalAmount)}
          </span>
        </div>
      </div>

      {/* Metric 2: Total Tickets */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
        <div className="absolute top-0 left-0 h-1 bg-slate-800 dark:bg-slate-500 w-full"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Approved Volume
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <Ticket className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {metrics.totalCount.toLocaleString()} <span className="text-xs font-bold text-slate-400">Tickets</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{metrics.uniqueRMs} Active RMs</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">{((metrics.totalCount / (tickets.length || 1)) * 100).toFixed(0)}% of dataset</span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          <span>Digital: <strong>{metrics.digitalCount}</strong></span>
          <span>Physical: <strong>{metrics.physicalCount}</strong></span>
        </div>
      </div>

      {/* Metric 3: Average Ticket Size */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
        <div className="absolute top-0 left-0 h-1 bg-emerald-500 w-full"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Average Ticket Size
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900/50">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatINR(metrics.avgAmount)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Median: ₹81,196</span>
            <span className="text-slate-400">Max: ₹33.25 L</span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Aud: {formatINR(metrics.auditableAmount)}</span>
          <span className="text-amber-700 dark:text-amber-400 font-semibold">Non-Aud: {formatINR(metrics.nonAuditableAmount)}</span>
        </div>
      </div>

      {/* Metric 4: Turnaround Time */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
        <div className="absolute top-0 left-0 h-1 bg-amber-500 w-full"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            SLA Turnaround (TAT)
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900/50">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {metrics.avgTAT} <span className="text-xs font-bold text-slate-400">Days</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Peak Day: {metrics.peakDay.date || 'N/A'}</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{metrics.peakDay.count} tickets</span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>8 L2 Approvers Sign-Off Active</span>
        </div>
      </div>

    </div>
  );
}
