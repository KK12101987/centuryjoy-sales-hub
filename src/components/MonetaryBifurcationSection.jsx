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
  Search,
  ChevronDown,
  ChevronRight,
  UserCheck,
  User
} from 'lucide-react';

function formatINR(val) {
  if (!val && val !== 0) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export default function MonetaryBifurcationSection() {
  const { filteredTickets } = useData();
  const [activeTab, setActiveTab] = useState('rms'); // 'rms', 'managers', 'teams', 'approvers'
  const [rmSearch, setRmSearch] = useState('');
  const [expandedManagers, setExpandedManagers] = useState({});
  const [expandedTeams, setExpandedTeams] = useState({});

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
    const rmMap = {};
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
      const rmName = (t.relationshipManager || 'Unknown RM').trim();

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

      // Relationship Managers (RMs)
      if (!rmMap[rmName]) {
        rmMap[rmName] = {
          name: rmName,
          manager: mgr,
          team: teamName,
          isPhysical: isPhys,
          totalAmt: 0,
          audAmt: 0,
          nonAudAmt: 0,
          totalTix: 0,
          audTix: 0,
          nonAudTix: 0
        };
      }
      rmMap[rmName].totalAmt += amt;
      rmMap[rmName].totalTix += 1;
      if (isAud) {
        rmMap[rmName].audAmt += amt;
        rmMap[rmName].audTix += 1;
      } else {
        rmMap[rmName].nonAudAmt += amt;
        rmMap[rmName].nonAudTix += 1;
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
          physicalTix: 0,
          rms: {}
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

      // Link RM to manager
      if (!mgrMap[mgr].rms[rmName]) {
        mgrMap[mgr].rms[rmName] = { name: rmName, team: teamName, totalAmt: 0, audAmt: 0, nonAudAmt: 0, totalTix: 0 };
      }
      mgrMap[mgr].rms[rmName].totalAmt += amt;
      mgrMap[mgr].rms[rmName].totalTix += 1;
      if (isAud) mgrMap[mgr].rms[rmName].audAmt += amt;
      else mgrMap[mgr].rms[rmName].nonAudAmt += amt;

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
          nonAudTix: 0,
          rms: {}
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

      // Link RM to team
      if (!teamMap[teamName].rms[rmName]) {
        teamMap[teamName].rms[rmName] = { name: rmName, totalAmt: 0, audAmt: 0, nonAudAmt: 0, totalTix: 0 };
      }
      teamMap[teamName].rms[rmName].totalAmt += amt;
      teamMap[teamName].rms[rmName].totalTix += 1;
      if (isAud) teamMap[teamName].rms[rmName].audAmt += amt;
      else teamMap[teamName].rms[rmName].nonAudAmt += amt;

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
    const rmsList = Object.values(rmMap).sort((a, b) => b.totalAmt - a.totalAmt);

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
      approversList,
      rmsList
    };
  }, [filteredTickets]);

  // Filtered RMs based on search
  const filteredRMs = useMemo(() => {
    if (!rmSearch) return bifurcationData.rmsList;
    const q = rmSearch.toLowerCase();
    return bifurcationData.rmsList.filter(r => 
      r.name.toLowerCase().includes(q) ||
      r.manager.toLowerCase().includes(q) ||
      r.team.toLowerCase().includes(q)
    );
  }, [bifurcationData.rmsList, rmSearch]);

  const toggleManager = (mgrName) => {
    setExpandedManagers(prev => ({ ...prev, [mgrName]: !prev[mgrName] }));
  };

  const toggleTeam = (teamName) => {
    setExpandedTeams(prev => ({ ...prev, [teamName]: !prev[teamName] }));
  };

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

    rows.push(['Relationship Managers (RMs) Breakdown']);
    rows.push(['RM Name', 'Supervising Manager', 'Team / Captain', 'Type', 'Total Amount (INR)', 'Auditable Amount (INR)', 'Non-Auditable Amount (INR)', 'Auditable %', 'Total Tickets', 'Auditable Tickets', 'Non-Auditable Tickets']);
    for (const r of bifurcationData.rmsList) {
      const audPct = r.totalAmt > 0 ? ((r.audAmt / r.totalAmt) * 100).toFixed(2) : '0.00';
      rows.push([
        r.name,
        r.manager,
        r.team,
        r.isPhysical ? 'Physical Team' : 'Digital Pod',
        r.totalAmt.toFixed(2),
        r.audAmt.toFixed(2),
        r.nonAudAmt.toFixed(2),
        `${audPct}%`,
        r.totalTix,
        r.audTix,
        r.nonAudTix
      ]);
    }
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

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CenturyJoy_Monetary_Bifurcation_RMs_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Complete financial revenue reconciliation, compliance split, and individual Relationship Manager (RM) monetary values.
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
              {bifurcationData.totalTix.toLocaleString()} Total Invoices • {bifurcationData.rmsList.length} Active RMs
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

      {/* Dimension Selector Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 mb-4 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          
          {/* TAB 1: Relationship Managers (Featured Default) */}
          <button
            onClick={() => setActiveTab('rms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'rms'
                ? 'bg-[#e31e24] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>By Relationship Managers ({bifurcationData.rmsList.length} RMs)</span>
          </button>

          <button
            onClick={() => setActiveTab('managers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'teams'
                ? 'bg-[#e31e24] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>By Teams & Captains (11)</span>
          </button>

          <button
            onClick={() => setActiveTab('approvers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'approvers'
                ? 'bg-[#e31e24] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>By L2 Approvers (8)</span>
          </button>
        </div>

        {/* RM Quick Filter Search */}
        {activeTab === 'rms' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter RM by name or manager..."
              value={rmSearch}
              onChange={(e) => setRmSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24]"
            />
          </div>
        )}
      </div>

      {/* TAB 1: RELATIONSHIP MANAGERS (RMs) TABLE */}
      {activeTab === 'rms' && (
        <div className="space-y-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Showing <strong>{filteredRMs.length}</strong> Relationship Managers ranked by monetary value</span>
            <span className="text-[11px] text-slate-400">Green = Auditable • Amber = Non-Auditable</span>
          </div>

          <div className="overflow-x-auto max-h-[550px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-600 dark:text-slate-300 font-bold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Relationship Manager (RM)</th>
                  <th className="py-2.5 px-3">Supervising Manager</th>
                  <th className="py-2.5 px-3">Team / Captain</th>
                  <th className="py-2.5 px-3">Total Value (₹)</th>
                  <th className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">Auditable Value (₹)</th>
                  <th className="py-2.5 px-3 text-amber-700 dark:text-amber-400">Non-Auditable Value (₹)</th>
                  <th className="py-2.5 px-3">Audit Share %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-800 dark:text-slate-200">
                {filteredRMs.map((rm, idx) => {
                  const audRatio = rm.totalAmt > 0 ? (rm.audAmt / rm.totalAmt) * 100 : 0;
                  const initials = rm.name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={rm.name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-[#e31e24]" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{rm.name}</span>
                            <span className="text-[10px] text-slate-500">{rm.totalTix} Invoices</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-semibold">
                        {rm.manager}
                      </td>
                      <td className="py-2.5 px-3">
                        {rm.isPhysical ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Physical Team
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-[#e31e24] dark:bg-red-950/50 dark:text-red-400">
                            {rm.team}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-extrabold text-slate-900 dark:text-white">
                        {formatINR(rm.totalAmt)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                        <div>{formatINR(rm.audAmt)}</div>
                        <div className="text-[10px] text-slate-400">{rm.audTix} tix</div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-700 dark:text-amber-400">
                        <div>{formatINR(rm.nonAudAmt)}</div>
                        <div className="text-[10px] text-slate-400">{rm.nonAudTix} tix</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex shrink-0">
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

      {/* TAB 2: SENIOR MANAGERS MATRIX (WITH EXPANDABLE RM ROSTERS) */}
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
                <th className="py-2.5 px-3 text-right">RM Roster</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-800 dark:text-slate-200">
              {bifurcationData.managersList.map((m) => {
                const audRatio = m.totalAmt > 0 ? (m.audAmt / m.totalAmt) * 100 : 0;
                const initials = m.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                const isExpanded = Boolean(expandedManagers[m.name]);
                const managerRMs = Object.values(m.rms).sort((a, b) => b.totalAmt - a.totalAmt);

                return (
                  <React.Fragment key={m.name}>
                    <tr 
                      onClick={() => toggleManager(m.name)}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button className="text-slate-400 hover:text-slate-600">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-[#e31e24]" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{m.name}</span>
                            <span className="text-[10px] text-slate-500">{managerRMs.length} Assigned RMs</span>
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
                      <td className="py-3 px-3 text-right">
                        <span className="text-xs text-[#e31e24] font-bold">
                          {isExpanded ? 'Hide RMs' : 'View RMs'}
                        </span>
                      </td>
                    </tr>

                    {/* EXPANDED RM DRAWER UNDER SENIOR MANAGER */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80 dark:bg-slate-900/40">
                        <td colSpan={8} className="p-3 pl-10">
                          <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                            Relationship Managers under {m.name} ({managerRMs.length} RMs):
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {managerRMs.map(rm => {
                              const rmAudRatio = rm.totalAmt > 0 ? (rm.audAmt / rm.totalAmt) * 100 : 0;
                              return (
                                <div key={rm.name} className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900 dark:text-white truncate" title={rm.name}>{rm.name}</span>
                                    <span className="text-slate-400 text-[10px]">{rm.totalTix} tix</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mb-1">
                                    {rm.team}
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-slate-900 dark:text-white">{formatINR(rm.totalAmt)}</span>
                                    <span className="text-emerald-600 dark:text-emerald-400">{rmAudRatio.toFixed(0)}% Aud</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                                    <span className="text-emerald-600">Aud: {formatINR(rm.audAmt)}</span>
                                    <span className="text-amber-600">Non: {formatINR(rm.nonAudAmt)}</span>
                                  </div>
                                </div>
                              );
                            })}
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
      )}

      {/* TAB 3: TEAMS & POD CAPTAINS MATRIX (WITH EXPANDABLE RM ROSTERS) */}
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
                  <th className="py-2.5 px-3 text-right">RM Roster</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-800 dark:text-slate-200">
                {bifurcationData.teamsList.map((tm) => {
                  const audRatio = tm.totalAmt > 0 ? (tm.audAmt / tm.totalAmt) * 100 : 0;
                  const isExpanded = Boolean(expandedTeams[tm.name]);
                  const teamRMs = Object.values(tm.rms).sort((a, b) => b.totalAmt - a.totalAmt);

                  return (
                    <React.Fragment key={tm.name}>
                      <tr 
                        onClick={() => toggleTeam(tm.name)}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <button className="text-slate-400 hover:text-slate-600">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">{tm.name}</span>
                              <span className="text-[10px] text-slate-500">{teamRMs.length} Assigned RMs</span>
                            </div>
                          </div>
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
                        <td className="py-3 px-3 text-right">
                          <span className="text-xs text-[#e31e24] font-bold">
                            {isExpanded ? 'Hide RMs' : 'View RMs'}
                          </span>
                        </td>
                      </tr>

                      {/* EXPANDED RM DRAWER UNDER TEAM */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-slate-900/40">
                          <td colSpan={8} className="p-3 pl-8">
                            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                              RMs under {tm.name} ({teamRMs.length} RMs):
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {teamRMs.map(rm => {
                                const rmAudRatio = rm.totalAmt > 0 ? (rm.audAmt / rm.totalAmt) * 100 : 0;
                                return (
                                  <div key={rm.name} className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-900 dark:text-white truncate" title={rm.name}>{rm.name}</span>
                                      <span className="text-slate-400 text-[10px]">{rm.totalTix} tix</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-bold mt-1">
                                      <span className="text-slate-900 dark:text-white">{formatINR(rm.totalAmt)}</span>
                                      <span className="text-emerald-600 dark:text-emerald-400">{rmAudRatio.toFixed(0)}% Aud</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                                      <span className="text-emerald-600">Aud: {formatINR(rm.audAmt)}</span>
                                      <span className="text-amber-600">Non: {formatINR(rm.nonAudAmt)}</span>
                                    </div>
                                  </div>
                                );
                              })}
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
      )}

      {/* TAB 4: L2 APPROVERS MATRIX */}
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
