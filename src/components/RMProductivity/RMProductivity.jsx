import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { nf, fmtDuration } from '../../utils/formatters';
import { getAllowedUploadTabs } from '../../utils/auth';
import * as XLSX from 'xlsx';
import { 
  PhoneCall, 
  Clock, 
  Users, 
  Upload, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Calendar, 
  Filter, 
  GitBranch, 
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Building2
} from 'lucide-react';

export default function RMProductivity() {
  const { 
    telephony, 
    scopedTelephony,
    addTelephonyRows, 
    hierarchy, 
    updateRmMapping, 
    scopeFilter, 
    rmDirectory,
    openUploadModal,
    currentUser
  } = useData();

  const allowedUploadTabs = getAllowedUploadTabs(currentUser);
  const canUploadTelephony = allowedUploadTabs.includes('telephony');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState('manager'); // 'manager' | 'captain' | 'rm'
  const [datePreset, setDatePreset] = useState('full'); // 'full' | 'oct' | 'nov' | 'last7' | 'today'
  const [openNodes, setOpenNodes] = useState(() => {
    if (currentUser?.role === 'manager' && currentUser.managerKey) {
      return new Set([currentUser.managerKey]);
    }
    if (currentUser?.role === 'captain') {
      return new Set([currentUser.managerKey || 'Arijit Nath', currentUser.captainKey || currentUser.name]);
    }
    return new Set(['Surajit Laha', 'Niladri Bhadra', 'Arijit Nath', 'Amit Singal']);
  });

  useEffect(() => {
    if (currentUser?.role === 'manager' && currentUser.managerKey) {
      setOpenNodes(new Set([currentUser.managerKey]));
    } else if (currentUser?.role === 'captain') {
      setOpenNodes(new Set([currentUser.managerKey || 'Arijit Nath', currentUser.captainKey || currentUser.name]));
    }
  }, [currentUser]);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Transfer form state
  const [transferData, setTransferData] = useState({
    agentName: '',
    newCaptain: 'Nasima Banu',
    newManager: 'Surajit Laha',
  });

  // Filtered Telephony Records strictly adhering to supervisory scope
  const filteredRecords = useMemo(() => {
    const base = scopedTelephony || telephony;
    return base.filter((r) => {
      // Scope filter
      if (scopeFilter?.manager && scopeFilter.manager !== 'all' && r.m !== scopeFilter.manager) return false;
      if (scopeFilter?.captain && scopeFilter.captain !== 'all' && r.c !== scopeFilter.captain) return false;

      // Date preset
      if (datePreset === 'oct' && !r.d.startsWith('2026-10')) return false;
      if (datePreset === 'nov' && !r.d.startsWith('2026-11')) return false;
      if (datePreset === 'today' && r.d !== '2026-11-16') return false;

      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const rName = (r.r || '').toLowerCase();
        const cName = (r.c || '').toLowerCase();
        const mName = (r.m || '').toLowerCase();
        const aName = (r.a || '').toLowerCase();
        return rName.includes(q) || cName.includes(q) || mName.includes(q) || aName.includes(q);
      }

      return true;
    });
  }, [scopedTelephony, telephony, scopeFilter, datePreset, searchQuery]);

  // Aggregate Metrics
  const totalDials = useMemo(() => filteredRecords.reduce((sum, r) => sum + (r.t || 0), 0), [filteredRecords]);
  const totalConnected = useMemo(() => filteredRecords.reduce((sum, r) => sum + (r.conn || 0), 0), [filteredRecords]);
  const totalDuration = useMemo(() => filteredRecords.reduce((sum, r) => sum + (r.dur || 0), 0), [filteredRecords]);
  const uniqueAgents = useMemo(() => new Set(filteredRecords.map((r) => r.r)).size, [filteredRecords]);

  const connectivityRate = totalDials > 0 ? ((totalConnected / totalDials) * 100).toFixed(1) : '0.0';
  const avgTalkSec = totalConnected > 0 ? Math.round(totalDuration / totalConnected) : 0;

  // Toggle tree node
  const toggleNode = (nodeKey) => {
    setOpenNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeKey)) next.delete(nodeKey);
      else next.add(nodeKey);
      return next;
    });
  };

  // Build tree based on selectedView
  const hierarchicalTree = useMemo(() => {
    const tree = {};

    filteredRecords.forEach((rec) => {
      const mgr = rec.m || 'General Operations';
      const cap = rec.c || 'Direct Team';
      const rm = rec.r;

      if (!tree[mgr]) {
        tree[mgr] = { dials: 0, conn: 0, dur: 0, captains: {} };
      }
      tree[mgr].dials += rec.t || 0;
      tree[mgr].conn += rec.conn || 0;
      tree[mgr].dur += rec.dur || 0;

      if (!tree[mgr].captains[cap]) {
        tree[mgr].captains[cap] = { dials: 0, conn: 0, dur: 0, rms: {} };
      }
      tree[mgr].captains[cap].dials += rec.t || 0;
      tree[mgr].captains[cap].conn += rec.conn || 0;
      tree[mgr].captains[cap].dur += rec.dur || 0;

      if (!tree[mgr].captains[cap].rms[rm]) {
        tree[mgr].captains[cap].rms[rm] = { dials: 0, conn: 0, dur: 0, agency: rec.a };
      }
      tree[mgr].captains[cap].rms[rm].dials += rec.t || 0;
      tree[mgr].captains[cap].rms[rm].conn += rec.conn || 0;
      tree[mgr].captains[cap].rms[rm].dur += rec.dur || 0;
    });

    return tree;
  }, [filteredRecords]);

  // Handle Excel Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Parsing spreadsheet...');
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const sheetName = wb.SheetNames[0];
        const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);

        const mappedRows = rawRows.map((row) => ({
          r: row['RM Name'] || row['Agent ID'] || row['Agent Name'] || 'Agent',
          c: row['Captain'] || row['Captain Name'] || 'Direct Team',
          m: row['Manager'] || row['Manager Name'] || 'Surajit Laha',
          a: row['Process'] || row['Agency'] || 'Telephony',
          d: row['Date'] || new Date().toISOString().split('T')[0],
          t: Number(row['Dials'] || row['Total Calls'] || 50),
          conn: Number(row['Connected'] || row['Answered'] || 25),
          dur: Number(row['Talk Time (Sec)'] || row['Duration'] || 3000),
        }));

        addTelephonyRows(mappedRows);
        setUploadStatus(`Success! Ingested ${mappedRows.length} telephony rows.`);
        setTimeout(() => {
          setIsUploadOpen(false);
          setUploadStatus('');
        }, 1500);
      } catch (err) {
        setUploadStatus(`Error: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmTransfer = (e) => {
    e.preventDefault();
    if (!transferData.agentName) return;
    updateRmMapping(transferData.agentName, transferData.newCaptain, transferData.newManager);
    setIsTransferOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Dials */}
        <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Dials</span>
            <PhoneCall className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {nf.format(totalDials)}
          </div>
          <div className="text-[11px] text-slate-500">All outbound call attempts</div>
        </div>

        {/* Connected Calls */}
        <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Connected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {nf.format(totalConnected)}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold">{connectivityRate}% Connect Rate</div>
        </div>

        {/* Total Talk Time */}
        <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Talk Time</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {fmtDuration(totalDuration)}
          </div>
          <div className="text-[11px] text-slate-500">Cumulative conversation time</div>
        </div>

        {/* Avg Call Duration */}
        <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Talk Time</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {fmtDuration(avgTalkSec)}
          </div>
          <div className="text-[11px] text-slate-500">Per connected conversation</div>
        </div>

        {/* Active Agents */}
        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Calling Agents</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {uniqueAgents} <span className="text-xs font-normal text-slate-400">RMs Active</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {currentUser?.role === 'manager'
              ? `${currentUser.managerKey || currentUser.name} Division`
              : currentUser?.role === 'captain'
              ? `${currentUser.teamName || currentUser.captainKey || currentUser.name} Pod`
              : 'Across 4 Senior Managers'}
          </div>
        </div>

      </div>

      {/* Filter & Action Toolbar */}
      <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search & Presets */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agent, captain, team..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Date Presets */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs">
            <button
              onClick={() => setDatePreset('full')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                datePreset === 'full' ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-300 shadow-sm' : 'text-slate-500'
              }`}
            >
              Full Range
            </button>
            <button
              onClick={() => setDatePreset('oct')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                datePreset === 'oct' ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-300 shadow-sm' : 'text-slate-500'
              }`}
            >
              October Live
            </button>
            <button
              onClick={() => setDatePreset('nov')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                datePreset === 'nov' ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-300 shadow-sm' : 'text-slate-500'
              }`}
            >
              November Live
            </button>
            <button
              onClick={() => setDatePreset('today')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                datePreset === 'today' ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-300 shadow-sm' : 'text-slate-500'
              }`}
            >
              Latest Day
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
            <button
              onClick={() => setIsTransferOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Transfer RM</span>
            </button>
          )}

          {canUploadTelephony && (
            <button
              onClick={() => openUploadModal('telephony')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Dialer Dump</span>
            </button>
          )}
        </div>

      </div>

      {/* Hierarchical Telephony Drilldown Tree */}
      <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-brand-500" />
            <span>
              {currentUser?.role === 'manager'
                ? `Hierarchical Telephony Drilldown (${currentUser.managerKey} Division)`
                : currentUser?.role === 'captain'
                ? `Hierarchical Telephony Drilldown (${currentUser.teamName || currentUser.captainKey} Pod)`
                : 'Hierarchical Telephony Drilldown (Manager › Captain › RM)'}
            </span>
          </h2>
          <span className="text-xs text-slate-400">Click to expand/collapse</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {Object.entries(hierarchicalTree).map(([mgr, mgrData]) => {
            const isMgrOpen = openNodes.has(mgr);
            const mgrConnRate = mgrData.dials > 0 ? ((mgrData.conn / mgrData.dials) * 100).toFixed(1) : 0;

            return (
              <div key={mgr} className="transition-colors">
                
                {/* Manager Row */}
                <div 
                  onClick={() => toggleNode(mgr)}
                  className="px-6 py-4 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center space-x-3">
                    {isMgrOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">{mgr}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold uppercase">
                      Senior Manager
                    </span>
                  </div>

                  <div className="flex items-center space-x-6 text-xs">
                    <div>
                      <span className="text-slate-400">Dials: </span>
                      <span className="font-bold text-slate-900 dark:text-white">{nf.format(mgrData.dials)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Conn %: </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{mgrConnRate}%</span>
                    </div>
                    <div className="font-mono">
                      <span className="text-slate-400">Talk Time: </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{fmtDuration(mgrData.dur)}</span>
                    </div>
                  </div>
                </div>

                {/* Captains Sub-Tree */}
                {isMgrOpen && (
                  <div className="pl-8 pr-6 py-2 space-y-2 bg-white dark:bg-[#0e1320]">
                    {Object.entries(mgrData.captains).map(([cap, capData]) => {
                      const isCapOpen = openNodes.has(`${mgr}-${cap}`);
                      const capConnRate = capData.dials > 0 ? ((capData.conn / capData.dials) * 100).toFixed(1) : 0;

                      return (
                        <div key={cap} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                          
                          {/* Captain Header */}
                          <div 
                            onClick={() => toggleNode(`${mgr}-${cap}`)}
                            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                          >
                            <div className="flex items-center space-x-2">
                              {isCapOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                              <span className="font-bold text-xs text-slate-900 dark:text-white">{cap}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                                Pod Captain
                              </span>
                            </div>

                            <div className="flex items-center space-x-4 text-xs">
                              <span className="text-slate-500">{nf.format(capData.dials)} Dials</span>
                              <span className="font-semibold text-emerald-600">{capConnRate}%</span>
                              <span className="font-mono text-slate-400">{fmtDuration(capData.dur)}</span>
                            </div>
                          </div>

                          {/* RM Leaf Nodes */}
                          {isCapOpen && (
                            <div className="p-3 bg-white dark:bg-[#0b0f19] divide-y divide-slate-100 dark:divide-slate-800/80">
                              {Object.entries(capData.rms).map(([rmName, rmStats]) => {
                                const rmRate = rmStats.dials > 0 ? ((rmStats.conn / rmStats.dials) * 100).toFixed(1) : 0;
                                return (
                                  <div key={rmName} className="py-2.5 px-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-lg">
                                    <div>
                                      <span className="font-semibold text-slate-900 dark:text-white">{rmName}</span>
                                      <span className="text-[10px] text-slate-400 ml-2 font-mono">({rmStats.agency})</span>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                      <span className="text-slate-600 dark:text-slate-300 font-medium">{rmStats.dials} dials</span>
                                      <span className="text-emerald-600 font-bold">{rmStats.conn} conn ({rmRate}%)</span>
                                      <span className="font-mono text-slate-500 font-semibold">{fmtDuration(rmStats.dur)}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* UPLOAD DIALER MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-brand-600" />
                <span>Upload Telephony Dump</span>
              </h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
            </div>

            <p className="text-xs text-slate-500">
              Select an Excel (.xlsx, .xls) or CSV dialer export. Columns mapped: Agent Name/ID, Dials, Connected, Talk Time, Date.
            </p>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center space-y-3">
              <Upload className="w-8 h-8 text-brand-500 mx-auto" />
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
            </div>

            {uploadStatus && (
              <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl text-xs text-brand-700 dark:text-brand-300 font-medium">
                {uploadStatus}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TRANSFER RM MODAL */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-purple-600" />
                <span>Transfer RM Scope</span>
              </h3>
              <button onClick={() => setIsTransferOpen(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
            </div>

            <form onSubmit={handleConfirmTransfer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select RM / Agent</label>
                <select
                  value={transferData.agentName}
                  onChange={(e) => setTransferData((prev) => ({ ...prev, agentName: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  required
                >
                  <option value="">-- Choose Agent --</option>
                  {rmDirectory.filter((r) => r.status !== 'inactive').map((rm) => (
                    <option key={rm.rm_name} value={rm.rm_name}>{rm.rm_name} ({rm.captain_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">New Senior Manager</label>
                <select
                  value={transferData.newManager}
                  onChange={(e) => setTransferData((prev) => ({ ...prev, newManager: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  {['Surajit Laha', 'Niladri Bhadra', 'Arijit Nath', 'Amit Singal'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">New Pod Captain</label>
                <select
                  value={transferData.newCaptain}
                  onChange={(e) => setTransferData((prev) => ({ ...prev, newCaptain: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  {['Arshi Afreen Jamal', 'Mousumi Chakraborty', 'Nasima Banu', 'Pallabi Chura', 'Ranjana Mohajan', 'Shiuli Bhattacharjee', 'Silpa Palchina', 'Direct Supervision'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsTransferOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold">Confirm Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
