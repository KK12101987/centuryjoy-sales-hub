import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import initialTickets from '../data/initialData.json';
import novemberTickets from '../data/novemberData.json';
import { verifyWatermarkIntegrity } from '../utils/integrity';

// Unified default ticket corpus combining baseline October (2,688) & November (326)
const DEFAULT_ALL_TICKETS = [
  ...initialTickets.map((t, idx) => ({ ...t, _uid: `oct-${idx}-${t.ticketNo}` })),
  ...novemberTickets.map((t, idx) => ({ ...t, _uid: `nov-${idx}-${t.ticketNo}` }))
];

export const AVAILABLE_DATASETS = {
  october: {
    id: 'october',
    name: 'October 2026 Live',
    badgeText: 'October 2026 Live',
    dateLabel: 'October 2026',
    shortLabel: 'Oct 2026',
    period: 'Oct 1 - Oct 31, 2026',
    ticketsCount: 2688,
    amountFormatted: '₹40.50 Cr',
    tickets: initialTickets,
    isTest: false
  },
  november: {
    id: 'november',
    name: 'November 2026 Live',
    badgeText: 'November 2026 Live',
    dateLabel: 'November 2026',
    shortLabel: 'Nov 2026',
    period: 'Nov 2 - Nov 16, 2026',
    ticketsCount: 326,
    amountFormatted: '₹5.14 Cr',
    tickets: novemberTickets,
    isTest: false
  }
};

const DataContext = createContext(null);

