import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { AUTHORIZED_USERS, findUserByEmail, generateOTP } from '../utils/auth';
import { 
  KeyRound, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Lock,
  User,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useData();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState('');
  const [targetUser, setTargetUser] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [showToast, setShowToast] = useState(false);

  const digitRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Resend OTP countdown
  useEffect(() => {
    let interval = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  // Handle Email Submission
  const handleRequestOTP = (selectedEmail) => {
    const emailToUse = (typeof selectedEmail === 'string' && selectedEmail.trim()) ? selectedEmail : email;
    setErrorMsg('');
    const user = findUserByEmail(emailToUse);
    if (!user) {
      setErrorMsg('Email not recognized. Please use an authorized email or select a profile below.');
      return;
    }

    const newOtp = generateOTP();
    setTargetUser(user);
    setGeneratedOtp(newOtp);
    setOtpDigits(['', '', '', '', '', '']);
    setStep(2);
    setResendTimer(60);
    setShowToast(true);

    // Auto focus first OTP input
    setTimeout(() => {
      if (digitRefs[0].current) {
        digitRefs[0].current.focus();
      }
    }, 150);
  };

  // Quick 1-click select manager
  const handleQuickSelect = (mgr) => {
    setEmail(mgr.email);
    handleRequestOTP(mgr.email);
  };

  // Handle OTP digit changes
  const handleDigitChange = (index, val) => {
    setErrorMsg('');
    const char = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto advance
    if (char && index < 5 && digitRefs[index + 1].current) {
      digitRefs[index + 1].current.focus();
    }

    // Auto submit if all 6 filled
    if (char && index === 5 && newDigits.every(d => d !== '')) {
      const code = newDigits.join('');
      verifyCode(code);
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs[index - 1].current.focus();
    }
  };

  // Handle Paste
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < paste.length; i++) {
        newDigits[i] = paste[i];
      }
      setOtpDigits(newDigits);
      if (paste.length === 6) {
        verifyCode(paste);
      } else if (digitRefs[paste.length]) {
        digitRefs[paste.length].current.focus();
      }
    }
  };

  // Verify OTP
  const verifyCode = (code = otpDigits.join('')) => {
    setErrorMsg('');
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }

    if (code === generatedOtp) {
      login(targetUser);
    } else {
      setErrorMsg('Invalid verification code. Please check the OTP displayed above and try again.');
    }
  };

  // Auto-fill OTP shortcut for rapid testing
  const handleAutoFill = () => {
    const chars = generatedOtp.split('');
    setOtpDigits(chars);
    verifyCode(generatedOtp);
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
        <div className="h-1.5 bg-gradient-to-r from-[#e31e24] via-red-600 to-amber-500 w-full"></div>

        <div className="p-6 sm:p-8">
          
          {/* Card Title */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {step === 1 ? 'Senior Management Login' : 'Verify One-Time Password'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {step === 1 
                ? 'Enter your corporate email to receive a secure access code.' 
                : `Verification code sent to ${targetUser?.email}`}
            </p>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#e31e24]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: EMAIL ENTRY */}
          {step === 1 && (
            <div className="space-y-4">
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
                    onKeyDown={(e) => e.key === 'Enter' && handleRequestOTP()}
                    placeholder="e.g. kushal.centuryply@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e31e24] focus:ring-2 focus:ring-red-500/20 font-medium"
                  />
                </div>
              </div>

              <button
                onClick={() => handleRequestOTP()}
                className="w-full py-2.5 px-4 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>Request Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* 1-Click Quick Select for Authorized Personnel */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider text-center">
                  Quick Access Profiles:
                </div>
                <div className="space-y-1.5">
                  {AUTHORIZED_USERS.map((u) => (
                    <button
                      key={u.email}
                      onClick={() => handleQuickSelect(u)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-left transition-all flex items-center justify-between group"
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

          {/* STEP 2: 6-DIGIT OTP ENTRY */}
          {step === 2 && (
            <div className="space-y-5">
              
              {/* Simulated Secure OTP Dispatch Alert */}
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs">
                <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    One-Time Password Generated
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 font-mono">
                    Valid for 5 mins
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Your Security Code:</span>
                    <span className="text-base font-black tracking-widest text-emerald-900 dark:text-emerald-100 font-mono">
                      {generatedOtp}
                    </span>
                  </div>
                  <button
                    onClick={handleAutoFill}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors shadow-xs"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              </div>

              {/* 6 Digit Input Boxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex justify-between gap-2 max-w-xs mx-auto" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={digitRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-lg font-black bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#e31e24] focus:ring-2 focus:ring-red-500/20 font-mono shadow-inner"
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => verifyCode()}
                  className="w-full py-2.5 px-4 bg-[#e31e24] hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Verify & Access Portal</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => {
                      setStep(1);
                      setErrorMsg('');
                    }}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold text-[11px]"
                  >
                    Change Email
                  </button>

                  <button
                    disabled={resendTimer > 0}
                    onClick={() => handleRequestOTP(targetUser.email)}
                    className={`font-bold text-[11px] ${
                      resendTimer > 0 
                        ? 'text-slate-400 cursor-not-allowed' 
                        : 'text-[#e31e24] hover:underline'
                    }`}
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </div>

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
