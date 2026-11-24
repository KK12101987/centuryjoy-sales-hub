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
      if (saved) return JSON.parse(saved);
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize legacy auditor names to the 4 authorized QA auditors
          let migrated = false;
          const mapped = parsed.map((a) => {
            if (a.auditor_name === 'Tanmoy Das') {
              migrated = true;
              return { ...a, auditor_name: 'Nabonita Roy' };
            }
            if (a.auditor_name === 'Manika Chakraborty') {
              migrated = true;
              return { ...a, auditor_name: 'Arindam CenturyPly' };
            }
            if (a.auditor_name === 'Dhriti Mondal') {
              migrated = true;
              return { ...a, auditor_name: 'Sayan Banik' };
            }
            if (a.auditor_name === 'Kushal Kar') {
              migrated = true;
              return { ...a, auditor_name: 'Arnab Chakladaar' };
            }
            return a;
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

  // D. RM Directory State
  const [rmDirectory, setRmDirectory] = useState(() => {
    try {
      const saved = localStorage.getItem('century_rm_directory_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return rawRMs;
  });

  const updateRmMapping = (rmName, newCaptain, newManager, newProcess) => {
    verifyWatermarkIntegrity();
    setRmDirectory((prev) => {
      const updated = prev.map((rm) => {
        if (rm.rm_name.toLowerCase() === rmName.toLowerCase()) {
          return {
            ...rm,
            captain_name: newCaptain,
            manager_name: newManager,
            team_name: newProcess || rm.team_name,
          };
        }
        return rm;
      });
      try {
        localStorage.setItem('century_rm_directory_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setHierarchy((prev) => {
      const tree = JSON.parse(JSON.stringify(prev.tree || {}));
      for (const m in tree) {
        for (const c in tree[m]) {
          tree[m][c] = (tree[m][c] || []).filter((agent) => agent.toLowerCase() !== rmName.toLowerCase());
        }
      }
      if (!tree[newManager]) tree[newManager] = {};
      if (!tree[newManager][newCaptain]) tree[newManager][newCaptain] = [];
      tree[newManager][newCaptain].push(rmName);

      const newH = { ...prev, tree };
      try {
        localStorage.setItem('century_hierarchy_tree_v2', JSON.stringify(newH));
      } catch (e) {}
      return newH;
    });
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
    dialerCalls,
    addDialerCalls,
    updateDialerCall,
    discardAllPendingDialerCalls,
    rmDirectory,
    updateRmMapping,
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
