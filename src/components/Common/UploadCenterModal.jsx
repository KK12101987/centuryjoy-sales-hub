import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard,
  PhoneCall,
  Download,
  Headphones,
  Check,
  Eye
} from 'lucide-react';
import { 
  CANONICAL_FIELDS, 
  autoDetectColumnMapping, 
  transformUploadedData 
} from '../../utils/columnMatcher';
import { useData } from '../../context/DataContext';
import { getAllowedUploadTabs } from '../../utils/auth';

export default function UploadCenterModal({ isOpen, onClose, initialTab = 'l2' }) {
  const { 
    importTickets, 
    addTelephonyRows, 
    addQaAuditsBulk, 
    addDialerCalls,
    rmDirectory,
    updateRmMapping,
    hierarchy,
    currentUser
  } = useData();

  const allowedTabs = getAllowedUploadTabs(currentUser);

  // Initialize activeTab to requested tab only if allowed, else first allowed tab
  const getInitialTab = () => {
    if (initialTab && allowedTabs.includes(initialTab)) return initialTab;
    return allowedTabs[0] || 'l2';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab); // 'l2' | 'telephony' | 'qa' | 'dialer'

  // Sync activeTab when allowedTabs or initialTab changes
  React.useEffect(() => {
    if (allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
    }
  }, [allowedTabs, activeTab]);
  
  // Shared state
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Tab 1: L2 Ingestion State
  const [l2RawHeaders, setL2RawHeaders] = useState([]);
  const [l2RawRows, setL2RawRows] = useState([]);
  const [l2ColumnMapping, setL2ColumnMapping] = useState({});
  const [l2IngestMode, setL2IngestMode] = useState('replace');
  const [l2ShowPreview, setL2ShowPreview] = useState(false);

  // Tab 2: Telephony Ingestion State
  const [telRows, setTelRows] = useState([]);
  const [telMode, setTelMode] = useState('append');
  const [missingRMs, setMissingRMs] = useState([]);
  const [rmAssignments, setRmAssignments] = useState({});

  // Tab 3: QA Ingestion State
  const [qaRows, setQaRows] = useState([]);
  const [qaMode, setQaMode] = useState('append');

  // Tab 4: Dialer Ingestion State
  const [dialerRows, setDialerRows] = useState([]);
  const [dialerMode, setDialerMode] = useState('append');

  if (!isOpen) return null;

  // Reset form when switching tabs
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setFile(null);
    setStatusMsg({ type: '', text: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ==========================================
  // TAB 1: L2 FINANCIAL PROCESSING
  // ==========================================
  const processL2File = (uploadedFile) => {
    setStatusMsg({ type: '', text: '' });
    setFile(uploadedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!data || data.length === 0) {
          setStatusMsg({ type: 'error', text: 'Uploaded sheet is empty or contains no readable data.' });
          setIsProcessing(false);
          return;
        }

        const headers = Object.keys(data[0] || {});
        setL2RawHeaders(headers);
        setL2RawRows(data);

        const detected = autoDetectColumnMapping(headers);
        setL2ColumnMapping(detected);
        setIsProcessing(false);
      } catch (err) {
        console.error('File parsing error:', err);
        setStatusMsg({ type: 'error', text: `Failed to parse file: ${err.message || 'Unknown format'}` });
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleL2MappingChange = (canonicalKey, selectedRawHeader) => {
    setL2ColumnMapping((prev) => ({
      ...prev,
      [canonicalKey]: selectedRawHeader || undefined
    }));
  };

  const handleConfirmL2Import = () => {
    if (!l2ColumnMapping.ticketNo || !l2ColumnMapping.finalTotalAmount) {
      setStatusMsg({ type: 'error', text: 'Please map both "Ticket Number" and "Total Amount" before proceeding.' });
      return;
    }

    try {
      const normalizedRecords = transformUploadedData(l2RawRows, l2ColumnMapping);
      importTickets(normalizedRecords, l2IngestMode);
      setStatusMsg({ type: 'success', text: `Successfully ingested ${normalizedRecords.length.toLocaleString()} L2 tickets (${l2IngestMode === 'replace' ? 'dataset replaced' : 'appended'}).` });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Import error:', err);
      setStatusMsg({ type: 'error', text: `Import failed: ${err.message}` });
    }
  };

  // ==========================================
  // TAB 2: TELEPHONY PROCESSING & TEMPLATE
  // ==========================================
  const downloadTelephonyTemplate = () => {
    const headers = [
      "DATE", "FULL NAME", "AGENT ID", "PROCESS", "TOTAL CALLS", "ANSWERED", "MISSED", 
      "TOTAL IN CALLS", "CONNECTED", "NOT CONNECTED", "TOTAL OUT CALLS", "ANSWERED", 
      "MISSED", "TOTAL RECEIVED TRANSFER CALLS", "LOGGED IN DURATION", "IDLE TIME", 
      "TALK TIME", "HOLD TIME", "WRAP UP", "RINGING", "DIALING", "BREAK TIME", 
      "IDLE TIME", "TALK TIME", "HOLD TIME", "WRAP UP", "AHT", "BREAK COUNT", 
      "LUNCH", "BIOBREAK", "CRM_UPDATE", "CALL_CUG", "WHATSAPP_CALL", "ACQUIS_MEET", 
      "BILL_UPLOAD", "CALL_LISTENING", "TEA_BREAK", "LUNCH_BREAK", "BIO_BREAK", 
      "OPERATION_WORK", "TEAM_MEET", "TRANING_BREAK", "WhatsApp", "CRM", "TEAMMEETING", 
      "FIRSTLOGIN", "OUTBOUND"
    ];
    const subheaders = [""];
    const ws = XLSX.utils.aoa_to_sheet([headers, subheaders]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Agent Performance Report");
    XLSX.writeFile(wb, "Agent_Performance_Template.xlsx");
  };

  const processTelephonyFile = (uploadedFile) => {
    setStatusMsg({ type: '', text: '' });
    setFile(uploadedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawData || rawData.length === 0) {
          setStatusMsg({ type: 'error', text: 'Spreadsheet has no rows.' });
          setIsProcessing(false);
          return;
        }

        // Check for missing RMs against rmDirectory
        const knownRMs = new Set((rmDirectory || []).map((r) => (r.rm_name || '').toLowerCase().trim()));
        const missing = [];
        const initialAssignments = {};

        // Parse rows
        const parsedRows = rawData.map((row, idx) => {
          const rmRaw = row['FULL NAME'] || row['Full Name'] || row['RM Name'] || row['Agent Name'] || row['Agent ID'] || `Agent_${idx}`;
          const rmClean = String(rmRaw).trim();
          const rmKey = rmClean.toLowerCase();

          // If not in known directory, mark for assignment
          if (rmClean && !knownRMs.has(rmKey) && !missing.includes(rmClean)) {
            missing.push(rmClean);
            initialAssignments[rmClean] = {
              captain: 'Nasima Banu',
              manager: 'Surajit Laha',
              process: row['PROCESS'] || 'Telephony'
            };
          }

          // Extract standard numeric metrics
          const dials = Number(row['TOTAL CALLS'] || row['Total Calls'] || row['TOTAL OUT CALLS'] || row['Dials'] || 0);
          const conn = Number(row['CONNECTED'] || row['Answered'] || row['Total Answered'] || 0);
          let dur = 0;
          const talkRaw = row['TALK TIME'] || row['Talk Time'] || row['Duration'] || 0;
          if (typeof talkRaw === 'number') {
            dur = talkRaw > 1000 ? Math.round(talkRaw) : Math.round(talkRaw * 60);
          } else if (typeof talkRaw === 'string' && talkRaw.includes(':')) {
            const parts = talkRaw.split(':').map(Number);
            dur = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : (parts[0] || 0) * 60 + (parts[1] || 0);
          }

          // Resolve captain & manager from directory
          const matchedRM = (rmDirectory || []).find((r) => (r.rm_name || '').toLowerCase().trim() === rmKey);

          return {
            r: rmClean,
            c: matchedRM?.captain_name || row['Captain'] || 'Direct Team',
            m: matchedRM?.manager_name || row['Manager'] || 'Surajit Laha',
            a: row['PROCESS'] || matchedRM?.team_name || 'Telephony',
            d: row['DATE'] || row['Date'] || new Date().toISOString().split('T')[0],
            t: dials,
            conn: conn,
            dur: dur,
          };
        });

        setTelRows(parsedRows);
        setMissingRMs(missing);
        setRmAssignments(initialAssignments);
        setIsProcessing(false);
      } catch (err) {
        console.error('Telephony file error:', err);
        setStatusMsg({ type: 'error', text: `Failed to parse telephony report: ${err.message}` });
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleConfirmTelephonyImport = () => {
    // 1. Commit any missing RM mappings
    if (missingRMs.length > 0) {
      missingRMs.forEach((rmName) => {
        const assign = rmAssignments[rmName] || { captain: 'Nasima Banu', manager: 'Surajit Laha', process: 'Telephony' };
        updateRmMapping(rmName, assign.captain, assign.manager, assign.process);
      });
    }

    // 2. Ingest rows into DataContext
    try {
      addTelephonyRows(telRows);
      setStatusMsg({
        type: 'success',
        text: `Successfully ingested ${telRows.length.toLocaleString()} telephony records${missingRMs.length > 0 ? ` and registered ${missingRMs.length} new RMs` : ''}.`
      });
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Failed to save telephony data: ${err.message}` });
    }
  };

  // ==========================================
  // TAB 3: QA HISTORICAL AUDITS PROCESSING
  // ==========================================
  const processQaFile = (uploadedFile) => {
    setStatusMsg({ type: '', text: '' });
    setFile(uploadedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawData || rawData.length === 0) {
          setStatusMsg({ type: 'error', text: 'QA sheet is empty.' });
          setIsProcessing(false);
          return;
        }

        const parsedAudits = rawData.map((row, idx) => {
          const rm = row['Name'] || row['RM Name'] || row['Agent Name'] || 'Agent';
          const matchedRM = (rmDirectory || []).find((r) => (r.rm_name || '').toLowerCase() === String(rm).toLowerCase());
          
          return {
            id: `audit-up-${Date.now()}-${idx}`,
            audit_id: row['Sl.'] || `AUD-${idx + 100}`,
            rm_name: rm,
            captain_name: matchedRM?.captain_name || row['Captain'] || 'Direct Team',
            manager_name: matchedRM?.manager_name || row['Manager'] || 'Surajit Laha',
            mobile_number: String(row['Mobile Number'] || row['Phone Number'] || row['Customer Phone'] || ''),
            call_duration: String(row['Call Duration'] || '00:03:00'),
            call_date: row['Call Date'] || new Date().toISOString().split('T')[0],
            audit_date: row['Audit Date'] || new Date().toISOString().split('T')[0],
            franchise: row['Franchise'] || matchedRM?.team_name || 'Joy Kolkata',
            auditor_name: row['Auditor'] || 'QA Team',
            total_score: Number(row['Total Score'] || row['Score'] || 80),
            percentage: Number(row['%age'] || row['Percentage'] || 80),
            observations: row['Audit Observation'] || row['Remarks'] || 'Audit record imported from historical spreadsheet.',
            scores: {
              Introduction: Number(row['Introduction'] || 10),
              'Project Registration': Number(row['Project Registration'] || 10),
              'Product & Pricing requirement': Number(row['Product & Pricing requirement'] || 10),
              'Product FeedBack': Number(row['Product FeedBack'] || 10),
              'Cross & Upsell of product': Number(row['Cross & Upsell of product'] || 10),
              'Marketing Benefit': Number(row['Marketing Benefit'] || 10),
              Redemption: Number(row['Redemption'] || 10),
              'Call Closure': Number(row['Call Closure'] || 10),
              'GTM Adherence': Number(row['GTM Adherence'] || 10),
              'CRM Update': Number(row['CRM Update'] || 10),
              Softskill: Number(row['Softskill'] || 10),
            }
          };
        });

        setQaRows(parsedAudits);
        setIsProcessing(false);
      } catch (err) {
        console.error('QA parse error:', err);
        setStatusMsg({ type: 'error', text: `Failed to parse QA file: ${err.message}` });
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleConfirmQaImport = () => {
    try {
      addQaAuditsBulk(qaRows, qaMode);
      setStatusMsg({ type: 'success', text: `Successfully imported ${qaRows.length.toLocaleString()} QA audit evaluations!` });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Failed to save QA audits: ${err.message}` });
    }
  };

  // ==========================================
  // TAB 4: DIALER CALLS PROCESSING
  // ==========================================
  const processDialerFile = (uploadedFile) => {
    setStatusMsg({ type: '', text: '' });
    setFile(uploadedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawData || rawData.length === 0) {
          setStatusMsg({ type: 'error', text: 'Dialer export is empty.' });
          setIsProcessing(false);
          return;
        }

        const parsedCalls = rawData.map((row, idx) => ({
          id: `dialer-up-${Date.now()}-${idx}`,
          phone_no: String(row['Phone No'] || row['phone_no'] || row['Phone Number'] || row['Customer Phone'] || '').trim(),
          agent_id: String(row['Agent ID'] || row['agent_id'] || row['Agent'] || 'agent_01'),
          duration: String(row['Duration'] || row['duration'] || row['Talk Time'] || '00:01:00'),
          status: String(row['Status'] || row['status'] || 'Completed'),
          call_date: String(row['Call Date'] || row['call_date'] || new Date().toISOString().replace('T', ' ').slice(0, 19)),
          recording_file: String(row['Recording File'] || row['recording_file'] || row['Audio URL'] || ''),
          process: String(row['Process'] || row['process'] || 'CenturyJoy'),
          discarded: 0
        })).filter(c => Boolean(c.phone_no));

        setDialerRows(parsedCalls);
        setIsProcessing(false);
      } catch (err) {
        console.error('Dialer parse error:', err);
        setStatusMsg({ type: 'error', text: `Failed to parse dialer file: ${err.message}` });
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleConfirmDialerImport = () => {
    try {
      addDialerCalls(dialerRows, dialerMode);
      setStatusMsg({ type: 'success', text: `Successfully loaded ${dialerRows.length.toLocaleString()} dialer call records for QA auditing!` });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Failed to save dialer calls: ${err.message}` });
    }
  };

  // Generic File Pick Handler
  const handleGenericFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (activeTab === 'l2') processL2File(selected);
    else if (activeTab === 'telephony') processTelephonyFile(selected);
    else if (activeTab === 'qa') processQaFile(selected);
    else if (activeTab === 'dialer') processDialerFile(selected);
  };

  const handleGenericDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    if (activeTab === 'l2') processL2File(dropped);
    else if (activeTab === 'telephony') processTelephonyFile(dropped);
    else if (activeTab === 'qa') processQaFile(dropped);
    else if (activeTab === 'dialer') processDialerFile(dropped);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center border border-brand-500/30 shadow-md">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Universal Data Ingestion Center</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  Enterprise
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Multi-domain pipeline for L2 Approvals, Telephony Dumps, QA Audits & Dialer Call Logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Ribbon */}
        {allowedTabs.length > 0 ? (
          <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/40 overflow-x-auto">
            {allowedTabs.includes('l2') && (
              <button
                onClick={() => handleTabSwitch('l2')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'l2'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>L2 Approvals Financials</span>
              </button>
            )}

            {allowedTabs.includes('telephony') && (
              <button
                onClick={() => handleTabSwitch('telephony')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'telephony'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>RM Telephony Performance</span>
              </button>
            )}

            {allowedTabs.includes('qa') && (
              <button
                onClick={() => handleTabSwitch('qa')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'qa'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Historical QA Audits</span>
              </button>
            )}

            {allowedTabs.includes('dialer') && (
              <button
                onClick={() => handleTabSwitch('dialer')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'dialer'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>Dialer Call Recordings Log</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-950/40 border-b border-slate-800 text-slate-400 text-xs">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="font-bold text-white text-sm">Upload Ingestion Restricted</p>
            <p className="mt-1 max-w-md mx-auto">Your current user role ({currentUser?.designation || currentUser?.role}) operates in read-only review mode without data upload privileges.</p>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Status Alert */}
          {statusMsg.text && (
            <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              statusMsg.type === 'error'
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
            }`}>
              {statusMsg.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 1: L2 FINANCIAL APPROVALS */}
          {/* ==================================================== */}
          {activeTab === 'l2' && (
            <div className="space-y-4">
              {!file ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleGenericDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-850/60 transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleGenericFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-white">
                    Drop your L2 Approved Excel (.xlsx, .xls) or CSV here
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Smart column mapper auto-aligns Ticket No, Final Total Amount, RM Name, Captain, Manager, and Dates.
                  </p>
                  <span className="inline-block mt-4 px-4 py-1.5 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-sm">
                    Browse File
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div className="font-bold text-white">{file.name}</div>
                        <div className="text-slate-400 text-[11px]">
                          {l2RawRows.length.toLocaleString()} rows detected • {l2RawHeaders.length} columns found
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                    >
                      Change File
                    </button>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                    <span className="font-semibold text-slate-300">Ingestion Mode:</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="l2IngestMode"
                        value="replace"
                        checked={l2IngestMode === 'replace'}
                        onChange={() => setL2IngestMode('replace')}
                        className="accent-brand-500"
                      />
                      <span>Replace Current Dataset</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="l2IngestMode"
                        value="append"
                        checked={l2IngestMode === 'append'}
                        onChange={() => setL2IngestMode('append')}
                        className="accent-brand-500"
                      />
                      <span>Append to Existing</span>
                    </label>
                  </div>

                  {/* Column Mapping Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Column Auto-Detection &amp; Field Verification
                      </h3>
                      <button
                        onClick={() => setL2ShowPreview(!l2ShowPreview)}
                        className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{l2ShowPreview ? 'Hide Preview' : 'Show Sample Preview'}</span>
                      </button>
                    </div>

                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
                      <div className="max-h-56 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-900 sticky top-0 border-b border-slate-800 text-slate-400">
                            <tr>
                              <th className="py-2.5 px-3 font-semibold">Standard System Field</th>
                              <th className="py-2.5 px-3 font-semibold">Matched Excel Header</th>
                              <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {CANONICAL_FIELDS.map((field) => {
                              const matchedHeader = l2ColumnMapping[field.key] || '';
                              return (
                                <tr key={field.key} className="hover:bg-slate-850/50">
                                  <td className="py-2 px-3">
                                    <div className="font-semibold text-slate-200">
                                      {field.label}
                                      {field.required && <span className="text-rose-400 ml-1">*</span>}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono">{field.key}</div>
                                  </td>
                                  <td className="py-2 px-3">
                                    <select
                                      value={matchedHeader}
                                      onChange={(e) => handleL2MappingChange(field.key, e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-500"
                                    >
                                      <option value="">-- Ignore Field --</option>
                                      {l2RawHeaders.map((header) => (
                                        <option key={header} value={header}>
                                          {header}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    {matchedHeader ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                                        <Check className="w-3.5 h-3.5" /> Mapped
                                      </span>
                                    ) : field.required ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] text-rose-400">
                                        <AlertTriangle className="w-3.5 h-3.5" /> Required
                                      </span>
                                    ) : (
                                      <span className="text-[11px] text-slate-500">Optional</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setFile(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmL2Import}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm &amp; Ingest L2 Records</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: TELEPHONY PRODUCTIVITY & TEMPLATE */}
          {/* ==================================================== */}
          {activeTab === 'telephony' && (
            <div className="space-y-4">
              {/* Telephony Header & Template Button */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Agent Performance Daily Calling Report
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload official dialer agent report. New rows will be appended with automatic RM Captain &amp; Manager mapping.
                  </p>
                </div>
                <button
                  onClick={downloadTelephonyTemplate}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>Download Blank Template</span>
                </button>
              </div>

              {!file ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleGenericDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-850/60 transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleGenericFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-white">
                    Drop your Agent Performance Report (.xlsx, .csv)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Supports columns: DATE, FULL NAME, TOTAL CALLS, CONNECTED, TALK TIME, IDLE TIME, BREAK COUNT, etc.
                  </p>
                  <span className="inline-block mt-4 px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm">
                    Browse File
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                      <div>
                        <div className="font-bold text-white">{file.name}</div>
                        <div className="text-slate-400 text-[11px]">
                          {telRows.length.toLocaleString()} agent records parsed
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                    >
                      Change File
                    </button>
                  </div>

                  {/* Missing RM Mapper Prompt */}
                  {missingRMs.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>{missingRMs.length} Unmapped RMs Detected in Uploaded Sheet</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Please assign their reporting RM Captain and Senior Manager so their telephony metrics correctly roll up:
                      </p>
                      
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                        {missingRMs.map((rm) => (
                          <div key={rm} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                            <span className="font-bold text-white">{rm}</span>
                            <div className="flex items-center gap-2">
                              <select
                                value={rmAssignments[rm]?.captain || 'Nasima Banu'}
                                onChange={(e) => setRmAssignments(prev => ({
                                  ...prev,
                                  [rm]: { ...prev[rm], captain: e.target.value }
                                }))}
                                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                              >
                                <option value="Nasima Banu">Capt. Nasima Banu</option>
                                <option value="Priyanka Sen">Capt. Priyanka Sen</option>
                                <option value="Sanjay Roy">Capt. Sanjay Roy</option>
                                <option value="Pooja Kumari">Capt. Pooja Kumari</option>
                                <option value="Amit Kumar">Capt. Amit Kumar</option>
                              </select>

                              <select
                                value={rmAssignments[rm]?.manager || 'Surajit Laha'}
                                onChange={(e) => setRmAssignments(prev => ({
                                  ...prev,
                                  [rm]: { ...prev[rm], manager: e.target.value }
                                }))}
                                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                              >
                                <option value="Surajit Laha">Mgr. Surajit Laha</option>
                                <option value="Niladri Bhadra">Mgr. Niladri Bhadra</option>
                                <option value="Arijit Nath">Mgr. Arijit Nath</option>
                                <option value="Amit Singal">Mgr. Amit Singal</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setFile(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmTelephonyImport}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm &amp; Ingest Telephony Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: QA HISTORICAL AUDITS */}
          {/* ==================================================== */}
          {activeTab === 'qa' && (
            <div className="space-y-4">
              {!file ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleGenericDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-850/60 transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleGenericFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-white">
                    Drop Historical QA Audit Spreadsheet (.xlsx, .csv)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Loads audits with all 11 evaluation categories (Introduction, Pricing, GTM Adherence, Softskill, Total Score).
                  </p>
                  <span className="inline-block mt-4 px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-sm">
                    Browse File
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="font-bold text-white">{file.name}</div>
                        <div className="text-slate-400 text-[11px]">
                          {qaRows.length.toLocaleString()} historical QA evaluations parsed
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                    >
                      Change File
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setFile(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmQaImport}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm &amp; Ingest QA Audits</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: DIALER CALL RECORDINGS */}
          {/* ==================================================== */}
          {activeTab === 'dialer' && (
            <div className="space-y-4">
              {!file ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleGenericDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-850/60 transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv, .html"
                    onChange={handleGenericFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-white">
                    Drop Dialer Export (.xlsx, .csv, .html)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Loads Phone No, Duration, Agent ID, Call Date, and Audio Recording links for instant 1-click QA auditing.
                  </p>
                  <span className="inline-block mt-4 px-4 py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-sm">
                    Browse File
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="font-bold text-white">{file.name}</div>
                        <div className="text-slate-400 text-[11px]">
                          {dialerRows.length.toLocaleString()} dialer call records parsed
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                    >
                      Change File
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setFile(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDialerImport}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm &amp; Load Dialer Calls</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Info */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>All ingestions undergo live schema validation &amp; anti-tamper integrity checks</span>
          </div>
          <span>Century Joy v5.0</span>
        </div>

      </div>
    </div>
  );
}
