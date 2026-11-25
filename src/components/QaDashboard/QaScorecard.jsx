import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { isAuthorizedAuditor, ROLES } from '../../utils/auth';
import { 
  Award, 
  CheckSquare, 
  User, 
  Save, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2,
  AlertTriangle,
  Lock
} from 'lucide-react';

export const PARAMETERS = [
  { 
    id: "introduction", 
    label: "Introduction", 
    max: 5, 
    medium: 2.5,
    subParameters: [
      "Proper opening of the call with greeting.",
      "Self Introduction",
      "Company Introduction",
      "Refer personal notes if any",
      "For participating AID - Self Introduction & Company Induction not very important.",
      "Check the previous interaction from meeting info before starting the conversation."
    ]
  },
  { 
    id: "project_registration", 
    label: "Project Registration", 
    max: 15, 
    medium: 7.5,
    subParameters: [
      "Ongoing & Upcoming project.",
      "Creating proper Project Name along with the location",
      "Project registration should be prior to invoice date if any sale has happened."
    ]
  },
  { 
    id: "pricing_requirement", 
    label: "Product & Pricing requirement", 
    max: 10, 
    medium: 5,
    subParameters: [
      "Probe for the material requirement.",
      "Pricing requirement if any.",
      "Dealer Assistant - So that the purchase happens through Century Dealer.",
      "Convince the AID to purchase through 2.0"
    ]
  },
  { 
    id: "product_feedback", 
    label: "Product FeedBack", 
    max: 3, 
    medium: 1.5,
    subParameters: [
      "Enquired whether s/he had used century product in his/her current project.",
      "If Yes - Feedback & product used",
      "If No - Reason",
      "Compliance if any - Needs to be mentioned in remarks - and create the ticket."
    ]
  },
  { 
    id: "upsell", 
    label: "Cross & Upsell of product", 
    max: 20, 
    medium: 10,
    subParameters: [
      "Probe and upsell the product - Focus on premium products.",
      "Probe and cross sell the product - Focus on premium product"
    ]
  },
  { 
    id: "marketing_benefit", 
    label: "Marketing Benefit", 
    max: 20, 
    medium: 10,
    subParameters: [
      "TCW",
      "Upgrading the AID Club Membership and informing about the key benefits.",
      "Inform updated benefits Century is providing for Laminates, NV-Natural Veneer"
    ]
  },
  { 
    id: "call_closure", 
    label: "Call Closure", 
    max: 2, 
    medium: 1,
    subParameters: [
      "Thanking Giving",
      "Wishing"
    ]
  },
  { 
    id: "softskill", 
    label: "Softskill", 
    max: 5, 
    medium: 2.5,
    subParameters: [
      "Voice Modulation",
      "Rate of speech",
      "Energy in call",
      "Active Listening",
      "Pronunciation",
      "Professionalism",
      "Using proper hold verbiage in case needs to gather the information.",
      "In case no response received from AID need to provide proper verbiage before disconnecting the call."
    ]
  },
  { 
    id: "redemption", 
    label: "Redemption", 
    max: 5, 
    medium: 2.5, 
    fatal: true,
    subParameters: [
      "Informed about Joy Gratitude points.",
      "Joy Gratitude points redemption process if eligible",
      "WhatsApp Bot interaction",
      "If the scheme - Kind - New Acquisition - Convince the AID to use Century Product.",
      "If he is in FTS scheme - RM needs to take a callback"
    ]
  },
  { 
    id: "gtm_adherence", 
    label: "GTM Adherence", 
    max: 5, 
    medium: 2.5, 
    fatal: true,
    subParameters: [
      "Any incorrect information, wrong commitment, Rude/Unprofessional behaviour will lead to Fatal",
      "Incomplete information."
    ]
  },
  { 
    id: "crm_update", 
    label: "CRM Update", 
    max: 10, 
    medium: 5, 
    fatal: true,
    subParameters: [
      "Proper meeting info update",
      "Incorrect / no meeting info update will be marked as fatal"
    ]
  },
];

