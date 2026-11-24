import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { formatINR, nf, f1, fmtDuration } from '../../utils/formatters';
import { 
  CreditCard, 
  PhoneCall, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Calendar, 
  Filter, 
  ArrowUpRight, 
  ShieldAlert, 
  Award, 
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function ConsolidatedDashboard() {
  const { 
    tickets, 
    telephony, 
    qaAudits, 
    switchModule, 
    scopeFilter, 
    setScopeFilter,
    dateRange,
    setDateRange,
    hierarchy
  } = useData();

  // Filtered Datasets based on Scope & Stream
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (scopeFilter.manager !== 'all' && t.manager !== scopeFilter.manager) return false;
      if (scopeFilter.stream === 'digital' && t.stream !== 'Digital Pod') return false;
      if (scopeFilter.stream === 'physical' && t.stream !== 'Physical Team') return false;
      return true;
    });
  }, [tickets, scopeFilter]);

  const filteredTelephony = useMemo(() => {
    return telephony.filter((rec) => {
      if (scopeFilter.manager !== 'all' && rec.m !== scopeFilter.manager) return false;
      if (scopeFilter.captain !== 'all' && rec.c !== scopeFilter.captain) return false;
      return true;
    });
  }, [telephony, scopeFilter]);

  const filteredQa = useMemo(() => {
    return qaAudits.filter((a) => {
      if (scopeFilter.manager !== 'all' && a.manager_name !== scopeFilter.manager) return false;
      if (scopeFilter.captain !== 'all' && a.captain_name !== scopeFilter.captain) return false;
      return true;
    });
  }, [qaAudits, scopeFilter]);

  // Aggregate Metrics
  // 1. Financial (L2)
  const totalAmount = useMemo(() => {
    return filteredTickets.reduce((sum, t) => sum + (Number(t.finalTotalAmount) || 0), 0);
  }, [filteredTickets]);

  const auditableTickets = useMemo(() => {
    return filteredTickets.filter((t) => (t.is_auditable || '').toLowerCase() === 'yes' || t.inv_type?.includes('Auditable'));
  }, [filteredTickets]);

  // 2. Productivity (Telephony)
  const totalDials = useMemo(() => {
    return filteredTelephony.reduce((sum, r) => sum + (r.t || 0), 0);
  }, [filteredTelephony]);

  const totalConnected = useMemo(() => {
    return filteredTelephony.reduce((sum, r) => sum + (r.conn || 0), 0);
  }, [filteredTelephony]);

  const totalDuration = useMemo(() => {
    return filteredTelephony.reduce((sum, r) => sum + (r.dur || 0), 0);
  }, [filteredTelephony]);

  const connectivityRate = totalDials > 0 ? ((totalConnected / totalDials) * 100).toFixed(1) : '0.0';
  const avgTalkTimeSec = totalConnected > 0 ? Math.round(totalDuration / totalConnected) : 0;

  // 3. QA Audits
  const avgQaScore = useMemo(() => {
    if (filteredQa.length === 0) return 0;
    const valid = filteredQa.filter((a) => !a.is_fatal);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((s, a) => s + (Number(a.overall_score) || 0), 0);
    return (sum / valid.length).toFixed(1);
  }, [filteredQa]);

  const fatalCount = useMemo(() => {
    return filteredQa.filter((a) => a.is_fatal).length;
  }, [filteredQa]);

  const fatalRate = filteredQa.length > 0 ? ((fatalCount / filteredQa.length) * 100).toFixed(1) : '0.0';

  // Senior Managers Cross-Comparison Breakdown
  const managers = ['Surajit Laha', 'Niladri Bhadra', 'Arijit Nath', 'Amit Singal'];
  const managerComparison = useMemo(() => {
    return managers.map((mgr) => {
      const mgrTickets = tickets.filter((t) => t.manager === mgr);
      const mgrFin = mgrTickets.reduce((sum, t) => sum + (Number(t.finalTotalAmount) || 0), 0);
      const mgrTele = telephony.filter((r) => r.m === mgr);
      const dials = mgrTele.reduce((sum, r) => sum + (r.t || 0), 0);
      const conn = mgrTele.reduce((sum, r) => sum + (r.conn || 0), 0);
      const connRate = dials > 0 ? ((conn / dials) * 100).toFixed(1) : '0.0';

      const mgrQa = qaAudits.filter((a) => a.manager_name === mgr);
      const qaValid = mgrQa.filter((a) => !a.is_fatal);
      const qaScore = qaValid.length > 0 ? (qaValid.reduce((sum, a) => sum + (Number(a.overall_score) || 0), 0) / qaValid.length).toFixed(1) : '0.0';

      let status = 'Balanced';
      let statusColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      if (Number(qaScore) >= 88 && Number(connRate) >= 48) {
        status = 'High Performer';
        statusColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      } else if (Number(qaScore) < 82 || Number(connRate) < 42) {
        status = 'Needs Review';
        statusColor = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      }

      return {
        manager: mgr,
        ticketsCount: mgrTickets.length,
        financialVolume: mgrFin,
        dials,
        connected: conn,
        connRate,
        qaScore,
        auditsCount: mgrQa.length,
        status,
        statusColor,
      };
    });
  }, [tickets, telephony, qaAudits]);

  return (
    <div className="space-y-6">
      
      {/* Executive Welcome & Filter Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Consolidated Enterprise Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Integrated Operational Performance
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Cross-functional synthesis reconciling ₹45.64 Cr in L2 financial disbursements with 100K+ agent dials and 41-checkpoint quality audits.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Stream Filter */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-1 flex items-center text-xs">
              <button
                onClick={() => setScopeFilter((prev) => ({ ...prev, stream: 'all' }))}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  scopeFilter.stream === 'all' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                All Streams
              </button>
              <button
                onClick={() => setScopeFilter((prev) => ({ ...prev, stream: 'digital' }))}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  scopeFilter.stream === 'digital' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Digital Pods
              </button>
              <button
                onClick={() => setScopeFilter((prev) => ({ ...prev, stream: 'physical' }))}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  scopeFilter.stream === 'physical' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Physical Field
              </button>
            </div>

            {/* Manager Filter */}
            <select
              value={scopeFilter.manager}
              onChange={(e) => setScopeFilter((prev) => ({ ...prev, manager: e.target.value }))}
              className="bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Senior Managers</option>
              {managers.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tri-Factor Pillar KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pillar 1: Financial L2 Reconciliations */}
        <div 
          onClick={() => switchModule('l2')}
          className="group bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-brand-500/50 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
              <span>Inspect L2</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pillar 1 • Financial Approvals</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatINR(totalAmount)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Across <span className="font-semibold text-slate-700 dark:text-slate-300">{nf.format(filteredTickets.length)}</span> transactions
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Auditable Ratio</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {filteredTickets.length > 0 ? ((auditableTickets.length / filteredTickets.length) * 100).toFixed(1) : 0}% Share
            </span>
          </div>
        </div>

        {/* Pillar 2: RM Calling Productivity */}
        <div 
          onClick={() => switchModule('productivity')}
          className="group bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <PhoneCall className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>View Telephony</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pillar 2 • Calling Telephony</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {nf.format(totalDials)} <span className="text-lg font-normal text-slate-400">Dials</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{connectivityRate}%</span> Connected ({nf.format(totalConnected)} calls)
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Avg Call Talk Time</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {fmtDuration(avgTalkTimeSec)}
            </span>
          </div>
        </div>

        {/* Pillar 3: Quality Assurance & 7 QC Analytics */}
        <div 
          onClick={() => switchModule('qa')}
          className="group bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-amber-500/50 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Explore QA</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pillar 3 • Quality Assurance</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {avgQaScore}% <span className="text-lg font-normal text-slate-400">Avg Score</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated across <span className="font-semibold text-slate-700 dark:text-slate-300">41 sub-parameters</span>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Fatal Call Rate</span>
            <span className={`font-bold ${Number(fatalRate) > 5 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {fatalRate}% ({fatalCount} Fatalities)
            </span>
          </div>
        </div>

      </div>

      {/* Cross-Performance Senior Management Matrix */}
      <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-brand-500" />
              <span>Senior Management Cross-Functional Performance Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Side-by-side comparison of Financial Disbursals, Telephony Volume, and Call Quality Audits
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            4 Senior Leadership Executives
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Senior Manager</th>
                <th className="py-3 px-4">L2 Financial Vol</th>
                <th className="py-3 px-4">Tickets</th>
                <th className="py-3 px-4">Total Dials</th>
                <th className="py-3 px-4">Connectivity %</th>
                <th className="py-3 px-4">Avg QA Score</th>
                <th className="py-3 px-4">Audits</th>
                <th className="py-3 px-4">Performance Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {managerComparison.map((row) => (
                <tr key={row.manager} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {row.manager}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                    {formatINR(row.financialVolume)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {nf.format(row.ticketsCount)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {nf.format(row.dials)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    {row.connRate}%
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {row.qaScore}%
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {row.auditsCount} audits
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
