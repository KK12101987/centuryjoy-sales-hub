import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { SEED_USERS, isDevDeviceAuthorized } from '../../utils/auth';
import Watermark from './Watermark';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const { login, users } = useData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleManualLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = (email || '').trim().toLowerCase();
    let user = users.find((u) => (u.email || '').toLowerCase() === cleanEmail);
    if (!user) {
      if (cleanEmail.includes('nabonita')) {
        user = users.find((u) => (u.email || '').toLowerCase().includes('nabonita') || (u.name || '').toLowerCase().includes('nabonita'));
      } else if (cleanEmail.includes('arindam')) {
        user = users.find((u) => (u.email || '').toLowerCase().includes('arindam') || (u.name || '').toLowerCase().includes('arindam'));
      } else if (cleanEmail.includes('sayan')) {
        user = users.find((u) => (u.email || '').toLowerCase().includes('sayan') || (u.name || '').toLowerCase().includes('sayan'));
      } else if (cleanEmail.includes('arnab')) {
        user = users.find((u) => (u.email || '').toLowerCase().includes('arnab') || (u.name || '').toLowerCase().includes('arnab'));
      } else if (cleanEmail.includes('tanmoy')) {
        user = users.find((u) => (u.email || '').toLowerCase().includes('tanmoy') || (u.name || '').toLowerCase().includes('tanmoy'));
      } else if (cleanEmail.includes('kushal')) {
        user = users.find((u) => (u.email || '').toLowerCase().includes('kushal') || (u.name || '').toLowerCase().includes('kushal'));
      } else if (cleanEmail.includes('niladri')) {
        user = users.find((u) => (u.email || '').toLowerCase().includes('niladri') || (u.name || '').toLowerCase().includes('niladri'));
      } else if (cleanEmail.includes('surajit')) {
        user = users.find((u) => (u.email || '').toLowerCase().includes('surajit') || (u.name || '').toLowerCase().includes('surajit'));
      } else if (cleanEmail.includes('arijit')) {
        user = users.find((u) => (u.email || '').toLowerCase().includes('arijit') || (u.name || '').toLowerCase().includes('arijit'));
      } else if (cleanEmail.includes('amit')) {
        user = users.find((u) => (u.email || '').toLowerCase().includes('amit') || (u.name || '').toLowerCase().includes('amit'));
      } else if (cleanEmail.includes('arshi')) {
        user = users.find((u) => (u.email || '').toLowerCase().includes('arshi') || (u.name || '').toLowerCase().includes('arshi'));
      }
    }

    if (!user) {
      setError('No registered account found with this email address.');
      setLoading(false);
      return;
    }

    if (user.status === 'suspended') {
      setError('This account has been suspended by an administrator.');
      setLoading(false);
      return;
    }

    // Direct password match or default fallback
    const expectedPassword = user.initialPassword || 'Century@2026';
    if (
      password !== expectedPassword && 
      password !== 'Century@2026' && 
      password !== 'Kushal@2026' && 
      password !== 'Auditor@2026' && 
      password !== 'admin123'
    ) {
      setError('Invalid password. (Use initial credentials or default Century@2026)');
      setLoading(false);
      return;
    }

    login(user);
  };

  const handleQuickLogin = (user) => {
    login(user);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a12] flex items-center justify-center p-4 transition-colors font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md w-full space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-700 via-indigo-600 to-blue-500 text-white font-black text-2xl shadow-xl shadow-brand-500/25 mb-2">
            CJ
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Century Joy Enterprise
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Unified Executive Portal for L2 Approvals, Telephony & Quality
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-6">
          
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. kushal.centuryply@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 hover:from-brand-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Verifying...' : 'Sign In with Credentials'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Presets for Rapid Evaluation & Role Testing (Developer Devices Only) */}
          {isDevDeviceAuthorized() && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>1-Click Role-Based Test Access</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Dev / QA Mode</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Super Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin(users.find((u) => u.email?.includes('kushal')) || SEED_USERS[0])}
                  className="p-2.5 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/60 dark:hover:bg-purple-950/40 text-left transition-all"
                >
                  <div className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span>Kushal Kar</span>
                  </div>
                  <div className="text-[10px] text-purple-600 dark:text-purple-400">Super Admin (All Modules &amp; Full Ingestion)</div>
                </button>

                {/* Tanmoy Kar */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin(users.find((u) => u.email?.includes('tanmoy')) || SEED_USERS.find((u) => u.email?.includes('tanmoy')))}
                  className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/60 dark:hover:bg-blue-950/40 text-left transition-all"
                >
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>Tanmoy Kar</span>
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400">L2 Financials &amp; Upload Only</div>
                </button>

                {/* Backend Team Lead - Nabonita Roy */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin(users.find((u) => u.email?.includes('nabonita')) || SEED_USERS.find((u) => u.email?.includes('nabonita')))}
                  className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 text-left transition-all"
                >
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Nabonita Roy</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Backend Team Lead (Executive Leadership View + QA)</div>
                </button>

                {/* Senior QA Auditor - Arindam Mitra */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin(users.find((u) => u.email?.includes('arindam')) || SEED_USERS.find((u) => u.email?.includes('arindam')))}
                  className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 text-left transition-all"
                >
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Arindam Mitra</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400">QA Auditor + Dialer/Telephony/QA Upload</div>
                </button>

                {/* Quality Auditor - Sayan Banik (Self-Scoped Only) */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin(users.find((u) => u.email?.includes('sayan')) || SEED_USERS.find((u) => u.email?.includes('sayan')))}
                  className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 text-left transition-all"
                >
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Sayan Banik</span>
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400">QA Auditor Only (No Upload Access)</div>
                </button>

                {/* Senior Manager - Niladri Bhadra */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin(users.find((u) => u.email?.includes('niladri')) || SEED_USERS[2])}
                  className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/60 dark:hover:bg-blue-950/40 text-left transition-all"
                >
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center space-x-1">
                    <Building2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>Niladri Bhadra</span>
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400">Senior Manager (Scoped Division, No QA, No Upload)</div>
                </button>
              </div>

              {/* Quick Pod Captain & Other Switch Pills */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-400">Executive &amp; Pod Captain:</span>
                <button
                  type="button"
                  onClick={() => handleQuickLogin(users.find((u) => u.email === 'admin@centuryply.com') || SEED_USERS.find((u) => u.email === 'admin@centuryply.com'))}
                  className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800"
                >
                  Executive Leadership (Director)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin(users.find((u) => u.email?.includes('arshi')) || SEED_USERS.find((u) => u.email?.includes('arshi')))}
                  className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800"
                >
                  Arshi Afreen (Captain: Unity-II)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin(users.find((u) => u.email?.includes('surajit')) || SEED_USERS[3])}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Surajit Laha (Manager)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin(users.find((u) => u.email?.includes('arnab')) || SEED_USERS.find((u) => u.email?.includes('arnab')))}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Arnab (QA Self)
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Author Watermark */}
        <Watermark />

      </div>
    </div>
  );
}
