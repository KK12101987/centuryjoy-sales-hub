import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { 
  Sliders, 
  X, 
  Check, 
  Copy, 
  Eye, 
  EyeOff, 
  LayoutDashboard, 
  Layers, 
  CreditCard, 
  PhoneCall, 
  CheckCircle2, 
  Laptop, 
  Lock, 
  Unlock, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function DevModuleControlModal({ isOpen, onClose }) {
  const { 
    publicModulesConfig, 
    updatePublicModuleToggle, 
    setAllPublicModules,
    previewPublicMode,
    togglePreviewPublicMode,
    tickets,
    telephony,
    qaAudits
  } = useData();

  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Module Definitions with metadata & live counts
  const modulesList = [
    {
      key: 'consolidated',
      name: 'Consolidated Executive Command Center',
      shortName: 'Consolidated',
      icon: LayoutDashboard,
      iconColor: 'text-indigo-500',
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderLight: 'border-indigo-200 dark:border-indigo-800',
      badge: 'Executive Synthesis',
      description: 'Cross-functional synthesis dashboard reconciling total disbursements, RM calling dials, and call quality compliance.'
    },
    {
      key: 'divisions',
      name: 'Divisions & Pods Operations Hub',
      shortName: 'Divisions & Pods',
      icon: Layers,
      iconColor: 'text-blue-500',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40',
      borderLight: 'border-blue-200 dark:border-blue-800',
      badge: '4 Division Managers • 11 Pods',
      description: 'Detailed division hubs for Senior Managers (Niladri, Surajit, Arijit, Amit Singal) and Pod Captain breakdown.'
    },
    {
      key: 'l2',
      name: 'L2 Financial Reconciliation & Velocity',
      shortName: 'L2 Approvals',
      icon: CreditCard,
      iconColor: 'text-emerald-500',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderLight: 'border-emerald-200 dark:border-emerald-800',
      badge: `${(tickets || []).length.toLocaleString()} Tickets • ₹${(((tickets || []).reduce((s, t) => s + (t.finalTotalAmount || 0), 0)) / 10000000).toFixed(2)} Cr`,
      description: 'Approval velocity timeline, monetary bifurcation (auditable vs. non-auditable split), and RM disbursement roster.'
    },
    {
      key: 'productivity',
      name: 'RM Calling Productivity & Telephony',
      shortName: 'RM Telephony',
      icon: PhoneCall,
      iconColor: 'text-purple-500',
      bgLight: 'bg-purple-50 dark:bg-purple-950/40',
      borderLight: 'border-purple-200 dark:border-purple-800',
      badge: `${(telephony || []).length.toLocaleString()} Active Records • 80K+ Dials`,
      description: 'Dialer logs, connection percentage, total talk time, agent rankings, and supervisory coaching tags.'
    },
    {
      key: 'qa',
      name: 'Quality Assurance & 7 QC Analytics Suite',
      shortName: 'QA & QC Tools',
      icon: CheckCircle2,
      iconColor: 'text-amber-500',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
      borderLight: 'border-amber-200 dark:border-amber-800',
      badge: `${(qaAudits || []).length.toLocaleString()} Evaluations • 7 QC Tools`,
      description: '7 QC Statistical Process Control tools (Scatter, Pareto, Fishbone, Histogram, SPC) and 41-parameter evaluation scorecard.'
    }
  ];

  const publicActiveCount = Object.values(publicModulesConfig || {}).filter(Boolean).length;

  const handlePresetL2Only = () => {
    setAllPublicModules({
      consolidated: false,
      divisions: false,
      l2: true,
      productivity: false,
      qa: false
    });
  };

  const handlePresetAllOn = () => {
    setAllPublicModules({
      consolidated: true,
      divisions: true,
      l2: true,
      productivity: true,
      qa: true
    });
  };

  const handlePresetAllOff = () => {
    setAllPublicModules({
      consolidated: false,
      divisions: false,
      l2: false,
      productivity: false,
      qa: false
    });
  };

  const handleCopyShareLink = () => {
    const activeKeys = Object.keys(publicModulesConfig || {}).filter(k => publicModulesConfig[k]);
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?public=${activeKeys.join(',')}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 dark:from-[#0b0e17] dark:via-[#0e1320] dark:to-indigo-950/20">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
              <Sliders className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  Developer Mode · Public Module Release Controller
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Laptop className="w-3 h-3" />
                  Dev Device
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Control the public visibility of each operational module. Outside devices only see modules switched ON below.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
            title="Close Controller"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staging Summary & Quick Presets Ribbon */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-[#0a0d16] border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Public Status:</span>
            <span className="px-2 py-0.5 rounded-md font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
              {publicActiveCount} of {modulesList.length} Modules Publicly Visible
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePresetL2Only}
              className="px-2.5 py-1 rounded-lg font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
              title="Reset to recommended staging: L2 Approvals only visible publicly"
            >
              <RotateCcw className="w-3 h-3 text-amber-500" />
              <span>L2 Only (Staging)</span>
            </button>
            <button
              onClick={handlePresetAllOn}
              className="px-2.5 py-1 rounded-lg font-semibold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
              title="Turn all 5 modules ON publicly"
            >
              <Unlock className="w-3 h-3" />
              <span>Turn All ON</span>
            </button>
            <button
              onClick={handlePresetAllOff}
              className="px-2.5 py-1 rounded-lg font-semibold bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
              title="Lock all modules (Maintenance mode)"
            >
              <Lock className="w-3 h-3" />
              <span>Turn All OFF</span>
            </button>
          </div>
        </div>

        {/* Modules List with Toggle Switches */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
          {modulesList.map((mod) => {
            const isPublic = !!(publicModulesConfig && publicModulesConfig[mod.key]);
            const Icon = mod.icon;

            return (
              <div 
                key={mod.key}
                className="pt-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span className={`p-2.5 rounded-2xl ${mod.bgLight} ${mod.borderLight} border shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${mod.iconColor}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {mod.name}
                      </h4>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {mod.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>

                {/* Status Indicator & Interactive Toggle Switch */}
                <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pl-11 sm:pl-0">
                  <span 
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition-all ${
                      isPublic 
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isPublic ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    <span>{isPublic ? 'Publicly Active' : 'Dev Locked'}</span>
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isPublic}
                    onClick={() => updatePublicModuleToggle(mod.key, !isPublic)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isPublic ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    title={`Click to turn ${mod.shortName} ${isPublic ? 'OFF' : 'ON'} for outside devices`}
                  >
                    <span 
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isPublic ? 'translate-x-5' : 'translate-x-0'
                      }`} 
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer with Live Preview & Share Link */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0a0d16]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={togglePreviewPublicMode}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all border cursor-pointer ${
                previewPublicMode
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
              title="Test the dashboard exactly as outside devices will experience it"
            >
              {previewPublicMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
              <span>{previewPublicMode ? 'Exit Public Preview' : 'Test as Public User'}</span>
            </button>

            <button
              onClick={handleCopyShareLink}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Copy link configured with these exact public modules"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Public Link'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm cursor-pointer text-center"
          >
            Apply &amp; Done
          </button>
        </div>
      </div>
    </div>
  );
}
