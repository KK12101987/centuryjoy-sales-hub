import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { 
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
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useData();
  const [mode, setMode] = useState('login'); // 'login' | 'recover'
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    const verification = verifyUserPassword(email, password);
    
    if (verification.success) {
      login(verification.user);
    } else {
      setLoginError(verification.error);
      setIsSubmitting(false);
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
      setRecoverError('Please enter your assigned recovery PIN (e.g. CP-1001 or CP-7777).');
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
      }, 1400);
    } else {
      setRecoverError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center p-4 sm:p-6 md:p-10 font-['Plus_Jakarta_Sans',sans-serif] text-slate-100 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* Main Concept 1 Split-Screen Flagship Container */}
      <div className="w-full max-w-5xl bg-[#0d1322] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px] relative z-10">
        
        {/* =========================================================================
            LEFT COLUMN: Enterprise Authority, Live Certification & Revenue Scale
            ========================================================================= */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#12192c] via-[#0d1322] to-[#18080a] p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
          
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* CJ Executive Brand Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#e31e24] text-white flex items-center justify-center font-black text-2xl tracking-wider shadow-lg shadow-red-600/30">
                CJ
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Century Joy</h2>
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                  Sales & Revenue Hub
                </p>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="space-y-4 my-8">
              <h3 className="text-xl lg:text-2xl font-black text-white leading-tight">
                Executive Governance & Revenue Sign-Off Portal
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Authorized management terminal for L2 approval tracking, auditor performance, turnaround SLA compliance, and multi-stream revenue governance.
              </p>
            </div>

            {/* Live Operational Metrics Showcase */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 shadow-inner">
                <div className="text-[10px] uppercase font-bold text-slate-400">Operating Months</div>
                <div className="text-sm font-extrabold text-white mt-0.5">Oct & Nov 2026</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Certified
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 shadow-inner">
                <div className="text-[10px] uppercase font-bold text-slate-400">Ingested Revenue</div>
                <div className="text-sm font-extrabold text-white mt-0.5">₹45.64 Cr</div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1">3,014 Total Tickets</div>
              </div>
            </div>
          </div>

          {/* Left Footer Badges */}
          <div className="pt-6 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              CenturyPly Enterprise Security
            </span>
            <span className="font-mono text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
              RBAC Enabled
            </span>
          </div>

        </div>

        {/* =========================================================================
            RIGHT COLUMN: Clean Credential Sign-In (Zero Quick-Access Profiles)
            ========================================================================= */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-[#0a0f1d]/80">
          <div className="max-w-md mx-auto w-full space-y-6">
            
            {/* Header / Mode Indicator */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white">
                  {mode === 'login' ? 'Senior Management Sign-In' : 'Password Recovery'}
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700">
                  {mode === 'login' ? 'Password Login' : 'Option 1 PIN'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {mode === 'login'
                  ? 'Enter your corporate credentials to access the executive portal.'
                  : 'Enter your corporate email and recovery PIN to set a new password.'}
              </p>
            </div>

            {/* ================= MODE 1: LOGIN ================= */}
            {mode === 'login' && (
              <div className="space-y-4">
                
                {/* Error Banner */}
                {loginError && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-300 flex items-center gap-2.5 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#e31e24]" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  
                  {/* Corporate Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Corporate Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. niladri.bhadra@centuryply.com"
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e31e24] focus:ring-2 focus:ring-red-500/20 font-medium transition-all"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setRecoverEmail(email);
                          setMode('recover');
                          setLoginError('');
                        }}
                        className="text-[11px] font-bold text-red-400 hover:text-red-300 hover:underline cursor-pointer transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        ref={passwordInputRef}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e31e24] focus:ring-2 focus:ring-red-500/20 font-medium transition-all"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit CTA Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-[#e31e24] hover:bg-red-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In & Access Portal'}</span>
                  </button>

                </form>

                {/* Secure Sign-in Assurance Notice */}
                <div className="pt-6 border-t border-slate-800/80 text-center">
                  <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Protected by CenturyPly Corporate Single Sign-On</span>
                  </div>
                </div>

              </div>
            )}

            {/* ================= MODE 2: RECOVER PASSWORD (OPTION 1 PIN) ================= */}
            {mode === 'recover' && (
              <div className="space-y-4">
                
                {/* Notices */}
                {recoverError && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-300 flex items-center gap-2.5 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#e31e24]" />
                    <span>{recoverError}</span>
                  </div>
                )}

                {recoverSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-300 flex items-center gap-2.5 animate-in fade-in duration-150">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{recoverSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleRecover} className="space-y-3.5">
                  
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                      Corporate Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={recoverEmail}
                        onChange={(e) => setRecoverEmail(e.target.value)}
                        placeholder="e.g. niladri.bhadra@centuryply.com"
                        className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e31e24] focus:ring-2 focus:ring-red-500/20 font-medium"
                      />
                    </div>
                  </div>

                  {/* Recovery PIN */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Recovery PIN
                      </label>
                      <span className="text-[10px] text-slate-500">Format: CP-XXXX</span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={recoveryPin}
                        onChange={(e) => setRecoveryPin(e.target.value.toUpperCase())}
                        placeholder="e.g. CP-1001 or CP-7777"
                        className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e31e24] focus:ring-2 focus:ring-red-500/20 font-mono font-bold tracking-wider"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-10 py-2 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e31e24] focus:ring-2 focus:ring-red-500/20 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full pl-10 pr-10 py-2 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e31e24] focus:ring-2 focus:ring-red-500/20 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
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
                      className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Back to Login
                    </button>
                  </div>

                </form>

              </div>
            )}

          </div>
        </div>

      </div>

      {/* Authorized Personnel Notice */}
      <div className="mt-4 text-center text-xs text-slate-500 font-medium">
        Authorized CenturyPly Management & Executive Personnel Only
      </div>

    </div>
  );
}
