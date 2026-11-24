import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus, 
  ROLE_DEFINITIONS, 
  ROLES 
} from '../../utils/auth';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  Search, 
  Edit3, 
  Trash2, 
  Lock, 
  Mail, 
  User, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  ShieldAlert, 
  Sparkles,
  GitBranch,
  Save,
  RefreshCw,
  Layers,
  ArrowRight,
  UserMinus,
  UserX,
  RotateCcw,
  Archive,
  UserCheck,
  History,
  Database,
  AlertTriangle
} from 'lucide-react';

export default function UserManagement() {
  const { 
    currentUser, 
    users, 
    refreshUsers, 
    hierarchy, 
    updateHierarchy, 
    rmDirectory, 
    updateRmMapping,
    deactivateRm,
    reactivateRm,
    revertOffboard,
    promoteEmployee,
    lastOffboardAction,
    qaAudits
  } = useData();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'roles' | 'scope' | 'offboard'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Offboarding state
  const [offboardSubTab, setOffboardSubTab] = useState('active'); // 'active' | 'archived'
  const [offboardSearch, setOffboardSearch] = useState('');
  const [deactivatingRm, setDeactivatingRm] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState('Resignation / Separation');
  const [customDeactivateNote, setCustomDeactivateNote] = useState('');

  // Promotion / Succession modal state
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [promotionData, setPromotionData] = useState({
    candidateName: '',
    targetRole: 'captain', // 'captain' | 'manager'
    targetTeam: 'Unity-II',
    assignedAgents: [],
  });

  // Dedicated Captain Resignation tab state
  const [resigningCaptainName, setResigningCaptainName] = useState('Arshi Afreen Jamal');
  const [captainSeparationReason, setCaptainSeparationReason] = useState('Resignation / Separation');
  const [captainSeparationNotes, setCaptainSeparationNotes] = useState('');

  // Drawer / Modal states
  const [modalMode, setModalMode] = useState('none'); // 'create' | 'edit' | 'reset-password'
  const [selectedUser, setSelectedUser] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '', canRevert: false, revertTarget: '' });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ROLES.VIEWER,
    managerKey: 'all',
    captainKey: '',
    designation: '',
    initialPassword: 'Century@2026',
    isPhysicalOnly: false,
  });

  // Scope assignment state
  const [scopeTransfer, setScopeTransfer] = useState({
    agentName: '',
    targetTeam: 'Unity-II',
    targetManager: 'Arijit Nath',
    targetCaptain: 'Arshi Afreen Jamal',
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  const managersList = ['Surajit Laha', 'Niladri Bhadra', 'Arijit Nath', 'Amit Singal'];
  const captainsList = [
    'Arshi Afreen Jamal',
    'Mousumi Chakraborty',
    'Nasima Banu',
    'Pallabi Chura',
    'Ranjana Mohajan',
    'Shiuli Bhattacharjee',
    'Silpa Palchina',
    'Direct Supervision (Physical)'
  ];

  // Distinct Teams List
  const teamsList = useMemo(() => {
    const list = [...new Set(rmDirectory.map((r) => (r.team_name || '').trim()).filter(Boolean))];
    if (!list.includes('Unity-II')) list.push('Unity-II');
    if (!list.includes('Unity-I')) list.push('Unity-I');
    return list.sort();
  }, [rmDirectory]);

  // Filtered users for Tab 1 User Accounts
  const filteredUsers = useMemo(() => {
    return (users || []).filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const mName = (u.name || '').toLowerCase();
        const mEmail = (u.email || '').toLowerCase();
        const mDesig = (u.designation || '').toLowerCase();
        return mName.includes(q) || mEmail.includes(q) || mDesig.includes(q);
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  // Active & Inactive RMs
  const activeRms = useMemo(() => {
    return (rmDirectory || []).filter((r) => r.status !== 'inactive');
  }, [rmDirectory]);

  const inactiveRms = useMemo(() => {
    return (rmDirectory || []).filter((r) => r.status === 'inactive');
  }, [rmDirectory]);

  const filteredActiveRms = useMemo(() => {
    if (!offboardSearch) return activeRms;
    const q = offboardSearch.toLowerCase();
    return activeRms.filter(
      (r) =>
        (r.rm_name || '').toLowerCase().includes(q) ||
        (r.team_name || '').toLowerCase().includes(q) ||
        (r.captain_name || '').toLowerCase().includes(q) ||
        (r.manager_name || '').toLowerCase().includes(q)
    );
  }, [activeRms, offboardSearch]);

  const filteredInactiveRms = useMemo(() => {
    if (!offboardSearch) return inactiveRms;
    const q = offboardSearch.toLowerCase();
    return inactiveRms.filter(
      (r) =>
        (r.rm_name || '').toLowerCase().includes(q) ||
        (r.team_name || '').toLowerCase().includes(q) ||
        (r.captain_name || '').toLowerCase().includes(q) ||
        (r.manager_name || '').toLowerCase().includes(q) ||
        (r.deactivationReason || '').toLowerCase().includes(q)
    );
  }, [inactiveRms, offboardSearch]);

  // Subordinates helper
  const getSubordinatesOfCaptain = (captainName) => {
    if (!captainName) return [];
    return (activeRms || []).filter(
      (r) =>
        (r.captain_name || '').toLowerCase() === captainName.toLowerCase() &&
        r.rm_name.toLowerCase() !== captainName.toLowerCase()
    );
  };

  const handleConfirmDeactivate = () => {
    if (!deactivatingRm) return;
    try {
      const subRms = getSubordinatesOfCaptain(deactivatingRm.rm_name);
      const isCapt = subRms.length > 0;
      const fullReason = customDeactivateNote
        ? `${deactivateReason} - ${customDeactivateNote}`
        : deactivateReason;

      deactivateRm(deactivatingRm.rm_name, fullReason);

      const successText = isCapt
        ? `Soft-offboarded Captain "${deactivatingRm.rm_name}". Team of ${subRms.length} RMs temporarily reports directly to Senior Manager "${deactivatingRm.manager_name || 'Arijit Nath'}". Historical records 100% preserved!`
        : `Soft-offboarded "${deactivatingRm.rm_name}". Removed from active operations with zero database impact!`;

      setAlertMsg({
        type: 'success',
        text: successText,
        canRevert: true,
        revertTarget: deactivatingRm.rm_name,
      });
      setDeactivatingRm(null);
      setCustomDeactivateNote('');
      setTimeout(() => setAlertMsg({ type: '', text: '', canRevert: false, revertTarget: '' }), 10000);
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message, canRevert: false, revertTarget: '' });
    }
  };

  const handleRevertOffboard = (rmName) => {
    try {
      revertOffboard(rmName);
      setAlertMsg({
        type: 'success',
        text: `Successfully reverted offboarding! Restored "${rmName}" and reinstated all pod hierarchy.`,
        canRevert: false,
        revertTarget: '',
      });
      setTimeout(() => setAlertMsg({ type: '', text: '', canRevert: false, revertTarget: '' }), 5000);
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message, canRevert: false, revertTarget: '' });
    }
  };

  const handleConfirmPromotion = (e) => {
    e.preventDefault();
    if (!promotionData.candidateName) {
      alert('Please select an employee to promote.');
      return;
    }
    try {
      promoteEmployee(
        promotionData.candidateName,
        promotionData.targetRole,
        promotionData.assignedAgents,
        promotionData.targetTeam
      );
      setAlertMsg({
        type: 'success',
        text: `Successfully promoted "${promotionData.candidateName}" to ${promotionData.targetRole === 'manager' ? 'Senior Manager' : 'Pod Captain'}! Assigned team members updated across all systems.`,
        canRevert: false,
        revertTarget: '',
      });
      setPromotionModalOpen(false);
      setPromotionData({
        candidateName: '',
        targetRole: 'captain',
        targetTeam: 'Unity-II',
        assignedAgents: [],
      });
      setTimeout(() => setAlertMsg({ type: '', text: '', canRevert: false, revertTarget: '' }), 5000);
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message, canRevert: false, revertTarget: '' });
    }
  };

  // Active Captains List (RMs who supervise other agents or have Captain designation)
  const activeCaptainsList = useMemo(() => {
    const captainNames = new Set(
      activeRms
        .filter((r) => r.captain_name && r.captain_name.toLowerCase() !== r.rm_name.toLowerCase())
        .map((r) => r.captain_name.toLowerCase())
    );
    return activeRms.filter(
      (r) =>
        captainNames.has(r.rm_name.toLowerCase()) ||
        (r.designation || '').toLowerCase().includes('captain')
    );
  }, [activeRms]);

  // Keep resigningCaptainName pointing to an active captain
  useEffect(() => {
    if (!resigningCaptainName && activeCaptainsList.length > 0) {
      setResigningCaptainName(activeCaptainsList[0].rm_name);
    }
  }, [activeCaptainsList, resigningCaptainName]);

  // Inactive / separated captains
  const inactiveCaptainsList = useMemo(() => {
    return (inactiveRms || []).filter(
      (r) =>
        r.wasCaptain ||
        (r.designation || '').toLowerCase().includes('captain') ||
        (activeRms || []).some(
          (sub) => (sub.previousCaptain || '').toLowerCase() === r.rm_name.toLowerCase()
        )
    );
  }, [inactiveRms, activeRms]);

  // Subordinates currently in temporary Senior Manager supervision
  const failoverAgents = useMemo(() => {
    return (activeRms || []).filter((r) => r.tempSupervisedByManager || r.previousCaptain);
  }, [activeRms]);

  // Pods health overview
  const podsOverview = useMemo(() => {
    const teams = ['Unity-II', 'Catlyst-II', 'Catlyst-I', 'SoarZone-II', 'SoarZone-I'];
    return teams.map((teamName) => {
      const teamRms = activeRms.filter((r) => (r.team_name || '').toLowerCase() === teamName.toLowerCase());
      const captain = teamRms.find((r) => activeCaptainsList.some((c) => c.rm_name.toLowerCase() === r.rm_name.toLowerCase()));
      const failovers = teamRms.filter((r) => r.tempSupervisedByManager);
      const seniorManager = teamRms[0]?.manager_name || (teamName.startsWith('Unity') ? 'Arijit Nath' : teamName.startsWith('Catlyst') ? 'Surajit Laha' : 'Niladri Bhadra');
      return {
        teamName,
        captainName: captain ? captain.rm_name : null,
        seniorManager,
        totalRms: teamRms.length,
        failoverCount: failovers.length,
        isFailover: !captain || failovers.length > 0,
      };
    });
  }, [activeRms, activeCaptainsList]);

  const handleExecuteCaptainResignation = (captainNameToResign) => {
    const targetName = captainNameToResign || resigningCaptainName;
    if (!targetName) {
      alert('Please select a Pod Captain to process resignation.');
      return;
    }
    const captainObj = activeRms.find((r) => r.rm_name.toLowerCase() === targetName.toLowerCase());
    if (!captainObj) return;

    const subRms = getSubordinatesOfCaptain(targetName);
    const mgr = captainObj.manager_name || 'Arijit Nath';
    const fullReason = captainSeparationNotes
      ? `${captainSeparationReason} - ${captainSeparationNotes}`
      : captainSeparationReason;

    try {
      deactivateRm(targetName, fullReason);
      setAlertMsg({
        type: 'success',
        text: `Successfully processed resignation for Pod Captain "${targetName}". All ${subRms.length} subordinates now report temporarily to Senior Manager "${mgr}". Zero data loss!`,
        canRevert: true,
        revertTarget: targetName,
      });
      setCaptainSeparationNotes('');
      setTimeout(() => setAlertMsg({ type: '', text: '', canRevert: false, revertTarget: '' }), 10000);
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message, canRevert: false, revertTarget: '' });
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      role: ROLES.VIEWER,
      managerKey: 'all',
      captainKey: '',
      designation: '',
      initialPassword: 'Century@2026',
      isPhysicalOnly: false,
    });
    setAlertMsg({ type: '', text: '' });
    setModalMode('create');
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || ROLES.VIEWER,
      managerKey: user.managerKey || 'all',
      captainKey: user.captainKey || '',
      designation: user.designation || '',
      initialPassword: user.initialPassword || '',
      isPhysicalOnly: Boolean(user.isPhysicalOnly),
    });
    setAlertMsg({ type: '', text: '' });
    setModalMode('edit');
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        createUser(formData);
        setAlertMsg({ type: 'success', text: `User ${formData.name} successfully created.` });
      } else if (modalMode === 'edit') {
        updateUser(selectedUser.email, formData);
        setAlertMsg({ type: 'success', text: `User ${formData.name} updated successfully.` });
      }
      refreshUsers();
      setTimeout(() => setModalMode('none'), 1200);
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    }
  };

  const handleDelete = (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.name}"?`)) return;
    try {
      deleteUser(user.email);
      refreshUsers();
      setAlertMsg({ type: 'success', text: `User ${user.name} removed successfully.` });
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    }
  };

  const handleToggleStatus = (user) => {
    try {
      toggleUserStatus(user.email);
      refreshUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  // Scope transfer execute
  const handleExecuteScopeTransfer = (e) => {
    e.preventDefault();
    if (!scopeTransfer.agentName) {
      alert('Please select an agent to reassign.');
      return;
    }
    try {
      updateRmMapping(
        scopeTransfer.agentName,
        scopeTransfer.targetCaptain,
        scopeTransfer.targetManager,
        scopeTransfer.targetTeam || 'Unity-II'
      );
      setAlertMsg({
        type: 'success',
        text: `Successfully reassigned ${scopeTransfer.agentName} to Franchise / Team "${scopeTransfer.targetTeam || 'Unity-II'}", Captain "${scopeTransfer.targetCaptain}" under Manager "${scopeTransfer.targetManager}". Changes synced across all dashboards!`,
      });
      setTimeout(() => setAlertMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>User & Supervisory Scope Governance Console</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise administration: Role-Based Access Control, Account Lifecycles, and Supervisory Tree Scopes.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'users' ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            User Accounts ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('scope')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'scope' ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Supervisory Scope
          </button>
          <button
            onClick={() => setActiveTab('captain-resignation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'captain-resignation'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-300/80 dark:border-amber-800/80'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
            <span>Captain Resignation & Succession</span>
            {failoverAgents.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title={`${failoverAgents.length} agents in failover mode`} />
            )}
          </button>
          <button
            onClick={() => setActiveTab('offboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'offboard' ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span>Remove / Offboard Employee {inactiveRms.length > 0 ? `(${inactiveRms.length})` : ''}</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'roles' ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Role Matrix
          </button>
        </div>
      </div>

      {alertMsg.text && (
        <div className={`p-4 rounded-xl text-xs font-medium border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
        }`}>
          <div className="flex items-center space-x-2">
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span className="font-semibold">{alertMsg.text}</span>
          </div>
          {alertMsg.canRevert && alertMsg.revertTarget && (
            <button
              onClick={() => handleRevertOffboard(alertMsg.revertTarget)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 self-end sm:self-auto shadow-md shadow-emerald-700/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revert Offboarding Mistake</span>
            </button>
          )}
        </div>
      )}

      {/* TAB 1: USER ACCOUNTS CRUD */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Controls Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user, email, role..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value={ROLES.ADMIN}>Super Admin</option>
                <option value={ROLES.MANAGER}>Senior Manager</option>
                <option value={ROLES.CAPTAIN}>Pod Captain</option>
                <option value={ROLES.AUDITOR}>QA Auditor</option>
                <option value={ROLES.VIEWER}>Executive Viewer</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreate}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create New User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role & Designation</th>
                  <th className="py-3 px-4">Supervisory Scope</th>
                  <th className="py-3 px-4">Credentials & PIN</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((user) => {
                  const roleDef = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS[ROLES.VIEWER];
                  return (
                    <tr key={user.email} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                          <span>{user.name}</span>
                          {user.isProtected && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${roleDef.badgeColor}`}>
                          {roleDef.label}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5">{user.designation}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {user.managerKey === 'all' ? (
                          <span className="font-semibold text-purple-600 dark:text-purple-400">All Enterprise Divisions</span>
                        ) : (
                          <span>{user.managerKey} {user.captainKey ? `› ${user.captainKey}` : ''}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        <div>Pass: {user.initialPassword || '••••••••'}</div>
                        <div className="text-slate-400">PIN: {user.recoveryPin}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={user.isProtected}
                          className={`flex items-center space-x-1 font-semibold text-[11px] ${
                            user.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {user.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          <span className="capitalize">{user.status}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit User"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {!user.isProtected && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUPERVISORY & CAPTAIN SCOPE ASSIGNMENT */}
      {activeTab === 'scope' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Reassignment Action Card */}
          <div className="lg:col-span-1 bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-purple-600" />
                <span>Supervisory Scope Assignment</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Reassign an active Relationship Manager / Agent to a new Pod Captain or Senior Manager.
              </p>
            </div>

            <form onSubmit={handleExecuteScopeTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Relationship Manager (Agent)
                </label>
                <select
                  value={scopeTransfer.agentName}
                  onChange={(e) => {
                    const agent = e.target.value;
                    const matched = rmDirectory.find((r) => r.rm_name === agent);
                    setScopeTransfer((prev) => ({
                      ...prev,
                      agentName: agent,
                      targetTeam: matched?.team_name || prev.targetTeam || 'Unity-II',
                      targetCaptain: matched?.captain_name || prev.targetCaptain || 'Arshi Afreen Jamal',
                      targetManager: matched?.manager_name || prev.targetManager || 'Arijit Nath',
                    }));
                  }}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                  required
                >
                  <option value="">-- Choose Agent from {activeRms.length} Active RMs --</option>
                  {activeRms.map((rm) => (
                    <option key={rm.id || rm.rm_name} value={rm.rm_name}>
                      {rm.rm_name} ({rm.team_name || 'Unity-II'} • {rm.captain_name || 'Direct'} • {rm.manager_name || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Franchise / Team
                </label>
                <select
                  value={scopeTransfer.targetTeam}
                  onChange={(e) => setScopeTransfer((prev) => ({ ...prev, targetTeam: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                >
                  {teamsList.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Senior Manager
                </label>
                <select
                  value={scopeTransfer.targetManager}
                  onChange={(e) => setScopeTransfer((prev) => ({ ...prev, targetManager: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  {managersList.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Pod Captain
                </label>
                <select
                  value={scopeTransfer.targetCaptain}
                  onChange={(e) => setScopeTransfer((prev) => ({ ...prev, targetCaptain: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  {captainsList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Effective Transfer Date
                </label>
                <input
                  type="date"
                  value={scopeTransfer.effectiveDate}
                  onChange={(e) => setScopeTransfer((prev) => ({ ...prev, effectiveDate: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Confirm Scope Transfer</span>
              </button>
            </form>
          </div>

          {/* Right: Live Organizational Tree View */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>Live Supervisory Hierarchy Tree</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Senior Managers › Pod Captains › Assigned Relationship Managers
                </p>
              </div>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 font-mono">
                {activeRms.length} Active Agents{inactiveRms.length > 0 ? ` • ${inactiveRms.length} Offboarded` : ''}
              </span>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {managersList.map((mgr) => {
                const caps = hierarchy.tree?.[mgr] || {};
                return (
                  <div key={mgr} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{mgr}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold">
                          Senior Manager
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {Object.keys(caps).length} Teams / Pods
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4 border-l-2 border-blue-200 dark:border-blue-900/60">
                      {Object.entries(caps).map(([captain, agents]) => (
                        <div key={captain} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 space-y-1.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span>{captain}</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {(agents || []).length} RMs
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {(agents || []).slice(0, 6).map((ag) => (
                              <span key={ag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {ag}
                              </span>
                            ))}
                            {(agents || []).length > 6 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                                +{(agents || []).length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB: CAPTAIN RESIGNATION & SUCCESSION PROTOCOL */}
      {activeTab === 'captain-resignation' && (
        <div className="space-y-6">
          
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-amber-900/10 via-slate-900/5 to-amber-900/10 dark:from-amber-950/40 dark:via-slate-900/60 dark:to-slate-900/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Pod Captain Resignation & Succession Protocol
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Failover to Senior Manager</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                When a Pod Captain resigns, their subordinate agents <strong>automatically and temporarily report directly to their immediate Senior Manager</strong> so operations, call queues, and L2 audits continue without interruption. Once leadership selects a successor, promote that employee to Captain to re-establish the pod.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs shadow-sm self-stretch md:self-auto justify-around">
              <div className="text-center px-3 border-r border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Active Captains</div>
                <div className="text-lg font-black text-amber-600 dark:text-amber-400">{activeCaptainsList.length}</div>
              </div>
              <div className="text-center px-3 border-r border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">In Failover</div>
                <div className="text-lg font-black text-rose-600 dark:text-rose-400">{failoverAgents.length}</div>
              </div>
              <div className="text-center px-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Active Pods</div>
                <div className="text-lg font-black text-purple-600 dark:text-purple-400">{podsOverview.length}</div>
              </div>
            </div>
          </div>

          {/* Pod Status Overview Grid */}
          <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>Live Pod Leadership Status & Failover Health</span>
              </h3>
              <span className="text-[11px] text-slate-400">5 Operational Pods</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {podsOverview.map((pod) => (
                <div
                  key={pod.teamName}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    pod.isFailover
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                      : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">{pod.teamName}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        pod.isFailover ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Manager: <strong className="text-slate-700 dark:text-slate-300">{pod.seniorManager}</strong>
                  </div>
                  <div className="text-[11px] mt-1">
                    {pod.captainName ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        Captain: {pod.captainName} ({pod.totalRms} RMs)
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">
                        ⚠️ No Active Captain ({pod.totalRms} RMs under Manager)
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                    {pod.captainName ? (
                      <button
                        onClick={() => {
                          setResigningCaptainName(pod.captainName);
                        }}
                        className="text-[10px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center space-x-1"
                      >
                        <span>Select to Resign →</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setPromotionData((prev) => ({
                            ...prev,
                            targetTeam: pod.teamName,
                            assignedAgents: activeRms
                              .filter((r) => (r.team_name || '').toLowerCase() === pod.teamName.toLowerCase())
                              .map((r) => r.rm_name),
                          }));
                          setPromotionModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center space-x-1"
                      >
                        <span>Promote Successor →</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dual Action Consoles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Console 1: Execute Captain Resignation */}
            <div className="bg-white dark:bg-[#0e1320] border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                  <UserMinus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Step 1: Process Captain Resignation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Safely separate a Pod Captain and auto-route their team to the Senior Manager.
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Pod Captain
                  </label>
                  <select
                    value={resigningCaptainName}
                    onChange={(e) => setResigningCaptainName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {activeCaptainsList.map((capt) => {
                      const count = getSubordinatesOfCaptain(capt.rm_name).length;
                      return (
                        <option key={capt.rm_name} value={capt.rm_name}>
                          {capt.rm_name} ({capt.team_name} • {count} Supervised RMs • Mgr: {capt.manager_name})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Subordinates & Failover Preview */}
                {(() => {
                  const targetCapt = activeRms.find(
                    (r) => r.rm_name.toLowerCase() === (resigningCaptainName || '').toLowerCase()
                  );
                  const subRms = getSubordinatesOfCaptain(resigningCaptainName);
                  const mgrName = targetCapt?.manager_name || 'Arijit Nath';
                  return (
                    <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 dark:text-amber-200">
                          Supervised Pod Members ({subRms.length} RMs):
                        </span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                          Team: {targetCapt?.team_name || 'Unity-II'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {subRms.map((rm) => (
                          <span
                            key={rm.rm_name}
                            className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 text-[11px] text-slate-800 dark:text-slate-200"
                          >
                            {rm.rm_name}
                          </span>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-amber-200/70 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 font-medium text-[11px] flex items-start space-x-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Failover Destination:</strong> All {subRms.length} agents will temporarily report directly to Senior Manager <strong>{mgrName}</strong>. Zero tickets or calls orphaned.
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Separation Reason
                  </label>
                  <select
                    value={captainSeparationReason}
                    onChange={(e) => setCaptainSeparationReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Resignation / Separation">Official Resignation / Separation</option>
                    <option value="Career Advancement / Better Offer">Career Advancement / External Offer</option>
                    <option value="Personal Reasons / Relocation">Personal Reasons / Relocation</option>
                    <option value="Internal Department Transfer">Internal Department Transfer</option>
                    <option value="Health / Medical Leave">Health / Extended Medical Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Handover Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={captainSeparationNotes}
                    onChange={(e) => setCaptainSeparationNotes(e.target.value)}
                    placeholder="e.g. Completed handover meeting with Senior Manager"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleExecuteCaptainResignation(resigningCaptainName)}
                  disabled={!resigningCaptainName}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Execute Captain Resignation & Failover to Manager</span>
                </button>
              </div>
            </div>

            {/* Console 2: Succession & Leadership Promotion */}
            <div className="bg-white dark:bg-[#0e1320] border border-purple-200/80 dark:border-purple-900/40 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Step 2: Leadership Succession & Role Promotion
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Once a replacement is selected, promote that employee to Captain or Senior Manager.
                  </p>
                </div>
              </div>

              {/* Promotion Form */}
              <form onSubmit={handleConfirmPromotion} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Employee to Promote
                  </label>
                  <select
                    value={promotionData.candidateName}
                    onChange={(e) => {
                      const candidate = e.target.value;
                      const matched = activeRms.find((r) => r.rm_name === candidate);
                      const currentTeam = matched?.team_name || 'Unity-II';
                      // Auto-select subordinate agents from that team
                      const teamAgents = activeRms
                        .filter(
                          (r) =>
                            (r.team_name || '').toLowerCase() === currentTeam.toLowerCase() &&
                            r.rm_name.toLowerCase() !== candidate.toLowerCase()
                        )
                        .map((r) => r.rm_name);
                      setPromotionData((prev) => ({
                        ...prev,
                        candidateName: candidate,
                        targetTeam: currentTeam,
                        assignedAgents: teamAgents,
                      }));
                    }}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Choose Candidate from {activeRms.length} Active RMs --</option>
                    {activeRms.map((rm) => (
                      <option key={rm.rm_name} value={rm.rm_name}>
                        {rm.rm_name} ({rm.team_name} • Current Supervisor: {rm.captain_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Promote To Role
                    </label>
                    <select
                      value={promotionData.targetRole}
                      onChange={(e) =>
                        setPromotionData((prev) => ({ ...prev, targetRole: e.target.value }))
                      }
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                    >
                      <option value="captain">Pod Captain (Leads a Pod)</option>
                      <option value="manager">Senior Manager (Executive)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Franchise / Team
                    </label>
                    <select
                      value={promotionData.targetTeam}
                      onChange={(e) => {
                        const newTeam = e.target.value;
                        const teamAgents = activeRms
                          .filter(
                            (r) =>
                              (r.team_name || '').toLowerCase() === newTeam.toLowerCase() &&
                              r.rm_name.toLowerCase() !== (promotionData.candidateName || '').toLowerCase()
                          )
                          .map((r) => r.rm_name);
                        setPromotionData((prev) => ({
                          ...prev,
                          targetTeam: newTeam,
                          assignedAgents: teamAgents,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                    >
                      {teamsList.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subordinate Agent Selection Checkboxes */}
                {promotionData.targetRole === 'captain' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Assign Team Members to New Captain ({promotionData.assignedAgents.length} selected):
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const allTeam = activeRms
                            .filter(
                              (r) =>
                                (r.team_name || '').toLowerCase() ===
                                  (promotionData.targetTeam || 'Unity-II').toLowerCase() &&
                                r.rm_name.toLowerCase() !==
                                  (promotionData.candidateName || '').toLowerCase()
                            )
                            .map((r) => r.rm_name);
                          setPromotionData((prev) => ({ ...prev, assignedAgents: allTeam }));
                        }}
                        className="text-[10px] text-purple-600 hover:text-purple-700 font-bold"
                      >
                        Select All Team
                      </button>
                    </div>
                    <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 text-xs">
                      {activeRms
                        .filter(
                          (r) =>
                            r.rm_name.toLowerCase() !== (promotionData.candidateName || '').toLowerCase()
                        )
                        .map((rm) => {
                          const isChecked = promotionData.assignedAgents.includes(rm.rm_name);
                          return (
                            <label
                              key={rm.rm_name}
                              className="flex items-center space-x-2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-800 dark:text-slate-200"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setPromotionData((prev) => ({
                                    ...prev,
                                    assignedAgents: checked
                                      ? [...prev.assignedAgents, rm.rm_name]
                                      : prev.assignedAgents.filter((a) => a !== rm.rm_name),
                                  }));
                                }}
                                className="rounded text-purple-600 focus:ring-purple-500"
                              />
                              <span className="font-medium">{rm.rm_name}</span>
                              <span className="text-[10px] text-slate-400">
                                ({rm.team_name} • Current: {rm.captain_name})
                              </span>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!promotionData.candidateName}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm Promotion & Reassign Pod</span>
                </button>
              </form>
            </div>
          </div>

          {/* Accidental Resignation & Offboarding Revert Center */}
          <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span>Accidental Resignation & Offboarding Revert Center</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Revert any accidental separation or resignation with 1 click. Restores the employee to active operations and reinstates all original pod hierarchy.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                {inactiveRms.length} Offboarded Records
              </span>
            </div>

            {inactiveRms.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Employee</th>
                      <th className="py-2.5 px-4">Role / Pod</th>
                      <th className="py-2.5 px-4">Separation Date & Reason</th>
                      <th className="py-2.5 px-4 text-right">Revert Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {inactiveRms.map((rm) => (
                      <tr key={rm.rm_name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{rm.rm_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{rm.dialer_id || rm.rm_name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rm.wasCaptain ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {rm.wasCaptain ? 'Pod Captain' : rm.designation || 'Relationship Manager'}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-0.5">{rm.team_name} • Sup: {rm.captain_name || 'Direct'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          <div className="font-medium">{rm.deactivationDate || 'Recent'}</div>
                          <div className="text-[11px] text-slate-400 italic">{rm.deactivationReason || 'Resignation'}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRevertOffboard(rm.rm_name)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ml-auto"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Revert Resignation</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  All Staff & Pod Captains are Active
                </div>
                <div className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
                  There are no separated or offboarded employees requiring restoration. If an employee is offboarded by mistake in the future, their restoration card will appear here for 1-click reinstatement.
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB: EMPLOYEE SOFT OFFBOARDING / DEACTIVATION (Zero Database Impact) */}
      {activeTab === 'offboard' && (
        <div className="space-y-6">
          
          {/* Quick Nav Banner to Captain Resignation */}
          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200 font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Looking to process a Pod Captain's resignation with auto-failover to Senior Manager?</span>
            </div>
            <button
              onClick={() => setActiveTab('captain-resignation')}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 self-end sm:self-auto"
            >
              Go to Captain Resignation Tab →
            </button>
          </div>
          
          {/* Hero Explanatory Banner */}
          <div className="bg-gradient-to-r from-purple-900/10 via-slate-900/5 to-slate-900/10 dark:from-purple-950/40 dark:via-slate-900/60 dark:to-slate-900/30 border border-purple-200 dark:border-purple-900/50 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  <Database className="w-5 h-5" />
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Employee Separation & Soft Offboarding Console
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Zero Database Impact Guarantee</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Safely offboard departing or reassigned staff from active operational lists (new QA scorecards, live dialer queues, and supervisory reassignments). 
                <strong> 100% of historical data is preserved:</strong> past sales tickets, call records, and completed audits remain permanently retained and verifiable in the database.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs shadow-sm self-stretch md:self-auto justify-around">
              <div className="text-center px-3 border-r border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Active RMs</div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{activeRms.length}</div>
              </div>
              <div className="text-center px-3 border-r border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Offboarded</div>
                <div className="text-lg font-black text-amber-600 dark:text-amber-400">{inactiveRms.length}</div>
              </div>
              <div className="text-center px-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Audits Preserved</div>
                <div className="text-lg font-black text-purple-600 dark:text-purple-400">{(qaAudits || []).length}</div>
              </div>
            </div>
          </div>

          {/* Accidental Offboarding Protection Banner */}
          {lastOffboardAction && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span>Accidental Offboarding Protection</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mono">
                      1-Click Revert Ready
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Recently offboarded <strong>{lastOffboardAction.rmName}</strong>
                    {lastOffboardAction.wasCaptain
                      ? ` (Pod Captain — ${lastOffboardAction.affectedSubordinateNames?.length || 0} agents temporarily reporting to Senior Manager ${lastOffboardAction.immediateManager})`
                      : ''}. Offboarded by mistake?
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRevertOffboard(lastOffboardAction.rmName)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 self-end sm:self-auto shadow-md shadow-amber-600/20 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert Offboarding Mistake</span>
              </button>
            </div>
          )}

          {/* Controls Bar & Subtabs */}
          <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Sub-tab Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <button
                  onClick={() => setOffboardSubTab('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    offboardSubTab === 'active'
                      ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Active Operations Roster ({activeRms.length})</span>
                </button>
                <button
                  onClick={() => setOffboardSubTab('archived')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    offboardSubTab === 'archived'
                      ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5 text-amber-500" />
                  <span>Offboarded / Inactive Archive ({inactiveRms.length})</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setPromotionData({
                    candidateName: activeRms[0]?.rm_name || '',
                    targetRole: 'captain',
                    targetTeam: 'Unity-II',
                    assignedAgents: [],
                  });
                  setPromotionModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Promote to Captain / Manager</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={offboardSearch}
                onChange={(e) => setOffboardSearch(e.target.value)}
                placeholder="Search RM, franchise, captain..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Sub-tab 1: Active Roster */}
          {offboardSubTab === 'active' && (
            <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <span>Active Relationship Managers in Live System</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click "Deactivate Employee" to soft-remove any agent who has left or separated. Past tickets and audits remain 100% intact.
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Showing {filteredActiveRms.length} of {activeRms.length} Active
                </span>
              </div>

              <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider z-10">
                    <tr>
                      <th className="py-3 px-4">Employee / RM Name</th>
                      <th className="py-3 px-4">Franchise / Team</th>
                      <th className="py-3 px-4">Pod Captain & Senior Manager</th>
                      <th className="py-3 px-4">Historical Data Protection</th>
                      <th className="py-3 px-4 text-right">Operational Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredActiveRms.map((rm) => {
                      const rmAuditsCount = (qaAudits || []).filter(
                        (a) => (a.rm_name || '').toLowerCase() === rm.rm_name.toLowerCase()
                      ).length;
                      return (
                        <tr key={rm.id || rm.rm_name} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                              <span>{rm.rm_name}</span>
                              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Dialer ID: {rm.dialer_id || 'N/A'} • ID: #{rm.id}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              {rm.team_name || 'Unity-II'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                            <div className="font-medium text-xs">{rm.captain_name || 'Direct Supervision'}</div>
                            <div className="text-[11px] text-slate-500">Mgr: {rm.manager_name || 'General Management'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 text-[11px]">
                              <Database className="w-3.5 h-3.5 text-blue-500" />
                              <span>{rmAuditsCount} QA Audits Logged</span>
                            </div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              ✓ Historical records locked & preserved
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setDeactivatingRm(rm);
                                setDeactivateReason('Resignation / Separation');
                                setCustomDeactivateNote('');
                              }}
                              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-xs transition-all flex items-center space-x-1.5 ml-auto"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>Deactivate Employee</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab 2: Offboarded / Inactive Archive */}
          {offboardSubTab === 'archived' && (
            <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <Archive className="w-4 h-4 text-amber-500" />
                    <span>Offboarded / Inactive Employees Archive</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    These employees are hidden from active scorecard dropdowns. All historical audits, tickets, and logs remain 100% preserved.
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {inactiveRms.length} Offboarded
                </span>
              </div>

              {inactiveRms.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    No Employees Currently Offboarded
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    All {rmDirectory.length} Relationship Managers are active in operational lists. When an employee is soft-deactivated, they will appear here with full restore options.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider z-10">
                      <tr>
                        <th className="py-3 px-4">Employee / RM Name</th>
                        <th className="py-3 px-4">Last Franchise / Team</th>
                        <th className="py-3 px-4">Last Captain & Manager</th>
                        <th className="py-3 px-4">Separation Reason & Date</th>
                        <th className="py-3 px-4">Database History</th>
                        <th className="py-3 px-4 text-right">Restore Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredInactiveRms.map((rm) => {
                        const rmAuditsCount = (qaAudits || []).filter(
                          (a) => (a.rm_name || '').toLowerCase() === rm.rm_name.toLowerCase()
                        ).length;
                        return (
                          <tr key={rm.id || rm.rm_name} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors bg-amber-50/20 dark:bg-amber-950/10">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                                <span>{rm.rm_name}</span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase">
                                  Offboarded
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                Dialer ID: {rm.dialer_id || 'N/A'} • ID: #{rm.id}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {rm.team_name || 'Unity-II'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                              <div className="font-medium text-xs">{rm.captain_name || 'Direct'}</div>
                              <div className="text-[11px] text-slate-500">Mgr: {rm.manager_name || 'General'}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900 dark:text-slate-200">
                                {rm.deactivationReason || 'Separated / Soft Offboarded'}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Date: {rm.deactivatedAt ? rm.deactivatedAt.slice(0, 10) : 'Recent'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                                <Database className="w-3.5 h-3.5" />
                                <span>{rmAuditsCount} Past Audits Preserved</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                100% database integrity maintained
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleRevertOffboard(rm.rm_name)}
                                className="px-3.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold text-xs transition-all flex items-center space-x-1.5 ml-auto shadow-sm"
                                title="Revert offboarding and reinstate employee"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Revert Offboarding</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* TAB 3: ROLE PERMISSION MATRIX */}
      {activeTab === 'roles' && (
        <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Enterprise Role Permission Matrix (RBAC)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear functional breakdown of authority across modules, upload portals, and executive oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ROLE_DEFINITIONS).map(([roleKey, def]) => (
              <div key={roleKey} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${def.badgeColor}`}>
                    {def.label}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {def.description}
                </p>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Manage Users & Scope:</span>
                    <span className={def.canManageUsers ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                      {def.canManageUsers ? '✓ Allowed' : '— Denied'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Excel / Dialer Data Upload:</span>
                    <span className={def.canUploadData ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                      {def.canUploadData ? '✓ Allowed' : '— Denied'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">All Financial Portals:</span>
                    <span className={def.canViewAllFinancials ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                      {def.canViewAllFinancials ? '✓ Unrestricted' : 'Scoped'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Conduct QA Audits:</span>
                    <span className={def.canConductAudits ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                      {def.canConductAudits ? '✓ Authorized' : '— Denied'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {modalMode !== 'none' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {modalMode === 'create' ? 'Create New User Account' : `Edit Account: ${formData.name}`}
              </h3>
              <button
                onClick={() => setModalMode('none')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={modalMode === 'edit'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Assignment</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={ROLES.VIEWER}>Executive Viewer</option>
                  <option value={ROLES.AUDITOR}>Quality Auditor</option>
                  <option value={ROLES.CAPTAIN}>Pod Captain</option>
                  <option value={ROLES.MANAGER}>Senior Manager</option>
                  <option value={ROLES.ADMIN}>Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Supervisory Manager Scope</label>
                <select
                  value={formData.managerKey}
                  onChange={(e) => setFormData((prev) => ({ ...prev, managerKey: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="all">All Managers / Enterprise Unrestricted</option>
                  {managersList.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation Label</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, designation: e.target.value }))}
                  placeholder="e.g. Lead Quality Auditor"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
                <input
                  type="text"
                  value={formData.initialPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, initialPassword: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalMode('none')}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Soft Deactivation Confirmation */}
      {deactivatingRm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-start space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <UserMinus className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Soft-Deactivate Employee
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Remove from active operations without deleting historical data.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee:</span>
                <span className="font-bold text-slate-900 dark:text-white">{deactivatingRm.rm_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Team / Franchise:</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{deactivatingRm.team_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pod Captain:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{deactivatingRm.captain_name}</span>
              </div>
            </div>

            {/* Captain Resignation Warning if applicable */}
            {(() => {
              const subRms = getSubordinatesOfCaptain(deactivatingRm.rm_name);
              if (subRms.length === 0) return null;
              return (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs space-y-1.5">
                  <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Pod Captain Resignation Protocol</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    This employee is a Pod Captain supervising <strong>{subRms.length} active Relationship Managers</strong> under Senior Manager <strong>{deactivatingRm.manager_name || 'Arijit Nath'}</strong>.
                  </p>
                  <div className="p-2 rounded-lg bg-amber-100/70 dark:bg-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 font-semibold flex items-center space-x-1.5">
                    <span>⚡</span>
                    <span>
                      Auto-Failover: All {subRms.length} agents will temporarily report directly to Senior Manager {deactivatingRm.manager_name || 'Arijit Nath'}.
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Zero DB Impact Guarantee Box */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1">
              <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Database Impact Guarantee</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                This employee will be hidden from new QA evaluations, live dialer lists, and active supervisory pods. 
                <strong> No records are deleted.</strong> All past sales tickets, call recordings, and historical QA scorecards remain 100% intact in the database.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Separation Reason
                </label>
                <select
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Resignation / Separation">Resignation / Voluntary Separation</option>
                  <option value="End of Employment Contract">End of Employment Contract</option>
                  <option value="Role Transition / Department Transfer">Role Transition / Department Transfer</option>
                  <option value="Medical / Extended Leave">Medical / Extended Leave</option>
                  <option value="Disciplinary / Offboarded">Disciplinary / Involuntary Separation</option>
                  <option value="Other / Administrative Deactivation">Other / Administrative Deactivation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Additional Note (Optional)
                </label>
                <input
                  type="text"
                  value={customDeactivateNote}
                  onChange={(e) => setCustomDeactivateNote(e.target.value)}
                  placeholder="e.g. Last working day Nov 24, 2026"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeactivatingRm(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 flex items-center space-x-1.5"
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>Confirm Soft Deactivation</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Pod Succession & Promotion */}
      {promotionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-start space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Pod Succession & Role Promotion
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Promote an employee to Pod Captain or Senior Manager and assign subordinate teams.
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmPromotion} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Select Employee to Promote
                </label>
                <select
                  value={promotionData.candidateName}
                  onChange={(e) => {
                    const cand = e.target.value;
                    const matched = activeRms.find((r) => r.rm_name === cand);
                    setPromotionData((prev) => ({
                      ...prev,
                      candidateName: cand,
                      targetTeam: matched?.team_name || prev.targetTeam,
                    }));
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                  required
                >
                  <option value="">-- Choose Active Employee --</option>
                  {activeRms.map((rm) => (
                    <option key={rm.rm_name} value={rm.rm_name}>
                      {rm.rm_name} ({rm.team_name} • Current Supervisor: {rm.captain_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Promotion Role
                  </label>
                  <select
                    value={promotionData.targetRole}
                    onChange={(e) => setPromotionData((prev) => ({ ...prev, targetRole: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="captain">Promote to Pod Captain</option>
                    <option value="manager">Promote to Senior Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Assigned Franchise / Team
                  </label>
                  <select
                    value={promotionData.targetTeam}
                    onChange={(e) => setPromotionData((prev) => ({ ...prev, targetTeam: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                  >
                    {teamsList.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {promotionData.targetRole === 'captain' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Assign Team Members to New Captain
                    </label>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                      {promotionData.assignedAgents.length} Agents Selected
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mb-2">
                    Select agents (including those temporarily reporting to Senior Manager) to transfer under this newly promoted captain:
                  </p>

                  <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                    {activeRms
                      .filter((r) => r.rm_name !== promotionData.candidateName)
                      .map((rm) => {
                        const isChecked = promotionData.assignedAgents.includes(rm.rm_name);
                        return (
                          <label
                            key={rm.rm_name}
                            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setPromotionData((prev) => ({
                                  ...prev,
                                  assignedAgents: checked
                                    ? [...prev.assignedAgents, rm.rm_name]
                                    : prev.assignedAgents.filter((a) => a !== rm.rm_name),
                                }));
                              }}
                              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-xs font-medium text-slate-900 dark:text-white">{rm.rm_name}</span>
                            <span className="text-[10px] text-slate-400">
                              ({rm.team_name} • Sup: {rm.captain_name})
                              {rm.tempSupervisedByManager ? ' [Direct to Manager]' : ''}
                            </span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPromotionModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Approve & Execute Promotion</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
