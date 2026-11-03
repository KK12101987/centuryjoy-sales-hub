import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Eye,
  RefreshCw
} from 'lucide-react';
import { 
  CANONICAL_FIELDS, 
  autoDetectColumnMapping, 
  transformUploadedData 
} from '../utils/columnMatcher';
import { useData } from '../context/DataContext';

export default function UploadModal({ isOpen, onClose }) {
  const { importTickets } = useData();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [rawHeaders, setRawHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [ingestMode, setIngestMode] = useState('replace'); // 'replace' or 'append'
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processExcelFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    processExcelFile(dropped);
  };

  const processExcelFile = (uploadedFile) => {
    setErrorMsg('');
    setFile(uploadedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        
        // Pick first sheet
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        
        // Convert to array of objects
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (!data || data.length === 0) {
          setErrorMsg('Uploaded sheet is empty or contains no readable data.');
          setIsProcessing(false);
          return;
        }

        const headers = Object.keys(data[0] || {});
        setRawHeaders(headers);
        setRawRows(data);

        // Run auto column detection
        const detected = autoDetectColumnMapping(headers);
        setColumnMapping(detected);
        setIsProcessing(false);
      } catch (err) {
        console.error('File parsing error:', err);
        setErrorMsg(`Failed to parse file: ${err.message || 'Unknown format'}`);
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleMappingChange = (canonicalKey, selectedRawHeader) => {
    setColumnMapping((prev) => ({
      ...prev,
      [canonicalKey]: selectedRawHeader || undefined
    }));
  };

  const handleConfirmImport = () => {
    if (!columnMapping.ticketNo || !columnMapping.finalTotalAmount) {
      setErrorMsg('Please map both "Ticket Number" and "Total Amount" before proceeding.');
      return;
    }

    try {
      const normalizedRecords = transformUploadedData(rawRows, columnMapping);
      importTickets(normalizedRecords, ingestMode);
      onClose();
    } catch (err) {
      console.error('Import error:', err);
      setErrorMsg(`Import failed: ${err.message}`);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setRawHeaders([]);
    setRawRows([]);
    setColumnMapping({});
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Upload & Ingest L2 Approved Data
              </h2>
              <p className="text-xs text-slate-400">
                Resilient Ingestion Engine with automated fuzzy column detection & format normalization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!file ? (
            /* Dropzone */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-850/60 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-white">
                Drop your Excel (.xlsx, .xls) or CSV here
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Supports custom header formats, mismatched columns, and varying date/number styles
              </p>
              <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-sm">
                Browse File
              </span>
            </div>
          ) : (
            /* Uploaded File Overview & Column Mapping */
            <div className="space-y-4">
              
              {/* File Info Bar */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white">{file.name}</div>
                    <div className="text-slate-400 text-[11px]">
                      {rawRows.length.toLocaleString()} rows detected • {rawHeaders.length} columns found
                    </div>
                  </div>
                </div>
                <button
                  onClick={resetUpload}
                  className="px-2.5 py-1 rounded text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  Change File
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                <span className="font-semibold text-slate-300">Ingestion Mode:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ingestMode"
                    value="replace"
                    checked={ingestMode === 'replace'}
                    onChange={() => setIngestMode('replace')}
                    className="accent-indigo-500"
                  />
                  <span>Replace Current Month</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ingestMode"
                    value="append"
                    checked={ingestMode === 'append'}
                    onChange={() => setIngestMode('append')}
                    className="accent-indigo-500"
                  />
                  <span>Append & Deduplicate by Ticket No</span>
                </label>
              </div>

              {/* Smart Column Mapping Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Header Mapping & Verification
                  </span>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    {showPreview ? 'Hide Raw Preview' : 'Show 3-Row Preview'}
                  </button>
                </div>

                {/* 3-Row Raw Data Preview Drawer */}
                {showPreview && (
                  <div className="p-3 bg-slate-950 border-b border-slate-800 overflow-x-auto text-[11px]">
                    <div className="text-[10px] text-slate-500 mb-1 font-semibold uppercase">
                      First 3 Sample Rows from uploaded file:
                    </div>
                    <table className="w-full text-left font-mono">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          {rawHeaders.slice(0, 7).map(h => (
                            <th key={h} className="py-1 px-2 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {rawRows.slice(0, 3).map((r, i) => (
                          <tr key={i}>
                            {rawHeaders.slice(0, 7).map(h => (
                              <td key={h} className="py-1 px-2 whitespace-nowrap">{String(r[h] ?? '')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Mapping Selectors */}
                <div className="p-3 space-y-2.5 max-h-56 overflow-y-auto text-xs bg-slate-900/40">
                  {CANONICAL_FIELDS.map((field) => {
                    const matchedHeader = columnMapping[field.key] || '';
                    return (
                      <div 
                        key={field.key}
                        className="flex items-center justify-between gap-4 p-2 rounded-lg bg-slate-900/80 border border-slate-800/60"
                      >
                        <div className="min-w-[180px]">
                          <span className="font-semibold text-white">
                            {field.label}
                          </span>
                          {field.required && (
                            <span className="text-rose-400 ml-1 text-[11px] font-bold">*Required</span>
                          )}
                        </div>

                        <select
                          value={matchedHeader}
                          onChange={(e) => handleMappingChange(field.key, e.target.value)}
                          className={`flex-1 py-1 px-2 rounded-lg text-xs bg-slate-800 border ${
                            matchedHeader 
                              ? 'border-emerald-500/40 text-emerald-300' 
                              : field.required ? 'border-amber-500/40 text-amber-300' : 'border-slate-700 text-slate-400'
                          }`}
                        >
                          <option value="">-- Not Selected / Not in File --</option>
                          {rawHeaders.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 flex justify-between items-center bg-slate-900/80 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          {file && (
            <button
              onClick={handleConfirmImport}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ingest & Update Dashboard</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
