import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  Coins, 
  ShieldCheck, 
  ShieldAlert, 
  Download, 
  Layers, 
  Users, 
  CheckCircle2, 
  Building2, 
  Smartphone,
  TrendingUp,
  Percent
} from 'lucide-react';

function formatINR(val) {
  if (!val && val !== 0) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

function formatRawINR(val) {
  return `₹${(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function MonetaryBifurcationSection() {
  const { filteredTickets, tickets } = useData();
  const [activeTab, setActiveTab] = useState('managers'); // 'managers', 'teams', 'approvers'

  // Compute aggregated monetary bifurcation stats
  const bifurcationData = useMemo(() => {
    let totalAmt = 0;
    let audAmt = 0;
    let nonAudAmt = 0;
    let totalTix = 0;
    let audTix = 0;
    let nonAudTix = 0;

    const mgrMap = {};
    const teamMap = {};
    const apprMap = {};
    const streamMap = {
      Digital: { name: 'Digital Stream (CenturyJoy)', totalAmt: 0, audAmt: 0, nonAudAmt: 0, totalTix: 0, audTix: 0, nonAudTix: 0 },
      Physical: { name: 'Physical Stream (CenturyJoyApp)', totalAmt: 0, audAmt: 0, nonAudAmt: 0, totalTix: 0, audTix: 0, nonAudTix: 0 }
    };

    for (const t of filteredTickets) {
      const amt = t.finalTotalAmount || 0;
      const isAud = t.invType !== 'Non-Auditable';
      const mgr = t.manager || 'Unassigned';
      const isPhys = Boolean(t.isPhysical);
      const streamKey = isPhys ? 'Physical' : 'Digital';
      const teamName = isPhys ? `${mgr} - Physical Team` : (t.captain || 'Direct');
      const appr = t.l2Assign || 'Unassigned';

      // Totals
      totalAmt += amt;
      totalTix += 1;
      if (isAud) {
        audAmt += amt;
        audTix += 1;
      } else {
        nonAudAmt += amt;
        nonAudTix += 1;
      }

      // Streams
      streamMap[streamKey].totalAmt += amt;
      streamMap[streamKey].totalTix += 1;
      if (isAud) {
        streamMap[streamKey].audAmt += amt;
        streamMap[streamKey].audTix += 1;
      } else {
        streamMap[streamKey].nonAudAmt += amt;
        streamMap[streamKey].nonAudTix += 1;
      }

      // Managers
      if (!mgrMap[mgr]) {
        mgrMap[mgr] = {
          name: mgr,
          totalAmt: 0,
          audAmt: 0,
          nonAudAmt: 0,
          totalTix: 0,
          audTix: 0,
          nonAudTix: 0,
          digitalAmt: 0,
          physicalAmt: 0,
          digitalTix: 0,
          physicalTix: 0
        };
      }
      mgrMap[mgr].totalAmt += amt;
      mgrMap[mgr].totalTix += 1;
      if (isAud) {
        mgrMap[mgr].audAmt += amt;
        mgrMap[mgr].audTix += 1;
      } else {
        mgrMap[mgr].nonAudAmt += amt;
        mgrMap[mgr].nonAudTix += 1;
      }
      if (isPhys) {
        mgrMap[mgr].physicalAmt += amt;
        mgrMap[mgr].physicalTix += 1;
      } else {
        mgrMap[mgr].digitalAmt += amt;
        mgrMap[mgr].digitalTix += 1;
      }

      // Teams / Captains
      if (!teamMap[teamName]) {
        teamMap[teamName] = {
          name: teamName,
          manager: mgr,
          isPhysical: isPhys,
          totalAmt: 0,
          audAmt: 0,
          nonAudAmt: 0,
          totalTix: 0,
          audTix: 0,
          nonAudTix: 0
        };
      }
      teamMap[teamName].totalAmt += amt;
      teamMap[teamName].totalTix += 1;
      if (isAud) {
        teamMap[teamName].audAmt += amt;
        teamMap[teamName].audTix += 1;
      } else {
        teamMap[teamName].nonAudAmt += amt;
        teamMap[teamName].nonAudTix += 1;
      }

      // Approvers
      if (!apprMap[appr]) {
        apprMap[appr] = {
          name: appr,
          totalAmt: 0,
          audAmt: 0,
          nonAudAmt: 0,
          totalTix: 0,
          audTix: 0,
          nonAudTix: 0
        };
      }
      apprMap[appr].totalAmt += amt;
      apprMap[appr].totalTix += 1;
      if (isAud) {
        apprMap[appr].audAmt += amt;
        apprMap[appr].audTix += 1;
      } else {
        apprMap[appr].nonAudAmt += amt;
        apprMap[appr].nonAudTix += 1;
      }
    }

    const managersList = Object.values(mgrMap).sort((a, b) => b.totalAmt - a.totalAmt);
    const teamsList = Object.values(teamMap).sort((a, b) => b.totalAmt - a.totalAmt);
    const approversList = Object.values(apprMap).sort((a, b) => b.totalAmt - a.totalAmt);

    return {
      totalAmt,
      audAmt,
      nonAudAmt,
      totalTix,
      audTix,
      nonAudTix,
      audRatio: totalAmt > 0 ? (audAmt / totalAmt) * 100 : 0,
      nonAudRatio: totalAmt > 0 ? (nonAudAmt / totalAmt) * 100 : 0,
      streamMap,
      managersList,
      teamsList,
      approversList
    };
  }, [filteredTickets]);

  // Export Monetary Bifurcation Matrix as CSV
  const handleExportCSV = () => {
    let rows = [];
    rows.push(['Monetary Value Bifurcation (Auditable vs Non-Auditable)']);
    rows.push(['Generated', new Date().toISOString()]);
    rows.push([]);
    rows.push(['Overall Reconciliation']);
    rows.push(['Metric', 'Total Amount (INR)', 'Auditable Amount (INR)', 'Non-Auditable Amount (INR)', 'Auditable %', 'Total Tickets', 'Auditable Tickets', 'Non-Auditable Tickets']);
    rows.push([
      'Grand Total',
      bifurcationData.totalAmt.toFixed(2),
      bifurcationData.audAmt.toFixed(2),
      bifurcationData.nonAudAmt.toFixed(2),
      `${bifurcationData.audRatio.toFixed(2)}%`,
      bifurcationData.totalTix,
      bifurcationData.audTix,
      bifurcationData.nonAudTix
    ]);
    rows.push([]);

    rows.push(['Senior Management Breakdown']);
    rows.push(['Manager', 'Total Amount (INR)', 'Auditable (INR)', 'Non-Auditable (INR)', 'Auditable %', 'Digital Revenue (INR)', 'Physical Revenue (INR)', 'Total Tickets']);
    for (const m of bifurcationData.managersList) {
      const audPct = m.totalAmt > 0 ? ((m.audAmt / m.totalAmt) * 100).toFixed(2) : '0.00';
      rows.push([
        m.name,
        m.totalAmt.toFixed(2),
        m.audAmt.toFixed(2),
        m.nonAudAmt.toFixed(2),
        `${audPct}%`,
        m.digitalAmt.toFixed(2),
        m.physicalAmt.toFixed(2),
        m.totalTix
      ]);
    }
    rows.push([]);

    rows.push(['Teams & Pods Breakdown']);
    rows.push(['Team / Captain', 'Supervising Manager', 'Type', 'Total Amount (INR)', 'Auditable (INR)', 'Non-Auditable (INR)', 'Auditable %', 'Total Tickets']);
    for (const tm of bifurcationData.teamsList) {
      const audPct = tm.totalAmt > 0 ? ((tm.audAmt / tm.totalAmt) * 100).toFixed(2) : '0.00';
      rows.push([
        tm.name,
        tm.manager,
        tm.isPhysical ? 'Physical Team (Direct)' : 'Digital Pod (Captain)',
        tm.totalAmt.toFixed(2),
        tm.audAmt.toFixed(2),
        tm.nonAudAmt.toFixed(2),
        `${audPct}%`,
        tm.totalTix
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CenturyJoy_Monetary_Bifurcation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 text-[#e31e24] flex items-center justify-center border border-red-200 dark:border-red-900/50">
              <Coins className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Monetary Value Bifurcation (Auditable vs. Non-Auditable)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete financial revenue reconciliation, compliance split, and audit ratios across operational dimensions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5 text-[#e31e24]" />
          <span>Export Audit Matrix (CSV)</span>
        </button>
      </div>

      {/* Top Level Financial Reconciliation Banner */}
      <div className="my-5 p-4 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Total Revenue */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Approved Value
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatINR(bifurcationData.totalAmt)}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {bifurcationData.totalTix.toLocaleString()} Total Approved Invoices
            </span>
          </div>

          {/* Auditable Revenue */}
          <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Auditable Revenue
              </span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                {bifurcationData.audRatio.toFixed(1)}%
              </span>
            </div>
            <div className="text-lg font-black text-emerald-900 dark:text-emerald-200 mt-1">
              {formatINR(bifurcationData.audAmt)}
            </div>
            <span className="text-xs text-emerald-700 dark:text-emerald-400">
              {bifurcationData.audTix.toLocaleString()} Invoices • Verified Complete
            </span>
          </div>

          {/* Non-Auditable Revenue */}
          <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Non-Auditable Revenue
              </span>
              <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                {bifurcationData.nonAudRatio.toFixed(1)}%
              </span>
            </div>
            <div className="text-lg font-black text-amber-900 dark:text-amber-200 mt-1">
              {formatINR(bifurcationData.nonAudAmt)}
            </div>
            <span className="text-xs text-amber-700 dark:text-amber-400">
              {bifurcationData.nonAudTix.toLocaleString()} Invoices • Standard Exemption
            </span>
          </div>

        </div>

        {/* Visual Split Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              Auditable Split: {formatINR(bifurcationData.audAmt)} ({bifurcationData.audRatio.toFixed(1)}%)
            </span>
            <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
              Non-Auditable Split: {formatINR(bifurcationData.nonAudAmt)} ({bifurcationData.nonAudRatio.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${bifurcationData.audRatio}%` }} 
              className="bg-emerald-500 hover:bg-emerald-600 transition-all duration-300"
              title={`Auditable: ${bifurcationData.audRatio.toFixed(1)}%`}
            ></div>
            <div 
              style={{ width: `${bifurcationData.nonAudRatio}%` }} 
              className="bg-amber-500 hover:bg-amber-600 transition-all duration-300"
              title={`Non-Auditable: ${bifurcationData.nonAudRatio.toFixed(1)}%`}
            ></div>
          </div>
        </div>

      </div>

      {/* Dimension Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-4 pb-2">
        <button
          onClick={() => setActiveTab('managers')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'managers'
              ? 'bg-[#e31e24] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>By Senior Managers (4)</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'teams'
              ? 'bg-[#e31e24] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>By Teams & Pod Captains (11)</span>
        </button>

        <button
          onClick={() => setActiveTab('approvers')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'approvers'
              ? 'bg-[#e31e24] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>By L2 Approvers (8)</span>
        </button>
      </div>

      {/* TAB 1: SENIOR MANAGERS MATRIX */}
      {activeTab === 'managers' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold">
                <th className="py-2.5 px-3">Senior Manager</th>
                <th className="py-2.5 px-3">Total Approved (₹)</th>
                <th className="py-2.5 px-3">Tickets</th>
                <th className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">Auditable Value (₹)</th>
                <th className="py-2.5 px-3 text-amber-700 dark:text-amber-400">Non-Auditable Value (₹)</th>
                <th className="py-2.5 px-3">Audit Share</th>
                <th className="py-2.5 px-3">Stream Split (Dig / Phys)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-800 dark:text-slate-200">
              {bifurcationData.managersList.map((m) => {
                const audRatio = m.totalAmt > 0 ? (m.audAmt / m.totalAmt) * 100 : 0;
                const initials = m.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                return (
                  <tr key={m.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-[11px] border border-slate-700">
                          {initials}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{m.name}</span>
                          <span className="text-[10px] text-slate-500">Senior Manager</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                      {formatINR(m.totalAmt)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {m.totalTix.toLocaleString()} tix
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                      <div>{formatINR(m.audAmt)}</div>
                      <div className="text-[10px] text-slate-400">{m.audTix} tix</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-700 dark:text-amber-400">
                      <div>{formatINR(m.nonAudAmt)}</div>
                      <div className="text-[10px] text-slate-400">{m.nonAudTix} tix</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                          <div style={{ width: `${audRatio}%` }} className="bg-emerald-500"></div>
                          <div style={{ width: `${100 - audRatio}%` }} className="bg-amber-500"></div>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                          {audRatio.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Dig: {formatINR(m.digitalAmt)}</span>
                      <span className="mx-1">•</span>
                      <span>Phys: {formatINR(m.physicalAmt)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: TEAMS & POD CAPTAINS MATRIX */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          
          {/* Stream Summary Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#e31e24]" />
                  Digital Teams (CenturyJoy)
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {formatINR(bifurcationData.streamMap.Digital.totalAmt)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  Aud: {formatINR(bifurcationData.streamMap.Digital.audAmt)} ({((bifurcationData.streamMap.Digital.audAmt / bifurcationData.streamMap.Digital.totalAmt) * 100).toFixed(1)}%)
                </span>
                <span className="text-amber-700 dark:text-amber-400 font-semibold">
                  Non-Aud: {formatINR(bifurcationData.streamMap.Digital.nonAudAmt)} ({((bifurcationData.streamMap.Digital.nonAudAmt / bifurcationData.streamMap.Digital.totalAmt) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  Physical Teams (CenturyJoyApp)
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {formatINR(bifurcationData.streamMap.Physical.totalAmt)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  Aud: {formatINR(bifurcationData.streamMap.Physical.audAmt)} ({((bifurcationData.streamMap.Physical.audAmt / bifurcationData.streamMap.Physical.totalAmt) * 100).toFixed(1)}%)
                </span>
                <span className="text-amber-700 dark:text-amber-400 font-semibold">
                  Non-Aud: {formatINR(bifurcationData.streamMap.Physical.nonAudAmt)} ({((bifurcationData.streamMap.Physical.nonAudAmt / bifurcationData.streamMap.Physical.totalAmt) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Team / Pod Captain</th>
                  <th className="py-2.5 px-3">Supervising Manager</th>
                  <th className="py-2.5 px-3">Structure</th>
                  <th className="py-2.5 px-3">Total Value (₹)</th>
                  <th className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">Auditable (₹)</th>
                  <th className="py-2.5 px-3 text-amber-700 dark:text-amber-400">Non-Auditable (₹)</th>
                  <th className="py-2.5 px-3">Auditable %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-800 dark:text-slate-200">
                {bifurcationData.teamsList.map((tm) => {
                  const audRatio = tm.totalAmt > 0 ? (tm.audAmt / tm.totalAmt) * 100 : 0;
                  return (
                    <tr key={tm.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{tm.name}</span>
                        <span className="text-[10px] text-slate-500">{tm.totalTix} Invoices</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-semibold">
                        {tm.manager}
                      </td>
                      <td className="py-3 px-3">
                        {tm.isPhysical ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Physical • Direct
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-[#e31e24] dark:bg-red-950/50 dark:text-red-400">
                            Digital Pod Captain
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                        {formatINR(tm.totalAmt)}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                        <div>{formatINR(tm.audAmt)}</div>
                        <div className="text-[10px] text-slate-400">{tm.audTix} tix</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-amber-700 dark:text-amber-400">
                        <div>{formatINR(tm.nonAudAmt)}</div>
                        <div className="text-[10px] text-slate-400">{tm.nonAudTix} tix</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                            <div style={{ width: `${audRatio}%` }} className="bg-emerald-500"></div>
                            <div style={{ width: `${100 - audRatio}%` }} className="bg-amber-500"></div>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                            {audRatio.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 3: L2 APPROVERS MATRIX */}
      {activeTab === 'approvers' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold">
                <th className="py-2.5 px-3">L2 Reviewer / Approver</th>
                <th className="py-2.5 px-3">Total Signed (₹)</th>
                <th className="py-2.5 px-3">Tickets</th>
                <th className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">Auditable Signed (₹)</th>
                <th className="py-2.5 px-3 text-amber-700 dark:text-amber-400">Non-Auditable Signed (₹)</th>
                <th className="py-2.5 px-3">Auditable Share</th>
                <th className="py-2.5 px-3">Avg Ticket Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-800 dark:text-slate-200">
              {bifurcationData.approversList.map((appr) => {
                const audRatio = appr.totalAmt > 0 ? (appr.audAmt / appr.totalAmt) * 100 : 0;
                const avgTicket = appr.totalTix > 0 ? appr.totalAmt / appr.totalTix : 0;
                return (
                  <tr key={appr.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 dark:text-white block">{appr.name}</span>
                      <span className="text-[10px] text-slate-500">L2 Level Approver</span>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                      {formatINR(appr.totalAmt)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {appr.totalTix.toLocaleString()} tix
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                      <div>{formatINR(appr.audAmt)}</div>
                      <div className="text-[10px] text-slate-400">{appr.audTix} tix</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-700 dark:text-amber-400">
                      <div>{formatINR(appr.nonAudAmt)}</div>
                      <div className="text-[10px] text-slate-400">{appr.nonAudTix} tix</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                          <div style={{ width: `${audRatio}%` }} className="bg-emerald-500"></div>
                          <div style={{ width: `${100 - audRatio}%` }} className="bg-amber-500"></div>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                          {audRatio.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-semibold">
                      {formatINR(avgTicket)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
