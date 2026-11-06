import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { 
  AUTHORIZED_USERS, 
  findUserByEmail, 
  verifyUserPassword, 
  recoverUserPassword 
} from '../utils/auth';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  User,
  RotateCcw
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useData();
  const [mode, setMode] = useState('login'); // 'login' | 'recover'
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Recovery State
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoveryPin, setRecoveryPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recoverError, setRecoverError] = useState('');
  const [recoverSuccess, setRecoverSuccess] = useState('');

  const passwordInputRef = useRef(null);

  // Quick 1-click select manager profile
  const handleQuickSelect = (u) => {
    setEmail(u.email);
    setLoginError('');
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  };

  // Handle Standard Login
  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    if (!email || !email.trim()) {
      setLoginError('Please enter your corporate email address.');
      return;
    }

    if (!password) {
      setLoginError('Please enter your password.');
      return;
    }

    const verification = verifyUserPassword(email, password);
    if (verification.success) {
      login(verification.user);
    } else {
      setLoginError(verification.error);
    }
  };

  // Handle Password Recovery (Option 1: Self-Service with Recovery PIN)
  const handleRecover = (e) => {
    if (e) e.preventDefault();
    setRecoverError('');
    setRecoverSuccess('');

    if (!recoverEmail || !recoverEmail.trim()) {
      setRecoverError('Please enter your corporate email address.');
      return;
    }

    if (!recoveryPin || !recoveryPin.trim()) {
      setRecoverError('Please enter your assigned recovery PIN (e.g. CP-1001).');
      return;
    }

    if (!newPassword || newPassword.trim().length < 6) {
      setRecoverError('New password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoverError('New password and confirm password do not match.');
      return;
    }

    const result = recoverUserPassword(recoverEmail, recoveryPin, newPassword);
    if (result.success) {
      setRecoverSuccess(result.message);
      setTimeout(() => {
        login(result.user);
      }, 1500);
    } else {
      setRecoverError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-[#070b14] flex flex-col justify-center items-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-[#e31e24] text-white flex items-center justify-center font-black text-xl tracking-wider shadow-lg shadow-red-600/30">
          CJ
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Century Joy Sales & Revenue Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Executive Performance & Revenue Governance
          </p>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden relative">
        <div className="h-1.5 bg-gradient-to-r from-[#e31e24] via-red-600 to-amber-500 w-full" />

        <div className="p-6 sm:p-8">
          
          {/* Card Title */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {mode === 'login' ? 'Senior Management Login' : 'Password Recovery'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {mode === 'login'
                ? 'Enter your corporate credentials to access the executive portal.'
                : 'Enter your corporate email and recovery PIN to reset your password.'}
            </p>
          </div>

          {/* ================= MODE 1: LOGIN ================= */}
          {mode === 'login' && (
            <div className="space-y-4">
              
              {/* Error Notice */}
              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#e31e24]" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Corporate Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. niladri.bhadra@centuryply.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24] focus:ring-2 focus:ring-red-500/20 font-medium"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoverEmail(email);
                        setMode('recover');
                        setLoginError('');
                      }}
                      className="text-[11px] font-bold text-[#e31e24] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24] focus:ring-2 focus:ring-red-500/20 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In & Access Portal</span>
                </button>

              </form>

              {/* Quick Select for Authorized Personnel */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider text-center">
                  Quick Access Profiles:
                </div>
                <div className="space-y-1.5">
                  {AUTHORIZED_USERS.map((u) => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => handleQuickSelect(u)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs group-hover:bg-[#e31e24] transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-[#e31e24] transition-colors">
                            {u.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {u.designation}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#e31e24] flex items-center gap-1">
                        Select <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= MODE 2: RECOVER PASSWORD (OPTION 1) ================= */}
          {mode === 'recover' && (
            <div className="space-y-4">
              
              {/* Error Notice */}
              {recoverError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#e31e24]" />
                  <span>{recoverError}</span>
                </div>
              )}

              {/* Success Notice */}
              {recoverSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold">{recoverSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRecover} className="space-y-3.5">
                
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Corporate Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={recoverEmail}
                      onChange={(e) => setRecoverEmail(e.target.value)}
                      placeholder="e.g. niladri.bhadra@centuryply.com"
                      className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24] focus:ring-2 focus:ring-red-500/20 font-medium"
                    />
                  </div>
                </div>

                {/* Recovery PIN */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Recovery PIN
                    </label>
                    <span className="text-[10px] text-slate-400">
                      e.g. CP-1001 (Assigned by Admin)
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={recoveryPin}
                      onChange={(e) => setRecoveryPin(e.target.value)}
                      placeholder="Enter assigned recovery PIN"
                      className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24] focus:ring-2 focus:ring-red-500/20 font-mono font-bold tracking-wider"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    New Password <span className="text-slate-400 text-[10px] lowercase">(min 6 chars)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-10 py-2 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24] focus:ring-2 focus:ring-red-500/20 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-10 py-2 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24] focus:ring-2 focus:ring-red-500/20 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Reset Password & Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setRecoverError('');
                      setRecoverSuccess('');
                    }}
                    className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>

              </form>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800 p-3 text-center text-[11px] text-slate-500 font-medium">
          Authorized Senior Management & Executive Personnel Only
        </div>
      </div>

    </div>
  );
}
