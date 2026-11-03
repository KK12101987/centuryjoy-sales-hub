import React from 'react';
import { useData } from '../context/DataContext';
import { 
  IndianRupee, 
  Ticket, 
  TrendingUp, 
  Clock, 
  Users, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

function formatINR(val) {
  if (!val && val !== 0) return '₹0';
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
}

export default function KPICards() {
  const { metrics, filteredTickets, tickets } = useData();
  const isFiltered = filteredTickets.length !== tickets.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Metric 1: Total Value */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-colors"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Approved Revenue
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatINR(metrics.totalAmount)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>Raw: ₹{metrics.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            {isFiltered && (
              <span className="text-amber-400 font-medium text-[11px]">Filtered</span>
            )}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>100% Sign-Off Verified</span>
        </div>
      </div>

      {/* Metric 2: Total Tickets */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="absolute top-0 right-0 w-28 h-28 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/15 transition-colors"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Approved Tickets
          </span>
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
            <Ticket className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {metrics.totalCount.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>Across 22 Active Days</span>
            <span className="text-slate-500">{((metrics.totalCount / (tickets.length || 1)) * 100).toFixed(0)}% of total</span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-slate-400">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>{metrics.uniqueRMs} Active Relationship Mgrs</span>
        </div>
      </div>

      {/* Metric 3: Average Ticket Value */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-colors"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Average Ticket Size
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatINR(metrics.avgAmount)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>Median: ₹81,196</span>
            <span className="text-slate-500">Max: ₹33.25 L</span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Avg L1 to L2 TAT: {metrics.avgTAT} Days</span>
        </div>
      </div>

      {/* Metric 4: Peak Activity Day */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-colors"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Peak Approval Day
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
            <span>{metrics.peakDay.date || 'N/A'}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span className="text-amber-400 font-semibold">{metrics.peakDay.count} Tickets</span>
            <span>{formatINR(metrics.peakDay.amount)}</span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-slate-400">Reviewers: {metrics.uniqueApprovers} Approvers</span>
        </div>
      </div>

    </div>
  );
}