export function DataProvider({ children }) {
  // Master tickets state
  const [tickets, setTickets] = useState(() => {
    return DEFAULT_ALL_TICKETS;
  });

  // Selected Month state: '2026-10' | '2026-11' | 'all' | other YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(() => {
    try {
      const saved = localStorage.getItem('century_selected_month_v2');
      if (saved) return saved;
      const oldDs = localStorage.getItem('century_active_dataset');
      if (oldDs === 'november') return '2026-11';
      if (oldDs === 'october') return '2026-10';
    } catch (e) {}
    return '2026-10'; // Default to October 2026 Live baseline
  });

  const selectMonth = (monthKey) => {
    setSelectedMonth(monthKey);
    try {
      localStorage.setItem('century_selected_month_v2', monthKey);
    } catch (e) {}
  };

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('century_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'user-access'

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('century_theme_v2') || 'light';
  });

  // Filter States
  const [streamFilter, setStreamFilter] = useState('all'); // 'all', 'digital', 'physical'
  const [auditPodFilter, setAuditPodFilter] = useState('all'); // 'all', 'Auditable', 'Non-Auditable'
  const [selectedManager, setSelectedManager] = useState('all');
  const [selectedCaptain, setSelectedCaptain] = useState('all');
  const [selectedL2Assign, setSelectedL2Assign] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Handle Authentication login / logout
  const login = (user) => {
    try {
      sessionStorage.setItem('century_auth_user', JSON.stringify(user));
    } catch (e) {}
    setCurrentUser(user);
    if (user.role === 'manager') {
      setSelectedManager(user.managerKey);
    } else {
      setSelectedManager('all');
    }
    resetFilters();
  };

  const logout = () => {
    try {
      sessionStorage.removeItem('century_auth_user');
    } catch (e) {}
    setCurrentUser(null);
    setSelectedManager('all');
    setActiveView('dashboard');
    resetFilters();
  };

  // Base tickets scoped strictly to the logged-in user profile
  const userScopedTickets = useMemo(() => {
    if (!currentUser) return tickets;
    if (currentUser.role === 'manager') {
      return tickets.filter(t => t.manager === currentUser.managerKey);
    }
    return tickets;
  }, [tickets, currentUser]);

  // Dynamically compute available months from userScopedTickets
  const availableMonths = useMemo(() => {
    const monthMap = new Map();

    // Default predefined descriptors
    monthMap.set('2026-10', {
      key: '2026-10',
      label: 'October 2026',
      badgeText: 'October 2026 Live',
      dateLabel: 'October 2026',
      period: 'Oct 1 - Oct 31, 2026',
      count: 0,
      amount: 0,
      isTest: false
    });

    monthMap.set('2026-11', {
      key: '2026-11',
      label: 'November 2026',
      badgeText: 'November 2026 Live',
      dateLabel: 'November 2026',
      period: 'Nov 2 - Nov 16, 2026',
      count: 0,
      amount: 0,
      isTest: false
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
          isTest: false
        });
      }
      const entry = monthMap.get(ym);
      entry.count += 1;
      entry.amount += (t.finalTotalAmount || 0);
    }

    return Array.from(monthMap.values()).filter(m => m.count > 0);
  }, [userScopedTickets]);

  // scopedTickets is NOW strictly scoped to BOTH logged-in user AND selectedMonth!
  const scopedTickets = useMemo(() => {
    if (selectedMonth === 'all') return userScopedTickets;
    return userScopedTickets.filter((t) => {
      const ym = (t.l2ApprovedDate || t.createdDate || '').slice(0, 7);
      return ym === selectedMonth;
    });
  }, [userScopedTickets, selectedMonth]);

  // Scoped counts for streams and audit pods within the active month
  const scopedStreamCounts = useMemo(() => {
    let digital = 0;
    let physical = 0;
    for (const t of scopedTickets) {
      if (t.isPhysical) physical += 1;
      else digital += 1;
    }
    return { digital, physical };
  }, [scopedTickets]);

  const scopedAuditCounts = useMemo(() => {
    let auditable = 0;
    let nonAuditable = 0;
    for (const t of scopedTickets) {
      if (t.invType === 'Non-Auditable') nonAuditable += 1;
      else auditable += 1;
    }
    return { auditable, nonAuditable };
  }, [scopedTickets]);

  // Active Month Information
  const activeMonthInfo = useMemo(() => {
    if (selectedMonth === 'all') {
      const totalAmt = userScopedTickets.reduce((sum, t) => sum + (t.finalTotalAmount || 0), 0);
      return {
        key: 'all',
        label: 'All Months',
        badgeText: 'All Months Consolidated',
        dateLabel: 'Consolidated Period',
        period: 'All Active Records',
        count: userScopedTickets.length,
        amount: totalAmt,
        isTest: false
      };
    }
    const found = availableMonths.find(m => m.key === selectedMonth);
    return found || availableMonths[0] || {
      key: '2026-10',
      label: 'October 2026',
      badgeText: 'October 2026 Live',
      dateLabel: 'October 2026',
      period: 'Oct 1 - Oct 31, 2026',
      count: 0,
      amount: 0,
      isTest: false
    };
  }, [selectedMonth, availableMonths, userScopedTickets]);

  // Handle Theme switching
  useEffect(() => {
    localStorage.setItem('century_theme_v2', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Rule 19 Anti-Tamper check on state changes
  useEffect(() => {
    verifyWatermarkIntegrity();
  }, [tickets, selectedMonth, streamFilter, auditPodFilter, selectedManager, selectedCaptain, selectedL2Assign, searchQuery]);

  const handleManagerSelect = (mgr) => {
    setSelectedManager(mgr);
    setSelectedCaptain('all');
  };

  const resetFilters = () => {
    setStreamFilter('all');
    setAuditPodFilter('all');
    setSelectedManager('all');
    setSelectedCaptain('all');
    setSelectedL2Assign('all');
    setSearchQuery('');
    setDateRange({ start: '', end: '' });
  };

  // Memoized Filtered Dataset (scopedTickets further filtered by streams, pods, managers, search)
  const filteredTickets = useMemo(() => {
    return scopedTickets.filter((t) => {
      // Stream Filter (Digital vs Physical)
      if (streamFilter === 'digital' && t.isPhysical) return false;
      if (streamFilter === 'physical' && !t.isPhysical) return false;

      // Audit Pod Filter (Auditable vs Non-Auditable)
      if (auditPodFilter !== 'all' && t.invType !== auditPodFilter) return false;

      // Manager & Captain Filter
      if (selectedManager !== 'all' && t.manager !== selectedManager) return false;
      if (selectedCaptain !== 'all') {
        if (t.isPhysical) {
          if (t.teamDisplay !== selectedCaptain && t.manager !== selectedCaptain) return false;
        } else {
          if (t.captain !== selectedCaptain) return false;
        }
      }

      // Reviewer filter
      if (selectedL2Assign !== 'all' && t.l2Assign !== selectedL2Assign) return false;

      // Date Range
      if (dateRange.start && t.l2ApprovedDate < dateRange.start) return false;
      if (dateRange.end && t.l2ApprovedDate > dateRange.end) return false;

      // Search Query
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

  // Aggregate Key Metrics
  const metrics = useMemo(() => {
    const totalCount = filteredTickets.length;
    const totalAmount = filteredTickets.reduce((sum, t) => sum + (t.finalTotalAmount || 0), 0);
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    // Digital vs Physical
    let digitalCount = 0;
    let digitalAmount = 0;
    let physicalCount = 0;
    let physicalAmount = 0;

    // Auditable vs Non-Auditable
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

    let peakDay = { date: 'N/A', count: 0, amount: 0 };
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
      dailyMap
    };
  }, [filteredTickets]);

  // Backward-compatible dataset select
  const selectDataset = (datasetId) => {
    if (datasetId === 'november') {
      selectMonth('2026-11');
    } else if (datasetId === 'october') {
      selectMonth('2026-10');
    } else {
      selectMonth(datasetId);
    }
  };

  const importTickets = (newRecords, mode = 'replace') => {
    verifyWatermarkIntegrity();
    if (mode === 'replace') {
      const tagged = newRecords.map((r, i) => ({ ...r, _uid: `upload-${i}-${r.ticketNo}` }));
      setTickets(tagged);
      const firstMonth = (tagged[0]?.l2ApprovedDate || tagged[0]?.createdDate || '').slice(0, 7);
      if (firstMonth && firstMonth.length === 7) {
        setSelectedMonth(firstMonth);
      } else {
        setSelectedMonth('all');
      }
      resetFilters();
    } else {
      // Append mode: merge into existing corpus
      const existingMap = new Map(tickets.map((t) => [t._uid || t.ticketNo, t]));
      for (let i = 0; i < newRecords.length; i++) {
        const nr = newRecords[i];
        const uid = nr._uid || `upload-${i}-${nr.ticketNo}`;
        existingMap.set(uid, { ...nr, _uid: uid });
      }
      const updated = Array.from(existingMap.values());
      setTickets(updated);
      const newMonth = (newRecords[0]?.l2ApprovedDate || newRecords[0]?.createdDate || '').slice(0, 7);
      if (newMonth && newMonth.length === 7) {
        setSelectedMonth(newMonth);
      }
    }
  };

  return (
    <DataContext.Provider
      value={{
        tickets,
        userScopedTickets,
        scopedTickets,
        scopedStreamCounts,
        scopedAuditCounts,
        filteredTickets,
        metrics,
        currentUser,
        login,
        logout,
        activeView,
        setActiveView,
        theme,
        toggleTheme,
        streamFilter,
        setStreamFilter,
        auditPodFilter,
        setAuditPodFilter,
        selectedManager,
        setSelectedManager: handleManagerSelect,
        selectedCaptain,
        setSelectedCaptain,
        selectedL2Assign,
        setSelectedL2Assign,
        searchQuery,
        setSearchQuery,
        dateRange,
        setDateRange,
        resetFilters,
        importTickets,
        // Month Selector API
        selectedMonth,
        setSelectedMonth,
        selectMonth,
        availableMonths,
        activeMonthInfo,
        // Backwards compatibility API
        availableDatasets: Object.values(AVAILABLE_DATASETS),
        selectedDatasetId: selectedMonth === '2026-11' ? 'november' : 'october',
        activeDataset: activeMonthInfo,
        selectDataset
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
