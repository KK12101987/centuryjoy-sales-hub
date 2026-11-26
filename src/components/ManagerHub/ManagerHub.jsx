import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { formatINR, nf, fmtDuration } from '../../utils/formatters';
import { verifyWatermarkIntegrity } from '../../utils/integrity';
import { exportToCsv } from '../../utils/exportCsv';
import { 
  CreditCard, 
  PhoneCall, 
  CheckCircle2, 
  Award, 
  Users, 
  Building2, 
  Layers, 
  Sparkles,
  Info,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  X,
  Check
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

const evaluatePerformanceTier = (dials, connRate, qaScore, fatalCount) => {
  if (dials === 0) {
    return {
      tier: 'No Activity',
      color: 'bg-slate-800/80 text-slate-400 border-slate-700/80'
    };
  }
  // Fatal Parameter Breaches strictly override general QA/productivity
  if (fatalCount >= 2) {
    return {
      tier: `Critical (${fatalCount} Fatals)`,
      color: 'bg-rose-950/80 text-rose-300 border-rose-800/80'
    };
  }
  if (fatalCount === 1) {
    return {
      tier: 'At Risk (1 Fatal)',
      color: 'bg-rose-950/60 text-rose-300 border-rose-800/60'
    };
  }
  // Zero Fatalities - standard operational criteria
  const rateNum = Number(connRate) || 0;
  const scoreNum = Number(qaScore) || 0;
  if (rateNum >= 54 && scoreNum >= 86) {
    return {
      tier: 'Top Performer',
      color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
    };
  }
  if (rateNum >= 48 && scoreNum >= 82) {
    return {
      tier: 'On Track',
      color: 'bg-blue-950/60 text-blue-300 border-blue-800/60'
    };
  }
  return {
    tier: 'Needs Coaching',
    color: 'bg-amber-950/60 text-amber-300 border-amber-800/60'
  };
};

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
    hierarchy,
    selectedMonth,
    coachingLogs,
    logCoachingAction
  } = useData();

  // Role resolution
  const isSuperAdmin = currentUser?.role === 'admin' || currentUser?.email?.includes('kushal') || currentUser?.email?.includes('tanmoy');
  const isManager = currentUser?.role === 'manager';
  const isCaptain = currentUser?.role === 'captain';

  const effectiveManagerName = (currentUser?.managerKey && currentUser.managerKey !== 'all') 
    ? currentUser.managerKey 
    : (isManager ? currentUser.name : 'Niladri Bhadra');
  const effectiveCaptainName = (currentUser?.captainKey && currentUser.captainKey !== 'all')
    ? currentUser.captainKey
    : (isCaptain ? (currentUser.teamName || currentUser.name) : 'Arshi Afreen Jamal');

  // Admin View State
  const [viewType, setViewType] = useState(() => (isCaptain ? 'pod' : 'manager'));
  const [selectedManager, setSelectedManager] = useState(() => effectiveManagerName);
  const [selectedPodCaptain, setSelectedPodCaptain] = useState(() => effectiveCaptainName);

  // Active Manager or Pod Determination
  const activeManagerName = isManager ? effectiveManagerName : (isSuperAdmin ? (selectedManager && selectedManager !== 'all' ? selectedManager : 'Niladri Bhadra') : 'Niladri Bhadra');
  const activeCaptainName = isCaptain ? effectiveCaptainName : (isSuperAdmin ? (selectedPodCaptain && selectedPodCaptain !== 'all' ? selectedPodCaptain : 'Arshi Afreen Jamal') : 'Arshi Afreen Jamal');
  const isPhysicalManager = activeManagerName === 'Amit Singal' || activeManagerName.toLowerCase().includes('singal');

  // Coaching Action Modal States
  const [coachingTarget, setCoachingTarget] = useState(null);
  const [coachingFocus, setCoachingFocus] = useState("GTM Adherence & Product Guidelines");
  const [coachingNotes, setCoachingNotes] = useState("");
  const [coachingDate, setCoachingDate] = useState(new Date().toISOString().split("T")[0]);
  const [coachingStatus, setCoachingStatus] = useState("Completed");
  const [coachingToast, setCoachingToast] = useState("");
  const [coachingTargetAuditor, setCoachingTargetAuditor] = useState("Nabonita Roy");
  const [coachingDelegation, setCoachingDelegation] = useState({ 
    isEscalation: false, 
    senderRole: 'Pod Captain', 
    senderName: '' 
  });

  // Table Search and Filter Presets
  const [managerSearch, setManagerSearch] = useState("");
  const [managerFilter, setManagerFilter] = useState("all");
  const [podSearch, setPodSearch] = useState("");
  const [podFilter, setPodFilter] = useState("all");

  // Master Base Datasets strictly adhering to active operational month
  const baseTickets = useMemo(() => {
    const list = scopedTickets || tickets;
    if (selectedMonth && selectedMonth !== 'all') {
      return list.filter((t) => (t.l2ApprovedDate || t.createdDate || '').startsWith(selectedMonth));
    }
    return list;
  }, [scopedTickets, tickets, selectedMonth]);

  const baseTelephony = useMemo(() => {
    const list = scopedTelephony || telephony;
    if (selectedMonth && selectedMonth !== 'all') {
      return list.filter((r) => (r.d || '').startsWith(selectedMonth));
    }
    return list;
  }, [scopedTelephony, telephony, selectedMonth]);

  const baseQa = useMemo(() => {
    const list = scopedQaAudits || qaAudits;
    if (selectedMonth && selectedMonth !== 'all') {
      return list.filter((a) => (a.audit_date || a.call_date || a.created_at || '').startsWith(selectedMonth));
    }
    return list;
  }, [scopedQaAudits, qaAudits, selectedMonth]);

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
    
    // Legitimate subordinate digital pods assigned to this Senior Manager
    const managerPods = POD_CAPTAINS.filter(
      (p) => p.manager.toLowerCase() === activeManagerName.toLowerCase()
    );

    return managerPods.map((p) => {
      const capName = p.captain;
      const podTeam = p.team;

      // Telephony strictly scoped to this manager AND this specific pod / captain (exact matching to avoid prefix collision)
      const capTele = baseTelephony.filter((r) => {
        const mMatch = r.m && r.m.toLowerCase() === activeManagerName.toLowerCase();
        if (!mMatch) return false;
        const cMatch = r.c && r.c.toLowerCase() === capName.toLowerCase();
        const tMatch = podTeam && (r.a?.toLowerCase() === podTeam.toLowerCase() || r.c?.toLowerCase() === capName.toLowerCase());
        return cMatch || tMatch;
      });

      const podDials = capTele.reduce((sum, r) => sum + (r.t || 0), 0);
      const podConn = capTele.reduce((sum, r) => sum + (r.conn || 0), 0);
      const connRate = podDials > 0 ? ((podConn / podDials) * 100).toFixed(1) : '0.0';

      // QA Audits strictly scoped to this manager AND this specific pod / captain (exact matching)
      const capQa = baseQa.filter((a) => {
        const mMatch = a.manager_name && a.manager_name.toLowerCase() === activeManagerName.toLowerCase();
        if (!mMatch) return false;
        const cMatch = a.captain_name && a.captain_name.toLowerCase() === capName.toLowerCase();
        const tMatch = podTeam && (a.team_name?.toLowerCase() === podTeam.toLowerCase() || a.captain_name?.toLowerCase() === capName.toLowerCase());
        return cMatch || tMatch;
      });

      const validQa = capQa.filter((a) => !a.is_fatal);
      const qaScore = validQa.length > 0 
        ? (validQa.reduce((s, a) => s + (Number(a.overall_score) || 0), 0) / validQa.length).toFixed(1) 
        : '85.0';
      
      // Tickets strictly scoped to this manager AND this specific pod (exact matching)
      const podTickets = baseTickets.filter((t) => {
        const mMatch = t.manager && t.manager.toLowerCase() === activeManagerName.toLowerCase();
        if (!mMatch) return false;
        const cMatch = t.captain && t.captain.toLowerCase() === capName.toLowerCase();
        const tMatch = podTeam && (t.invType?.toLowerCase() === podTeam.toLowerCase() || t.stream?.toLowerCase() === podTeam.toLowerCase());
        return cMatch || tMatch;
      });
      const podDisb = podTickets.reduce((s, t) => s + (Number(t.finalTotalAmount) || 0), 0);

      // Active RMs count for this pod
      const podRmsCount = (rmDirectory || []).filter((rm) => {
        const mMatch = rm.manager_name && rm.manager_name.toLowerCase() === activeManagerName.toLowerCase();
        if (!mMatch) return false;
        const cMatch = rm.captain_name && rm.captain_name.toLowerCase() === capName.toLowerCase();
        const tMatch = podTeam && (rm.team_name?.toLowerCase() === podTeam.toLowerCase() || rm.captain_name?.toLowerCase() === capName.toLowerCase());
        return cMatch || tMatch;
      }).length;

      return {
        captain: capName,
        teamName: podTeam,
        badge: p.badge,
        rmCount: podRmsCount,
        dials: podDials,
        connected: podConn,
        connRate,
        qaScore,
        disbursed: podDisb,
        auditsCount: capQa.length
      };
    });
  }, [activeManagerName, isPhysicalManager, baseTelephony, baseQa, baseTickets, rmDirectory]);

  // RM Roster for this Division
  const divisionRms = useMemo(() => {
    if (isPhysicalManager) return [];
    return (rmDirectory || [])
      .filter((rm) => rm.manager_name === activeManagerName)
      .map((rm) => {
        const rmTele = baseTelephony.filter((r) => ((r.r || r.rm || '')).toLowerCase() === (rm.rm_name || '').toLowerCase());
        const dials = rmTele.reduce((s, r) => s + (r.t || 0), 0);
        const conn = rmTele.reduce((s, r) => s + (r.conn || 0), 0);
        const dur = rmTele.reduce((s, r) => s + (r.dur || 0), 0);
        const connRate = dials > 0 ? ((conn / dials) * 100).toFixed(1) : '0.0';
        const rmAudits = baseQa.filter((a) => (a.rm_name || '').toLowerCase() === (rm.rm_name || '').toLowerCase());
        const fatalCount = rmAudits.filter((a) => a.is_fatal).length;
        const validQa = rmAudits.filter((a) => !a.is_fatal);
        const qaScore = validQa.length > 0 
          ? (validQa.reduce((s, a) => s + (Number(a.overall_score) || 0), 0) / validQa.length).toFixed(1) 
          : (rmAudits.length > 0 ? '0.0' : '85.0');
        const perf = evaluatePerformanceTier(dials, connRate, qaScore, fatalCount);

        const isCoached = (coachingLogs || []).some(
          (c) => c.rmName?.toLowerCase() === rm.rm_name?.toLowerCase() && c.status === 'Completed'
        );

        return {
          rm_name: rm.rm_name,
          captain_name: rm.captain_name,
          team_name: rm.team_name,
          dials,
          connected: conn,
          connRate,
          duration: dur,
          qaScore,
          fatalCount,
          badge: perf.tier,
          badgeColor: perf.color,
          isCoached
        };
      })
      .sort((a, b) => b.dials - a.dials);
  }, [activeManagerName, isPhysicalManager, rmDirectory, baseTelephony, baseQa, coachingLogs]);

  // -------------------------------------------------------------
  // B. POD CAPTAIN COMMAND DASHBOARD COMPUTATIONS
  // -------------------------------------------------------------
  const activePodConfig = useMemo(() => {
    return POD_CAPTAINS.find((p) => p.captain.toLowerCase() === activeCaptainName.toLowerCase()) || POD_CAPTAINS[0];
  }, [activeCaptainName]);

  const podTelephony = useMemo(() => {
    return baseTelephony.filter((r) => {
      const cMatch = r.c?.toLowerCase() === activePodConfig.captain.toLowerCase();
      const tMatch = r.a?.toLowerCase() === activePodConfig.team.toLowerCase();
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
        const rmTele = podTelephony.filter((r) => ((r.r || r.rm || '')).toLowerCase() === (rm.rm_name || '').toLowerCase());
        const dials = rmTele.reduce((s, r) => s + (r.t || 0), 0);
        const conn = rmTele.reduce((s, r) => s + (r.conn || 0), 0);
        const dur = rmTele.reduce((s, r) => s + (r.dur || 0), 0);
        const connRate = dials > 0 ? ((conn / dials) * 100).toFixed(1) : '0.0';
        const rmAudits = podQa.filter((a) => (a.rm_name || '').toLowerCase() === (rm.rm_name || '').toLowerCase());
        const fatalCount = rmAudits.filter((a) => a.is_fatal).length;
        const validQa = rmAudits.filter((a) => !a.is_fatal);
        const qaScore = validQa.length > 0 
          ? (validQa.reduce((s, a) => s + (Number(a.overall_score) || 0), 0) / validQa.length).toFixed(1) 
          : (rmAudits.length > 0 ? '0.0' : '85.0');
        const perf = evaluatePerformanceTier(dials, connRate, qaScore, fatalCount);

        const isCoached = (coachingLogs || []).some(
          (c) => c.rmName?.toLowerCase() === rm.rm_name?.toLowerCase() && c.status === 'Completed'
        );

        return {
          rm_name: rm.rm_name,
          dials,
          connected: conn,
          connRate,
          duration: dur,
          qaScore,
          fatalCount,
          badge: perf.tier,
          badgeColor: perf.color,
          isCoached
        };
      })
      .sort((a, b) => b.dials - a.dials);
  }, [activePodConfig, rmDirectory, podTelephony, podQa, coachingLogs]);

  // Month-over-Month Comparative Analytics
  const momAnalytics = useMemo(() => {
    // 1. Division MoM (Oct baseline)
    const octDivTele = (telephony || []).filter(r => r.m === activeManagerName && (r.d || '').startsWith('2026-10'));
    const octDivDials = octDivTele.reduce((s, r) => s + (r.t || 0), 0);
    const octDivConn = octDivTele.reduce((s, r) => s + (r.conn || 0), 0);
    const octDivConnRate = octDivDials > 0 ? (octDivConn / octDivDials) * 100 : 0;
    const octDivQa = (qaAudits || []).filter(a => a.manager_name === activeManagerName && !a.is_fatal && (a.audit_date || a.call_date || a.created_at || '').startsWith('2026-10'));
    const octDivAvgQa = octDivQa.length > 0 ? (octDivQa.reduce((s, a) => s + Number(a.overall_score || 0), 0) / octDivQa.length) : 0;

    // 2. Pod MoM (Oct baseline)
    const octPodTele = (telephony || []).filter(r => {
      const cMatch = r.c?.toLowerCase() === activePodConfig.captain.toLowerCase();
      const tMatch = r.a?.toLowerCase() === (activePodConfig.team || '').toLowerCase();
      return (cMatch || tMatch) && (r.d || '').startsWith('2026-10');
    });
    const octPodDials = octPodTele.reduce((s, r) => s + (r.t || 0), 0);
    const octPodConn = octPodTele.reduce((s, r) => s + (r.conn || 0), 0);
    const octPodConnRate = octPodDials > 0 ? (octPodConn / octPodDials) * 100 : 0;
    const octPodQa = (qaAudits || []).filter(a => {
      const cMatch = a.captain_name?.toLowerCase() === activePodConfig.captain.toLowerCase();
      const tMatch = a.team_name?.toLowerCase() === activePodConfig.team.toLowerCase();
      return (cMatch || tMatch) && !a.is_fatal && (a.audit_date || a.call_date || a.created_at || '').startsWith('2026-10');
    });
    const octPodAvgQa = octPodQa.length > 0 ? (octPodQa.reduce((s, a) => s + Number(a.overall_score || 0), 0) / octPodQa.length) : 0;

    return {
      octDivDials,
      octDivConnRate,
      octDivAvgQa,
      octPodDials,
      octPodConnRate,
      octPodAvgQa
    };
  }, [telephony, qaAudits, activeManagerName, activePodConfig]);

  const renderMomBadge = (currentVal, octVal, unit = '%', isRateOrScore = false) => {
    if (selectedMonth === '2026-10') {
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
          Baseline
        </span>
      );
    }
    if (selectedMonth === 'all') {
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded-full border border-indigo-800/70">
          Consolidated
        </span>
      );
    }
    if (!octVal || octVal === 0) return null;

    let delta = 0;
    if (isRateOrScore) {
      delta = Number(currentVal) - Number(octVal);
    } else {
      delta = ((Number(currentVal) - Number(octVal)) / Number(octVal)) * 100;
    }
    const isPositive = delta >= 0;
    const formattedDelta = Math.abs(delta).toFixed(1);

    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
        isPositive 
          ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/70' 
          : 'text-rose-400 bg-rose-950/60 border-rose-800/70'
      }`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{isPositive ? `+${formattedDelta}` : `-${formattedDelta}`}{unit} MoM</span>
      </span>
    );
  };

  // Filtered Roster Lists
  const filteredDivisionRms = useMemo(() => {
    return divisionRms.filter((rm) => {
      if (managerSearch) {
        const q = managerSearch.toLowerCase();
        const matchName = rm.rm_name.toLowerCase().includes(q);
        const matchTeam = (rm.team_name || '').toLowerCase().includes(q);
        const matchCap = (rm.captain_name || '').toLowerCase().includes(q);
        if (!matchName && !matchTeam && !matchCap) return false;
      }
      const isCoached = (coachingLogs || []).some(c => c.rmName?.toLowerCase() === rm.rm_name?.toLowerCase());
      if (managerFilter === 'top') return rm.badge.includes('Top Performer');
      if (managerFilter === 'ontrack') return rm.badge.includes('On Track');
      if (managerFilter === 'atrisk') return rm.fatalCount > 0 || rm.badge.includes('At Risk') || rm.badge.includes('Critical');
      if (managerFilter === 'coaching') return rm.badge.includes('Needs Coaching');
      if (managerFilter === 'completed') return isCoached;
      return true;
    });
  }, [divisionRms, managerSearch, managerFilter, coachingLogs]);

  const filteredPodRms = useMemo(() => {
    return podRms.filter((rm) => {
      if (podSearch) {
        const q = podSearch.toLowerCase();
        if (!rm.rm_name.toLowerCase().includes(q)) return false;
      }
      const isCoached = (coachingLogs || []).some(c => c.rmName?.toLowerCase() === rm.rm_name?.toLowerCase());
      if (podFilter === 'top') return rm.badge.includes('Top Performer');
      if (podFilter === 'ontrack') return rm.badge.includes('On Track');
      if (podFilter === 'atrisk') return rm.fatalCount > 0 || rm.badge.includes('At Risk') || rm.badge.includes('Critical');
      if (podFilter === 'coaching') return rm.badge.includes('Needs Coaching');
      if (podFilter === 'completed') return isCoached;
      return true;
    });
  }, [podRms, podSearch, podFilter, coachingLogs]);

  // CSV Export Handlers
  const handleExportDivisionRoster = () => {
    const headers = [
      { key: 'rm_name', label: 'RM Agent' },
      { key: 'captain_name', label: 'Pod Captain' },
      { key: 'team_name', label: 'Pod Team' },
      { key: 'dials', label: 'Outbound Dials' },
      { key: 'connected', label: 'Connected Calls' },
      { key: 'connRate', label: 'Connect %' },
      { key: 'talkTimeFmt', label: 'Total Talk Time' },
      { key: 'qaScore', label: 'QA Avg Score %' },
      { key: 'fatalCount', label: 'Fatal Calls' },
      { key: 'badge', label: 'Performance Tier' },
      { key: 'coachingStatus', label: 'Coaching Status' }
    ];
    const rows = filteredDivisionRms.map(r => ({
      ...r,
      talkTimeFmt: fmtDuration(r.duration),
      coachingStatus: (coachingLogs || []).some(c => c.rmName?.toLowerCase() === r.rm_name?.toLowerCase()) ? 'Coached' : 'Pending'
    }));
    exportToCsv(`${activeManagerName.replace(/\s+/g, '_')}_Division_RM_Roster_${selectedMonth}`, headers, rows);
  };

  const handleExportPodLeaderboard = () => {
    const headers = [
      { key: 'rm_name', label: 'RM Agent' },
      { key: 'dials', label: 'Outbound Dials' },
      { key: 'connected', label: 'Connected Calls' },
      { key: 'connRate', label: 'Connect %' },
      { key: 'talkTimeFmt', label: 'Cumulative Talk Time' },
      { key: 'qaScore', label: 'QA Avg Score %' },
      { key: 'fatalCount', label: 'Fatal Calls' },
      { key: 'badge', label: 'Performance Tier' },
      { key: 'coachingStatus', label: 'Coaching Status' }
    ];
    const rows = filteredPodRms.map(r => ({
      ...r,
      talkTimeFmt: fmtDuration(r.duration),
      coachingStatus: (coachingLogs || []).some(c => c.rmName?.toLowerCase() === r.rm_name?.toLowerCase()) ? 'Coached' : 'Pending'
    }));
    exportToCsv(`${activePodConfig.team}_RM_Leaderboard_${selectedMonth}`, headers, rows);
  };

  // Coaching Handlers
  const handleOpenCoachingModal = (rm) => {
    setCoachingTarget(rm);
    setCoachingDate(new Date().toISOString().split("T")[0]);
    setCoachingStatus("Completed");

    // 1. Locate RM's fatal audit from active baseQa or full qaAudits corpus
    const rmFatalAudits = (baseQa || qaAudits || []).filter(
      (a) => (a.rm_name || '').toLowerCase() === (rm.rm_name || '').toLowerCase() && a.is_fatal
    );
    const latestFatal = [...rmFatalAudits].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))[0];

    // Auto-detect designated Quality Auditor who evaluated the fatal call
    const detectedAuditor = latestFatal?.auditor_name || "Nabonita Roy";
    setCoachingTargetAuditor(detectedAuditor);

    // 2. Auto-select Coaching Focus Area based on specific fatal parameter failure
    let autoFocus = "Call Opening & Introduction Pitch";
    if (latestFatal) {
      const reasonText = `${latestFatal.fatal_reason || ''} ${latestFatal.feedback || ''} ${latestFatal.observation || ''}`.toLowerCase();
      if (latestFatal.redemption === 0 || reasonText.includes('redemption') || reasonText.includes('gratitude') || reasonText.includes('points')) {
        autoFocus = "Redemption & Gratitude Points Process";
      } else if (latestFatal.crm_update === 0 || reasonText.includes('crm') || reasonText.includes('meeting')) {
        autoFocus = "CRM Meeting Notes & Documentation";
      } else if (latestFatal.gtm_adherence === 0 || reasonText.includes('gtm') || reasonText.includes('misinformation') || reasonText.includes('rude') || reasonText.includes('pricing') || reasonText.includes('misleading')) {
        autoFocus = "GTM Adherence & Product Guidelines";
      } else {
        autoFocus = "GTM Adherence & Product Guidelines";
      }
    } else if (rm.fatalCount > 0) {
      autoFocus = "GTM Adherence & Product Guidelines";
    } else if (Number(rm.qaScore) < 85) {
      autoFocus = "Product Pricing & Objection Handling";
    } else if (Number(rm.connRate) < 50) {
      autoFocus = "Call Opening & Introduction Pitch";
    }

    // 3. Multi-tier delegation rule:
    // When RM gets 3 or more fatals (>= 3): Request must be sent by Senior Manager to the QA who gave the fatal
    // When RM gets less than 3 fatals (< 3): Request can be sent by the Pod Captain to the QA who gave the fatal
    const isEscalation = (rm.fatalCount || 0) >= 3;
    const senderRole = isEscalation ? 'Senior Manager' : 'Pod Captain';
    const senderName = isEscalation 
      ? (activeManagerName || rm.manager_name || currentUser?.name || 'Senior Manager')
      : (rm.captain_name || activeCaptainName || currentUser?.name || 'Pod Captain');

    setCoachingDelegation({ isEscalation, senderRole, senderName });

    // 4. Pre-fill existing note if already coached, otherwise load auto-focus
    const existingLog = (coachingLogs || []).find(
      (c) => c.rmName?.toLowerCase() === rm.rm_name?.toLowerCase()
    );
    if (existingLog) {
      setCoachingFocus(existingLog.focus || autoFocus);
      setCoachingNotes(existingLog.notes || "");
      setCoachingDate(existingLog.date || new Date().toISOString().split("T")[0]);
      setCoachingStatus(existingLog.status || "Completed");
    } else {
      setCoachingFocus(autoFocus);
      setCoachingNotes("");
    }
  };

  const handleSaveCoaching = (e) => {
    e.preventDefault();
    if (!coachingTarget) return;

    if (logCoachingAction) {
      logCoachingAction({
        rmName: coachingTarget.rm_name,
        teamName: coachingTarget.team_name || activePodConfig.team,
        captainName: coachingTarget.captain_name || activeCaptainName,
        managerName: activeManagerName,
        supervisor: coachingDelegation.senderName,
        senderRole: coachingDelegation.senderRole,
        senderName: coachingDelegation.senderName,
        targetAuditor: coachingTargetAuditor,
        delegationLevel: coachingDelegation.isEscalation 
          ? 'Senior Manager Escalation (≥3 Fatals)' 
          : 'Pod Captain Coaching (<3 Fatals)',
        date: coachingDate,
        focus: coachingFocus,
        notes: coachingNotes,
        status: coachingStatus,
        fatalCountBefore: coachingTarget.fatalCount
      });
    }

    setCoachingToast(`✓ Coaching session successfully logged for ${coachingTarget.rm_name}!`);
    setTimeout(() => setCoachingToast(""), 4000);
    setCoachingTarget(null);
  };

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
                <div className="flex items-center gap-2">
                  {!isPhysicalManager && renderMomBadge(divisionDials, momAnalytics.octDivDials, '%', false)}
                  <span className="text-xs font-semibold text-emerald-400">Division Calls</span>
                </div>
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
                <div className="flex items-center gap-2">
                  {!isPhysicalManager && renderMomBadge(divisionAvgQa, momAnalytics.octDivAvgQa, '%', true)}
                  <span className="text-xs font-semibold text-amber-400">Division QA</span>
                </div>
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
                  <div key={pod.teamName || pod.captain} className="bg-[#0e1320] border border-slate-800 rounded-2xl p-5 hover:border-brand-500/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-white">{pod.teamName || pod.captain} Pod</h3>
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
              <div className="px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Relationship Managers Roster ({activeManagerName} Division)</h3>
                  <p className="text-xs text-slate-400">Reporting agents across all assigned digital pods • Click At-Risk badges to log coaching</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={managerSearch}
                      onChange={(e) => setManagerSearch(e.target.value)}
                      placeholder="Search RM, pod or captain..."
                      className="pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none w-48 sm:w-56"
                    />
                    {managerSearch && (
                      <button 
                        onClick={() => setManagerSearch('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* 1-Click CSV Export Button */}
                  <button
                    onClick={handleExportDivisionRoster}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    title="Export filtered roster to Microsoft Excel / CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                    {filteredDivisionRms.length} of {divisionRms.length} RMs
                  </span>
                </div>
              </div>

              {/* Quick Filter Preset Pills */}
              <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold mr-1">Filter View:</span>
                {[
                  { key: 'all', label: `All RMs (${divisionRms.length})` },
                  { key: 'top', label: `🌟 Top Performers (${divisionRms.filter(r => r.badge.includes('Top Performer')).length})` },
                  { key: 'ontrack', label: `✓ On Track (${divisionRms.filter(r => r.badge.includes('On Track')).length})` },
                  { key: 'atrisk', label: `🚨 At Risk / Fatals (${divisionRms.filter(r => r.fatalCount > 0 || r.badge.includes('At Risk') || r.badge.includes('Critical')).length})` },
                  { key: 'coaching', label: `⚠️ Needs Coaching (${divisionRms.filter(r => r.badge.includes('Needs Coaching')).length})` },
                  { key: 'completed', label: `🎓 Coached (${divisionRms.filter(r => r.isCoached).length})` }
                ].map((pill) => (
                  <button
                    key={pill.key}
                    onClick={() => setManagerFilter(pill.key)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      managerFilter === pill.key
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Table with Sticky Header */}
              <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-10 backdrop-blur-md bg-slate-900/95 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">RM Agent</th>
                      <th className="py-3 px-4">Pod Captain</th>
                      <th className="py-3 px-4">Pod Team</th>
                      <th className="py-3 px-4">Dials</th>
                      <th className="py-3 px-4">Connected</th>
                      <th className="py-3 px-4">Connect %</th>
                      <th className="py-3 px-4">Talk Time</th>
                      <th className="py-3 px-4">QA Avg</th>
                      <th className="py-3 px-4">Fatal Calls</th>
                      <th className="py-3 px-4">Performance Tier</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredDivisionRms.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="py-8 text-center text-slate-400">
                          No relationship managers match the current search or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredDivisionRms.map((rm) => (
                        <tr key={rm.rm_name} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                            <span>{rm.rm_name}</span>
                            {rm.isCoached && (
                              <span className="text-[10px] text-emerald-400" title="Coaching conducted">🎓</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{rm.captain_name}</td>
                          <td className="py-3 px-4 text-indigo-400">{rm.team_name}</td>
                          <td className="py-3 px-4 font-mono">{nf.format(rm.dials)}</td>
                          <td className="py-3 px-4 font-mono">{nf.format(rm.connected)}</td>
                          <td className="py-3 px-4 font-bold text-emerald-400">{rm.connRate}%</td>
                          <td className="py-3 px-4 font-mono text-slate-300">{fmtDuration(rm.duration)}</td>
                          <td className="py-3 px-4 font-bold text-white">{rm.qaScore}%</td>
                          <td className="py-3 px-4 font-mono">
                            {rm.fatalCount > 0 ? (
                              <button
                                onClick={() => handleOpenCoachingModal(rm)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/70 text-rose-300 border border-rose-800/70 hover:bg-rose-900/80 cursor-pointer transition-colors"
                                title="Click to log counseling/coaching session"
                              >
                                🚨 {rm.fatalCount} Failed
                              </button>
                            ) : (
                              <span className="text-slate-500 font-medium">0</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleOpenCoachingModal(rm)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${rm.badgeColor}`}
                              title="Click to view/log coaching session"
                            >
                              {rm.badge}
                            </button>
                            {rm.isCoached && (
                              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                                Coached
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {rm.isCoached ? (
                              <button
                                onClick={() => handleOpenCoachingModal(rm)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 text-[10px] font-bold flex items-center gap-1 mx-auto transition-colors cursor-pointer shadow-xs"
                                title="Coaching completed • Click to view or update notes"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Coaching Done</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenCoachingModal(rm)}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                                title="Log coaching session"
                              >
                                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Coach</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
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
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-900/60 flex items-center justify-center text-emerald-400 font-bold text-xl">
                  <PhoneCall className="w-6 h-6" />
                </div>
                {renderMomBadge(podTotalDials, momAnalytics.octPodDials, '%', false)}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pod Dials</span>
              <div className="text-3xl font-extrabold text-white mt-1">
                {nf.format(podTotalDials)} <span className="text-lg font-normal text-slate-400">Dials</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                <span className="font-semibold text-emerald-400">{podConnRate}%</span> Connected ({nf.format(podTotalConnected)} calls)
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Connected Calls</span>
                <span className="font-bold text-emerald-400">{nf.format(podTotalConnected)} Successful</span>
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
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-900/60 flex items-center justify-center text-amber-400 font-bold text-xl">
                  <Award className="w-6 h-6" />
                </div>
                {renderMomBadge(podAvgQaScore, momAnalytics.octPodAvgQa, '%', true)}
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
            <div className="px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">{activePodConfig.team} Relationship Managers Leaderboard</h3>
                <p className="text-xs text-slate-400">Live dialing volume, talk duration, and quality metrics • Click At-Risk badges to log coaching</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={podSearch}
                    onChange={(e) => setPodSearch(e.target.value)}
                    placeholder="Search RM agent..."
                    className="pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none w-44 sm:w-52"
                  />
                  {podSearch && (
                    <button 
                      onClick={() => setPodSearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 1-Click CSV Export Button */}
                <button
                  onClick={handleExportPodLeaderboard}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="Export filtered leaderboard to Microsoft Excel / CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                  Captain: {activePodConfig.captain}
                </span>
              </div>
            </div>

            {/* Quick Filter Preset Pills */}
            <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold mr-1">Filter View:</span>
              {[
                { key: 'all', label: `All RMs (${podRms.length})` },
                { key: 'top', label: `🌟 Top Performers (${podRms.filter(r => r.badge.includes('Top Performer')).length})` },
                { key: 'ontrack', label: `✓ On Track (${podRms.filter(r => r.badge.includes('On Track')).length})` },
                { key: 'atrisk', label: `🚨 At Risk / Fatals (${podRms.filter(r => r.fatalCount > 0 || r.badge.includes('At Risk') || r.badge.includes('Critical')).length})` },
                { key: 'coaching', label: `⚠️ Needs Coaching (${podRms.filter(r => r.badge.includes('Needs Coaching')).length})` },
                { key: 'completed', label: `🎓 Coached (${podRms.filter(r => r.isCoached).length})` }
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setPodFilter(pill.key)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    podFilter === pill.key
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Table with Sticky Header */}
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-10 backdrop-blur-md bg-slate-900/95 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">RM Agent</th>
                    <th className="py-3 px-4">Outbound Dials</th>
                    <th className="py-3 px-4">Connected</th>
                    <th className="py-3 px-4">Connect %</th>
                    <th className="py-3 px-4">Cumulative Talk Time</th>
                    <th className="py-3 px-4">QA Avg Score</th>
                    <th className="py-3 px-4">Fatal Calls</th>
                    <th className="py-3 px-4">Performance Tier</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredPodRms.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-slate-400">
                        No relationship managers match the current search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPodRms.map((rm) => (
                      <tr key={rm.rm_name} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                          <span>{rm.rm_name}</span>
                          {rm.isCoached && (
                            <span className="text-[10px] text-emerald-400" title="Coaching conducted">🎓</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono">{nf.format(rm.dials)}</td>
                        <td className="py-3 px-4 font-mono">{nf.format(rm.connected)}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">{rm.connRate}%</td>
                        <td className="py-3 px-4 font-mono text-slate-300">{fmtDuration(rm.duration)}</td>
                        <td className="py-3 px-4 font-bold text-white">{rm.qaScore}%</td>
                        <td className="py-3 px-4 font-mono">
                          {rm.fatalCount > 0 ? (
                            <button
                              onClick={() => handleOpenCoachingModal(rm)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/70 text-rose-300 border border-rose-800/70 hover:bg-rose-900/80 cursor-pointer transition-colors"
                              title="Click to log counseling/coaching session"
                            >
                              🚨 {rm.fatalCount} Failed
                            </button>
                          ) : (
                            <span className="text-slate-500 font-medium">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleOpenCoachingModal(rm)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${rm.badgeColor}`}
                            title="Click to view/log coaching session"
                          >
                            {rm.badge}
                          </button>
                          {rm.isCoached && (
                            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                              Coached
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {rm.isCoached ? (
                            <button
                              onClick={() => handleOpenCoachingModal(rm)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 text-[10px] font-bold flex items-center gap-1 mx-auto transition-colors cursor-pointer shadow-xs"
                              title="Coaching completed • Click to view or update notes"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Coaching Done</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenCoachingModal(rm)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                              title="Log coaching session"
                            >
                              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Coach</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================= */}
      {/* 3. LOG COUNSELING / COACHING SESSION MODAL                    */}
      {/* ============================================================= */}
      {coachingTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-[#0e1320] border border-indigo-800/80 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 my-8">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-indigo-900/60 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Log Coaching Session</span>
                  </h3>
                  <p className="text-xs text-indigo-300/80 mt-0.5">
                    Record supervisory feedback and corrective counseling for Relationship Manager.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCoachingTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Agent Profile Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{coachingTarget.rm_name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${coachingTarget.badgeColor}`}>
                  {coachingTarget.badge}
                </span>
              </div>
              <div className="text-slate-400 flex flex-wrap items-center gap-3">
                <span>Team: <strong className="text-slate-200">{coachingTarget.team_name || activePodConfig.team}</strong></span>
                <span>•</span>
                <span>Captain: <strong className="text-slate-200">{coachingTarget.captain_name || activeCaptainName}</strong></span>
                <span>•</span>
                <span>Fatals: <strong className={coachingTarget.fatalCount > 0 ? "text-rose-400 font-bold" : "text-emerald-400"}>{coachingTarget.fatalCount}</strong></span>
              </div>
            </div>

            {/* Multi-Tier Delegation Dispatch Routing Banner */}
            <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              coachingDelegation.isEscalation 
                ? 'bg-rose-950/60 border-rose-800/80 text-rose-200' 
                : 'bg-indigo-950/60 border-indigo-800/80 text-indigo-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${coachingDelegation.isEscalation ? 'bg-rose-900/80 text-rose-300' : 'bg-indigo-900/80 text-indigo-300'}`}>
                  {coachingDelegation.isEscalation ? <Building2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-bold flex items-center gap-2">
                    <span>{coachingDelegation.isEscalation ? '🏢 Senior Manager Escalation' : '⚡ Pod Captain Action'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-900/80 border border-slate-700 font-bold">
                      {coachingTarget.fatalCount} {coachingTarget.fatalCount === 1 ? 'Fatal' : 'Fatals'} ({coachingDelegation.isEscalation ? '≥ 3 Rule' : '< 3 Rule'})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Dispatched by <strong className="text-white">{coachingDelegation.senderRole} ({coachingDelegation.senderName})</strong> to Quality Auditor <strong className="text-white font-mono">{coachingTargetAuditor}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Coaching Form */}
            <form onSubmit={handleSaveCoaching} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Coaching Date</label>
                  <input
                    type="date"
                    value={coachingDate}
                    onChange={(e) => setCoachingDate(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">
                    Dispatched By ({coachingDelegation.senderRole})
                  </label>
                  <input
                    type="text"
                    value={coachingDelegation.senderName}
                    readOnly
                    className="w-full p-2 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-300 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300 flex items-center justify-between">
                  <span>Target Quality Auditor</span>
                  <span className="text-[10px] text-slate-400">Audited Fatal Call</span>
                </label>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 font-mono font-bold flex items-center justify-between text-xs">
                  <span>{coachingTargetAuditor}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-sans font-semibold">
                    QA Recipient
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Coaching Focus Area</label>
                <select
                  value={coachingFocus}
                  onChange={(e) => setCoachingFocus(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none"
                >
                  <option value="GTM Adherence & Product Guidelines">GTM Adherence & Misinformation Prevention (Fatal)</option>
                  <option value="Redemption & Gratitude Points Process">Redemption & Joy Gratitude Points (Fatal)</option>
                  <option value="CRM Meeting Notes & Documentation">CRM Meeting Notes & Verification (Fatal)</option>
                  <option value="Call Opening & Introduction Pitch">Call Opening, Greeting & Self Introduction</option>
                  <option value="Product Pricing & Objection Handling">Product & Pricing Requirement Discovery</option>
                  <option value="Cross & Upsell Probing Techniques">Premium Product Upselling & Cross-Selling</option>
                  <option value="Customer Softskills & Active Listening">Tone, Energy, Hold Verbiage & Voice Modulation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Counseling Notes & Action Items</label>
                <textarea
                  value={coachingNotes}
                  onChange={(e) => setCoachingNotes(e.target.value)}
                  placeholder="Record observed defects, specific guidance shared, agreed turnaround timeline..."
                  rows={4}
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Resolution Status</label>
                <div className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="coachingStatus"
                      value="Completed"
                      checked={coachingStatus === 'Completed'}
                      onChange={() => setCoachingStatus('Completed')}
                      className="text-emerald-500 focus:ring-0"
                    />
                    <span className="font-semibold text-emerald-400">Coaching Completed</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="coachingStatus"
                      value="In Progress"
                      checked={coachingStatus === 'In Progress'}
                      onChange={() => setCoachingStatus('In Progress')}
                      className="text-amber-500 focus:ring-0"
                    />
                    <span className="font-semibold text-amber-400">In Progress / Follow-up Needed</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCoachingTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-900/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Coaching Record</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Global Coaching Feedback Toast */}
      {coachingToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4" />
          <span>{coachingToast}</span>
        </div>
      )}

    </div>
  );
}
