import React, { useState, useEffect } from 'react';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus, 
  adminResetUserPassword,
  SEED_USERS
} from '../utils/auth';
import { 
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
  Sliders, 
  ToggleLeft, 
  ToggleRight,
  ShieldAlert,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

export default function DeveloperUserModal({ isOpen, onClose, currentUser }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal Sub-Views: 'list' | 'create' | 'edit' | 'reset-password'
  const [view, setView] = useState('list');
  const [selectedUser, setSelectedUser] = useState(null);

  // Success & Error feedback
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Create User Form State
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

  // Edit User Form State
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

  // Admin Quick Password Reset State
  const [quickPassword, setQuickPassword] = useState('');
  const [showQuickPassword, setShowQuickPassword] = useState(false);

  // Load and refresh users list
  const loadUsers = () => {
    setUsers(getAllUsers());
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setView('list');
      setFeedback({ type: '', message: '' });
    }
  }, [isOpen]);

  // Listen to cross-component user updates
  useEffect(() => {
    const handleUpdate = () => loadUsers();
    window.addEventListener('century_users_updated', handleUpdate);
    return () => window.removeEventListener('century_users_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  // Security Check: Strictly restricted to Developer / Admin
  const isDeveloper = currentUser && (
    currentUser.role === 'admin' || 
    (currentUser.name && currentUser.name.toLowerCase().includes('kushal')) ||
    (currentUser.email && currentUser.email.toLowerCase().includes('kushal'))
  );

  if (!isDeveloper) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-[#0f172a] border border-red-800 rounded-2xl p-6 text-center text-white">
          <ShieldAlert className="w-12 h-12 text-[#e31e24] mx-auto mb-3" />
          <h3 className="text-lg font-black">Restricted Developer Console</h3>
          <p className="text-xs text-slate-400 mt-2">
            This module requires Master Developer privileges. Access is granted strictly to Kushal Kar.
          </p>
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.designation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.managerKey || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (roleFilter === 'all') return matchesSearch;
    if (roleFilter === 'manager') return matchesSearch && u.role === 'manager';
    if (roleFilter === 'admin') return matchesSearch && u.role === 'admin';
    return matchesSearch;
  });

  // Handle Create User
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    const result = createUser(createForm);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      loadUsers();
      setView('list');
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

  // Open Edit User View
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
    setView('edit');
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
      setView('list');
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
    setView('reset-password');
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
      setView('list');
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

  // Handle Delete User
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-[#0b1120] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Accent Gradient Line */}
        <div className="h-1.5 bg-gradient-to-r from-[#e31e24] via-red-600 to-amber-500 w-full shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between bg-[#0e1628]/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e31e24] text-white flex items-center justify-center font-black shadow-md shadow-red-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Developer User & Access Management Console
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                  Developer Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Create fresh user accounts, configure supervisory scopes, and govern executive credentials.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close Console"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert Banner */}
        {feedback.message && (
          <div className={`px-5 py-2.5 text-xs flex items-center justify-between border-b shrink-0 ${
            feedback.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300' 
              : 'bg-red-950/40 border-red-900/60 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#e31e24] shrink-0" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
            <button 
              onClick={() => setFeedback({ type: '', message: '' })}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body Container */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* =========================================================================
              VIEW 1: USERS DIRECTORY & ACCESS LIST
              ========================================================================= */}
          {view === 'list' && (
            <div className="space-y-4">
              
              {/* Controls Bar: Search, Filter, and "+ Create Fresh User" */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                
                {/* Search & Role Filter */}
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search name, email, or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e31e24]"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-300 focus:outline-none focus:border-[#e31e24]"
                  >
                    <option value="all">All Roles ({users.length})</option>
                    <option value="manager">Senior Managers</option>
                    <option value="admin">Admins & Developers</option>
                  </select>
                </div>

                {/* Create Fresh User CTA Button */}
                <button
                  onClick={() => {
                    setView('create');
                    setFeedback({ type: '', message: '' });
                  }}
                  className="px-3.5 py-1.5 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Create Fresh User</span>
                </button>

              </div>

              {/* Users Cards / Table */}
              <div className="space-y-2.5">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No users match your search criteria.</p>
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const initials = (u.name || 'U')
                      .split(' ')
                      .map(p => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    const isActive = u.status !== 'suspended';

                    return (
                      <div
                        key={u.email}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                          isActive 
                            ? 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800' 
                            : 'bg-red-950/10 border-red-900/40 opacity-75'
                        }`}
                      >
                        {/* User Identity & Scope */}
                        <div className="flex items-start sm:items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                            u.isProtected 
                              ? 'bg-red-600 text-white shadow-red-600/30' 
                              : 'bg-slate-800 text-slate-200 border border-slate-700'
                          }`}>
                            {initials}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-white">{u.name}</span>
                              
                              {/* Protected / Developer Badge */}
                              {u.isProtected && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/30">
                                  MASTER DEVELOPER
                                </span>
                              )}

                              {/* Status Badge */}
                              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                isActive 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {isActive ? '● Active' : '✕ Suspended'}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span>{u.email}</span>
                            </div>

                            <div className="flex items-center gap-2 pt-1 text-[10px]">
                              <span className="text-slate-300 font-semibold bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                                {u.designation || u.role}
                              </span>
                              <span className="text-slate-400">
                                Scope: <strong className="text-white">{u.managerKey === 'all' ? 'All Teams' : u.managerKey}</strong>
                                {u.isPhysicalOnly ? ' (Physical Only)' : ''}
                              </span>
                              <span className="text-slate-500 font-mono">
                                PIN: {u.recoveryPin || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          
                          {/* Edit Access Button */}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Edit User & Access"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                            <span className="hidden md:inline">Edit</span>
                          </button>

                          {/* Quick Password Reset Button */}
                          <button
                            onClick={() => handleOpenReset(u)}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                            <span className="hidden md:inline">Password</span>
                          </button>

                          {/* Suspend / Activate Toggle Button */}
                          {!u.isProtected && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isActive 
                                  ? 'bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border-slate-700' 
                                  : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border-emerald-800'
                              }`}
                              title={isActive ? 'Suspend User Access' : 'Reactivate User Access'}
                            >
                              {isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-red-400" />}
                            </button>
                          )}

                          {/* Delete User Button */}
                          {!u.isProtected && (
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-300 border border-slate-700 transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          )}

                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* =========================================================================
              VIEW 2: CREATE FRESH USER
              ========================================================================= */}
          {view === 'create' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#e31e24]" />
                    Create Fresh Corporate User & Grant Access
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Newly created users can immediately log in with their assigned corporate credentials.
                  </p>
                </div>
                <button
                  onClick={() => setView('list')}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
                >
                  Back to Directory
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 max-w-2xl">
                
                {/* Full Name & Corporate Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e31e24]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Corporate Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh.chandra@centuryply.com"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e31e24]"
                    />
                  </div>
                </div>

                {/* Initial Password & Recovery PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Initial Password * (min 6 chars)</label>
                    <div className="relative">
                      <input
                        type={showCreatePassword ? 'text' : 'password'}
                        required
                        placeholder="e.g. Century@2026"
                        value={createForm.initialPassword}
                        onChange={(e) => setCreateForm({ ...createForm, initialPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-9 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e31e24]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showCreatePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Recovery PIN (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. CP-2026 (Auto-generated if empty)"
                      value={createForm.recoveryPin}
                      onChange={(e) => setCreateForm({ ...createForm, recoveryPin: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e31e24] font-mono"
                    />
                  </div>
                </div>

                {/* Role & Designation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Role Permission *</label>
                    <select
                      value={createForm.role}
                      onChange={(e) => {
                        const r = e.target.value;
                        setCreateForm({
                          ...createForm,
                          role: r,
                          designation: r === 'admin' ? 'Executive Director' : 'Senior Manager',
                          managerKey: r === 'admin' ? 'all' : createForm.managerKey
                        });
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#e31e24]"
                    >
                      <option value="manager">Senior Manager (Scoped to RM Pods)</option>
                      <option value="admin">Administrator / Executive Leadership (Full Access)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Official Designation Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Manager or Executive Director"
                      value={createForm.designation}
                      onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e31e24]"
                    />
                  </div>
                </div>

                {/* Supervisory Scope Assignment */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
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
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#e31e24]"
                  >
                    <option value="all">All Teams & Pods (Unrestricted Full Dataset)</option>
                    <option value="Niladri Bhadra">Niladri Bhadra Pod (Digital & Physical • 30 RMs)</option>
                    <option value="Surajit Laha">Surajit Laha Pod (Digital & Physical • 25 RMs)</option>
                    <option value="Arijit Nath">Arijit Nath Pod (Digital & Physical • 23 RMs)</option>
                    <option value="Amit Singal">Amit Singal Pod (Physical Team Only • 6 RMs)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Defines which tickets and RM revenue streams this user is authorized to inspect.
                  </p>
                </div>

                {/* Physical Stream Only Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="create-phys-only"
                    checked={createForm.isPhysicalOnly}
                    onChange={(e) => setCreateForm({ ...createForm, isPhysicalOnly: e.target.checked })}
                    className="rounded border-slate-700 text-[#e31e24] focus:ring-red-500"
                  />
                  <label htmlFor="create-phys-only" className="text-xs text-slate-300 select-none">
                    Restrict exclusively to Physical Stream (No Digital Pods)
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md shadow-red-600/30 flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create User & Grant Access</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: EDIT USER & ACCESS
              ========================================================================= */}
          {view === 'edit' && selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    Edit User & Supervisory Scope: {selectedUser.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    {selectedUser.email}
                  </p>
                </div>
                <button
                  onClick={() => setView('list')}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
                >
                  Back to Directory
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 max-w-2xl">
                
                {/* Name & Designation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#e31e24]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Official Designation</label>
                    <input
                      type="text"
                      value={editForm.designation}
                      onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#e31e24]"
                    />
                  </div>
                </div>

                {/* Role & Scope */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Role Permission</label>
                    <select
                      disabled={selectedUser.isProtected}
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#e31e24] disabled:opacity-50"
                    >
                      <option value="manager">Senior Manager</option>
                      <option value="admin">Administrator / Leadership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Recovery PIN</label>
                    <input
                      type="text"
                      value={editForm.recoveryPin}
                      onChange={(e) => setEditForm({ ...editForm, recoveryPin: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-[#e31e24]"
                    />
                  </div>
                </div>

                {/* Manager Pod Scope */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Supervisory Scope (Manager Pod)</label>
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
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#e31e24]"
                  >
                    <option value="all">All Teams & Pods (Unrestricted Full Dataset)</option>
                    <option value="Niladri Bhadra">Niladri Bhadra Pod (30 RMs)</option>
                    <option value="Surajit Laha">Surajit Laha Pod (25 RMs)</option>
                    <option value="Arijit Nath">Arijit Nath Pod (23 RMs)</option>
                    <option value="Amit Singal">Amit Singal Pod (Physical Team Only • 6 RMs)</option>
                  </select>
                </div>

                {/* Password Override (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Override Password (Optional — leave blank to keep unchanged)
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      placeholder="Enter new password to override"
                      value={editForm.newPassword}
                      onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-9 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e31e24]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Status Toggle */}
                {!selectedUser.isProtected && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Account Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#e31e24]"
                    >
                      <option value="active">Active (Full Access Allowed)</option>
                      <option value="suspended">Suspended (Access Restricted)</option>
                    </select>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md shadow-red-600/30 flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Access Changes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* =========================================================================
              VIEW 4: QUICK RESET PASSWORD
              ========================================================================= */}
          {view === 'reset-password' && selectedUser && (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-white">Direct Developer Password Reset</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Set a new corporate password for <strong className="text-white">{selectedUser.name}</strong> ({selectedUser.email}).
                </p>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    New Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showQuickPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter new password"
                      value={quickPassword}
                      onChange={(e) => setQuickPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-9 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e31e24]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowQuickPassword(!showQuickPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showQuickPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Reset Password</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#0e1628]/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Master Dynamic Registry: <strong className="text-white">{users.length} Users Active</strong></span>
          </div>
          <span className="font-mono text-slate-500">CenturyPly Enterprise Access Protocol</span>
        </div>

      </div>
    </div>
  );
}
