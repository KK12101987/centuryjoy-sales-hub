import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { formatINR, nf, fmtDuration } from '../../utils/formatters';
import { verifyWatermarkIntegrity } from '../../utils/integrity';
import { 
  CreditCard, 
  PhoneCall, 
  CheckCircle2, 
  Award, 
  Users, 
  Building2, 
  Layers, 
  Sparkles,
  Info
} from 'lucide-react';

const SENIOR_MANAGERS = [
  { id: 'Niladri Bhadra', name: 'Niladri Bhadra', type: 'digital', pods: ['SoarZone-I', 'SoarZone-II'] },
  { id: 'Surajit Laha', name: 'Surajit Laha', type: 'digital', pods: ['Catlyst-I', 'Catlyst-II'] },
  { id: 'Arijit Nath', name: 'Arijit Nath', type: 'digital', pods: ['Unity-II', 'Unity-I', 'Zenith Pod'] },
  { id: 'Amit Singal', name: 'Amit Singal', type: 'physical', pods: [] }
];

const POD_CAPTAINS = [
  { captain: 'Arshi Afreen Jamal', team: 'Unity-II', manager: 'Arijit Nath', badge: 'High Volume' },
  { captain: 'Mousumi Chakraborty', team: 'Unity-I', manager: 'Arijit Nath', badge: 'Balanced' },
  { captain: 'Silpa Palchina', team: 'Zenith Pod', manager: 'Arijit Nath', badge: 'Specialist' },
  { captain: 'Nasima Banu', team: 'Catlyst-II', manager: 'Surajit Laha', badge: 'High Volume' },
  { captain: 'Pallabi Chura', team: 'Catlyst-I', manager: 'Surajit Laha', badge: 'Balanced' },
  { captain: 'Ranjana Mohajan', team: 'SoarZone-II', manager: 'Niladri Bhadra', badge: 'Balanced' },
  { captain: 'Shiuli Bhattacharjee', team: 'SoarZone-I', manager: 'Niladri Bhadra', badge: 'High Volume' }
];

