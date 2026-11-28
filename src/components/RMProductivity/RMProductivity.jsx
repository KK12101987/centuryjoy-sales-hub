import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { getAllowedUploadTabs } from '../../utils/auth';
import { 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Download, 
  Upload, 
  Calendar as CalendarIcon
} from 'lucide-react';

const nf = new Intl.NumberFormat('en-IN');
const f1 = (v) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);
const p2 = (n) => String(n).padStart(2, '0');

const fmtT = (s) => {
  if (s == null || isNaN(s)) return '—';
  s = Math.round(s);
  return p2(Math.floor(s / 3600)) + ':' + p2(Math.floor((s % 3600) / 60)) + ':' + p2(s % 60);
};

const fmtTotalT = (s) => {
  if (s == null || isNaN(s)) return '—';
  s = Math.round(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h + ':' + p2(m) + ':' + p2(sec);
};

const fmtP = (v) => (v == null || isNaN(v) ? '—' : f1(v) + '%');

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MON = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const LV = {
  manager: ['m', 'c', 'r'],
  agency: ['a', 'm', 'c', 'r'],
  captain: ['c', 'r'],
  rm: ['r']
};

const LVN = { m: 'Manager', a: 'Agency', c: 'Captain', r: 'RM' };
const titleBreadcrumbs = {
  manager: 'Manager › Captain › RM',
  agency: 'Agency › Manager › Captain › RM',
  captain: 'Captain › RM',
  rm: 'RM'
};

const M = {
  n: { t: 'Total calls', get: (a) => (a.avg ? (a.rd ? a.n / a.rd : 0) : a.n), fmt: (v) => (v == null ? '—' : Number.isInteger(v) ? nf.format(v) : f1(v)) },
  k: { t: 'Connected calls', get: (a) => a.k, fmt: (v) => (v == null ? '—' : nf.format(v)) },
  nc: { t: 'Not connected calls', get: (a) => a.nc, fmt: (v) => (v == null ? '—' : nf.format(v)) },
  kp: { t: 'Connection %', get: (a) => (a.n ? (a.k / a.n) * 100 : 0), fmt: fmtP },
  l: { t: 'Logged-in time', get: (a) => (a.vd ? (a.avg ? a.l / a.vd : a.l) : null), fmt: fmtT },
  i: { t: 'Idle time', get: (a) => (a.vd ? (a.avg ? a.i / a.vd : a.i) : null), fmt: fmtT },
  ip: { t: 'Idle %', get: (a) => (a.l ? (a.i / a.l) * 100 : null), fmt: fmtP },
  h: { t: 'AHT', get: (a) => (a.k ? a.h / a.k : null), fmt: fmtT },
  b: { t: 'Total Break time', get: (a) => (a.vd ? (a.avg ? a.b / a.vd : a.b) : null), fmt: fmtT },
  brkp: { t: 'Break %', get: (a) => (a.l ? (a.b / a.l) * 100 : null), fmt: fmtP }
};

function agg(rs, incx = false) {
  const a = { avg: true, n: 0, k: 0, nc: 0, h: 0, l: 0, i: 0, b: 0, bp: 0, bnp: 0, tp: 0, rd: 0, vd: 0 };
  const rm = new Set(), dd = new Set(), dv = new Set();
  for (const r of rs) {
    const n = r.n !== undefined ? r.n : (r.t || 0);
    const k = r.k !== undefined ? r.k : (r.conn || 0);
    const nc = r.nc !== undefined ? r.nc : Math.max(0, n - k);
    const h = r.h !== undefined ? r.h : (r.dur || 0);

    a.n += n;
    a.k += k;
    a.nc += nc;
    a.h += h;
    a.rd++;
    rm.add(r.r);
    dd.add(r.d);

    if (r.x && !incx) continue;

    const l = r.l || 0;
    const i = r.i || 0;
    const b = r.b || 0;
    const bp = r.bp || 0;
    const bnp = r.bnp || 0;
    const tp = r.tp || 0;

    a.l += l;
    a.i += i;
    a.b += b;
    a.bp += bp;
    a.bnp += bnp;
    a.tp += tp;
    a.vd++;
    dv.add(r.d);
  }
  a.rms = rm.size;
  a.nd = dd.size;
  a.nv = dv.size;
  return a;
}

function buildTree(rs, keys, lv = 0, path = '', incx = false) {
  const g = new Map();
  for (const r of rs) {
    const k = r[keys[lv]] || 'Unassigned';
    if (!g.has(k)) g.set(k, []);
    g.get(k).push(r);
  }
  return [...g].map(([k, x]) => {
    const id = path + '/' + k;
    const node = { id, label: k, key: keys[lv], lv, a: agg(x, incx), recs: x };
    const f = x[0];
    if (keys[lv] === 'c' && keys[0] === 'm') node.sub = f.m + ' · ' + f.a;
    else if (keys[lv] === 'c' && keys[0] === 'a') node.sub = f.m;
    else if (keys[lv] === 'r' && lv > 0) node.sub = f.c + ' · ' + f.m;
    else if (keys[lv] === 'm' && keys[0] === 'm') node.sub = f.a;

    if (lv < keys.length - 1) {
      node.ch = buildTree(x, keys, lv + 1, id, incx);
    }
    return node;
  });
}

function sortNodes(ns, sort) {
  const g = (n) => {
    const k = sort.k;
    if (k === 'name') return String(n.label).toLowerCase();
    if (k === 'rms') return n.a.rms;
    if (k === 'n') return n.a.n;
    if (k === 'k') return n.a.k;
    if (k === 'nc') return n.a.nc;
    if (M[k]) {
      const v = M[k].get(n.a);
      return v == null ? -1 : v;
    }
    return -1;
  };

  ns.sort((x, y) => {
    const a = g(x), b = g(y);
    const c = a < b ? -1 : a > b ? 1 : 0;
    return c * sort.dir || String(x.label).localeCompare(String(y.label));
  });

  ns.forEach((n) => n.ch && sortNodes(n.ch, sort));
  return ns;
}

function allNodeIds(ns, o = []) {
  ns.forEach((n) => {
    if (n.ch) {
      o.push(n.id);
      allNodeIds(n.ch, o);
    }
  });
  return o;
}

export default function RMProductivity() {
  const { 
    telephony, 
    scopedTelephony,
    selectedMonth, 
    selectMonth,
    openUploadModal,
    currentUser,
    scopeFilter
  } = useData();

  // Rule 22 Watermark Integrity Verification
  useEffect(() => {
    const wm = document.getElementById('antigravity-watermark-kushalkar');
    if (!wm || !wm.textContent.includes('Crafted with ❤️ and Antigravity by KUSHAL KAR')) {
      document.body.innerHTML = '';
      throw new Error('Application integrity check failed: Watermark removed or tampered.');
    }
  }, []);

  const allowedUploadTabs = getAllowedUploadTabs(currentUser);
  const canUploadTelephony = allowedUploadTabs.includes('telephony');

  // Filter States
  const [currentMonth, setCurrentMonth] = useState(() => selectedMonth || '2026-11');
  const [viewBy, setViewBy] = useState('manager'); // 'manager' | 'agency' | 'captain' | 'rm'
  const [selectedPeriods, setSelectedPeriods] = useState(['ALL']);
  const [searchQuery, setSearchQuery] = useState('');
  const [includeOpenSessions, setIncludeOpenSessions] = useState(false);
  const [sortConfig, setSortConfig] = useState({ k: 'n', dir: -1 });
  const [openNodes, setOpenNodes] = useState(new Set());
  const [selectedRow, setSelectedRow] = useState(null);

  // Calendar Dropdown State
  const [isCalOpen, setIsCalOpen] = useState(false);
  const [tempRangeStart, setTempRangeStart] = useState(null);
  const calRef = useRef(null);

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (calRef.current && !calRef.current.contains(e.target)) {
        setIsCalOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync with global month if changed externally
  useEffect(() => {
    if (selectedMonth && selectedMonth !== currentMonth) {
      setCurrentMonth(selectedMonth);
      setSelectedPeriods(['ALL']);
      setTempRangeStart(null);
    }
  }, [selectedMonth]);

  const handleMonthChange = (e) => {
    const val = e.target.value;
    setCurrentMonth(val);
    selectMonth(val);
    setSelectedPeriods(['ALL']);
    setTempRangeStart(null);
  };

  // Base raw records filtered by month and supervisory scope
  const monthFiltered = useMemo(() => {
    const base = scopedTelephony || telephony || [];
    return base.filter((r) => {
      if (scopeFilter?.manager && scopeFilter.manager !== 'all' && r.m !== scopeFilter.manager) return false;
      if (scopeFilter?.captain && scopeFilter.captain !== 'all' && r.c !== scopeFilter.captain) return false;
      if (currentMonth === 'all') return true;
      return r.d && r.d.startsWith(currentMonth);
    });
  }, [scopedTelephony, telephony, scopeFilter, currentMonth]);

  // Available unique dates in the current scoped month
  const availableDates = useMemo(() => {
    return [...new Set(monthFiltered.map((r) => r.d))].sort();
  }, [monthFiltered]);

  // Period filtered records
  const periodFiltered = useMemo(() => {
    let recs = monthFiltered;
    if (selectedPeriods.length > 0 && !selectedPeriods.includes('ALL')) {
      recs = recs.filter((r) => selectedPeriods.includes(r.d));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      recs = recs.filter((r) => {
        const rName = String(r.r || '').toLowerCase();
        const cName = String(r.c || '').toLowerCase();
        const mName = String(r.m || '').toLowerCase();
        const aName = String(r.a || '').toLowerCase();
        return rName.includes(q) || cName.includes(q) || mName.includes(q) || aName.includes(q);
      });
    }
    return recs;
  }, [monthFiltered, selectedPeriods, searchQuery]);

  // Total summary aggregation
  const totalSummary = useMemo(() => {
    return agg(periodFiltered, includeOpenSessions);
  }, [periodFiltered, includeOpenSessions]);

  // Build hierarchical tree
  const hierarchyTree = useMemo(() => {
    const keys = LV[viewBy] || LV.manager;
    const tree = buildTree(periodFiltered, keys, 0, '', includeOpenSessions);
    return sortNodes(tree, sortConfig);
  }, [periodFiltered, viewBy, includeOpenSessions, sortConfig]);

  // Expand / Collapse Handlers
  const handleExpandAll = () => {
    const all = allNodeIds(hierarchyTree);
    setOpenNodes(new Set(all));
  };

  const handleCollapseAll = () => {
    setOpenNodes(new Set());
  };

  const toggleNode = (id) => {
    setOpenNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSort = (colKey) => {
    setSortConfig((prev) => {
      if (prev.k === colKey) {
        return { k: colKey, dir: -prev.dir };
      }
      return { k: colKey, dir: colKey === 'name' ? 1 : -1 };
    });
  };

  // Calendar Presets
  const applyPreset = (preset) => {
    setTempRangeStart(null);
    if (!availableDates.length) return;
    if (preset === 'all') {
      setSelectedPeriods(['ALL']);
    } else if (preset === 'today') {
      setSelectedPeriods([availableDates[availableDates.length - 1]]);
    } else if (preset === 'yesterday') {
      setSelectedPeriods(availableDates.length > 1 ? [availableDates[availableDates.length - 2]] : [availableDates[0]]);
    } else if (preset === 'last7') {
      setSelectedPeriods(availableDates.slice(Math.max(0, availableDates.length - 7)));
    }
    setIsCalOpen(false);
  };

  // Calendar Day Click
  const handleCalDayClick = (dStr) => {
    if (!tempRangeStart) {
      setTempRangeStart(dStr);
      setSelectedPeriods([dStr]);
    } else {
      const startIdx = availableDates.indexOf(tempRangeStart);
      const endIdx = availableDates.indexOf(dStr);
      if (startIdx > -1 && endIdx > -1) {
        setSelectedPeriods(availableDates.slice(Math.min(startIdx, endIdx), Math.max(startIdx, endIdx) + 1));
      } else {
        setSelectedPeriods([dStr]);
      }
      setTempRangeStart(null);
      setIsCalOpen(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!periodFiltered.length) {
      alert('No data to export.');
      return;
    }
    const headers = [
      'Date', 'Manager', 'Agency', 'RM Captain', 'RM', 
      'Total Calls', 'Connected Calls', 'Not Connected Calls', 
      'Connection %', 'Logged-in Time', 'Idle Time', 'Idle %', 
      'AHT', 'Break Time', 'Break %'
    ];
    const rows = periodFiltered.map((r) => {
      const kp = r.n ? ((r.k / r.n) * 100).toFixed(1) + '%' : '0.0%';
      const ip = r.l ? ((r.i / r.l) * 100).toFixed(1) + '%' : '0.0%';
      const brkp = r.l ? ((r.b / r.l) * 100).toFixed(1) + '%' : '0.0%';
      const aht = r.k ? fmtT(r.h / r.k) : '—';
      return [
        r.d,
        `"${r.m || ''}"`,
        `"${r.a || ''}"`,
        `"${r.c || ''}"`,
        `"${r.r || ''}"`,
        r.n,
        r.k,
        r.nc,
        kp,
        fmtT(r.l),
        fmtT(r.i),
        ip,
        aht,
        fmtT(r.b),
        brkp
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RM_Productivity_${currentMonth}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dropdown Label
  const dateDropdownLabel = useMemo(() => {
    if (selectedPeriods.includes('ALL') || selectedPeriods.length === 0) return 'All Days in Month';
    if (selectedPeriods.length === 1) {
      const [y, m, d] = selectedPeriods[0].split('-');
      return `${d}-${m}-${y}`;
    }
    return `${selectedPeriods.length} days selected`;
  }, [selectedPeriods]);

  // Render Calendar Grid Days
  const calendarGrid = useMemo(() => {
    if (!currentMonth || currentMonth === 'all') {
      return (
        <div className="col-span-7 text-center text-slate-400 text-xs py-3">
          Select a specific month to view calendar grid.
        </div>
      );
    }
    const [y, m] = currentMonth.split('-').map(Number);
    const firstDayIndex = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    const totalDays = new Date(y, m, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="aspect-square opacity-0"></div>);
    }
    for (let d = 1; d <= totalDays; d++) {
      const dStr = `${y}-${p2(m)}-${p2(d)}`;
      const hasData = availableDates.includes(dStr);
      const isSel = selectedPeriods.includes('ALL') || selectedPeriods.includes(dStr);

      cells.push(
        <button
          key={dStr}
          type="button"
          disabled={!hasData}
          onClick={() => handleCalDayClick(dStr)}
          className={`aspect-square flex items-center justify-center text-xs rounded transition-all ${
            !hasData
              ? 'text-slate-600 dark:text-slate-600 cursor-not-allowed opacity-30'
              : isSel
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-500/20'
          }`}
        >
          {d}
        </button>
      );
    }
    return cells;
  }, [currentMonth, availableDates, selectedPeriods]);

  // Recursive Table Row Renderer
  const renderTreeRows = (nodes, pad = 0) => {
    const rows = [];
    for (const node of nodes) {
      const hasKids = !!node.ch;
      const isOpen = hasKids && (openNodes.has(node.id) || !!searchQuery);
      const isSelected = selectedRow && selectedRow.id === node.id;
      const isLeaf = !hasKids;
      const a = node.a;

      const callsText = a.rd > 1 ? (
        <span>
          <b className="font-semibold text-slate-900 dark:text-slate-100">{nf.format(a.n)}</b>{' '}
          <small className="text-slate-400 font-normal">({f1(a.n / a.rd)}/d)</small>
        </span>
      ) : (
        <b className="font-semibold text-slate-900 dark:text-slate-100">{nf.format(a.n)}</b>
      );

      const connText = (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {nf.format(a.k)}
        </span>
      );

      const notConnText = (
        <span className="font-semibold text-amber-500 dark:text-amber-400">
          {nf.format(a.nc)}
        </span>
      );

      const connRateText = (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {fmtP(M.kp.get(a))}
        </span>
      );

      const idlePctVal = M.ip.get(a) || 0;
      const idleAlert = idlePctVal > 25 ? 'text-amber-500 dark:text-amber-400 font-semibold' : 'text-slate-700 dark:text-slate-300';

      const breakPctVal = M.brkp.get(a) || 0;
      const breakAlert = breakPctVal > 20 ? 'text-amber-500 dark:text-amber-400 font-semibold' : 'text-slate-700 dark:text-slate-300';

      rows.push(
        <tr
          key={node.id}
          onClick={() => {
            if (hasKids) toggleNode(node.id);
            setSelectedRow((prev) => (prev?.id === node.id ? null : node));
          }}
          className={`border-b border-slate-200 dark:border-slate-800/80 transition-colors cursor-pointer select-none ${
            isSelected
              ? 'bg-blue-500/10 dark:bg-blue-600/15'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          {/* Label / Tree toggler */}
          <td className="py-2.5 px-3 sticky left-0 bg-white dark:bg-[#111827] z-10 whitespace-nowrap">
            <div className="flex items-center gap-1.5" style={{ paddingLeft: `${pad * 20}px` }}>
              <span className="w-4 text-center text-slate-400 text-xs inline-block">
                {hasKids ? (
                  isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 inline text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 inline text-slate-400" />
                  )
                ) : (
                  <span className="w-3.5 inline-block" />
                )}
              </span>
              <span className="font-medium text-xs text-slate-900 dark:text-slate-100">
                {node.label}
                {node.sub && (
                  <small className="text-slate-400 font-normal ml-1">· {node.sub}</small>
                )}
              </span>
            </div>
          </td>

          {/* HEAD COUNT */}
          <td className="py-2.5 px-3 text-right text-xs text-slate-700 dark:text-slate-300">
            {isLeaf ? '' : a.rms}
          </td>

          {/* TOTAL CALLS */}
          <td className="py-2.5 px-3 text-right text-xs">
            {callsText}
          </td>

          {/* CONNECTED */}
          <td className="py-2.5 px-3 text-right text-xs">
            {connText}
          </td>

          {/* NOT CONNECTED */}
          <td className="py-2.5 px-3 text-right text-xs">
            {notConnText}
          </td>

          {/* CONN % */}
          <td className="py-2.5 px-3 text-right text-xs">
            {connRateText}
          </td>

          {/* LOGGED-IN */}
          <td className="py-2.5 px-3 text-right text-xs font-mono text-slate-900 dark:text-slate-100">
            {fmtT(M.l.get(a))}
          </td>

          {/* IDLE */}
          <td className="py-2.5 px-3 text-right text-xs font-mono text-slate-900 dark:text-slate-100">
            {fmtT(M.i.get(a))}
          </td>

          {/* IDLE % */}
          <td className={`py-2.5 px-3 text-right text-xs ${idleAlert}`}>
            {fmtP(M.ip.get(a))}
          </td>

          {/* AHT */}
          <td className="py-2.5 px-3 text-right text-xs font-mono text-slate-900 dark:text-slate-100">
            {fmtT(M.h.get(a))}
          </td>

          {/* BREAK */}
          <td className="py-2.5 px-3 text-right text-xs font-mono text-slate-900 dark:text-slate-100">
            {fmtT(M.b.get(a))}
          </td>

          {/* BREAK % */}
          <td className={`py-2.5 px-3 text-right text-xs ${breakAlert}`}>
            {fmtP(M.brkp.get(a))}
          </td>
        </tr>
      );

      if (isOpen && node.ch) {
        rows.push(...renderTreeRows(node.ch, pad + 1));
      }
    }
    return rows;
  };

  const currentMonthTitle = useMemo(() => {
    if (!currentMonth || currentMonth === 'all') return 'All Months';
    const [y, m] = currentMonth.split('-').map(Number);
    return `${FULL_MON[m - 1]} ${y}`;
  }, [currentMonth]);

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* 1. TOP FILTER CONTROLS BAR */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex flex-wrap items-end gap-3 sm:gap-4">
        
        {/* Month Selector */}
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Month
          </label>
          <select
            value={currentMonth}
            onChange={handleMonthChange}
            className="h-9 px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#161b23] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="2026-11">Nov-26</option>
            <option value="2026-10">Oct-26</option>
            <option value="all">All months</option>
          </select>
        </div>

        {/* View By Selector */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            View By
          </label>
          <select
            value={viewBy}
            onChange={(e) => {
              setViewBy(e.target.value);
              setOpenNodes(new Set());
              setSelectedRow(null);
            }}
            className="h-9 px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#161b23] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="manager">Manager wise</option>
            <option value="agency">Agency wise</option>
            <option value="captain">Captain wise</option>
            <option value="rm">RM wise</option>
          </select>
        </div>

        {/* Date Multi-Select Popover */}
        <div className="flex flex-col gap-1 relative min-w-[190px]" ref={calRef}>
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Select Dates (Multi-Select)
          </label>
          <button
            type="button"
            onClick={() => setIsCalOpen((prev) => !prev)}
            className="h-9 px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#161b23] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 flex items-center justify-between gap-2 hover:border-slate-400 transition-colors font-medium"
          >
            <span className="truncate">{dateDropdownLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          </button>

          {/* Popover Dropdown */}
          {isCalOpen && (
            <div className="absolute top-16 left-0 w-72 bg-white dark:bg-[#161b23] border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              
              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                <button
                  type="button"
                  onClick={() => applyPreset('all')}
                  className="text-[11px] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500"
                >
                  Full Month
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('last7')}
                  className="text-[11px] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500"
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('yesterday')}
                  className="text-[11px] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500"
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('today')}
                  className="text-[11px] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500"
                >
                  Today
                </button>
              </div>

              {/* Month Header */}
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5 flex items-center justify-between">
                <span>{currentMonthTitle}</span>
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Day Name Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase font-bold text-slate-400 mb-1">
                <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {calendarGrid}
              </div>

              <div className="text-[10px] text-slate-400 text-center mb-2 italic">
                Click start date &amp; end date to select range
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPeriods(['ALL']);
                    setTempRangeStart(null);
                    setIsCalOpen(false);
                  }}
                  className="text-blue-500 hover:text-blue-600 font-semibold text-[11px]"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPeriods([]);
                    setTempRangeStart(null);
                    setIsCalOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-300 text-[11px]"
                >
                  Clear
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="flex flex-col gap-1 flex-1 min-w-[180px] max-w-xs">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Search
          </label>
          <div className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Manager, captain or RM"
              className="h-9 w-full pl-3 pr-8 text-xs bg-slate-50 dark:bg-[#161b23] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 hidden md:block" />

        {/* Include Open Sessions Checkbox */}
        <label className="flex items-center gap-2 h-9 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeOpenSessions}
            onChange={(e) => setIncludeOpenSessions(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
          />
          <span>Include open sessions (&gt;16 h)</span>
        </label>

        {/* Upload Button */}
        {canUploadTelephony && (
          <button
            type="button"
            onClick={() => openUploadModal('telephony')}
            className="h-9 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload APR</span>
          </button>
        )}

      </div>

      {/* 2. THE 6 OPERATIONAL KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Card 1: AVG CALLS / RM / DAY */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            AVG CALLS / RM / DAY
          </div>
          <div className="text-2xl font-bold font-sans text-slate-900 dark:text-slate-100 leading-tight">
            {totalSummary.rd ? f1(totalSummary.n / totalSummary.rd) : '0.0'}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {nf.format(totalSummary.n)} total calls
          </div>
        </div>

        {/* Card 2: CALL CONNECTIVITY */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            CALL CONNECTIVITY
          </div>
          <div className="text-2xl font-bold font-sans text-slate-900 dark:text-slate-100 leading-tight">
            {fmtP(M.kp.get(totalSummary))}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {nf.format(totalSummary.k)} conn · {nf.format(totalSummary.nc)} not conn
          </div>
        </div>

        {/* Card 3: AVG LOGGED-IN / RM / DAY */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            AVG LOGGED-IN / RM / DAY
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 leading-tight">
            {fmtT(M.l.get(totalSummary))}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {fmtTotalT(totalSummary.l)} total
          </div>
        </div>

        {/* Card 4: AVG IDLE / RM / DAY */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            AVG IDLE / RM / DAY
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 leading-tight">
            {fmtT(M.i.get(totalSummary))}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {fmtP(M.ip.get(totalSummary))} of logged-in
          </div>
        </div>

        {/* Card 5: AHT */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            AHT
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 leading-tight">
            {fmtT(M.h.get(totalSummary))}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {nf.format(totalSummary.k)} connected calls
          </div>
        </div>

        {/* Card 6: AVG BREAK / RM / DAY */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            AVG BREAK / RM / DAY
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 leading-tight">
            {fmtT(M.b.get(totalSummary))}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {fmtP(M.brkp.get(totalSummary))} of logged-in
          </div>
        </div>

      </div>

      {/* 3. DRILL-DOWN HIERARCHICAL TABLE CARD */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        
        {/* Table Toolbar Header */}
        <div className="p-3.5 sm:px-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {titleBreadcrumbs[viewBy] || 'Manager › Captain › RM'} · Selected Dates
            </h2>
            <p className="text-[11px] text-slate-400">
              Click a row to expand/focus. Click column headers to sort.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExpandAll}
              className="px-2.5 py-1 text-xs font-medium border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="px-2.5 py-1 text-xs font-medium border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              Collapse all
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-2.5 py-1 text-xs font-medium border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-50/60 dark:bg-slate-900/40">
                <th
                  onClick={() => handleSort('name')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-500 sticky left-0 bg-slate-50 dark:bg-[#111827] z-20"
                >
                  {LVN[LV[viewBy][0]] || 'MANAGER'}
                </th>
                <th onClick={() => handleSort('rms')} className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-500">
                  HEAD COUNT
                </th>
                <th onClick={() => handleSort('n')} className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-500">
                  TOTAL CALLS
                </th>
                <th onClick={() => handleSort('k')} className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-500">
                  CONNECTED
                </th>
                <th onClick={() => handleSort('nc')} className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-500">
                  NOT CONNECTED
                </th>
                <th onClick={() => handleSort('kp')} className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-500">
                  CONN %
                </th>
                <th onClick={() => handleSort('l')} className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-500">
                  LOGGED-IN
                </th>
                <th onClick={() => handleSort('i')} className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-500">
                  IDLE
                </th>
                <th onClick={() => handleSort('ip')} className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-500">
                  IDLE %
                </th>
                <th onClick={() => handleSort('h')} className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-500">
                  AHT
                </th>
                <th onClick={() => handleSort('b')} className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-500">
                  BREAK
                </th>
                <th onClick={() => handleSort('brkp')} className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-500">
                  BREAK %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              
              {/* Summary Row: All teams */}
              <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-semibold border-b border-slate-200 dark:border-slate-800">
                <td className="py-2.5 px-3 sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 pl-6">
                    <span className="text-xs text-slate-900 dark:text-slate-100">All teams</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right text-xs text-slate-900 dark:text-slate-100">
                  {totalSummary.rms}
                </td>
                <td className="py-2.5 px-3 text-right text-xs text-slate-900 dark:text-slate-100">
                  <b>{nf.format(totalSummary.n)}</b>{' '}
                  <small className="text-slate-400 font-normal">
                    ({totalSummary.rd ? f1(totalSummary.n / totalSummary.rd) : '0.0'}/d)
                  </small>
                </td>
                <td className="py-2.5 px-3 text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {nf.format(totalSummary.k)}
                </td>
                <td className="py-2.5 px-3 text-right text-xs font-semibold text-amber-500 dark:text-amber-400">
                  {nf.format(totalSummary.nc)}
                </td>
                <td className="py-2.5 px-3 text-right text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {fmtP(M.kp.get(totalSummary))}
                </td>
                <td className="py-2.5 px-3 text-right text-xs font-mono text-slate-900 dark:text-slate-100">
                  {fmtT(M.l.get(totalSummary))}
                </td>
                <td className="py-2.5 px-3 text-right text-xs font-mono text-slate-900 dark:text-slate-100">
                  {fmtT(M.i.get(totalSummary))}
                </td>
                <td className="py-2.5 px-3 text-right text-xs font-semibold text-amber-500 dark:text-amber-400">
                  {fmtP(M.ip.get(totalSummary))}
                </td>
                <td className="py-2.5 px-3 text-right text-xs font-mono text-slate-900 dark:text-slate-100">
                  {fmtT(M.h.get(totalSummary))}
                </td>
                <td className="py-2.5 px-3 text-right text-xs font-mono text-slate-900 dark:text-slate-100">
                  {fmtT(M.b.get(totalSummary))}
                </td>
                <td className="py-2.5 px-3 text-right text-xs font-semibold text-amber-500 dark:text-amber-400">
                  {fmtP(M.brkp.get(totalSummary))}
                </td>
              </tr>

              {/* Dynamic Hierarchical Tree Nodes */}
              {renderTreeRows(hierarchyTree, 0)}

            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
