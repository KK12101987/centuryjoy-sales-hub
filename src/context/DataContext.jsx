import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import initialTickets from '../data/initialData.json';
import { verifyWatermarkIntegrity } from '../utils/integrity';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedManager, setSelectedManager] = useState('all');
  const [selectedCaptain, setSelectedCaptain] = useState('all');
  const [selectedL2Assign, setSelectedL2Assign] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedAudit, setSelectedAudit] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Security & Anti-tamper verification coupled to state updates
  useEffect(() => {
    verifyWatermarkIntegrity();
  }, [tickets, selectedManager, selectedCaptain, selectedL2Assign, searchQuery]);

  // Reset dependent filters when manager changes
  const handleManagerSelect = (mgr) => {
    setSelectedManager(mgr);
    setSelectedCaptain('all');
  };

  const resetFilters = () => {
    setSelectedManager('all');
    setSelectedCaptain('all');
    setSelectedL2Assign('all');
    setSelectedSource('all');
    setSelectedAudit('all');
    setSearchQuery('');
    setDateRange({ start: '', end: '' });
  };

  // Memoized Filtered Dataset
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (selectedManager !== 'all' && t.manager !== selectedManager) return false;
      if (selectedCaptain !== 'all' && t.captain !== selectedCaptain) return false;
      if (selectedL2Assign !== 'all' && t.l2Assign !== selectedL2Assign) return false;
      if (selectedSource !== 'all' && t.source !== selectedSource) return false;
      if (selectedAudit !== 'all' && t.invType !== selectedAudit) return false;
      
      if (dateRange.start && t.l2ApprovedDate < dateRange.start) return false;
      if (dateRange.end && t.l2ApprovedDate > dateRange.end) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          t.ticketNo?.toLowerCase().includes(q) ||
          t.architectName?.toLowerCase().includes(q) ||
          t.userCode?.toLowerCase().includes(q) ||
          t.relationshipManager?.toLowerCase().includes(q) ||
          t.team?.toLowerCase().includes(q) ||
          t.l2Assign?.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [tickets, selectedManager, selectedCaptain, selectedL2Assign, selectedSource, selectedAudit, dateRange, searchQuery]);

  // Aggregate Key Metrics
  const metrics = useMemo(() => {
    const totalCount = filteredTickets.length;
    const totalAmount = filteredTickets.reduce((sum, t) => sum + (t.finalTotalAmount || 0), 0);
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    // Unique active RMs and Approvers
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

    // Turnaround time averages
    const validTATs = filteredTickets.filter((t) => t.tatL1ToL2Days !== null && t.tatL1ToL2Days >= 0);
    const avgTAT = validTATs.length > 0
      ? validTATs.reduce((acc, t) => acc + t.tatL1ToL2Days, 0) / validTATs.length
      : 0;

    return {
      totalCount,
      totalAmount,
      avgAmount,
      uniqueRMs,
      uniqueApprovers,
      peakDay,
      avgTAT: Math.round(avgTAT * 10) / 10,
      dailyMap
    };
  }, [filteredTickets]);

  // Ingest new uploaded tickets
  const importTickets = (newRecords, mode = 'replace') => {
    verifyWatermarkIntegrity();
    if (mode === 'replace') {
      setTickets(newRecords);
    } else {
      // Append mode with deduplication by ticketNo
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
        filteredTickets,
        metrics,
        selectedManager,
        setSelectedManager: handleManagerSelect,
        selectedCaptain,
        setSelectedCaptain,
        selectedL2Assign,
        setSelectedL2Assign,
        selectedSource,
        setSelectedSource,
        selectedAudit,
        setSelectedAudit,
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