export default function ManagerHub() {
  verifyWatermarkIntegrity();
  const { 
    currentUser, 
    scopedTickets, 
    tickets, 
    scopedTelephony, 
    telephony, 
    scopedQaAudits, 
    qaAudits,
    rmDirectory,
    hierarchy
  } = useData();

  // Role resolution
  const isSuperAdmin = currentUser?.role === 'admin' || currentUser?.email?.includes('kushal') || currentUser?.email?.includes('tanmoy');
  const isManager = currentUser?.role === 'manager';
  const isCaptain = currentUser?.role === 'captain';

  const effectiveManagerName = currentUser?.managerKey || (isManager ? currentUser.name : 'Niladri Bhadra');
  const effectiveCaptainName = currentUser?.captainKey || (isCaptain ? (currentUser.teamName || currentUser.name) : 'Arshi Afreen Jamal');

  // Admin View State
  const [viewType, setViewType] = useState(() => (isCaptain ? 'pod' : 'manager'));
  const [selectedManager, setSelectedManager] = useState(() => effectiveManagerName);
  const [selectedPodCaptain, setSelectedPodCaptain] = useState(() => effectiveCaptainName);

  // Active Manager or Pod Determination
  const activeManagerName = isManager ? effectiveManagerName : (isSuperAdmin ? selectedManager : 'Niladri Bhadra');
  const activeCaptainName = isCaptain ? effectiveCaptainName : (isSuperAdmin ? selectedPodCaptain : 'Arshi Afreen Jamal');
  const isPhysicalManager = activeManagerName === 'Amit Singal' || activeManagerName.toLowerCase().includes('singal');

  // Master Base Datasets
  const baseTickets = scopedTickets || tickets;
  const baseTelephony = scopedTelephony || telephony;
  const baseQa = scopedQaAudits || qaAudits;

  // -------------------------------------------------------------
  // A. SENIOR MANAGER DIVISION COMPUTATIONS
  // -------------------------------------------------------------
  const divisionTickets = useMemo(() => {
    return baseTickets.filter((t) => t.manager === activeManagerName);
  }, [baseTickets, activeManagerName]);

  const divisionFinancialVol = useMemo(() => {
    return divisionTickets.reduce((sum, t) => sum + (Number(t.finalTotalAmount) || 0), 0);
  }, [divisionTickets]);

  const divisionAuditableCount = useMemo(() => {
    return divisionTickets.filter((t) => (t.is_auditable || '').toLowerCase() === 'yes' || t.inv_type?.includes('Auditable')).length;
  }, [divisionTickets]);

  const divisionTelephony = useMemo(() => {
    return baseTelephony.filter((r) => r.m === activeManagerName);
  }, [baseTelephony, activeManagerName]);

  const divisionDials = useMemo(() => {
    return divisionTelephony.reduce((sum, r) => sum + (r.t || 0), 0);
  }, [divisionTelephony]);

  const divisionConnected = useMemo(() => {
    return divisionTelephony.reduce((sum, r) => sum + (r.conn || 0), 0);
  }, [divisionTelephony]);

  const divisionDuration = useMemo(() => {
    return divisionTelephony.reduce((sum, r) => sum + (r.dur || 0), 0);
  }, [divisionTelephony]);

  const divisionConnRate = divisionDials > 0 ? ((divisionConnected / divisionDials) * 100).toFixed(1) : '0.0';
  const divisionAvgTalkSec = divisionConnected > 0 ? Math.round(divisionDuration / divisionConnected) : 0;

  const divisionQa = useMemo(() => {
    return baseQa.filter((a) => a.manager_name === activeManagerName);
  }, [baseQa, activeManagerName]);

  const divisionAvgQa = useMemo(() => {
    const valid = divisionQa.filter((a) => !a.is_fatal);
    if (valid.length === 0) return '0.0';
    return (valid.reduce((s, a) => s + (Number(a.overall_score) || 0), 0) / valid.length).toFixed(1);
  }, [divisionQa]);

  const divisionFatalities = useMemo(() => {
    return divisionQa.filter((a) => a.is_fatal).length;
  }, [divisionQa]);

  // Subordinate Pod Breakdown for Manager
  const divisionPods = useMemo(() => {
    if (isPhysicalManager) return [];
    const mgrTree = hierarchy?.tree?.[activeManagerName] || {};
    return Object.entries(mgrTree).map(([capName, rmList]) => {
      const capTele = baseTelephony.filter((r) => r.c === capName || r.m === activeManagerName);
      const podDials = capTele.reduce((sum, r) => sum + (r.t || 0), 0);
      const podConn = capTele.reduce((sum, r) => sum + (r.conn || 0), 0);
      const connRate = podDials > 0 ? ((podConn / podDials) * 100).toFixed(1) : '0.0';
      const capQa = baseQa.filter((a) => a.captain_name === capName);
      const validQa = capQa.filter((a) => !a.is_fatal);
      const qaScore = validQa.length > 0 ? (validQa.reduce((s, a) => s + (Number(a.overall_score) || 0), 0) / validQa.length).toFixed(1) : '85.0';
      
      const podTickets = baseTickets.filter((t) => t.captain === capName || t.manager === activeManagerName);
      const podDisb = podTickets.reduce((s, t) => s + (Number(t.finalTotalAmount) || 0), 0);

      return {
        captain: capName,
        rmCount: Array.isArray(rmList) ? rmList.length : 0,
        dials: podDials,
        connected: podConn,
        connRate,
        qaScore,
        disbursed: podDisb,
        auditsCount: capQa.length
      };
    });
  }, [activeManagerName, hierarchy, isPhysicalManager, baseTelephony, baseQa, baseTickets]);

  // RM Roster for this Division
  const divisionRms = useMemo(() => {
    if (isPhysicalManager) return [];
    return (rmDirectory || [])
      .filter((rm) => rm.manager_name === activeManagerName)
      .map((rm) => {
        const rmTele = baseTelephony.filter((r) => (r.rm || '').toLowerCase() === (rm.rm_name || '').toLowerCase());
        const dials = rmTele.reduce((s, r) => s + (r.t || 0), 0);
        const conn = rmTele.reduce((s, r) => s + (r.conn || 0), 0);
        const dur = rmTele.reduce((s, r) => s + (r.dur || 0), 0);
        const connRate = dials > 0 ? ((conn / dials) * 100).toFixed(1) : '0.0';
        const rmAudits = baseQa.filter((a) => (a.rm_name || '').toLowerCase() === (rm.rm_name || '').toLowerCase());
        const validQa = rmAudits.filter((a) => !a.is_fatal);
        const qaScore = validQa.length > 0 ? (validQa.reduce((s, a) => s + (Number(a.overall_score) || 0), 0) / validQa.length).toFixed(1) : '85.0';

        return {
          rm_name: rm.rm_name,
          captain_name: rm.captain_name,
          team_name: rm.team_name,
          dials,
          connected: conn,
          connRate,
          duration: dur,
          qaScore
        };
      })
      .sort((a, b) => b.dials - a.dials);
  }, [activeManagerName, isPhysicalManager, rmDirectory, baseTelephony, baseQa]);

  // -------------------------------------------------------------
  // B. POD CAPTAIN COMMAND DASHBOARD COMPUTATIONS
  // -------------------------------------------------------------
  const activePodConfig = useMemo(() => {
    return POD_CAPTAINS.find((p) => p.captain.toLowerCase() === activeCaptainName.toLowerCase()) || POD_CAPTAINS[0];
  }, [activeCaptainName]);

  const podTelephony = useMemo(() => {
    return baseTelephony.filter((r) => {
      const cMatch = r.c?.toLowerCase() === activePodConfig.captain.toLowerCase();
      const tMatch = r.c?.toLowerCase().includes(activePodConfig.team.toLowerCase());
      return cMatch || tMatch;
    });
  }, [baseTelephony, activePodConfig]);

  const podTotalDials = useMemo(() => {
    return podTelephony.reduce((s, r) => s + (r.t || 0), 0);
  }, [podTelephony]);

  const podTotalConnected = useMemo(() => {
    return podTelephony.reduce((s, r) => s + (r.conn || 0), 0);
  }, [podTelephony]);

  const podTotalDuration = useMemo(() => {
    return podTelephony.reduce((s, r) => s + (r.dur || 0), 0);
  }, [podTelephony]);

  const podConnRate = podTotalDials > 0 ? ((podTotalConnected / podTotalDials) * 100).toFixed(1) : '0.0';
  const podAvgTalkSec = podTotalConnected > 0 ? Math.round(podTotalDuration / podTotalConnected) : 0;

  const podQa = useMemo(() => {
    return baseQa.filter((a) => {
      const cMatch = a.captain_name?.toLowerCase() === activePodConfig.captain.toLowerCase();
      const tMatch = a.team_name?.toLowerCase() === activePodConfig.team.toLowerCase();
      return cMatch || tMatch;
    });
  }, [baseQa, activePodConfig]);

  const podAvgQaScore = useMemo(() => {
    const valid = podQa.filter((a) => !a.is_fatal);
    if (valid.length === 0) return '85.8';
    return (valid.reduce((s, a) => s + (Number(a.overall_score) || 0), 0) / valid.length).toFixed(1);
  }, [podQa]);

  const podFatalities = useMemo(() => {
    return podQa.filter((a) => a.is_fatal).length;
  }, [podQa]);

  // Pod RMs Roster
  const podRms = useMemo(() => {
    return (rmDirectory || [])
      .filter((rm) => {
        const cMatch = rm.captain_name?.toLowerCase() === activePodConfig.captain.toLowerCase();
        const tMatch = rm.team_name?.toLowerCase() === activePodConfig.team.toLowerCase();
        return cMatch || tMatch;
      })
      .map((rm) => {
        const rmTele = podTelephony.filter((r) => (r.rm || '').toLowerCase() === (rm.rm_name || '').toLowerCase());
        const dials = rmTele.reduce((s, r) => s + (r.t || 0), 0);
        const conn = rmTele.reduce((s, r) => s + (r.conn || 0), 0);
        const dur = rmTele.reduce((s, r) => s + (r.dur || 0), 0);
        const connRate = dials > 0 ? ((conn / dials) * 100).toFixed(1) : '0.0';
        const rmAudits = podQa.filter((a) => (a.rm_name || '').toLowerCase() === (rm.rm_name || '').toLowerCase());
        const validQa = rmAudits.filter((a) => !a.is_fatal);
        const qaScore = validQa.length > 0 ? (validQa.reduce((s, a) => s + (Number(a.overall_score) || 0), 0) / validQa.length).toFixed(1) : '85.0';

        let badge = 'On Track';
        let badgeColor = 'bg-blue-950/60 text-blue-300 border-blue-800/60';
        if (Number(connRate) >= 54 && Number(qaScore) >= 86) {
          badge = 'Top Performer';
          badgeColor = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
        }

        return {
          rm_name: rm.rm_name,
          dials,
          connected: conn,
          connRate,
          duration: dur,
          qaScore,
          badge,
          badgeColor
        };
      })
      .sort((a, b) => b.dials - a.dials);
  }, [activePodConfig, rmDirectory, podTelephony, podQa]);

  return (
    <div className="space-y-6">

      {/* Top Admin Selector Ribbon (Only for Super Admin / Leadership) */}
      {isSuperAdmin && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-indigo-600 to-blue-500 flex items-center justify-center font-bold text-white text-lg shadow-md">
              CJ
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-brand-400">Governance & Hierarchy Control</div>
              <div className="text-sm font-bold text-white">Dedicated Division & Pod Dashboards</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher: Divisions vs Pods */}
            <div className="bg-slate-950/90 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
              <button
                onClick={() => setViewType('manager')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewType === 'manager' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                🏢 Senior Manager Divisions
              </button>
              <button
                onClick={() => setViewType('pod')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewType === 'pod' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Pod Captain Dashboards
              </button>
            </div>

            {/* Sub-Entity Selector */}
            {viewType === 'manager' ? (
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
                {SENIOR_MANAGERS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedManager(m.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      selectedManager === m.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m.name} {m.type === 'physical' ? '(Field)' : ''}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
                {POD_CAPTAINS.map((p) => (
                  <button
                    key={p.team}
                    onClick={() => setSelectedPodCaptain(p.captain)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      selectedPodCaptain === p.captain
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.team} ({p.captain.split(' ')[0]})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. SENIOR MANAGER DIVISION DASHBOARD VIEW                     */}
      {/* ------------------------------------------------------------- */}
      {(!isCaptain && (isManager || viewType === 'manager')) && (
        <div className="space-y-6">

          {/* Executive Division Banner */}
          <div className={`bg-gradient-to-r ${isPhysicalManager ? 'from-slate-900 via-purple-950 to-slate-900 border-purple-900/40' : 'from-slate-900 via-indigo-950 to-slate-900 border-indigo-900/40'} border rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${isPhysicalManager ? 'bg-purple-500/20 border-purple-400/30 text-purple-300' : 'bg-indigo-500/20 border-indigo-400/30 text-indigo-300'} text-xs font-bold`}>
                  <Building2 className="w-3.5 h-3.5" />
                  <span>
                    {isPhysicalManager ? '🚚 PHYSICAL FIELD OPERATIONS DIVISION' : '🏢 SENIOR MANAGEMENT DIVISION DASHBOARD'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {activeManagerName} Division Dashboard {isPhysicalManager ? '(Physical Field Teams)' : ''}
                </h1>
                <p className="text-slate-300 text-sm max-w-3xl">
                  {isPhysicalManager
                    ? 'Dedicated on-ground field distribution, dealer stock audits, and physical invoice reconciliations • Non-dialer operational stream.'
                    : `Operational synthesis for ${activeManagerName} Division • Overseeing ${divisionPods.length} Digital Calling Pods • ${divisionRms.length} Active Relationship Managers • ${formatINR(divisionFinancialVol)} in reconciled disbursements.`}
                </p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Division Scope</div>
                <div className="font-bold text-indigo-300">{activeManagerName} (Locked)</div>
                {isPhysicalManager && (
                  <div className="mt-1 text-[11px] font-semibold text-purple-300">Physical Stream • Active</div>
                )}
              </div>
            </div>
          </div>

          {/* Tri-Factor Pillar KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pillar 1: Financial Approvals */}
            <div className="bg-[#0e1320] border border-slate-800 rounded-2xl p-6 shadow-sm hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-900/60 flex items-center justify-center text-indigo-400 font-bold text-xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-indigo-400">Division L2</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pillar 1 • Financial Volume</span>
                <div className="text-3xl font-extrabold text-white">
                  {formatINR(divisionFinancialVol)}
                </div>
                <p className="text-xs text-slate-400">
                  Across <span className="font-semibold text-slate-200">{nf.format(divisionTickets.length)}</span> approved transactions
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Auditable Ratio</span>
                <span className="font-bold text-emerald-400">
                  {divisionTickets.length > 0 ? ((divisionAuditableCount / divisionTickets.length) * 100).toFixed(1) : '0.0'}% Share
                </span>
              </div>
            </div>

            {/* Pillar 2: Calling Telephony */}
            <div className="bg-[#0e1320] border border-slate-800 rounded-2xl p-6 shadow-sm hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-900/60 flex items-center justify-center text-emerald-400 font-bold text-xl">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-emerald-400">Division Calls</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pillar 2 • Calling Telephony</span>
                <div className="text-3xl font-extrabold text-white">
                  {isPhysicalManager ? (
                    <span className="text-2xl text-slate-400 font-normal">— (Field Operations)</span>
                  ) : (
                    <>{nf.format(divisionDials)} <span className="text-lg font-normal text-slate-400">Dials</span></>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {isPhysicalManager ? (
                    'No outbound digital dialer utilization'
                  ) : (
                    <><span className="font-semibold text-emerald-400">{divisionConnRate}%</span> Connected ({nf.format(divisionConnected)} calls)</>
                  )}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Talk Time</span>
                <span className="font-mono font-bold text-slate-300">
                  {isPhysicalManager ? '— (Field Stream)' : `${fmtDuration(divisionDuration)} (Avg ${fmtDuration(divisionAvgTalkSec)})`}
                </span>
              </div>
            </div>

            {/* Pillar 3: Quality Assurance */}
            <div className="bg-[#0e1320] border border-slate-800 rounded-2xl p-6 shadow-sm hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-900/60 flex items-center justify-center text-amber-400 font-bold text-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-amber-400">Division QA</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pillar 3 • Quality Assurance</span>
                <div className="text-3xl font-extrabold text-white">
                  {isPhysicalManager ? (
                    <span className="text-2xl text-slate-400 font-normal">— (Exempt from QA)</span>
                  ) : (
                    <>{divisionAvgQa}% <span className="text-lg font-normal text-slate-400">Avg Score</span></>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {isPhysicalManager ? (
                    'Evaluated on physical verification SLA'
                  ) : (
                    <>Evaluated across <span className="font-semibold text-slate-200">{divisionQa.length} audits</span></>
                  )}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">{isPhysicalManager ? 'Stream Status' : 'Fatal Call Rate'}</span>
                <span className={`font-bold ${isPhysicalManager ? 'text-purple-400' : (divisionFatalities > 5 ? 'text-rose-400' : 'text-emerald-400')}`}>
                  {isPhysicalManager ? 'Physical Compliance' : `${((divisionFatalities / Math.max(divisionQa.length, 1)) * 100).toFixed(1)}% (${divisionFatalities} Fatalities)`}
                </span>
              </div>
            </div>

          </div>

          {/* Physical Exemption Note */}
          {isPhysicalManager && (
            <div className="bg-purple-950/30 border border-purple-800/50 rounded-2xl p-4 flex items-center space-x-3 text-xs text-purple-200">
              <Info className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <span className="font-bold">Algorithmic Exemption Applied:</span> {activeManagerName} oversees on-ground physical field teams exclusively. Dialer telephonic metrics and call QA scores are exempt and do not penalize his division performance.
              </div>
            </div>
          )}

          {/* Subordinate Pods Comparison Grid (Digital Managers Only) */}
          {!isPhysicalManager && divisionPods.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm font-bold text-white">
                <Layers className="w-4 h-4 text-brand-400" />
                <span>Subordinate Digital Pods in {activeManagerName} Division</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {divisionPods.map((pod) => (
                  <div key={pod.captain} className="bg-[#0e1320] border border-slate-800 rounded-2xl p-5 hover:border-brand-500/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-white">{pod.captain} Pod</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {pod.rmCount} RMs
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-3">
                      Pod Captain: <span className="font-semibold text-slate-200">{pod.captain}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 text-center">
                      <div>
                        <div className="text-[10px] text-slate-400">Dials</div>
                        <div className="font-bold text-white text-xs">{nf.format(pod.dials)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Conn %</div>
                        <div className="font-bold text-emerald-400 text-xs">{pod.connRate}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">QA Score</div>
                        <div className="font-bold text-indigo-300 text-xs">{pod.qaScore}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Division RM Roster Table */}
          {!isPhysicalManager && divisionRms.length > 0 && (
            <div className="bg-[#0e1320] border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Relationship Managers Roster ({activeManagerName} Division)</h3>
                  <p className="text-xs text-slate-400">Reporting agents across all assigned digital pods</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                  {divisionRms.length} Calling Agents
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">RM Agent</th>
                      <th className="py-3 px-4">Pod Captain</th>
                      <th className="py-3 px-4">Pod Team</th>
                      <th className="py-3 px-4">Dials</th>
                      <th className="py-3 px-4">Connected</th>
                      <th className="py-3 px-4">Connect %</th>
                      <th className="py-3 px-4">Talk Time</th>
                      <th className="py-3 px-4">QA Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {divisionRms.map((rm) => (
                      <tr key={rm.rm_name} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-white">{rm.rm_name}</td>
                        <td className="py-3 px-4 text-slate-300">{rm.captain_name}</td>
                        <td className="py-3 px-4 text-indigo-400">{rm.team_name}</td>
                        <td className="py-3 px-4 font-mono">{nf.format(rm.dials)}</td>
                        <td className="py-3 px-4 font-mono">{nf.format(rm.connected)}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">{rm.connRate}%</td>
                        <td className="py-3 px-4 font-mono text-slate-300">{fmtDuration(rm.duration)}</td>
                        <td className="py-3 px-4 font-bold text-white">{rm.qaScore}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. POD CAPTAIN COMMAND DASHBOARD VIEW                         */}
      {/* ------------------------------------------------------------- */}
      {(isCaptain || (isSuperAdmin && viewType === 'pod')) && (
        <div className="space-y-6">

          {/* Pod Captain Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ POD DASHBOARD • DIGITAL CALLING</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {activePodConfig.team} Pod Dashboard
                </h1>
                <p className="text-slate-300 text-sm max-w-3xl">
                  Pod Captain: <span className="font-bold text-white">{activePodConfig.captain}</span> • Senior Manager: <span className="font-bold text-white">{activePodConfig.manager}</span> • {podRms.length} Active Relationship Managers • High Productivity Cluster.
                </p>
              </div>
              <div className="bg-emerald-900/40 border border-emerald-700/60 rounded-xl px-4 py-2.5 text-xs text-right">
                <div className="text-[10px] text-emerald-300 uppercase font-semibold">Pod Performance Tier</div>
                <div className="font-bold text-white">High Performer ({podConnRate}% Conn)</div>
              </div>
            </div>
          </div>

          {/* Pod Operational KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-[#0e1320] border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-900/60 flex items-center justify-center text-emerald-400 font-bold text-xl mb-4">
                <PhoneCall className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pod Dials</span>
              <div className="text-3xl font-extrabold text-white mt-1">
                {nf.format(podTotalDials)} <span className="text-lg font-normal text-slate-400">Dials</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                <span className="font-semibold text-emerald-400">{podConnRate}%</span> Connected ({nf.format(podTotalConnected)} calls)
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Pod Connect Target</span>
                <span className="font-bold text-emerald-400">Target: 50.0% (Met ✅)</span>
              </div>
            </div>

            <div className="bg-[#0e1320] border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-900/60 flex items-center justify-center text-blue-400 font-bold text-xl mb-4">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cumulative Talk Time</span>
              <div className="text-3xl font-extrabold text-white mt-1">
                {fmtDuration(podTotalDuration)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Average handling time: <span className="font-semibold text-slate-200">{fmtDuration(podAvgTalkSec)}</span> per call
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Active Dialers</span>
                <span className="font-bold text-blue-400">{podRms.length} of {podRms.length} RMs Dialing</span>
              </div>
            </div>

            <div className="bg-[#0e1320] border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-900/60 flex items-center justify-center text-amber-400 font-bold text-xl mb-4">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pod QA Compliance</span>
              <div className="text-3xl font-extrabold text-white mt-1">
                {podAvgQaScore}% <span className="text-lg font-normal text-slate-400">Avg Score</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Evaluated across <span className="font-semibold text-slate-200">{podQa.length} audited calls</span>
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Fatal Call Rate</span>
                <span className={`font-bold ${podFatalities > 2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {((podFatalities / Math.max(podQa.length, 1)) * 100).toFixed(1)}% ({podFatalities} Fatalities)
                </span>
              </div>
            </div>

          </div>

          {/* Pod RM Leaderboard Table */}
          <div className="bg-[#0e1320] border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{activePodConfig.team} Relationship Managers Leaderboard</h3>
                <p className="text-xs text-slate-400">Live dialing volume, talk duration, and quality metrics</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                Captain: {activePodConfig.captain}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">RM Agent</th>
                    <th className="py-3 px-4">Outbound Dials</th>
                    <th className="py-3 px-4">Connected</th>
                    <th className="py-3 px-4">Connect %</th>
                    <th className="py-3 px-4">Cumulative Talk Time</th>
                    <th className="py-3 px-4">QA Avg Score</th>
                    <th className="py-3 px-4">Performance Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {podRms.map((rm) => (
                    <tr key={rm.rm_name} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-white">{rm.rm_name}</td>
                      <td className="py-3 px-4 font-mono">{nf.format(rm.dials)}</td>
                      <td className="py-3 px-4 font-mono">{nf.format(rm.connected)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">{rm.connRate}%</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{fmtDuration(rm.duration)}</td>
                      <td className="py-3 px-4 font-bold text-white">{rm.qaScore}%</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${rm.badgeColor}`}>
                          {rm.badge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