export default function QaScorecard({ auditTarget = null, onClearTarget = null, onBackToHistory = null, canAudit: propCanAudit, currentUser: propCurrentUser }) {
  const { rmDirectory, addQaAudit, currentUser: contextUser, customTeams } = useData();
  const currentUser = propCurrentUser || contextUser;
  const canAudit = propCanAudit !== undefined ? propCanAudit : isAuthorizedAuditor(currentUser);

  // Audit Form Header
  const [mobileNumber, setMobileNumber] = useState("");
  const [callDuration, setCallDuration] = useState("");
  const [callDate, setCallDate] = useState(new Date().toISOString().split("T")[0]);
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split("T")[0]);
  const [franchise, setFranchise] = useState("");
  const [rmName, setRmName] = useState("");
  const [callPresent, setCallPresent] = useState("Yes");
  const [auditorName, setAuditorName] = useState(currentUser?.name || "Nabonita Roy");

  // Keep auditor name in sync with logged-in user
  useEffect(() => {
    if (currentUser?.name && !auditTarget?.isHistorical) {
      setAuditorName(currentUser.name);
    }
  }, [currentUser, auditTarget]);

  // Prepopulate if incoming auditTarget provided (Dialer call OR Historical Audit)
  useEffect(() => {
    if (auditTarget) {
      if (auditTarget.phone_no || auditTarget.mobile_number) {
        setMobileNumber(auditTarget.phone_no || auditTarget.mobile_number);
      } else if (auditTarget.isHistorical) {
        setMobileNumber("N/A (Historical Call)");
      }

      if (auditTarget.duration || auditTarget.call_duration) {
        setCallDuration(auditTarget.duration || auditTarget.call_duration);
      } else if (auditTarget.isHistorical) {
        setCallDuration("04:30");
      }

      const resolvedRmName = auditTarget.rm_name || auditTarget.agent_id || "";
      if (resolvedRmName) {
        setRmName(resolvedRmName);
      }

      // Auto-resolve team / franchise from auditTarget or matching RM in directory
      const matchedRm = (rmDirectory || []).find(
        (r) => (r.rm_name || "").toLowerCase() === resolvedRmName.toLowerCase() ||
               (r.dialer_id && (r.dialer_id || "").toLowerCase() === (auditTarget.agent_id || "").toLowerCase())
      );
      const resolvedTeam = auditTarget.team_name || auditTarget.franchise || matchedRm?.team_name || "";
      if (resolvedTeam) {
        setFranchise(resolvedTeam);
      }

      if (auditTarget.call_date) {
        setCallDate(String(auditTarget.call_date).slice(0, 10));
      } else if (auditTarget.audit_date) {
        setCallDate(String(auditTarget.audit_date).slice(0, 10));
      }

      if (auditTarget.audit_date) {
        setAuditDate(String(auditTarget.audit_date).slice(0, 10));
      }

      if (auditTarget.auditor_name) {
        setAuditorName(auditTarget.auditor_name);
      }

      if (auditTarget.observation || auditTarget.feedback) {
        setObservation(auditTarget.observation || auditTarget.feedback || "");
      }

      if (auditTarget.pointer_missed) {
        setPointerMissed(auditTarget.pointer_missed);
      }

      // Populate scorecard parameters if historical audit
      if (auditTarget.isHistorical || auditTarget.overall_score !== undefined) {
        const pMap = auditTarget.parameters || {};
        const initialScores = {
          introduction: auditTarget.introduction ?? (pMap.greeting ?? 4),
          project_registration: auditTarget.project_registration ?? (pMap.project_reg ?? 12),
          pricing_requirement: auditTarget.pricing_requirement ?? (pMap.need_discovery ?? 8),
          product_feedback: auditTarget.product_feedback ?? 2.5,
          upsell: auditTarget.upsell ?? (pMap.upsell ?? 16),
          marketing_benefit: auditTarget.marketing_benefit ?? (pMap.marketing_benefit ?? 16),
          call_closure: auditTarget.call_closure ?? (pMap.call_closure ?? 2),
          softskill: auditTarget.softskill ?? (pMap.softskills ?? 4.5),
          redemption: auditTarget.redemption ?? (auditTarget.is_fatal ? 0 : 5),
          gtm_adherence: auditTarget.gtm_adherence ?? (auditTarget.is_fatal ? 0 : 5),
          crm_update: auditTarget.crm_update ?? (auditTarget.is_fatal ? 0 : 10),
        };
        setScores(initialScores);
      }
    }
  }, [auditTarget]);

  // Reset form to blank state
  const handleResetForm = () => {
    setMobileNumber("");
    setCallDuration("");
    setCallDate(new Date().toISOString().split("T")[0]);
    setAuditDate(new Date().toISOString().split("T")[0]);
    setFranchise("");
    setRmName("");
    setCallPresent("Yes");
    setAuditorName(currentUser?.name || "Nabonita Roy");
    setScores({});
    setParamFeedback({});
    setObservation("");
    setPointerMissed("");
    setExpandedCards({});
    setPointerStates({});
    setAuditType("standard");
    setLockMessage("");
    setMsg("");
    if (onClearTarget) onClearTarget();
  };

  // Scoring Fields
  const [scores, setScores] = useState({});
  const [paramFeedback, setParamFeedback] = useState({});
  const [observation, setObservation] = useState("");
  const [pointerMissed, setPointerMissed] = useState("");

  // Checklist expansion & 3-way states (pass / missed / na)
  const [expandedCards, setExpandedCards] = useState({});
  const [pointerStates, setPointerStates] = useState({});

  // Short Call Detection (< 120s / 2 mins)
  const [auditType, setAuditType] = useState("standard");
  const [lockMessage, setLockMessage] = useState("");
  const [msg, setMsg] = useState("");

  // Unique Franchises / Teams from RM Directory + Custom Dynamic Teams (excluding dissolved pods)
  const franchises = useMemo(() => {
    let removedTeams = [];
    try {
      const saved = localStorage.getItem('century_removed_teams_v2');
      if (saved) removedTeams = JSON.parse(saved);
    } catch (e) {}
    const fromRms = rmDirectory
      .filter((r) => r.status !== 'inactive')
      .map((r) => (r.team_name || "").trim())
      .filter(Boolean);
    const fromCustom = customTeams || [];
    return [...new Set([...fromCustom, ...fromRms])]
      .filter((t) => !removedTeams.some((rt) => rt.toLowerCase() === t.toLowerCase()))
      .sort();
  }, [rmDirectory, customTeams]);

  // Filtered RMs (robust against Unity-II vs Unity 2 variations, excludes soft-offboarded employees for new evaluations)
  const availableRms = useMemo(() => {
    const activeList = rmDirectory.filter((r) => r.status !== 'inactive');
    if (!franchise) return activeList;
    const norm = (s) => (s || '').toLowerCase().replace(/[-_\s]/g, '').replace(/ii$/, '2').replace(/i$/, '1');
    const target = norm(franchise);
    return activeList.filter((r) => norm(r.team_name) === target);
  }, [rmDirectory, franchise]);

  // Selected RM details
  const selectedRmObj = useMemo(() => {
    return rmDirectory.find((r) => r.rm_name === rmName);
  }, [rmDirectory, rmName]);

  // Active Assigned Pod Captain (Guarantees resigned captains or failover managers never show as assigned captain)
  const activeCaptain = useMemo(() => {
    if (!selectedRmObj) return null;

    // Failover check
    if (selectedRmObj.tempSupervisedByManager) return null;

    const captName = (selectedRmObj.captain_name || "").trim();
    if (!captName) return null;

    // If captain matches senior manager, this pod is under interim manager failover
    if (
      selectedRmObj.manager_name &&
      captName.toLowerCase() === selectedRmObj.manager_name.toLowerCase()
    ) {
      return null;
    }

    // Lookup captain in rmDirectory: must exist and be ACTIVE
    const captObj = rmDirectory.find(
      (r) => r.rm_name.toLowerCase() === captName.toLowerCase()
    );
    if (!captObj || captObj.status === "inactive") {
      return null;
    }

    return captObj.rm_name;
  }, [rmDirectory, selectedRmObj]);

  const currentCaptain = activeCaptain || "";
  const currentManager = selectedRmObj ? selectedRmObj.manager_name || "" : "";
  const isCaptainResigned = selectedRmObj && !activeCaptain;
  const isTargetLocked = Boolean(auditTarget);

  // Short Call Check
  useEffect(() => {
    if (!callDuration) {
      setAuditType("standard");
      setLockMessage("");
      return;
    }
    const parts = callDuration.split(":");
    let totalSeconds = 0;
    if (parts.length === 2) {
      totalSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    } else if (parts.length === 3) {
      totalSeconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
    }
    if (!isNaN(totalSeconds) && totalSeconds < 120) {
      setAuditType("short");
      setLockMessage("Short Call (< 2 mins / 120s) detected. Parameters may be marked N/A where applicable.");
    } else {
      setAuditType("standard");
      setLockMessage("");
    }
  }, [callDuration]);

  // Card Expand / Rollback toggle
  const toggleCardExpand = (paramId) => {
    setExpandedCards((prev) => {
      const willExpand = !prev[paramId];
      if (willExpand) {
        // Initialize pointer states to 'pass' if not set
        const param = PARAMETERS.find((p) => p.id === paramId);
        if (param) {
          setPointerStates((curr) => {
            const nextStates = { ...curr };
            let modified = false;
            param.subParameters.forEach((_, idx) => {
              const key = `${paramId}_${idx}`;
              if (!nextStates[key]) {
                nextStates[key] = "pass";
                modified = true;
              }
            });
            if (modified) {
              calculateParamScore(paramId, nextStates);
            }
            return nextStates;
          });
        }
      }
      return { ...prev, [paramId]: willExpand };
    });
  };

  // 3-way Pointer State Change
  const handlePointerStateChange = (paramId, subIdx, newState) => {
    const key = `${paramId}_${subIdx}`;
    const nextStates = { ...pointerStates, [key]: newState };
    setPointerStates(nextStates);
    calculateParamScore(paramId, nextStates);

    // Sync missed pointers to pointerMissed textarea
    const missedList = [];
    PARAMETERS.forEach((p) => {
      p.subParameters.forEach((sub, idx) => {
        const s = nextStates[`${p.id}_${idx}`];
        if (s === "missed") {
          missedList.push(`${p.label}: ${sub}`);
        }
      });
    });
    setPointerMissed(missedList.join("; "));
  };

  // Calculate Proportional Score for a Parameter
  const calculateParamScore = (paramId, states = pointerStates) => {
    const param = PARAMETERS.find((p) => p.id === paramId);
    if (!param) return;

    const subs = param.subParameters;
    let passCount = 0;
    let missedCount = 0;
    let naCount = 0;

    subs.forEach((_, idx) => {
      const s = states[`${paramId}_${idx}`] || "pass";
      if (s === "pass") passCount++;
      else if (s === "missed") missedCount++;
      else if (s === "na") naCount++;
    });

    const applicableCount = subs.length - naCount;

    if (applicableCount === 0) {
      handleScoreChange(paramId, "NA");
      return;
    }

    if (param.fatal) {
      if (missedCount > 0) {
        handleScoreChange(paramId, 0);
      } else {
        handleScoreChange(paramId, param.max);
      }
    } else {
      const propScore = Math.round((passCount / applicableCount) * param.max * 10) / 10;
      handleScoreChange(paramId, propScore);
    }
  };

  const handleScoreChange = (id, value) => {
    setScores((prev) => ({ ...prev, [id]: value }));
  };

  // Calculate Totals & Fatal Overrides
  const { totalScore, totalPossible, percentage, hasFatalError } = useMemo(() => {
    let totScore = 0;
    let totPoss = 0;
    let fatalTriggered = false;

    PARAMETERS.forEach((p) => {
      const val = scores[p.id];
      if (val !== undefined && val !== "" && val !== "NA") {
        totScore += Number(val);
        totPoss += p.max;

        if (p.fatal && Number(val) === 0) {
          fatalTriggered = true;
        }
      }
    });

    totScore = Math.round(totScore * 10) / 10;
    let pct = totPoss > 0 ? ((totScore / totPoss) * 100).toFixed(2) : "0.00";

    if (fatalTriggered) {
      pct = "0.00";
      totScore = 0;
    }

    return {
      totalScore: totScore,
      totalPossible: totPoss,
      percentage: pct,
      hasFatalError: fatalTriggered,
    };
  }, [scores]);

  const naCount = useMemo(() => {
    return PARAMETERS.filter((p) => scores[p.id] === "NA").length;
  }, [scores]);

  const naPoints = useMemo(() => {
    return PARAMETERS.filter((p) => scores[p.id] === "NA").reduce((sum, p) => sum + (p.max || 0), 0);
  }, [scores]);

  // Scored Applicable Parameters Count (excluding NA)
  const scoredApplicableCount = useMemo(() => {
    return PARAMETERS.filter((p) => scores[p.id] !== undefined && scores[p.id] !== "" && scores[p.id] !== "NA").length;
  }, [scores]);

  // Total Applicable Parameters Count (11 minus any parameters deemed NA)
  const applicableParamsCount = PARAMETERS.length - naCount;

  const pctNum = parseFloat(percentage) || 0;

  // Submit Audit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canAudit) {
      setMsg("Auditor Authorization Required: Only designated QA auditors can submit call evaluations.");
      return;
    }
    if (!rmName) {
      setMsg("Please select an RM Name.");
      return;
    }

    const payload = {
      id: Date.now(),
      audit_date: auditDate,
      call_date: callDate,
      call_duration: callDuration,
      mobile_number: mobileNumber,
      rm_name: rmName,
      franchise: franchise,
      team_name: franchise || selectedRmObj?.team_name || "CenturyJoy",
      captain_name: activeCaptain || (currentManager ? `Direct Supervision (${currentManager})` : "—"),
      manager_name: currentManager,
      auditor_name: auditorName,
      observation: callPresent === "No" ? `[NO CALL PRESENT] ${observation}` : observation,
      pointer_missed: pointerMissed,
      parameter_feedback: paramFeedback,
      call_present: callPresent,
      overall_score: parseFloat(percentage),
      total_score: totalScore,
      total_possible: totalPossible,
      is_fatal: hasFatalError,
      ...scores,
    };

    addQaAudit(payload);
    setMsg(`✓ Audit successfully logged! Score: ${percentage}%`);
    setTimeout(() => setMsg(""), 4000);
  };

  const standardParams = PARAMETERS.filter((p) => !p.fatal);
  const fatalParams = PARAMETERS.filter((p) => p.fatal);

  return (
    <div className="space-y-6">
      
      {/* Active Call / Historical Audit Banner */}
      {auditTarget && (
        <div className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          auditTarget.isHistorical 
            ? 'bg-amber-500/10 border-amber-500/30' 
            : 'bg-indigo-500/10 border-indigo-500/30'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`p-2 rounded-xl font-bold flex items-center gap-1.5 ${
              auditTarget.isHistorical 
                ? 'bg-amber-500/20 text-amber-400' 
                : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              {auditTarget.isHistorical ? '📋 Historical Audit' : '🎧 Selected Call for Audit'}
            </span>
            <div>
              <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                <span>{auditTarget.rm_name || auditTarget.agent_id}</span>
                {auditTarget.overall_score !== undefined && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px]">
                      Score: {auditTarget.overall_score}%
                    </span>
                  </>
                )}
                {auditTarget.auditor_name && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300">Auditor: {auditTarget.auditor_name}</span>
                  </>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono truncate max-w-lg mt-0.5">
                {auditTarget.isHistorical ? (
                  <span>Audit #{auditTarget.id} • Date: {auditTarget.audit_date} • Team: {auditTarget.team_name || auditTarget.franchise || 'Unity-II'}</span>
                ) : (
                  <span>Phone: {auditTarget.phone_no} • Duration: {auditTarget.duration} • Status: {auditTarget.status || 'Completed'}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {auditTarget.recording_file && (
              <a
                href={auditTarget.recording_file}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <span>Listen to Recording (.WAV)</span>
              </a>
            )}
            {onBackToHistory && (
              <button
                type="button"
                onClick={onBackToHistory}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer transition-all flex items-center gap-1 shrink-0"
              >
                <span>← Back to History</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResetForm}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700/60 font-semibold cursor-pointer transition-all flex items-center gap-1 shrink-0"
              title="Clear target and start a new blank audit"
            >
              <span>New Blank Audit</span>
            </button>
          </div>
        </div>
      )}

      {/* Title & Instructions */}
      <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>Official CenturyPly QA Call Scorecard</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Standardized evaluation across 8 core scoring parameters and 3 fatal compliance categories.
            </p>
          </div>
          {lockMessage && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
              {lockMessage}
            </span>
          )}
        </div>

        {msg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
            {msg}
          </div>
        )}

        {!canAudit && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-3 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="font-bold">Auditing Restricted: </span>
              <span>Only designated QA auditors (Nabonita Roy, Arindam CenturyPly, Sayan Banik, Arnab Chakladaar) are authorized to submit call evaluations. Current view is in preview/read-only mode.</span>
            </div>
          </div>
        )}

        {/* Call & Agent Metadata Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-xs">
          
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Franchise / Team</span>
              {isTargetLocked && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 inline" /> Locked to Call
                </span>
              )}
            </label>
            {isTargetLocked ? (
              <input
                type="text"
                value={franchise || selectedRmObj?.team_name || "—"}
                readOnly
                disabled
                className="w-full p-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-bold cursor-not-allowed"
              />
            ) : (
              <select
                value={franchise}
                onChange={(e) => {
                  setFranchise(e.target.value);
                  setRmName("");
                }}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              >
                <option value="">-- All Teams --</option>
                {franchises.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Relationship Manager (RM)</span>
              {isTargetLocked && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 inline" /> Locked to Call
                </span>
              )}
            </label>
            {isTargetLocked ? (
              <input
                type="text"
                value={rmName || "—"}
                readOnly
                disabled
                className="w-full p-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-bold cursor-not-allowed"
              />
            ) : (
              <select
                value={rmName}
                onChange={(e) => {
                  setRmName(e.target.value);
                  const matched = rmDirectory.find((r) => r.rm_name === e.target.value);
                  if (matched && !franchise) setFranchise(matched.team_name);
                }}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                required
              >
                <option value="">-- Select RM --</option>
                {availableRms.map((rm) => (
                  <option key={rm.rm_name} value={rm.rm_name}>{rm.rm_name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Assigned Pod Captain</span>
              {isCaptainResigned && (
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                  Failover Mode
                </span>
              )}
            </label>
            <input
              type="text"
              value={
                !selectedRmObj
                  ? "—"
                  : activeCaptain
                  ? activeCaptain
                  : "— (Vacant • In Failover to Senior Manager)"
              }
              readOnly
              className={`w-full p-2 border rounded-xl font-semibold text-xs transition-all ${
                !selectedRmObj || activeCaptain
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60 text-amber-700 dark:text-amber-300"
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Senior Manager</label>
            <input
              type="text"
              value={currentManager || "—"}
              readOnly
              className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Customer Mobile No.</span>
              {isTargetLocked && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 inline" /> Locked
                </span>
              )}
            </label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="e.g. 9830012345"
              readOnly={isTargetLocked}
              disabled={isTargetLocked}
              className={`w-full p-2 rounded-xl border ${
                isTargetLocked
                  ? "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono font-semibold cursor-not-allowed"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Call Duration (MM:SS)</span>
              {isTargetLocked && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 inline" /> Locked
                </span>
              )}
            </label>
            <input
              type="text"
              value={callDuration}
              onChange={(e) => setCallDuration(e.target.value)}
              placeholder="02:45"
              readOnly={isTargetLocked}
              disabled={isTargetLocked}
              className={`w-full p-2 rounded-xl border ${
                isTargetLocked
                  ? "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono font-semibold cursor-not-allowed"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Call Date</span>
              {isTargetLocked && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 inline" /> Locked
                </span>
              )}
            </label>
            <input
              type="date"
              value={callDate}
              onChange={(e) => setCallDate(e.target.value)}
              readOnly={isTargetLocked}
              disabled={isTargetLocked}
              className={`w-full p-2 rounded-xl border ${
                isTargetLocked
                  ? "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-not-allowed"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Auditor Name</span>
              {currentUser?.name && <span className="text-[10px] text-emerald-500 font-semibold">✓ Verified</span>}
            </label>
            <input
              type="text"
              value={auditorName}
              readOnly={Boolean(currentUser?.name)}
              onChange={(e) => setAuditorName(e.target.value)}
              className={`w-full p-2 rounded-xl font-medium border ${
                currentUser?.name
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            />
          </div>

        </div>
      </div>

      {/* Redesigned Option 2: Minimalist Frosted Capsule Scoring Ribbon */}
      <div className="sticky top-20 z-30 bg-slate-900/95 dark:bg-[#0b0f19]/95 text-white rounded-2xl p-4 md:px-6 md:py-3.5 shadow-xl border border-slate-700/80 dark:border-slate-800 backdrop-blur-xl transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Minimalist Frosted Capsule */}
          <div className="flex items-center space-x-4">
            {/* Glowing Capsule Pill */}
            <div className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-xl shadow-sm border transition-all duration-300 ${
              hasFatalError 
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-rose-900/30 ring-1 ring-rose-500/20' 
                : pctNum >= 85 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-900/20 ring-1 ring-emerald-500/20'
                  : pctNum >= 70
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-amber-900/20 ring-1 ring-amber-500/20'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-rose-900/20 ring-1 ring-rose-500/20'
            }`}>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  hasFatalError 
                    ? 'bg-rose-500 animate-ping' 
                    : pctNum >= 85 
                      ? 'bg-emerald-400 animate-pulse' 
                      : pctNum >= 70 
                        ? 'bg-amber-400 animate-pulse' 
                        : 'bg-rose-400'
                }`}></span>
                <span className="text-lg font-black tracking-tight font-mono leading-none">
                  {percentage}%
                </span>
              </div>
              <span className="opacity-30">|</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                {hasFatalError ? 'FATAL 0%' : pctNum >= 85 ? 'BENCHMARK MET' : pctNum >= 70 ? 'COACHING' : 'BELOW TARGET'}
              </span>
            </div>

            <div>
              <div className="text-sm font-bold flex items-center space-x-2">
                <span className="text-white">Quality Audit Scorecard</span>
                {rmName && (
                  <span className="text-xs font-normal text-slate-400">
                    · <strong className="text-blue-400">{rmName}</strong>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 mt-0.5">
                <span className="flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Awarded: <strong className="text-white font-mono">{totalScore}</strong> / {totalPossible || (100 - naPoints)} Pts</span>
                </span>
                <span className="text-slate-600 dark:text-slate-500">•</span>
                <span className="flex items-center space-x-1 text-slate-300">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>{scoredApplicableCount} of {applicableParamsCount} Evaluated{naCount > 0 ? ` (${naCount} N/A)` : ''}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center Progress Track (Desktop) */}
          <div className="hidden xl:flex flex-col flex-1 max-w-xs mx-6 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>Pass Ratio</span>
              <span className="font-mono text-slate-200">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/60">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  hasFatalError
                    ? 'bg-rose-600 w-full'
                    : pctNum >= 85
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : pctNum >= 70
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                        : 'bg-gradient-to-r from-rose-500 to-pink-500'
                }`}
                style={{ width: hasFatalError ? '100%' : `${Math.min(100, Math.max(0, pctNum))}%` }}
              />
            </div>
          </div>

          {/* Right: Submit Button & Feedback Toast */}
          <div className="flex items-center space-x-3 self-end lg:self-auto">
            {msg && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {msg}
              </span>
            )}
            <button
              onClick={canAudit ? handleSubmit : null}
              disabled={!canAudit}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2 ${
                canAudit
                  ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white cursor-pointer shadow-emerald-600/25'
                  : 'bg-slate-700/60 text-slate-400 cursor-not-allowed border border-slate-600'
              }`}
              title={canAudit ? "Submit and save audit evaluation" : "Auditor access required to submit evaluations"}
            >
              <Save className="w-4 h-4" />
              <span>{canAudit ? "Submit & Save Audit" : "Auditor Only (Locked)"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Standard Scoring Cards Grid (8 Core Parameters) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {standardParams.map((p) => {
          const isExpanded = expandedCards[p.id];
          const currentScore = scores[p.id];
          const isEvaluated = currentScore !== undefined && currentScore !== "";

          return (
            <div 
              key={p.id} 
              className={`bg-white dark:bg-[#0e1320] border rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all ${
                isExpanded ? 'lg:col-span-2 ring-2 ring-blue-500/50' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {!isExpanded ? (
                /* Compact Card View */
                <div className="space-y-3">
                  <div className="flex items-start justify-between min-h-[36px]">
                    <span className="font-bold text-xs text-slate-900 dark:text-white leading-snug">{p.label}</span>
                    <span className="text-[11px] font-mono text-slate-400 font-semibold ml-2">Max: {p.max}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 font-medium">Awarded:</span>
                    <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                      currentScore === "NA" 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' 
                        : isEvaluated 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}>
                      {currentScore === "NA" ? "N/A" : isEvaluated ? `${currentScore} Pts` : "--"}
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Feedback / Remarks..."
                    value={paramFeedback[p.id] || ""}
                    onChange={(e) => setParamFeedback((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => toggleCardExpand(p.id)}
                    className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold transition-colors border border-blue-200/60 dark:border-blue-800/60"
                  >
                    📋 Open Checklist ({p.subParameters.length} Pointers)
                  </button>
                </div>
              ) : (
                /* Expanded Card View with 3-Way Checkpoints */
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-xs text-blue-600 dark:text-blue-400">{p.label}</span>
                    <span className="text-xs text-slate-400">Max Score: {p.max}</span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {p.subParameters.map((sub, idx) => {
                      const key = `${p.id}_${idx}`;
                      const state = pointerStates[key] || "pass";

                      return (
                        <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5">
                          <p className="text-slate-700 dark:text-slate-300 leading-snug">{idx + 1}. {sub}</p>
                          <div className="flex justify-end space-x-1">
                            <button
                              type="button"
                              onClick={() => handlePointerStateChange(p.id, idx, 'pass')}
                              className={`px-2 py-0.5 rounded font-bold text-[10px] transition-all ${
                                state === 'pass' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              ✓ Pass
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePointerStateChange(p.id, idx, 'missed')}
                              className={`px-2 py-0.5 rounded font-bold text-[10px] transition-all ${
                                state === 'missed' ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              ✗ Missed
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePointerStateChange(p.id, idx, 'na')}
                              className={`px-2 py-0.5 rounded font-bold text-[10px] transition-all ${
                                state === 'na' ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              ⚪ N/A
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-500">Calculated:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{scores[p.id] ?? "--"} / {p.max}</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Feedback / Remarks..."
                    value={paramFeedback[p.id] || ""}
                    onChange={(e) => setParamFeedback((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => toggleCardExpand(p.id)}
                    className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    ✓ Done / OK (Roll Back)
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fatal Parameters Section (3 Compliance Categories) */}
      <div className="border-2 border-red-500 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b-2 border-red-300 dark:border-red-900 pb-3">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-bold">
            <span className="text-xl">🚨</span>
            <span className="text-sm uppercase tracking-wider">Fatal Parameters (Non-Negotiable)</span>
          </div>
          <span className="text-xs text-red-600 font-semibold">
            Scoring 0 on any fatal item results in a 0% overall score.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fatalParams.map((p) => {
            const isExpanded = expandedCards[p.id];
            const currentScore = scores[p.id];
            const isFatalZero = currentScore === 0;

            return (
              <div key={p.id} className="bg-white dark:bg-[#0e1320] border border-red-300 dark:border-red-900/60 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3">
                {!isExpanded ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between min-h-[36px]">
                      <span className="font-bold text-xs text-red-600 dark:text-red-400 leading-snug">{p.label}</span>
                      <span className="text-[11px] font-mono text-slate-400 font-semibold ml-2">Max: {p.max}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-red-100 dark:border-red-950 text-xs">
                      <span className="text-slate-500">Status:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isFatalZero 
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' 
                          : currentScore === p.max 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isFatalZero ? "🚨 Fatal Violation" : currentScore === "NA" ? "N/A" : currentScore ? "✓ Passed" : "--"}
                      </span>
                    </div>

                    <input
                      type="text"
                      placeholder="Remarks..."
                      value={paramFeedback[p.id] || ""}
                      onChange={(e) => setParamFeedback((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => toggleCardExpand(p.id)}
                      className="w-full py-1.5 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold transition-colors border border-red-200"
                    >
                      📋 Open Checklist ({p.subParameters.length} Pointers)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-red-200 dark:border-red-900">
                      <span className="font-bold text-xs text-red-600">{p.label}</span>
                      <span className="text-xs text-slate-400">Max: {p.max}</span>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {p.subParameters.map((sub, idx) => {
                        const key = `${p.id}_${idx}`;
                        const state = pointerStates[key] || "pass";

                        return (
                          <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-red-100 dark:border-red-950 text-[11px] space-y-1.5">
                            <p className="text-slate-700 dark:text-slate-300 leading-snug">{idx + 1}. {sub}</p>
                            <div className="flex justify-end space-x-1">
                              <button
                                type="button"
                                onClick={() => handlePointerStateChange(p.id, idx, 'pass')}
                                className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                  state === 'pass' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                                }`}
                              >
                                ✓ Pass
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePointerStateChange(p.id, idx, 'missed')}
                                className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                  state === 'missed' ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                                }`}
                              >
                                ✗ Missed (Fatal)
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePointerStateChange(p.id, idx, 'na')}
                                className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                  state === 'na' ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                                }`}
                              >
                                ⚪ N/A
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleCardExpand(p.id)}
                      className="w-full py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      ✓ Done / OK (Roll Back)
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-Populated Missed Pointers & Observations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            Auto-Populated Missed Pointers:
          </label>
          <textarea
            value={pointerMissed}
            onChange={(e) => setPointerMissed(e.target.value)}
            placeholder="Missed checkpoints will appear here automatically..."
            rows={4}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            Overall Auditor Observation / Summary:
          </label>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Enter general call remarks, coaching suggestions, or compliance notes..."
            rows={4}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>
      </div>

    </div>
  );
}
