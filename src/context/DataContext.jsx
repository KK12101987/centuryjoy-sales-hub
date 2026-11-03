import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import initialTickets from '../data/initialData.json';
import { verifyWatermarkIntegrity } from '../utils/integrity';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('century_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [theme, setTheme] = useState(() => {
    // Default to Option 2 CenturyPly Enterprise Clean Light theme
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
    resetFilters();
  };

  // Base tickets dynamically scoped to the logged in user
  const scopedTickets = useMemo(() => {
    if (!currentUser) return tickets;
    if (currentUser.role === 'manager') {
      return tickets.filter(t => t.manager === currentUser.managerKey);
    }
    return tickets;
  }, [tickets, currentUser]);

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
  }, [tickets, streamFilter, auditPodFilter, selectedManager, selectedCaptain, selectedL2Assign, searchQuery]);

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

  // Memoized Filtered Dataset
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
      if (searchQuery.trim()) {
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

  const importTickets = (newRecords, mode = 'replace') => {
    verifyWatermarkIntegrity();
    if (mode === 'replace') {
      setTickets(newRecords);
    } else {
      const existingMap = new Map(tickets.map((t) => [t.ticketNo, t]));
      for (const nr of newRecords) {
        existingMap.set(nr.ticketNo, nr);
      }
      setTickets(Array.from(existingMap.values()));
    }
  };

  return (
    <DataContext.Provider
      value={{
        tickets,
        scopedTickets,
        filteredTickets,
        metrics,
        currentUser,
        login,
        logout,
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
        importTickets
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
