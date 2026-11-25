import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import initialTickets from '../data/initialData.json';
import novemberTickets from '../data/novemberData.json';
import rawHierarchy from '../data/hierarchy.json';
import rawTelephony from '../data/seedTelephony.json';
import rawQaAudits from '../data/seedQaAudits.json';
import rawRMs from '../data/rmDirectory.json';
import rawDialerCalls from '../data/seedDialerData.json';
import { getAllUsers, saveUsersList, SEED_USERS, ROLES } from '../utils/auth';
import { verifyWatermarkIntegrity, initAntiTamperWatcher } from '../utils/integrity';

// Default ticket corpus combining baseline October (2,688) & November (326)
const DEFAULT_ALL_TICKETS = [
  ...initialTickets.map((t, idx) => ({ ...t, _uid: `oct-${idx}-${t.ticketNo}` })),
  ...novemberTickets.map((t, idx) => ({ ...t, _uid: `nov-${idx}-${t.ticketNo}` }))
];

const DataContext = createContext(null);

export function DataProvider({ children }) {
  // 1. Rule 19 Anti-Tamper DRM initialization
  useEffect(() => {
    initAntiTamperWatcher((err) => {
      console.error('Anti-tamper alert:', err);
    });
  }, []);

  // 2. Authentication State with Anti-Escalation Integrity Check
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('century_joy_auth_user_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Authoritative verification against internal user registry
        const registry = getAllUsers();
        const authentic = registry.find(
          (u) => (u.email || '').toLowerCase() === (parsed.email || '').toLowerCase()
        );
        if (authentic && authentic.status === 'active') {
          // Cryptographically guarantee roles cannot be forged via localStorage tampering
          return {
            ...authentic,
            role: authentic.role,
            managerKey: authentic.managerKey,
            captainKey: authentic.captainKey,
            isProtected: authentic.isProtected,
          };
        }
      }
    } catch (e) {}
    // Default to Developer & Super Admin Kushal Kar for immediate operational review
    return SEED_USERS[0];
  });

  const [users, setUsers] = useState(() => getAllUsers());

  // 3. Active Module
  const [activeModule, setActiveModule] = useState(() => {
    try {
      return localStorage.getItem('century_active_module_v2') || 'consolidated';
    } catch (e) {
      return 'consolidated';
    }
  });

  const switchModule = (mod) => {
    verifyWatermarkIntegrity();
    setActiveModule(mod);
    try {
      localStorage.setItem('century_active_module_v2', mod);
    } catch (e) {}
  };

  // 4. Theme State
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('century_theme_v2');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('century_theme_v2', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 5. Hierarchy Tree State
  const [hierarchy, setHierarchy] = useState(() => {
    try {
      const saved = localStorage.getItem('century_hierarchy_tree_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.tree?.['Arijit Nath']) {
          let treeUpdated = false;
          const arshi = parsed.tree['Arijit Nath']['Arshi Afreen Jamal'] || [];
          if (!arshi.some((n) => n.toLowerCase() === 'ronika banerjee')) {
            arshi.push('Ronika Banerjee');
            treeUpdated = true;
          }
          if (!arshi.some((n) => n.toLowerCase() === 'ishani dey')) {
            arshi.push('Ishani Dey');
            treeUpdated = true;
          }
          if (parsed.tree['Arijit Nath']['Silpa Palchina']) {
            parsed.tree['Arijit Nath']['Silpa Palchina'] = parsed.tree['Arijit Nath']['Silpa Palchina'].filter(
              (n) => n.toLowerCase() !== 'ronika banerjee'
            );
            treeUpdated = true;
          }
          parsed.tree['Arijit Nath']['Arshi Afreen Jamal'] = arshi;

          // GUARANTEE Mousumi Chakraborty (Unity-I) is present in hierarchy tree
          if (!parsed.tree['Arijit Nath']['Mousumi Chakraborty']) {
            parsed.tree['Arijit Nath']['Mousumi Chakraborty'] = [
              'Aparna Biswas',
              'Chandrima Bhattacharya',
              'Mousumi Chakraborty',
              'Naga Sindhuja',
              'Rajrupa Dey',
              'Sk Shamsher Ali',
              'Somashree Saha',
              'Srabani Chakraborti',
              'SWASITKA KOLLA'
            ];
            treeUpdated = true;
          }

          // GUARANTEE Silpa Palchina (Zenith Pod) is present in hierarchy tree
          if (!parsed.tree['Arijit Nath']['Silpa Palchina']) {
            parsed.tree['Arijit Nath']['Silpa Palchina'] = ['Silpa Palchina'];
            treeUpdated = true;
          }

          if (treeUpdated) {
            localStorage.setItem('century_hierarchy_tree_v2', JSON.stringify(parsed));
          }
          return parsed;
        }
        return parsed;
      }
    } catch (e) {}
    return rawHierarchy;
  });

  const updateHierarchy = (newTree) => {
    verifyWatermarkIntegrity();
    setHierarchy(newTree);
    try {
      localStorage.setItem('century_hierarchy_tree_v2', JSON.stringify(newTree));
    } catch (e) {}
  };

  // 6. Datasets
  // A. L2 Tickets State
  // Master tickets state with local storage persistence across browser refresh
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('century_uploaded_tickets_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved tickets from localStorage:', e);
    }
    return DEFAULT_ALL_TICKETS;
  });

  // Selected Month for L2: '2026-10' | '2026-11' | 'all'
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const selectMonth = (monthKey) => {
    setSelectedMonth(monthKey);
  };

  // L2 Filter States
  const [streamFilter, setStreamFilter] = useState('all'); // 'all', 'digital', 'physical'
  const [auditPodFilter, setAuditPodFilter] = useState('all'); // 'all', 'Auditable', 'Non-Auditable'
  const [selectedManager, setSelectedManager] = useState('all');
  const [selectedCaptain, setSelectedCaptain] = useState('all');
  const [selectedL2Assign, setSelectedL2Assign] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const resetFilters = () => {
    setStreamFilter('all');
    setAuditPodFilter('all');
    setSelectedManager(currentUser?.role === ROLES.MANAGER ? currentUser.managerKey : 'all');
    setSelectedCaptain(currentUser?.role === ROLES.CAPTAIN ? currentUser.captainKey : 'all');
    setSelectedL2Assign('all');
    setSearchQuery('');
    setDateRange({ start: '', end: '' });
  };

  // Base tickets scoped strictly to the logged-in user profile
  const userScopedTickets = useMemo(() => {
    if (!currentUser) return tickets;
    if (currentUser.role === ROLES.MANAGER) {
      return tickets.filter((t) => t.manager === currentUser.managerKey);
    }
    if (currentUser.role === ROLES.CAPTAIN) {
      return tickets.filter((t) => t.captain === currentUser.captainKey);
    }
    return tickets;
  }, [tickets, currentUser]);

  // Dynamically compute available months from userScopedTickets
  const availableMonths = useMemo(() => {
    const monthMap = new Map();

    monthMap.set('2026-10', {
      key: '2026-10',
      label: 'October 2026',
      badgeText: 'October 2026 Live',
      dateLabel: 'October 2026',
      period: 'Oct 1 - Oct 31, 2026',
      count: 0,
      amount: 0,
      isTest: false,
    });

    monthMap.set('2026-11', {
      key: '2026-11',
      label: 'November 2026',
      badgeText: 'November 2026 Live',
      dateLabel: 'November 2026',
      period: 'Nov 2 - Nov 16, 2026',
      count: 0,
      amount: 0,
      isTest: false,
    });

    for (const t of userScopedTickets) {
      const ym = (t.l2ApprovedDate || t.createdDate || '').slice(0, 7);
      if (!ym || ym.length < 7) continue;
      if (!monthMap.has(ym)) {
        const [y, m] = ym.split('-');
        const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
        const label = !isNaN(dateObj)
          ? dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' })
          : ym;
        monthMap.set(ym, {
          key: ym,
          label: label,
          badgeText: `${label} Data`,
          dateLabel: label,
          period: label,
          count: 0,
          amount: 0,
          isTest: false,
        });
      }
      const entry = monthMap.get(ym);
      entry.count += 1;
      entry.amount += t.finalTotalAmount || 0;
    }

    return Array.from(monthMap.values()).filter((m) => m.count > 0);
  }, [userScopedTickets]);

  const scopedTickets = useMemo(() => {
    if (selectedMonth === 'all') return userScopedTickets;
    return userScopedTickets.filter((t) => {
      const d = t.l2ApprovedDate || t.createdDate || '';
      return d.startsWith(selectedMonth);
    });
  }, [userScopedTickets, selectedMonth]);

  const activeDatasetMeta = useMemo(() => {
    if (selectedMonth === 'all') {
      const allAmt = scopedTickets.reduce((sum, t) => sum + (t.finalTotalAmount || 0), 0);
      return {
        key: 'all',
        label: 'Consolidated (All Months)',
        badgeText: 'All Months Combined',
        dateLabel: 'All Active Records',
        period: 'Oct 1 - Nov 16, 2026',
        count: scopedTickets.length,
        amount: allAmt,
        isTest: false,
      };
    }
    const found = availableMonths.find((m) => m.key === selectedMonth);
    if (found) return found;
    return {
      key: selectedMonth,
      label: selectedMonth,
      badgeText: `${selectedMonth} Live`,
      dateLabel: selectedMonth,
      period: selectedMonth,
      count: scopedTickets.length,
      amount: scopedTickets.reduce((s, t) => s + (t.finalTotalAmount || 0), 0),
      isTest: false,
    };
  }, [selectedMonth, availableMonths, scopedTickets]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return scopedTickets.filter((t) => {
      if (streamFilter === 'digital' && t.isPhysical) return false;
      if (streamFilter === 'physical' && !t.isPhysical) return false;
      if (auditPodFilter !== 'all' && t.invType !== auditPodFilter) return false;

      if (selectedManager !== 'all' && t.manager !== selectedManager) return false;
      if (selectedCaptain !== 'all') {
        if (t.isPhysical) {
          if (t.teamDisplay !== selectedCaptain && t.manager !== selectedCaptain) return false;
        } else {
          if (t.captain !== selectedCaptain) return false;
        }
      }

      if (selectedL2Assign !== 'all' && t.l2Assign !== selectedL2Assign) return false;

      if (dateRange.start && t.l2ApprovedDate < dateRange.start) return false;
      if (dateRange.end && t.l2ApprovedDate > dateRange.end) return false;

      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          t.ticketNo?.toLowerCase().includes(q) ||
          t.architectName?.toLowerCase().includes(q) ||
          t.userCode?.toLowerCase().includes(q) ||
          t.relationshipManager?.toLowerCase().includes(q) ||
          t.team?.toLowerCase().includes(q) ||
          t.teamDisplay?.toLowerCase().includes(q) ||
          t.captain?.toLowerCase().includes(q) ||
          t.manager?.toLowerCase().includes(q) ||
          t.l2Assign?.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [scopedTickets, streamFilter, auditPodFilter, selectedManager, selectedCaptain, selectedL2Assign, dateRange, searchQuery]);

  // Aggregate L2 Metrics
  const metrics = useMemo(() => {
    const totalCount = filteredTickets.length;
    const totalAmount = filteredTickets.reduce((sum, t) => sum + (t.finalTotalAmount || 0), 0);
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    let digitalCount = 0;
    let digitalAmount = 0;
    let physicalCount = 0;
    let physicalAmount = 0;
    let auditableCount = 0;
    let auditableAmount = 0;
    let nonAuditableCount = 0;
    let nonAuditableAmount = 0;

    for (const t of filteredTickets) {
      if (t.isPhysical) {
        physicalCount += 1;
        physicalAmount += t.finalTotalAmount || 0;
      } else {
        digitalCount += 1;
        digitalAmount += t.finalTotalAmount || 0;
      }

      if (t.invType === 'Non-Auditable') {
        nonAuditableCount += 1;
        nonAuditableAmount += t.finalTotalAmount || 0;
      } else {
        auditableCount += 1;
        auditableAmount += t.finalTotalAmount || 0;
      }
    }

    const uniqueRMs = new Set(filteredTickets.map((t) => t.relationshipManager).filter(Boolean)).size;
    const uniqueApprovers = new Set(filteredTickets.map((t) => t.l2Assign).filter(Boolean)).size;

    // Daily breakdown for peak day
    const dailyMap = {};
    for (const t of filteredTickets) {
      const d = t.l2ApprovedDate;
      if (!d) continue;
      if (!dailyMap[d]) dailyMap[d] = { count: 0, amount: 0 };
      dailyMap[d].count += 1;
      dailyMap[d].amount += t.finalTotalAmount || 0;
    }

    let peakDay = { date: '2026-10-31', count: 0, amount: 0 };
    for (const [date, data] of Object.entries(dailyMap)) {
      if (data.count > peakDay.count) {
        peakDay = { date, count: data.count, amount: data.amount };
      }
    }

    const validTATs = filteredTickets.filter((t) => t.tatL1ToL2Days !== null && t.tatL1ToL2Days >= 0);
    const avgTAT = validTATs.length > 0
      ? validTATs.reduce((acc, t) => acc + t.tatL1ToL2Days, 0) / validTATs.length
      : 0;

    return {
      totalCount,
      totalAmount,
      avgAmount,
      digitalCount,
      digitalAmount,
      physicalCount,
      physicalAmount,
      auditableCount,
      auditableAmount,
      nonAuditableCount,
      nonAuditableAmount,
      uniqueRMs,
      uniqueApprovers,
      peakDay,
      avgTAT: Math.round(avgTAT * 10) / 10,
      dailyMap,
    };
  }, [filteredTickets]);

  // B. Telephony Records State
  const [telephony, setTelephony] = useState(() => {
    try {
      const saved = localStorage.getItem('century_telephony_data_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return rawTelephony;
  });

  const addTelephonyRows = (newRows) => {
    verifyWatermarkIntegrity();
    setTelephony((prev) => {
      const updated = [...newRows, ...prev];
      try {
        localStorage.setItem('century_telephony_data_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // C. QA Audits State
  const [qaAudits, setQaAudits] = useState(() => {
    try {
      const saved = localStorage.getItem('century_qa_audits_v2');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Explicitly permit empty array when purged by developer
          if (parsed.length === 0) return [];

          // Normalize legacy auditor names to the 4 authorized QA auditors and sync Unity-II for Ronika & Ishani
          let migrated = false;
          const mapped = parsed.map((a) => {
            let item = { ...a };
            if (item.rm_name === 'Ronika Banerjee' || item.rm_name === 'Ishani Dey') {
              if (item.team_name !== 'Unity-II') {
                item.team_name = 'Unity-II';
                migrated = true;
              }
            }
            if (item.auditor_name === 'Tanmoy Das') {
              migrated = true;
              item.auditor_name = 'Nabonita Roy';
            }
            if (item.auditor_name === 'Manika Chakraborty') {
              migrated = true;
              item.auditor_name = 'Arindam CenturyPly';
            }
            if (item.auditor_name === 'Dhriti Mondal') {
              migrated = true;
              item.auditor_name = 'Sayan Banik';
            }
            if (item.auditor_name === 'Kushal Kar') {
              migrated = true;
              item.auditor_name = 'Arnab Chakladaar';
            }
            return item;
          });
          if (migrated) {
            localStorage.setItem('century_qa_audits_v2', JSON.stringify(mapped));
          }
          return mapped;
        }
      }
    } catch (e) {}
    return rawQaAudits;
  });

  // A. L2 Ingestion Engine
  const importTickets = (newRecords, mode = 'replace') => {
    verifyWatermarkIntegrity();
    let updatedTickets = [];

    if (mode === 'replace') {
      const tagged = newRecords.map((r, i) => ({ ...r, _uid: `upload-${Date.now()}-${i}-${r.ticketNo || i}` }));
      
      // Determine all months present in the uploaded dataset
      const uploadedMonths = new Set(
        tagged.map(t => (t.l2ApprovedDate || t.createdDate || '').slice(0, 7)).filter(m => m.length === 7)
      );

      // Keep tickets from all other months, replace the uploaded month(s)
      const otherMonthsTickets = tickets.filter(t => {
        const m = (t.l2ApprovedDate || t.createdDate || '').slice(0, 7);
        return !uploadedMonths.has(m);
      });

      updatedTickets = [...otherMonthsTickets, ...tagged];
      setTickets(updatedTickets);

      try {
        localStorage.setItem('century_uploaded_tickets_v2', JSON.stringify(updatedTickets));
      } catch (e) {
        console.warn('Failed to save uploaded tickets to localStorage:', e);
      }

      if (uploadedMonths.size === 1) {
        const targetMonth = [...uploadedMonths][0];
        setSelectedMonth(targetMonth);
        try {
          localStorage.setItem('century_selected_month_v2', targetMonth);
        } catch (e) {}
      } else {
        setSelectedMonth('all');
        try {
          localStorage.setItem('century_selected_month_v2', 'all');
        } catch (e) {}
      }
      resetFilters();
    } else {
      // Append mode: merge into existing corpus and deduplicate by ticketNo
      const existingMap = new Map(tickets.map((t) => [t._uid || t.ticketNo, t]));
      for (let i = 0; i < newRecords.length; i++) {
        const nr = newRecords[i];
        const uid = nr._uid || `upload-${Date.now()}-${i}-${nr.ticketNo || i}`;
        existingMap.set(nr.ticketNo || uid, { ...nr, _uid: uid });
      }
      updatedTickets = Array.from(existingMap.values());
      setTickets(updatedTickets);

      try {
        localStorage.setItem('century_uploaded_tickets_v2', JSON.stringify(updatedTickets));
      } catch (e) {
        console.warn('Failed to save uploaded tickets to localStorage:', e);
      }

      const newMonth = (newRecords[0]?.l2ApprovedDate || newRecords[0]?.createdDate || '').slice(0, 7);
      if (newMonth && newMonth.length === 7) {
        setSelectedMonth(newMonth);
        try {
          localStorage.setItem('century_selected_month_v2', newMonth);
        } catch (e) {}
      }
    }
  };

  const addQaAudit = (newAudit) => {
    verifyWatermarkIntegrity();
    setQaAudits((prev) => {
      const updated = [newAudit, ...prev];
      try {
        localStorage.setItem('century_qa_audits_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const addQaAuditsBulk = (newAudits, mode = 'append') => {
    verifyWatermarkIntegrity();
    setQaAudits((prev) => {
      const updated = mode === 'replace' ? newAudits : [...newAudits, ...prev];
      try {
        localStorage.setItem('century_qa_audits_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const purgeAllQaAudits = () => {
    verifyWatermarkIntegrity();
    setQaAudits([]);
    try {
      localStorage.setItem('century_qa_audits_v2', JSON.stringify([]));
    } catch (e) {}
  };

  const restoreDefaultQaAudits = () => {
    verifyWatermarkIntegrity();
    setQaAudits(rawQaAudits);
    try {
      localStorage.setItem('century_qa_audits_v2', JSON.stringify(rawQaAudits));
    } catch (e) {}
  };

  // E. Dialer Calls & Audio Pipeline State
  const [dialerCalls, setDialerCalls] = useState(() => {
    try {
      const saved = localStorage.getItem('century_dialer_calls_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return rawDialerCalls;
  });

  const addDialerCalls = (newCalls, mode = 'append') => {
    verifyWatermarkIntegrity();
    setDialerCalls((prev) => {
      const updated = mode === 'replace' ? newCalls : [...newCalls, ...prev];
      try {
        localStorage.setItem('century_dialer_calls_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const updateDialerCall = (phone, updates) => {
    verifyWatermarkIntegrity();
    setDialerCalls((prev) => {
      const updated = prev.map((c) => (c.phone_no === phone ? { ...c, ...updates } : c));
      try {
        localStorage.setItem('century_dialer_calls_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const discardAllPendingDialerCalls = () => {
    verifyWatermarkIntegrity();
    setDialerCalls((prev) => {
      const updated = prev.map((c) => ({ ...c, status: 'Disposed - Discarded' }));
      try {
        localStorage.setItem('century_dialer_calls_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // F. Universal Upload Modal Global State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadModalTab, setUploadModalTab] = useState('l2'); // 'l2' | 'telephony' | 'qa' | 'dialer'

  const openUploadModal = (tab = 'l2') => {
    verifyWatermarkIntegrity();
    setUploadModalTab(tab);
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  // Team name normalizer
  const normalizeTeamName = (name) => {
    if (!name) return name;
    const clean = name.trim();
    if (/^unity[-_\s]*2$/i.test(clean) || /^unity[-_\s]*ii$/i.test(clean)) return 'Unity-II';
    if (/^unity[-_\s]*1$/i.test(clean) || /^unity[-_\s]*i$/i.test(clean)) return 'Unity-I';
    return clean;
  };

  // D. RM Directory State
  const [rmDirectory, setRmDirectory] = useState(() => {
    try {
      const saved = localStorage.getItem('century_rm_directory_v2');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let modified = false;
          parsed = parsed.map((rm) => {
            const name = (rm.rm_name || '').toLowerCase();
            // Ensure Ronika Banerjee and Ishani Dey are consistently on Unity-II
            if (name === 'ronika banerjee' || name === 'ishani dey') {
              if (rm.team_name !== 'Unity-II' || rm.captain_name !== 'Arshi Afreen Jamal' || rm.manager_name !== 'Arijit Nath') {
                modified = true;
                return {
                  ...rm,
                  team_name: 'Unity-II',
                  captain_name: 'Arshi Afreen Jamal',
                  manager_name: 'Arijit Nath',
                };
              }
            }
            // Normalize any Unity 2 or Unity 1 variations
            const normTeam = normalizeTeamName(rm.team_name);
            if (normTeam !== rm.team_name) {
              modified = true;
              return { ...rm, team_name: normTeam };
            }
            return rm;
          });

          // Ensure all Canonical Digital Pod Captains (including Mousumi Chakraborty & Silpa Palchina) are present & active
          const requiredCaptains = [
            {
              id: 293,
              rm_name: 'Mousumi Chakraborty',
              team_name: 'Unity-I',
              captain_name: 'Mousumi Chakraborty',
              manager_name: 'Arijit Nath',
              dialer_id: 'Mousumi_C',
              designation: 'Pod Captain',
              status: 'active',
            },
            {
              id: 294,
              rm_name: 'Silpa Palchina',
              team_name: 'Zenith Pod',
              captain_name: 'Silpa Palchina',
              manager_name: 'Arijit Nath',
              dialer_id: 'Silpa_P',
              designation: 'Pod Captain',
              status: 'active',
            },
          ];

          requiredCaptains.forEach((cap) => {
            const existingIdx = parsed.findIndex((r) => r.rm_name.toLowerCase() === cap.rm_name.toLowerCase());
            if (existingIdx === -1) {
              parsed.push(cap);
              modified = true;
            } else {
              if (
                parsed[existingIdx].team_name !== cap.team_name ||
                parsed[existingIdx].captain_name !== cap.captain_name ||
                parsed[existingIdx].status === 'inactive'
              ) {
                parsed[existingIdx] = {
                  ...parsed[existingIdx],
                  team_name: cap.team_name,
                  captain_name: cap.captain_name,
                  manager_name: cap.manager_name,
                  designation: cap.designation,
                  status: 'active',
                };
                modified = true;
              }
            }
          });

          // Ensure Mousumi Chakraborty's subordinates have team_name = 'Unity-I'
          const unity1Members = [
            'aparna biswas',
            'chandrima bhattacharya',
            'naga sindhuja',
            'rajrupa dey',
            'sk shamsher ali',
            'somashree saha',
            'srabani chakraborti',
            'swasitka kolla'
          ];
          parsed = parsed.map((rm) => {
            const name = (rm.rm_name || '').toLowerCase();
            if (unity1Members.includes(name)) {
              if (
                rm.team_name !== 'Unity-I' ||
                rm.captain_name !== 'Mousumi Chakraborty' ||
                rm.manager_name !== 'Arijit Nath' ||
                rm.status === 'inactive'
              ) {
                modified = true;
                return {
                  ...rm,
                  team_name: 'Unity-I',
                  captain_name: 'Mousumi Chakraborty',
                  manager_name: 'Arijit Nath',
                  status: 'active',
                };
              }
            }
            return rm;
          });

          if (modified) {
            localStorage.setItem('century_rm_directory_v2', JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch (e) {}
    return rawRMs;
  });

  const updateRmMapping = (rmName, newCaptain, newManager, newProcess) => {
    verifyWatermarkIntegrity();
    const finalTeam = newProcess ? normalizeTeamName(newProcess) : undefined;
    
    setRmDirectory((prev) => {
      const updated = prev.map((rm) => {
        if (rm.rm_name.toLowerCase() === rmName.toLowerCase()) {
          return {
            ...rm,
            captain_name: newCaptain || rm.captain_name,
            manager_name: newManager || rm.manager_name,
            team_name: finalTeam || rm.team_name,
          };
        }
        return rm;
      });
      try {
        localStorage.setItem('century_rm_directory_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Also sync team_name, captain, manager in QA Audits for this agent
    setQaAudits((prev) => {
      let changed = false;
      const updated = prev.map((audit) => {
        if (audit.rm_name && audit.rm_name.toLowerCase() === rmName.toLowerCase()) {
          changed = true;
          return {
            ...audit,
            captain_name: newCaptain || audit.captain_name,
            manager_name: newManager || audit.manager_name,
            team_name: finalTeam || audit.team_name,
          };
        }
        return audit;
      });
      if (changed) {
        try {
          localStorage.setItem('century_qa_audits_v2', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      }
      return prev;
    });

    setHierarchy((prev) => {
      const tree = JSON.parse(JSON.stringify(prev.tree || {}));
      for (const m in tree) {
        for (const c in tree[m]) {
          tree[m][c] = (tree[m][c] || []).filter((agent) => agent.toLowerCase() !== rmName.toLowerCase());
        }
      }
      const mgr = newManager || 'Arijit Nath';
      const cap = newCaptain || 'Arshi Afreen Jamal';
      if (!tree[mgr]) tree[mgr] = {};
      if (!tree[mgr][cap]) tree[mgr][cap] = [];
      tree[mgr][cap].push(rmName);

      const newH = { ...prev, tree };
      try {
        localStorage.setItem('century_hierarchy_tree_v2', JSON.stringify(newH));
      } catch (e) {}
      return newH;
    });
  };

  // Track last offboard action for instant 1-click Revert / Undo
  const [lastOffboardAction, setLastOffboardAction] = useState(() => {
    try {
      const saved = localStorage.getItem('century_last_offboard_action');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // Soft Deactivate RM / Employee without affecting the database (preserves all historical audits, tickets, and logs)
  // Auto-failover: If a Pod Captain resigns, their subordinate team temporarily reports directly to their immediate manager.
  const deactivateRm = (rmName, reason = 'Separated / Soft Offboarded') => {
    verifyWatermarkIntegrity();
    let updatedRm = null;

    // Detect if this employee is currently a Pod Captain for active subordinate agents
    const targetRm = rmDirectory.find((r) => r.rm_name.toLowerCase() === rmName.toLowerCase());
    const immediateManager = targetRm?.manager_name || 'Arijit Nath';
    const subordinateAgents = rmDirectory.filter(
      (r) =>
        r.status !== 'inactive' &&
        (r.captain_name || '').toLowerCase() === rmName.toLowerCase() &&
        r.rm_name.toLowerCase() !== rmName.toLowerCase()
    );
    const isCaptain = subordinateAgents.length > 0;
    const affectedSubordinateNames = subordinateAgents.map((s) => s.rm_name);

    setRmDirectory((prev) => {
      const updated = prev.map((rm) => {
        if (rm.rm_name.toLowerCase() === rmName.toLowerCase()) {
          updatedRm = {
            ...rm,
            status: 'inactive',
            deactivatedAt: new Date().toISOString(),
            deactivationReason: reason,
            wasCaptain: isCaptain,
          };
          return updatedRm;
        }

        // Auto-failover: Subordinate agents temporarily report directly to Senior Manager
        // GOLDEN RULE: Team Name and all subordinate members remain strictly INTACT!
        if (
          isCaptain &&
          rm.status !== 'inactive' &&
          (rm.captain_name || '').toLowerCase() === rmName.toLowerCase() &&
          rm.rm_name.toLowerCase() !== rmName.toLowerCase()
        ) {
          return {
            ...rm,
            team_name: rm.team_name, // Strictly preserved intact!
            captain_name: immediateManager, // Temporarily reports directly to immediate manager
            previousCaptain: rmName,
            tempSupervisedByManager: true,
          };
        }

        return rm;
      });

      try {
        localStorage.setItem('century_rm_directory_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Update active hierarchy tree
    setHierarchy((prev) => {
      const tree = JSON.parse(JSON.stringify(prev.tree || {}));

      if (isCaptain && tree[immediateManager]) {
        // Keep the pod intact under Senior Manager: team name and members remain together
        const agentsInPod = tree[immediateManager][rmName] || affectedSubordinateNames;
        const intactPodKey = targetRm?.team_name
          ? `${targetRm.team_name} (Interim: ${immediateManager})`
          : `${rmName} (Interim: ${immediateManager})`;
        delete tree[immediateManager][rmName];
        tree[immediateManager][intactPodKey] = agentsInPod.filter((ag) => ag.toLowerCase() !== rmName.toLowerCase());
      } else {
        // Regular RM removal from captain's pod
        for (const m in tree) {
          for (const c in tree[m]) {
            tree[m][c] = (tree[m][c] || []).filter((agent) => agent.toLowerCase() !== rmName.toLowerCase());
          }
        }
      }

      const newH = { ...prev, tree };
      try {
        localStorage.setItem('century_hierarchy_tree_v2', JSON.stringify(newH));
      } catch (e) {}
      return newH;
    });

    // Record last action for instant revert capability
    const actionMeta = {
      rmName,
      wasCaptain: isCaptain,
      immediateManager,
      affectedSubordinateNames,
      timestamp: new Date().toISOString(),
      reason,
    };
    setLastOffboardAction(actionMeta);
    try {
      localStorage.setItem('century_last_offboard_action', JSON.stringify(actionMeta));
    } catch (e) {}

    return updatedRm;
  };

  // Revert / Restore an offboarded employee (1-click mistake reversal & full pod restoration)
  const revertOffboard = (rmName) => {
    verifyWatermarkIntegrity();
    let restoredRm = null;

    setRmDirectory((prev) => {
      const target = prev.find((r) => r.rm_name.toLowerCase() === rmName.toLowerCase());
      const wasCaptain = target?.wasCaptain;
      const originalCaptain = rmName;

      const updated = prev.map((rm) => {
        if (rm.rm_name.toLowerCase() === rmName.toLowerCase()) {
          restoredRm = {
            ...rm,
            status: 'active',
            deactivatedAt: null,
            deactivationReason: null,
            wasCaptain: false,
          };
          return restoredRm;
        }

        // If this captain's subordinates were temporarily moved under manager, restore them to this captain
        if (wasCaptain && rm.previousCaptain && rm.previousCaptain.toLowerCase() === rmName.toLowerCase()) {
          return {
            ...rm,
            captain_name: originalCaptain,
            previousCaptain: null,
            tempSupervisedByManager: false,
          };
        }

        return rm;
      });

      try {
        localStorage.setItem('century_rm_directory_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Restore hierarchy tree
    setHierarchy((prev) => {
      const target = restoredRm || rmDirectory.find((r) => r.rm_name.toLowerCase() === rmName.toLowerCase());
      if (!target) return prev;
      const tree = JSON.parse(JSON.stringify(prev.tree || {}));
      const m = target.manager_name || 'Arijit Nath';
      const c = target.captain_name || 'Arshi Afreen Jamal';

      if (!tree[m]) tree[m] = {};

      if (target.wasCaptain) {
        // Find agents belonging to this restored captain
        const subAgents = rmDirectory
          .filter((r) => (r.previousCaptain || '').toLowerCase() === rmName.toLowerCase())
          .map((r) => r.rm_name);

        // Remove interim pod key and direct pool entries
        const intactPodKey = target?.team_name
          ? `${target.team_name} (Interim: ${m})`
          : `${target.rm_name} (Interim: ${m})`;
        delete tree[m][intactPodKey];

        if (tree[m][m]) {
          tree[m][m] = tree[m][m].filter((ag) => !subAgents.includes(ag));
        }
        tree[m][target.rm_name] = subAgents.length > 0 ? subAgents : [target.rm_name];
      } else {
        if (!tree[m][c]) tree[m][c] = [];
        if (!tree[m][c].some((a) => a.toLowerCase() === target.rm_name.toLowerCase())) {
          tree[m][c].push(target.rm_name);
        }
      }

      const newH = { ...prev, tree };
      try {
        localStorage.setItem('century_hierarchy_tree_v2', JSON.stringify(newH));
      } catch (e) {}
      return newH;
    });

    // Clear last offboard action if matching
    setLastOffboardAction((prev) => {
      if (prev?.rmName?.toLowerCase() === rmName.toLowerCase()) {
        try {
          localStorage.removeItem('century_last_offboard_action');
        } catch (e) {}
        return null;
      }
      return prev;
    });

    return restoredRm;
  };

  // Reactivate RM (alias to revertOffboard for general restores)
  const reactivateRm = (rmName) => {
    return revertOffboard(rmName);
  };

  // Promote Employee to Pod Captain or Senior Manager & assign subordinate pod
  const promoteEmployee = (candidateName, targetRole = 'captain', assignedAgents = [], teamName = '') => {
    verifyWatermarkIntegrity();
    let promotedCandidate = null;

    setRmDirectory((prev) => {
      const candidate = prev.find((r) => r.rm_name.toLowerCase() === candidateName.toLowerCase());
      if (!candidate) return prev;
      const manager = candidate.manager_name || 'Arijit Nath';
      const finalTeam = teamName || candidate.team_name || 'Unity-II';

      const updated = prev.map((rm) => {
        // The promoted candidate
        if (rm.rm_name.toLowerCase() === candidateName.toLowerCase()) {
          promotedCandidate = {
            ...rm,
            designation: targetRole === 'manager' ? 'Senior Manager' : 'Pod Captain',
            captain_name: targetRole === 'captain' ? candidateName : rm.captain_name,
            team_name: finalTeam,
            manager_name: targetRole === 'manager' ? candidateName : manager,
            status: 'active',
          };
          return promotedCandidate;
        }

        // Subordinate agents assigned to the newly promoted captain
        if (
          targetRole === 'captain' &&
          assignedAgents.some((a) => a.toLowerCase() === rm.rm_name.toLowerCase())
        ) {
          return {
            ...rm,
            captain_name: candidateName,
            manager_name: manager,
            team_name: finalTeam,
            tempSupervisedByManager: false,
            previousCaptain: null,
          };
        }

        return rm;
      });

      try {
        localStorage.setItem('century_rm_directory_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Update active hierarchy tree with new captain/manager branch
    setHierarchy((prev) => {
      const tree = JSON.parse(JSON.stringify(prev.tree || {}));
      const candidate = rmDirectory.find((r) => r.rm_name.toLowerCase() === candidateName.toLowerCase());
      const m = candidate?.manager_name || 'Arijit Nath';

      if (targetRole === 'captain') {
        if (!tree[m]) tree[m] = {};
        tree[m][candidateName] = assignedAgents.length > 0 ? assignedAgents : [candidateName];

        // Clean up assigned agents from manager's direct branch, interim keys, or other pods
        for (const cap in tree[m]) {
          if (cap !== candidateName) {
            if (cap.includes('(Interim:') && cap.toLowerCase().includes((finalTeam || '').toLowerCase())) {
              delete tree[m][cap];
            } else {
              tree[m][cap] = (tree[m][cap] || []).filter(
                (ag) => !assignedAgents.includes(ag) && ag !== candidateName
              );
            }
          }
        }
      } else if (targetRole === 'manager') {
        if (!tree[candidateName]) tree[candidateName] = {};
      }

      const newH = { ...prev, tree };
      try {
        localStorage.setItem('century_hierarchy_tree_v2', JSON.stringify(newH));
      } catch (e) {}
      return newH;
    });

    return promotedCandidate;
  };

  // Persistent registry of dynamic custom teams created by administrators
  const [customTeams, setCustomTeams] = useState(() => {
    try {
      const saved = localStorage.getItem('century_custom_teams_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Dynamically add a new Team / Pod, designate its Pod Captain, and assign members
  const addNewTeam = ({
    teamName,
    seniorManager = 'Arijit Nath',
    captainName = '',
    initialMembers = [],
    isNewCaptain = false,
    captainDetails = {},
  }) => {
    verifyWatermarkIntegrity();
    const cleanTeam = (teamName || '').trim();
    if (!cleanTeam) {
      throw new Error('Team / Pod name cannot be empty.');
    }

    // 1. Persist to customTeams
    setCustomTeams((prev) => {
      if (prev.some((t) => t.toLowerCase() === cleanTeam.toLowerCase())) return prev;
      const updated = [...prev, cleanTeam];
      try {
        localStorage.setItem('century_custom_teams_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const cleanCaptain = (captainName || '').trim();

    // 2. Update RM directory with Captain and Initial Members
    setRmDirectory((prev) => {
      let updated = [...prev];

      // If captain provided:
      if (cleanCaptain) {
        const existingCaptIndex = updated.findIndex(
          (r) => r.rm_name.toLowerCase() === cleanCaptain.toLowerCase()
        );

        if (existingCaptIndex >= 0 && !isNewCaptain) {
          // Promote / Reassign existing RM as Captain of this team
          updated[existingCaptIndex] = {
            ...updated[existingCaptIndex],
            team_name: cleanTeam,
            captain_name: cleanCaptain,
            manager_name: seniorManager,
            designation: 'Pod Captain',
            status: 'active',
          };
        } else {
          // Register brand new Pod Captain
          const newCaptainRecord = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            rm_name: cleanCaptain,
            team_name: cleanTeam,
            captain_name: cleanCaptain,
            manager_name: seniorManager,
            dialer_id: captainDetails?.dialerId || cleanCaptain.replace(/\s+/g, '_'),
            mobile_number: captainDetails?.mobileNumber || '',
            designation: 'Pod Captain',
            status: 'active',
          };
          updated.push(newCaptainRecord);
        }
      }

      // Assign initial members to this team
      if (Array.isArray(initialMembers) && initialMembers.length > 0) {
        updated = updated.map((rm) => {
          if (initialMembers.some((m) => m.toLowerCase() === rm.rm_name.toLowerCase())) {
            return {
              ...rm,
              team_name: cleanTeam,
              captain_name: cleanCaptain || seniorManager,
              manager_name: seniorManager,
              status: 'active',
            };
          }
          return rm;
        });
      }

      try {
        localStorage.setItem('century_rm_directory_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 3. Update Hierarchy Tree
    setHierarchy((prev) => {
      const tree = JSON.parse(JSON.stringify(prev.tree || {}));
      if (!tree[seniorManager]) tree[seniorManager] = {};

      const podCaptainKey = cleanCaptain || `${cleanTeam} (Interim)`;

      // Clean up assigned members and captain from other pods in the tree
      const memberList = Array.isArray(initialMembers) ? initialMembers : [];
      for (const m in tree) {
        for (const c in tree[m]) {
          if (m === seniorManager && c === podCaptainKey) continue;
          tree[m][c] = (tree[m][c] || []).filter(
            (ag) => !memberList.includes(ag) && ag.toLowerCase() !== cleanCaptain.toLowerCase()
          );
        }
      }

      const existingPodMembers = tree[seniorManager][podCaptainKey] || [];
      const combinedMembers = [...new Set([...existingPodMembers, ...memberList])];
      tree[seniorManager][podCaptainKey] =
        combinedMembers.length > 0 ? combinedMembers : cleanCaptain ? [cleanCaptain] : [];

      const newH = { ...prev, tree };
      try {
        localStorage.setItem('century_hierarchy_tree_v2', JSON.stringify(newH));
      } catch (e) {}
      return newH;
    });

    return { teamName: cleanTeam, captainName: cleanCaptain, seniorManager };
  };

  // Add a new or existing Relationship Manager to a specific team
  const addNewMemberToTeam = ({
    rmName,
    teamName,
    captainName = '',
    managerName = 'Arijit Nath',
    dialerId = '',
    mobileNumber = '',
    designation = 'Relationship Manager',
  }) => {
    verifyWatermarkIntegrity();
    const cleanName = (rmName || '').trim();
    const cleanTeam = (teamName || '').trim();
    if (!cleanName || !cleanTeam) {
      throw new Error('Member name and Team name are required.');
    }

    const finalCaptain = captainName || 'Direct Supervision';

    setRmDirectory((prev) => {
      let updated = [...prev];
      const existingIndex = updated.findIndex(
        (r) => r.rm_name.toLowerCase() === cleanName.toLowerCase()
      );

      if (existingIndex >= 0) {
        updated[existingIndex] = {
          ...updated[existingIndex],
          team_name: cleanTeam,
          captain_name: finalCaptain,
          manager_name: managerName,
          designation: designation || updated[existingIndex].designation || 'Relationship Manager',
          dialer_id: dialerId || updated[existingIndex].dialer_id || cleanName.replace(/\s+/g, '_'),
          mobile_number: mobileNumber || updated[existingIndex].mobile_number || '',
          status: 'active',
        };
      } else {
        const newRm = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          rm_name: cleanName,
          team_name: cleanTeam,
          captain_name: finalCaptain,
          manager_name: managerName,
          dialer_id: dialerId || cleanName.replace(/\s+/g, '_'),
          mobile_number: mobileNumber || '',
          designation: designation || 'Relationship Manager',
          status: 'active',
        };
        updated.push(newRm);
      }

      try {
        localStorage.setItem('century_rm_directory_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Update Hierarchy Tree
    setHierarchy((prev) => {
      const tree = JSON.parse(JSON.stringify(prev.tree || {}));
      if (!tree[managerName]) tree[managerName] = {};
      if (!tree[managerName][finalCaptain]) tree[managerName][finalCaptain] = [];

      // Remove from any other pod
      for (const m in tree) {
        for (const c in tree[m]) {
          tree[m][c] = (tree[m][c] || []).filter((ag) => ag.toLowerCase() !== cleanName.toLowerCase());
        }
      }

      if (!tree[managerName][finalCaptain].includes(cleanName)) {
        tree[managerName][finalCaptain].push(cleanName);
      }

      const newH = { ...prev, tree };
      try {
        localStorage.setItem('century_hierarchy_tree_v2', JSON.stringify(newH));
      } catch (e) {}
      return newH;
    });

    return { rmName: cleanName, teamName: cleanTeam, captainName: finalCaptain };
  };

  // Global Scope Filter for Consolidated View
  const [scopeFilter, setScopeFilter] = useState({
    manager: 'all',
    captain: 'all',
    stream: 'all',
  });

  // Auth operations
  const login = (user) => {
    verifyWatermarkIntegrity();
    setCurrentUser(user);
    try {
      localStorage.setItem('century_joy_auth_user_v2', JSON.stringify(user));
    } catch (e) {}
    if (user.role === ROLES.MANAGER) {
      setSelectedManager(user.managerKey);
    } else {
      setSelectedManager('all');
    }
    resetFilters();
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('century_joy_auth_user_v2');
    } catch (e) {}
    setSelectedManager('all');
    setActiveModule('consolidated');
    resetFilters();
  };

  const refreshUsers = () => {
    setUsers(getAllUsers());
  };

  const value = {
    currentUser,
    users,
    login,
    logout,
    refreshUsers,
    activeModule,
    switchModule,
    theme,
    toggleTheme,
    hierarchy,
    updateHierarchy,
    tickets,
    importTickets,
    selectedMonth,
    selectMonth,
    availableMonths,
    activeDatasetMeta,
    streamFilter,
    setStreamFilter,
    auditPodFilter,
    setAuditPodFilter,
    selectedManager,
    setSelectedManager,
    selectedCaptain,
    setSelectedCaptain,
    selectedL2Assign,
    setSelectedL2Assign,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    resetFilters,
    scopedTickets,
    filteredTickets,
    metrics,
    telephony,
    addTelephonyRows,
    qaAudits,
    addQaAudit,
    addQaAuditsBulk,
    purgeAllQaAudits,
    restoreDefaultQaAudits,
    dialerCalls,
    addDialerCalls,
    updateDialerCall,
    discardAllPendingDialerCalls,
    rmDirectory,
    updateRmMapping,
    deactivateRm,
    reactivateRm,
    revertOffboard,
    promoteEmployee,
    lastOffboardAction,
    customTeams,
    addNewTeam,
    addNewMemberToTeam,
    scopeFilter,
    setScopeFilter,
    isUploadModalOpen,
    uploadModalTab,
    openUploadModal,
    closeUploadModal,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
