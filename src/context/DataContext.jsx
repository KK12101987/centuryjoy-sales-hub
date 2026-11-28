import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import initialTickets from '../data/initialData.json';
import novemberTickets from '../data/novemberData.json';
import rawHierarchy from '../data/hierarchy.json';
import rawTelephony from '../data/seedTelephony.json';
import rawQaAudits from '../data/seedQaAudits.json';
import rawRMs from '../data/rmDirectory.json';
import rawDialerCalls from '../data/seedDialerData.json';
import { 
  getAllUsers, 
  SEED_USERS, 
  ROLES, 
  getPermittedModules,
  isDevDeviceAuthorized,
  setDevDeviceAuthorized,
  isPreviewPublicMode,
  setPreviewPublicMode,
  getPublicModulesConfig,
  savePublicModulesConfig
} from '../utils/auth';
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
    // Default to Developer & Super Admin Kushal Kar ONLY on authorized developer devices
    if (isDevDeviceAuthorized()) {
      return SEED_USERS[0];
    }
    return null;
  });

  const [users, setUsers] = useState(() => getAllUsers());

  // Staging / Public Device Lock & Dev Preview Mode
  const [isDevDevice, setIsDevDevice] = useState(() => isDevDeviceAuthorized());
  const [previewPublicMode, setPreviewPublicModeState] = useState(() => isPreviewPublicMode());

  // Developer Mode: Public Module Release Controls
  const [publicModulesConfig, setPublicModulesConfig] = useState(() => getPublicModulesConfig());
  const [isDevModuleModalOpen, setIsDevModuleModalOpen] = useState(false);

  const updatePublicModuleToggle = (moduleKey, enabled) => {
    setPublicModulesConfig(prev => {
      const next = { ...prev, [moduleKey]: !!enabled };
      savePublicModulesConfig(next);
      return next;
    });
  };

  const setAllPublicModules = (newConfig) => {
    setPublicModulesConfig(newConfig);
    savePublicModulesConfig(newConfig);
  };

  // Keep dev device state strictly synced with authoritative device authorization
  useEffect(() => {
    setIsDevDevice(isDevDeviceAuthorized());
  }, [currentUser]);

  // 3. Active Module
  const [activeModule, setActiveModule] = useState(() => {
    try {
      const isDev = isDevDeviceAuthorized() && !isPreviewPublicMode();
      if (!isDev) {
        const permitted = getPermittedModules(currentUser);
        return permitted[0] || 'l2';
      }
      return localStorage.getItem('century_active_module_v2') || 'consolidated';
    } catch (e) {
      return 'l2';
    }
  });

  const switchModule = (mod) => {
    verifyWatermarkIntegrity();
    const permitted = getPermittedModules(currentUser);
    const target = permitted.includes(mod) ? mod : (permitted[0] || 'l2');
    setActiveModule(target);
    try {
      localStorage.setItem('century_active_module_v2', target);
    } catch (e) {}
  };

  const togglePreviewPublicMode = () => {
    const nextState = !previewPublicMode;
    setPreviewPublicModeState(nextState);
    setPreviewPublicMode(nextState);
    // If entering public preview, ensure activeModule is permitted under public rules
    const permitted = getPermittedModules(currentUser);
    if (!permitted.includes(activeModule)) {
      const fallback = permitted[0] || 'l2';
      setActiveModule(fallback);
      try {
        localStorage.setItem('century_active_module_v2', fallback);
      } catch (e) {}
    }
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

  // 4b. Dynamic Display Resolution Scaling & Auto-Fit Engine
  const computeAutoZoom = () => {
    if (typeof window === 'undefined') return 1.0;

    // Detect browser zoom factor (e.g. Chrome zoom set to 75% or 80%)
    let browserZoom = 1.0;
    try {
      if (window.outerWidth && window.innerWidth) {
        browserZoom = window.outerWidth / window.innerWidth;
      }
    } catch (e) {}

    // If the browser itself is already zoomed out to <= 0.85 (like Chrome at 75% or 80%), do not double-scale
    if (browserZoom <= 0.85) {
      return 1.0;
    }

    const w = window.innerWidth;
    const h = window.innerHeight;

    // On narrow tablet or mobile viewports, maintain standard scale
    if (w < 1024) return 1.0;

    // Adaptive auto-fit calibrated for optimal screen fit and crisp readability
    if (h < 720) return 0.80;       // Small 720p / 768p displays or compact laptops
    if (h < 860) return 0.85;       // Standard 1080p laptop with 125% Windows DPI or browser toolbars
    if (h < 1020) return 0.90;      // Standard 1080p desktop with taskbar & address bar (comfortable & crisp)
    return 1.0;                     // 1080p maximized fullscreen, 1440p, 4K monitors
  };

  const [displayScale, setDisplayScaleState] = useState(() => {
    try {
      return localStorage.getItem('century_display_scale_v2') || 'auto';
    } catch (e) {
      return 'auto';
    }
  });

  const [effectiveZoom, setEffectiveZoom] = useState(() => {
    try {
      const saved = localStorage.getItem('century_display_scale_v2') || 'auto';
      if (saved === 'auto') return computeAutoZoom();
      return parseFloat(saved) / 100 || 1.0;
    } catch (e) {
      return 1.0;
    }
  });

  useEffect(() => {
    if (displayScale !== 'auto') {
      const targetZoom = parseFloat(displayScale) / 100 || 1.0;
      setEffectiveZoom(targetZoom);
      return;
    }

    const handleResize = () => {
      const autoZoom = computeAutoZoom();
      setEffectiveZoom(autoZoom);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [displayScale]);

  const updateDisplayScale = (newScale) => {
    setDisplayScaleState(newScale);
    try {
      localStorage.setItem('century_display_scale_v2', newScale);
    } catch (e) {}
    if (newScale !== 'auto') {
      setEffectiveZoom(parseFloat(newScale) / 100 || 1.0);
    } else {
      setEffectiveZoom(computeAutoZoom());
    }
  };

  // 4b. Real-time User Registry Event Synchronization
  useEffect(() => {
    const handleUsersUpdated = () => {
      const reg = getAllUsers();
      setUsers(reg);
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const matching = reg.find(
          (u) => (u.email || '').toLowerCase() === (prev.email || '').toLowerCase()
        );
        if (matching && matching.name !== prev.name) {
          return { ...prev, ...matching };
        }
        return prev;
      });
    };
    window.addEventListener('century_users_updated', handleUsersUpdated);
    return () => window.removeEventListener('century_users_updated', handleUsersUpdated);
  }, []);

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

          // GUARANTEE Unity-I is present in hierarchy tree, respecting captain resignation / failover
          if (parsed.tree['Arijit Nath']) {
            const hasUnityInterimKey = Object.keys(parsed.tree['Arijit Nath']).some((k) => k.includes('Unity-I'));
            // Remove Mousumi if her resignation is active
            if (parsed.tree['Arijit Nath']['Mousumi Chakraborty']) {
              delete parsed.tree['Arijit Nath']['Mousumi Chakraborty'];
              treeUpdated = true;
            }
            if (!hasUnityInterimKey) {
              parsed.tree['Arijit Nath']['Unity-I (Interim: Arijit Nath)'] = [
                'Aparna Biswas',
                'Chandrima Bhattacharya',
                'Naga Sindhuja',
                'Rajrupa Dey',
                'Sk Shamsher Ali',
                'Somashree Saha',
                'Srabani Chakraborti',
                'SWASITKA KOLLA'
              ];
              treeUpdated = true;
            }
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
    const effectiveMgr = currentUser.managerKey || (currentUser.role === ROLES.MANAGER ? currentUser.name : null);
    if (currentUser.role === ROLES.MANAGER && effectiveMgr && effectiveMgr !== 'all') {
      return tickets.filter((t) => t.manager === effectiveMgr);
    }
    if (currentUser.role === ROLES.CAPTAIN) {
      const effectiveCap = currentUser.captainKey || currentUser.name;
      return tickets.filter((t) => {
        const cMatch = effectiveCap && t.captain?.toLowerCase() === effectiveCap.toLowerCase();
        const nMatch = currentUser.name && t.captain?.toLowerCase() === currentUser.name.toLowerCase();
        const tMatch = currentUser.teamName && (
          t.teamDisplay?.toLowerCase() === currentUser.teamName.toLowerCase() ||
          t.captain?.toLowerCase().includes(currentUser.teamName.toLowerCase())
        );
        return cMatch || nMatch || tMatch;
      });
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
      const saved = localStorage.getItem('century_telephony_data_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].n !== undefined) {
          return parsed;
        }
      }
    } catch (e) {}
    return rawTelephony;
  });

  const addTelephonyRows = (newRows) => {
    verifyWatermarkIntegrity();
    setTelephony((prev) => {
      const updated = [...newRows, ...prev];
      try {
        localStorage.setItem('century_telephony_data_v3', JSON.stringify(updated));
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
            if (item.auditor_name === 'Manika Chakraborty' || item.auditor_name === 'Arindam CenturyPly') {
              migrated = true;
              item.auditor_name = 'Arindam Mitra';
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

  // E1. Team Email Chains Memory & Alert Persistence
  const DEFAULT_TEAM_CHAINS = {
    'Unity-II': {
      to: ['arshi.jamal@centuryply.com'],
      cc: ['arijit.nath@centuryply.com', 'nabonita.roy@centuryply.com', 'kushal.centuryply@gmail.com']
    },
    'Unity-I': {
      to: ['mousumi.chakraborty@centuryply.com'],
      cc: ['arijit.nath@centuryply.com', 'nabonita.roy@centuryply.com', 'kushal.centuryply@gmail.com']
    },
    'Catlyst-II': {
      to: ['nasima.banu@centuryply.com'],
      cc: ['surajit.laha@centuryply.com', 'nabonita.roy@centuryply.com', 'kushal.centuryply@gmail.com']
    },
    'Catlyst-I': {
      to: ['pallabi.chura@centuryply.com'],
      cc: ['surajit.laha@centuryply.com', 'nabonita.roy@centuryply.com', 'kushal.centuryply@gmail.com']
    },
    'SoarZone-II': {
      to: ['ranjana.mohajan@centuryply.com'],
      cc: ['niladri.bhadra@centuryply.com', 'nabonita.roy@centuryply.com', 'kushal.centuryply@gmail.com']
    },
    'SoarZone-I': {
      to: ['shiuli.bhattacharjee@centuryply.com'],
      cc: ['niladri.bhadra@centuryply.com', 'nabonita.roy@centuryply.com', 'kushal.centuryply@gmail.com']
    },
    'Zenith Pod': {
      to: ['silpa.palchina@centuryply.com'],
      cc: ['arijit.nath@centuryply.com', 'nabonita.roy@centuryply.com', 'kushal.centuryply@gmail.com']
    }
  };

  const [teamEmailChains, setTeamEmailChains] = useState(() => {
    try {
      const saved = localStorage.getItem('century_team_email_chains');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_TEAM_CHAINS;
  });

  const updateTeamEmailChain = (teamName, chain) => {
    verifyWatermarkIntegrity();
    setTeamEmailChains((prev) => {
      const toList = Array.isArray(chain?.to) ? chain.to : (chain?.to || '').split(',').map(s => s.trim()).filter(Boolean);
      const ccList = Array.isArray(chain?.cc) ? chain.cc : (chain?.cc || '').split(',').map(s => s.trim()).filter(Boolean);
      const updated = {
        ...prev,
        [teamName]: {
          to: toList.length > 0 ? toList : (prev[teamName]?.to || []),
          cc: ccList
        }
      };
      try {
        localStorage.setItem('century_team_email_chains', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // E2. Mail Chain History for Fatal Dispatches
  const [mailChainHistory, setMailChainHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('century_mail_chain_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const logFatalEmail = (record) => {
    verifyWatermarkIntegrity();
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...record
    };
    setMailChainHistory((prev) => {
      const updated = [entry, ...prev];
      try {
        localStorage.setItem('century_mail_chain_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return entry;
  };

  // E3. Relationship Manager Coaching Logs
  const [coachingLogs, setCoachingLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('century_coaching_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const logCoachingAction = (coachingRecord) => {
    verifyWatermarkIntegrity();
    const entry = {
      id: Date.now(),
      loggedAt: new Date().toISOString(),
      ...coachingRecord
    };
    setCoachingLogs((prev) => {
      const updated = [entry, ...prev];
      try {
        localStorage.setItem('century_coaching_logs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return entry;
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

          // Ensure Mousumi Chakraborty is properly recorded as resigned (status: inactive, wasCaptain: true)
          // and Unity-I subordinates are in active failover to Senior Manager Arijit Nath
          const mousumiIdx = parsed.findIndex((r) => r.rm_name.toLowerCase() === 'mousumi chakraborty');
          if (mousumiIdx === -1) {
            parsed.push({
              id: 293,
              rm_name: 'Mousumi Chakraborty',
              team_name: 'Unity-I',
              captain_name: 'Arijit Nath',
              manager_name: 'Arijit Nath',
              dialer_id: 'Mousumi_C',
              designation: 'Ex-Captain',
              status: 'inactive',
              wasCaptain: true,
              deactivationReason: 'Pod Captain Resigned - Auto-Failover to Senior Manager Arijit Nath',
              deactivatedAt: '2026-11-24T12:00:00.000Z',
            });
            modified = true;
          } else {
            // Keep Mousumi Chakraborty resigned and inactive
            if (parsed[mousumiIdx].status !== 'inactive' || !parsed[mousumiIdx].wasCaptain) {
              parsed[mousumiIdx] = {
                ...parsed[mousumiIdx],
                team_name: 'Unity-I',
                captain_name: 'Arijit Nath',
                manager_name: 'Arijit Nath',
                designation: 'Ex-Captain',
                status: 'inactive',
                wasCaptain: true,
                deactivationReason: parsed[mousumiIdx].deactivationReason || 'Pod Captain Resigned - Auto-Failover to Senior Manager Arijit Nath',
                deactivatedAt: parsed[mousumiIdx].deactivatedAt || '2026-11-24T12:00:00.000Z',
              };
              modified = true;
            }
          }

          // Ensure Silpa Palchina (Zenith Pod) is present & active
          const silpaIdx = parsed.findIndex((r) => r.rm_name.toLowerCase() === 'silpa palchina');
          if (silpaIdx === -1) {
            parsed.push({
              id: 294,
              rm_name: 'Silpa Palchina',
              team_name: 'Zenith Pod',
              captain_name: 'Silpa Palchina',
              manager_name: 'Arijit Nath',
              dialer_id: 'Silpa_P',
              designation: 'Pod Captain',
              status: 'active',
            });
            modified = true;
          }

          // Ensure Unity-I subordinates have team_name = 'Unity-I', manager = 'Arijit Nath', and are in failover mode
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
              let changed = false;
              const updated = { ...rm };
              if (updated.team_name !== 'Unity-I') {
                updated.team_name = 'Unity-I';
                changed = true;
              }
              if (updated.manager_name !== 'Arijit Nath') {
                updated.manager_name = 'Arijit Nath';
                changed = true;
              }
              // Failover fields: temporarily supervised by manager
              if (
                !updated.tempSupervisedByManager ||
                updated.captain_name !== 'Arijit Nath' ||
                updated.previousCaptain !== 'Mousumi Chakraborty'
              ) {
                updated.captain_name = 'Arijit Nath';
                updated.previousCaptain = 'Mousumi Chakraborty';
                updated.tempSupervisedByManager = true;
                changed = true;
              }
              if (updated.status === 'inactive' && !updated.deactivatedAt) {
                updated.status = 'active';
                changed = true;
              }
              if (changed) {
                modified = true;
                return updated;
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

  // Telephony records scoped strictly to the logged-in user's supervisory scope AND selected month
  const scopedTelephony = useMemo(() => {
    if (!telephony) return [];
    let base = telephony;
    if (currentUser) {
      if (currentUser.role !== ROLES.ADMIN && currentUser.role !== 'admin' && currentUser.managerKey !== 'all') {
        const effectiveMgr = currentUser.managerKey || (currentUser.role === ROLES.MANAGER ? currentUser.name : null);
        if (currentUser.role === ROLES.MANAGER && effectiveMgr && effectiveMgr !== 'all') {
          base = base.filter((r) => r.m === effectiveMgr);
        } else if (currentUser.role === ROLES.CAPTAIN) {
          const effectiveCap = currentUser.captainKey || (currentUser.teamName || currentUser.name);
          base = base.filter((r) => {
            const cMatch = effectiveCap && r.c?.toLowerCase() === effectiveCap.toLowerCase();
            const nMatch = currentUser.name && r.c?.toLowerCase() === currentUser.name.toLowerCase();
            const tMatch = currentUser.teamName && r.c?.toLowerCase().includes(currentUser.teamName.toLowerCase());
            return cMatch || nMatch || tMatch;
          });
        }
      }
    }
    if (selectedMonth && selectedMonth !== 'all') {
      return base.filter((r) => (r.d || '').startsWith(selectedMonth));
    }
    return base;
  }, [telephony, currentUser, selectedMonth]);

  // QA audits scoped strictly to the logged-in user profile AND selected month
  const scopedQaAudits = useMemo(() => {
    if (!qaAudits) return [];
    let base = qaAudits;
    if (currentUser) {
      if (currentUser.role !== ROLES.ADMIN && currentUser.role !== 'admin' && currentUser.managerKey !== 'all') {
        const effectiveMgr = currentUser.managerKey || (currentUser.role === ROLES.MANAGER ? currentUser.name : null);
        if (currentUser.role === ROLES.MANAGER && effectiveMgr && effectiveMgr !== 'all') {
          base = base.filter((a) => a.manager_name === effectiveMgr);
        } else if (currentUser.role === ROLES.CAPTAIN) {
          const effectiveCap = currentUser.captainKey || (currentUser.teamName || currentUser.name);
          base = base.filter((a) => {
            const cMatch = effectiveCap && a.captain_name?.toLowerCase() === effectiveCap.toLowerCase();
            const nMatch = currentUser.name && a.captain_name?.toLowerCase() === currentUser.name.toLowerCase();
            const tMatch = currentUser.teamName && a.team_name?.toLowerCase() === currentUser.teamName.toLowerCase();
            return cMatch || nMatch || tMatch;
          });
        } else if (currentUser.role === ROLES.AUDITOR && currentUser.qaScope === 'self') {
          const uName = (currentUser.name || '').toLowerCase().trim();
          const uEmail = (currentUser.email || '').toLowerCase().trim();
          base = base.filter((a) => {
            const aud = (a.auditor_name || '').toLowerCase().trim();
            return aud === uName || aud === uEmail;
          });
        }
      }
    }
    if (selectedMonth && selectedMonth !== 'all') {
      return base.filter((a) => (a.audit_date || a.call_date || a.created_at || '').startsWith(selectedMonth));
    }
    return base;
  }, [qaAudits, currentUser, selectedMonth]);

  // Incoming dialer call logs scoped to the user's supervised RMs AND selected month
  const scopedDialerCalls = useMemo(() => {
    let base = dialerCalls || [];
    if (currentUser) {
      if (currentUser.role !== ROLES.ADMIN && currentUser.role !== 'admin' && currentUser.managerKey !== 'all') {
        const effectiveMgr = currentUser.managerKey || (currentUser.role === ROLES.MANAGER ? currentUser.name : null);
        if (currentUser.role === ROLES.MANAGER && effectiveMgr && effectiveMgr !== 'all') {
          const supervisedRms = new Set(
            (rmDirectory || [])
              .filter((rm) => rm.manager_name === effectiveMgr)
              .flatMap((rm) => [(rm.rm_name || '').toLowerCase(), (rm.dialer_id || '').toLowerCase()])
              .filter(Boolean)
          );
          base = base.filter((c) => {
            const agId = (c.agent_id || '').toLowerCase();
            const rmN = (c.rm_name || '').toLowerCase();
            return supervisedRms.has(agId) || supervisedRms.has(rmN);
          });
        } else if (currentUser.role === ROLES.CAPTAIN) {
          const effectiveCap = currentUser.captainKey || (currentUser.teamName || currentUser.name);
          const supervisedRms = new Set(
            (rmDirectory || [])
              .filter((rm) =>
                (effectiveCap && rm.captain_name?.toLowerCase() === effectiveCap.toLowerCase()) ||
                (currentUser.name && rm.captain_name?.toLowerCase() === currentUser.name.toLowerCase()) ||
                (currentUser.teamName && rm.team_name?.toLowerCase() === currentUser.teamName.toLowerCase())
              )
              .flatMap((rm) => [(rm.rm_name || '').toLowerCase(), (rm.dialer_id || '').toLowerCase()])
              .filter(Boolean)
          );
          base = base.filter((c) => {
            const agId = (c.agent_id || '').toLowerCase();
            const rmN = (c.rm_name || '').toLowerCase();
            return supervisedRms.has(agId) || supervisedRms.has(rmN);
          });
        }
      }
    }
    if (selectedMonth && selectedMonth !== 'all') {
      return base.filter((c) => (c.call_date || c.upload_time || '').startsWith(selectedMonth));
    }
    return base;
  }, [dialerCalls, currentUser, rmDirectory, selectedMonth]);

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
    let wasCaptainFlag = false;

    setRmDirectory((prev) => {
      const target = prev.find((r) => r.rm_name.toLowerCase() === rmName.toLowerCase());
      wasCaptainFlag = Boolean(target?.wasCaptain);
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
        if (wasCaptainFlag && rm.previousCaptain && rm.previousCaptain.toLowerCase() === rmName.toLowerCase()) {
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

      if (wasCaptainFlag) {
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

  // Remove / Dissolve a Team / Pod (Zero Database Impact: members reassigned or soft-deactivated)
  const removeTeam = ({
    teamName,
    reassignToTeam = 'Unity-II',
    action = 'reassign', // 'reassign' | 'deactivate'
    targetCaptain = '',
    targetManager = '',
  }) => {
    verifyWatermarkIntegrity();
    const cleanTeam = (teamName || '').trim();
    if (!cleanTeam) {
      throw new Error('Team name to remove is required.');
    }

    // 1. Remove from customTeams
    setCustomTeams((prev) => {
      const updated = prev.filter((t) => t.toLowerCase() !== cleanTeam.toLowerCase());
      try {
        localStorage.setItem('century_custom_teams_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Also track removed teams so canonical or custom pods are filtered out
    try {
      const savedArchived = localStorage.getItem('century_removed_teams_v2');
      const parsedArchived = savedArchived ? JSON.parse(savedArchived) : [];
      if (!parsedArchived.some((t) => t.toLowerCase() === cleanTeam.toLowerCase())) {
        parsedArchived.push(cleanTeam);
        localStorage.setItem('century_removed_teams_v2', JSON.stringify(parsedArchived));
      }
    } catch (e) {}

    // Find affected members in this team
    const affectedMembers = rmDirectory.filter(
      (r) => (r.team_name || '').toLowerCase() === cleanTeam.toLowerCase()
    );

    // 2. Handle affected members in rmDirectory
    setRmDirectory((prev) => {
      const updated = prev.map((rm) => {
        if ((rm.team_name || '').toLowerCase() === cleanTeam.toLowerCase()) {
          if (action === 'deactivate') {
            return {
              ...rm,
              status: 'inactive',
              deactivatedAt: new Date().toISOString(),
              deactivationReason: `Pod Dissolution - Team "${cleanTeam}" removed`,
            };
          } else {
            // Reassign to target team
            return {
              ...rm,
              team_name: reassignToTeam,
              captain_name: targetCaptain || 'Direct Supervision',
              manager_name: targetManager || 'Arijit Nath',
              status: 'active',
              tempSupervisedByManager: false,
            };
          }
        }
        return rm;
      });

      try {
        localStorage.setItem('century_rm_directory_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 3. Update Hierarchy Tree
    setHierarchy((prev) => {
      const tree = JSON.parse(JSON.stringify(prev.tree || {}));
      const affectedNames = affectedMembers.map((m) => m.rm_name.toLowerCase());

      for (const m in tree) {
        for (const c in tree[m]) {
          // If captain key contains team name or is captain of removed team
          if (c.toLowerCase().includes(cleanTeam.toLowerCase())) {
            delete tree[m][c];
          } else {
            if (action === 'deactivate') {
              tree[m][c] = (tree[m][c] || []).filter(
                (ag) => !affectedNames.includes(ag.toLowerCase())
              );
            }
          }
        }
      }

      // If reassigning, append members to target pod
      if (action === 'reassign' && reassignToTeam) {
        const mgr = targetManager || 'Arijit Nath';
        const cap = targetCaptain || 'Direct Supervision';
        if (!tree[mgr]) tree[mgr] = {};
        if (!tree[mgr][cap]) tree[mgr][cap] = [];
        const newMemberNames = affectedMembers.map((m) => m.rm_name);
        tree[mgr][cap] = [...new Set([...tree[mgr][cap], ...newMemberNames])];
      }

      const newH = { ...prev, tree };
      try {
        localStorage.setItem('century_hierarchy_tree_v2', JSON.stringify(newH));
      } catch (e) {}
      return newH;
    });

    return { teamName: cleanTeam, memberCount: affectedMembers.length, action, reassignToTeam };
  };

  // Global Scope Filter for Consolidated View
  const [scopeFilter, setScopeFilter] = useState({
    manager: 'all',
    captain: 'all',
    stream: 'all',
  });

  // Synchronize supervisory scope bindings whenever currentUser changes or mounts
  useEffect(() => {
    if (!currentUser) return;
    const effectiveMgr = currentUser.managerKey || (currentUser.role === ROLES.MANAGER ? currentUser.name : null);
    const effectiveCap = currentUser.captainKey || (currentUser.role === ROLES.CAPTAIN ? (currentUser.teamName || currentUser.name) : null);
    if (currentUser.role === ROLES.MANAGER && effectiveMgr && effectiveMgr !== 'all') {
      setSelectedManager(effectiveMgr);
      setScopeFilter((prev) => ({ ...prev, manager: effectiveMgr, captain: 'all' }));
    } else if (currentUser.role === ROLES.CAPTAIN) {
      setSelectedManager(effectiveMgr || 'all');
      setSelectedCaptain(effectiveCap);
      setScopeFilter((prev) => ({
        ...prev,
        manager: effectiveMgr || 'all',
        captain: effectiveCap,
      }));
    }
  }, [currentUser]);

  // Auth operations
  const login = (user) => {
    verifyWatermarkIntegrity();
    setCurrentUser(user);
    if (user?.email === 'kushal.centuryply@gmail.com') {
      setDevDeviceAuthorized(true);
      setIsDevDevice(true);
    }
    try {
      localStorage.setItem('century_joy_auth_user_v2', JSON.stringify(user));
    } catch (e) {}
    const effectiveMgr = user.managerKey || (user.role === ROLES.MANAGER ? user.name : null);
    const effectiveCap = user.captainKey || (user.role === ROLES.CAPTAIN ? (user.teamName || user.name) : null);
    if (user.role === ROLES.MANAGER && effectiveMgr && effectiveMgr !== 'all') {
      setSelectedManager(effectiveMgr);
      setScopeFilter((prev) => ({ ...prev, manager: effectiveMgr, captain: 'all' }));
    } else if (user.role === ROLES.CAPTAIN) {
      setSelectedManager(effectiveMgr || 'all');
      setSelectedCaptain(effectiveCap);
      setScopeFilter((prev) => ({
        ...prev,
        manager: effectiveMgr || 'all',
        captain: effectiveCap,
      }));
    } else {
      setSelectedManager('all');
      setSelectedCaptain('all');
      setScopeFilter({ manager: 'all', captain: 'all', stream: 'all' });
    }
    const permitted = getPermittedModules(user);
    if (!permitted.includes(activeModule)) {
      setActiveModule(permitted[0]);
      try {
        localStorage.setItem('century_active_module_v2', permitted[0]);
      } catch (e) {}
    }
    resetFilters();
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('century_joy_auth_user_v2');
    } catch (e) {}
    setSelectedManager('all');
    setSelectedCaptain('all');
    setScopeFilter({ manager: 'all', captain: 'all', stream: 'all' });
    const isDev = isDevDeviceAuthorized() && !isPreviewPublicMode();
    setActiveModule(isDev ? 'consolidated' : 'l2');
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
    scopedTelephony,
    addTelephonyRows,
    qaAudits,
    scopedQaAudits,
    addQaAudit,
    addQaAuditsBulk,
    purgeAllQaAudits,
    restoreDefaultQaAudits,
    dialerCalls,
    scopedDialerCalls,
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
    removeTeam,
    scopeFilter,
    setScopeFilter,
    isUploadModalOpen,
    uploadModalTab,
    openUploadModal,
    closeUploadModal,
    teamEmailChains,
    updateTeamEmailChain,
    mailChainHistory,
    logFatalEmail,
    coachingLogs,
    logCoachingAction,
    displayScale,
    setDisplayScale: updateDisplayScale,
    effectiveZoom,
    isDevDevice,
    previewPublicMode,
    togglePreviewPublicMode,
    publicModulesConfig,
    updatePublicModuleToggle,
    setAllPublicModules,
    isDevModuleModalOpen,
    setIsDevModuleModalOpen,
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
