import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus, 
  adminResetUserPassword 
} from '../utils/auth';
import { 
  ArrowLeft,
  Users, 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  Search, 
  X, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Lock, 
  Mail, 
  User, 
  ToggleLeft, 
  ToggleRight,
  ShieldAlert,
  UserCheck,
  Building2,
  Sparkles,
  Eye,
  EyeOff,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';

export default function UserAccessPage({ onBack }) {
  const { currentUser, logout, theme, toggleTheme } = useData();

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Drawer / View State: 'none' | 'create' | 'edit' | 'reset-password'
  const [activeDrawer, setActiveDrawer] = useState('none');
  const [selectedUser, setSelectedUser] = useState(null);

  // Feedback Alert
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    initialPassword: '',
    role: 'manager',
    managerKey: 'all',
    designation: 'Senior Manager',
    isPhysicalOnly: false,
    recoveryPin: ''
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'manager',
    managerKey: 'all',
    designation: '',
    isPhysicalOnly: false,
    recoveryPin: '',
    newPassword: '',
    status: 'active'
  });
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Quick Password Reset State
  const [quickPassword, setQuickPassword] = useState('');
  const [showQuickPassword, setShowQuickPassword] = useState(false);

  const loadUsers = () => {
    setUsers(getAllUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Listen for user updates
  useEffect(() => {
    const handleUpdate = () => loadUsers();
    window.addEventListener('century_users_updated', handleUpdate);
    return () => window.removeEventListener('century_users_updated', handleUpdate);
  }, []);

  // Security Gate: Developer only
  const isDeveloper = currentUser && (
    currentUser.role === 'admin' || 
    (currentUser.name && currentUser.name.toLowerCase().includes('kushal')) ||
    (currentUser.email && currentUser.email.toLowerCase().includes('kushal'))
  );

  if (!isDeveloper) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md bg-[#0f172a] border border-red-800 rounded-3xl p-8">
          <ShieldAlert className="w-16 h-16 text-[#e31e24] mx-auto mb-4" />
          <h2 className="text-xl font-black">Restricted Developer Page</h2>
          <p className="text-xs text-slate-400 mt-2">
            This administration portal is restricted strictly to Developer Kushal Kar.
          </p>
          <button
            onClick={onBack}
            className="mt-6 px-5 py-2.5 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.designation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.managerKey || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (roleFilter === 'all') return matchesSearch;
    if (roleFilter === 'manager') return matchesSearch && u.role === 'manager';
    if (roleFilter === 'all_teams') return matchesSearch && (u.role === 'upload_view_all' || u.role === 'view_all');
    if (roleFilter === 'admin') return matchesSearch && u.role === 'admin';
    return matchesSearch;
  });

  // Calculate Metrics
  const totalCount = users.length;
  const activeCount = users.filter(u => u.status !== 'suspended').length;
  const managersCount = users.filter(u => u.role === 'manager').length;
  const allTeamsCount = users.filter(u => u.role === 'upload_view_all' || u.role === 'view_all').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  // Handle Create User Submit
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    const result = createUser(createForm);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      loadUsers();
      setActiveDrawer('none');
      setCreateForm({
        name: '',
        email: '',
        initialPassword: '',
        role: 'manager',
        managerKey: 'all',
        designation: 'Senior Manager',
        isPhysicalOnly: false,
        recoveryPin: ''
      });
    } else {
      setFeedback({ type: 'error', message: result.error });
    }
  };

  // Open Edit User Drawer
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'manager',
      managerKey: user.managerKey || 'all',
      designation: user.designation || '',
      isPhysicalOnly: Boolean(user.isPhysicalOnly),
      recoveryPin: user.recoveryPin || '',
      newPassword: '',
      status: user.status || 'active'
    });
    setFeedback({ type: '', message: '' });
    setActiveDrawer('edit');
  };

  // Handle Edit User Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFeedback({ type: '', message: '' });

    const result = updateUser(selectedUser.email, editForm);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      loadUsers();
      setActiveDrawer('none');
      setSelectedUser(null);
    } else {
      setFeedback({ type: 'error', message: result.error });
    }
  };

  // Open Quick Reset Password
  const handleOpenReset = (user) => {
    setSelectedUser(user);
    setQuickPassword('');
    setFeedback({ type: '', message: '' });
    setActiveDrawer('reset-password');
  };

  // Handle Quick Password Reset Submit
  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFeedback({ type: '', message: '' });

    const result = adminResetUserPassword(selectedUser.email, quickPassword);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      loadUsers();
      setActiveDrawer('none');
      setSelectedUser(null);
    } else {
      setFeedback({ type: 'error', message: result.error });
    }
  };

  // Toggle User Status
  const handleToggleStatus = (user) => {
    setFeedback({ type: '', message: '' });
    const result = toggleUserStatus(user.email);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      loadUsers();
    } else {
      setFeedback({ type: 'error', message: result.error });
    }
  };

  // Delete User
  const handleDelete = (user) => {
    if (!window.confirm(`Are you sure you want to revoke and delete access for ${user.name} (${user.email})?`)) {
      return;
    }
    setFeedback({ type: '', message: '' });
    const result = deleteUser(user.email);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      loadUsers();
    } else {
      setFeedback({ type: 'error', message: result.error });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-800 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200">
      
      {/* Red Century Accent Line */}
      <div className="h-1 bg-gradient-to-r from-[#e31e24] via-[#c4161c] to-[#991b1b] w-full" />

      {/* =========================================================================
          PAGE TOP NAVIGATION BAR
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* Left Brand & Return Button */}
          <div className="flex items-center gap-4">
            
            {/* Back to Executive Dashboard CTA */}
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer group"
              title="Return to Sales & Revenue Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-[#e31e24] group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Dashboard</span>
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Brand Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#e31e24] text-white flex items-center justify-center font-black text-sm shadow-md shadow-red-600/30">
                CJ
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    User Access & Identity Governance
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    Developer Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Provision fresh accounts, govern supervisory scopes, and manage credentials
                </p>
              </div>
            </div>

          </div>

          {/* Right Authenticated Developer Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* Developer Chip */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
              <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
                KK
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-slate-900 dark:text-white">{currentUser?.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold ml-1.5">• Lead Developer</span>
              </div>
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Sign Out */}
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-[#e31e24] dark:bg-slate-800 dark:hover:bg-red-950/40 dark:text-slate-300 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

          </div>

        </div>
      </header>

      {/* =========================================================================
          MAIN PAGE CONTENT CANVAS
          ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Feedback Alert Notice */}
        {feedback.message && (
          <div className={`p-4 rounded-2xl text-xs flex items-center justify-between border shadow-sm animate-in fade-in duration-150 ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300' 
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300'
          }`}>
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#e31e24] shrink-0" />
              )}
              <span className="font-semibold">{feedback.message}</span>
            </div>
            <button 
              onClick={() => setFeedback({ type: '', message: '' })}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =========================================================================
            TOP METRIC KPI CARDS (4 EXECUTIVE COUNTERS)
            ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Accounts</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {totalCount}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Registered corporate profiles
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Status</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {activeCount}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Authorized live login access
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Senior Managers</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {managersCount}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Niladri, Surajit, Arijit, Amit
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Leadership & Dev</span>
              <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {adminCount}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Full system access privileges
            </p>
          </div>

        </div>

        {/* =========================================================================
            ACTION BAR: SEARCH, ROLE FILTER PILLS & "+ CREATE FRESH USER"
            ========================================================================= */}
        <div className="bg-white dark:bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Search Bar & Role Filters */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by user name, corporate email, or pod scope..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24] focus:ring-1 focus:ring-red-500/20"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  roleFilter === 'all' 
                    ? 'bg-[#e31e24] text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Users ({users.length})
              </button>
              <button
                onClick={() => setRoleFilter('manager')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  roleFilter === 'manager' 
                    ? 'bg-[#e31e24] text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Managers ({managersCount})
              </button>
              <button
                onClick={() => setRoleFilter('all_teams')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  roleFilter === 'all_teams' 
                    ? 'bg-[#e31e24] text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All-Team Access ({allTeamsCount})
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  roleFilter === 'admin' 
                    ? 'bg-[#e31e24] text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Admins ({adminCount})
              </button>
            </div>

          </div>

          {/* Primary Create Button */}
          <button
            onClick={() => {
              setActiveDrawer('create');
              setFeedback({ type: '', message: '' });
            }}
            className="px-4 py-2.5 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md shadow-red-600/30 flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Create Fresh User</span>
          </button>

        </div>

        {/* =========================================================================
            SPACIOUS FULL-WIDTH USER GOVERNANCE TABLE
            ========================================================================= */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Authorized Personnel Directory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active corporate credentials and supervisory scope boundaries
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Showing {filteredUsers.length} of {users.length} Accounts
            </span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No users found</p>
              <p className="text-xs text-slate-500 mt-1">Try modifying your search query or role filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4 sm:px-6">User & Identity</th>
                    <th className="py-3.5 px-4">Role & Designation</th>
                    <th className="py-3.5 px-4">Supervisory Pod Scope</th>
                    <th className="py-3.5 px-4">Security PIN</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {filteredUsers.map((u) => {
                    const initials = (u.name || 'U')
                      .split(' ')
                      .map(p => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    const isActive = u.status !== 'suspended';

                    return (
                      <tr 
                        key={u.email}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                          !isActive ? 'opacity-60 bg-red-50/20 dark:bg-red-950/10' : ''
                        }`}
                      >
                        {/* User Identity */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                              u.isProtected
                                ? 'bg-red-600 text-white shadow-red-600/30'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                            }`}>
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-slate-900 dark:text-white">{u.name}</span>
                                {u.isProtected && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30">
                                    MASTER DEVELOPER
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{u.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Designation & Role */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {u.designation || u.role}
                            </span>
                            <div className="text-[10px] font-semibold text-slate-400">
                              {u.role === 'admin' && <span className="text-red-500 dark:text-red-400">Full Administrator</span>}
                              {u.role === 'upload_view_all' && <span className="text-emerald-600 dark:text-emerald-400">Upload + All Teams</span>}
                              {u.role === 'view_all' && <span className="text-blue-500 dark:text-blue-400">View All Teams (Read-Only)</span>}
                              {u.role === 'manager' && <span>Senior Manager (Pod Scoped)</span>}
                            </div>
                          </div>
                        </td>

                        {/* Supervisory Pod Scope */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {u.managerKey === 'all' ? 'All Teams & Pods' : u.managerKey}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {u.isPhysicalOnly ? 'Restricted to Physical Team Only' : 'Digital Pods + Physical Teams'}
                            </div>
                          </div>
                        </td>

                        {/* Security Recovery PIN */}
                        <td className="py-4 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                            {u.recoveryPin || 'N/A'}
                          </span>
                        </td>

                        {/* Account Status */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                              : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span>{isActive ? 'Active' : 'Suspended'}</span>
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            
                            {/* Edit Access Button */}
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Edit User & Access Scope"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                              <span>Edit</span>
                            </button>

                            {/* Reset Password Button */}
                            <button
                              onClick={() => handleOpenReset(u)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Override Password"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                              <span className="hidden sm:inline">Password</span>
                            </button>

                            {/* Status Toggle Switch */}
                            {!u.isProtected && (
                              <button
                                onClick={() => handleToggleStatus(u)}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  isActive
                                    ? 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border-slate-200 dark:bg-slate-800 dark:hover:bg-red-950/40 dark:text-slate-300 dark:hover:text-red-400 dark:border-slate-700'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                                }`}
                                title={isActive ? 'Suspend User Access' : 'Reactivate User Access'}
                              >
                                {isActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-red-500" />}
                              </button>
                            )}

                            {/* Delete User */}
                            {!u.isProtected && (
                              <button
                                onClick={() => handleDelete(u)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 dark:bg-slate-800 dark:hover:bg-red-900/50 dark:text-slate-400 dark:hover:text-red-300 dark:border-slate-700 transition-colors cursor-pointer"
                                title="Delete User Profile"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            )}

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>

      {/* =========================================================================
          SLIDE-OVER DRAWER / MODAL: CREATE FRESH USER
          ========================================================================= */}
      {activeDrawer === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="h-1.5 bg-gradient-to-r from-[#e31e24] via-red-600 to-amber-500 w-full" />

            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#e31e24]" />
                  Create Fresh Corporate User
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Assign credentials and supervisory pod access boundaries
                </p>
              </div>
              <button
                onClick={() => setActiveDrawer('none')}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh.chandra@centuryply.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Password * (min 6 chars)
                  </label>
                  <div className="relative">
                    <input
                      type={showCreatePassword ? 'text' : 'password'}
                      required
                      placeholder="e.g. Century@2026"
                      value={createForm.initialPassword}
                      onChange={(e) => setCreateForm({ ...createForm, initialPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 pr-10 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Recovery PIN (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CP-2026 (Auto-assigned)"
                    value={createForm.recoveryPin}
                    onChange={(e) => setCreateForm({ ...createForm, recoveryPin: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:border-[#e31e24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role Permission *
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => {
                      const r = e.target.value;
                      let defaultDesig = 'Senior Manager';
                      let defaultKey = createForm.managerKey;
                      if (r === 'admin') {
                        defaultDesig = 'Executive Director';
                        defaultKey = 'all';
                      } else if (r === 'upload_view_all') {
                        defaultDesig = 'Operations & Revenue Lead';
                        defaultKey = 'all';
                      } else if (r === 'view_all') {
                        defaultDesig = 'Executive Stakeholder / Viewer';
                        defaultKey = 'all';
                      }
                      setCreateForm({
                        ...createForm,
                        role: r,
                        designation: defaultDesig,
                        managerKey: defaultKey,
                        isPhysicalOnly: false
                      });
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#e31e24]"
                  >
                    <option value="manager">Senior Manager (Scoped to Pod)</option>
                    <option value="upload_view_all">Upload and View All Teams Data</option>
                    <option value="view_all">View All Teams Data (Read-Only)</option>
                    <option value="admin">Administrator / Leadership (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Designation Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Manager"
                    value={createForm.designation}
                    onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supervisory Scope Assignment (Manager Pod)
                </label>
                <select
                  value={createForm.managerKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCreateForm({
                      ...createForm,
                      managerKey: val,
                      isPhysicalOnly: val === 'Amit Singal'
                    });
                  }}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#e31e24]"
                >
                  <option value="all">All Teams & Pods (Unrestricted Full Dataset)</option>
                  <option value="Niladri Bhadra">Niladri Bhadra Pod (Digital + Physical • 30 RMs)</option>
                  <option value="Surajit Laha">Surajit Laha Pod (Digital + Physical • 25 RMs)</option>
                  <option value="Arijit Nath">Arijit Nath Pod (Digital + Physical • 23 RMs)</option>
                  <option value="Amit Singal">Amit Singal Pod (Physical Team Only • 6 RMs)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="page-create-phys"
                  checked={createForm.isPhysicalOnly}
                  onChange={(e) => setCreateForm({ ...createForm, isPhysicalOnly: e.target.checked })}
                  className="rounded border-slate-300 text-[#e31e24] focus:ring-red-500"
                />
                <label htmlFor="page-create-phys" className="text-xs text-slate-700 dark:text-slate-300 select-none">
                  Restrict strictly to Physical Stream (No Digital Pods)
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md shadow-red-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create User & Grant Access</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawer('none')}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE-OVER DRAWER / MODAL: EDIT USER ACCESS
          ========================================================================= */}
      {activeDrawer === 'edit' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="h-1.5 bg-gradient-to-r from-amber-500 via-[#e31e24] to-red-600 w-full" />

            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-500" />
                  Edit Access Scope: {selectedUser.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                  {selectedUser.email}
                </p>
              </div>
              <button
                onClick={() => setActiveDrawer('none')}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#e31e24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Designation
                  </label>
                  <input
                    type="text"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#e31e24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role Permission
                  </label>
                  <select
                    disabled={selectedUser.isProtected}
                    value={editForm.role}
                    onChange={(e) => {
                      const r = e.target.value;
                      let defaultKey = editForm.managerKey;
                      if (r === 'admin' || r === 'upload_view_all' || r === 'view_all') {
                        defaultKey = 'all';
                      }
                      setEditForm({
                        ...editForm,
                        role: r,
                        managerKey: defaultKey
                      });
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#e31e24] disabled:opacity-50"
                  >
                    <option value="manager">Senior Manager (Scoped to Pod)</option>
                    <option value="upload_view_all">Upload and View All Teams Data</option>
                    <option value="view_all">View All Teams Data (Read-Only)</option>
                    <option value="admin">Administrator / Leadership (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Recovery PIN
                  </label>
                  <input
                    type="text"
                    value={editForm.recoveryPin}
                    onChange={(e) => setEditForm({ ...editForm, recoveryPin: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#e31e24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supervisory Scope Assignment (Manager Pod)
                </label>
                <select
                  value={editForm.managerKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditForm({
                      ...editForm,
                      managerKey: val,
                      isPhysicalOnly: val === 'Amit Singal'
                    });
                  }}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#e31e24]"
                >
                  <option value="all">All Teams & Pods (Unrestricted Full Dataset)</option>
                  <option value="Niladri Bhadra">Niladri Bhadra Pod (30 RMs)</option>
                  <option value="Surajit Laha">Surajit Laha Pod (25 RMs)</option>
                  <option value="Arijit Nath">Arijit Nath Pod (23 RMs)</option>
                  <option value="Amit Singal">Amit Singal Pod (Physical Team Only • 6 RMs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Override Password (Optional — leave blank to keep unchanged)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder="Enter new password to override"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 pr-10 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!selectedUser.isProtected && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#e31e24]"
                  >
                    <option value="active">Active (Access Granted)</option>
                    <option value="suspended">Suspended (Access Denied)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md shadow-red-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Access Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawer('none')}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE-OVER MODAL: QUICK PASSWORD RESET
          ========================================================================= */}
      {activeDrawer === 'reset-password' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            
            <div className="text-center pb-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Developer Direct Password Override
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Set a new password for <strong className="text-slate-800 dark:text-white">{selectedUser.name}</strong> ({selectedUser.email}).
              </p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showQuickPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password"
                    value={quickPassword}
                    onChange={(e) => setQuickPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowQuickPassword(!showQuickPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showQuickPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawer('none')}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070a12] py-4 text-center text-xs text-slate-500 transition-colors mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Century Joy Sales & Revenue Hub • Developer Administration & Identity Governance</span>
          <span className="text-[11px] text-slate-400">Master Registry Protected</span>
        </div>
      </footer>

    </div>
  );
}
