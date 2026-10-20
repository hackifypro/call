'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';
import {
  X,
  Mail,
  Lock,
  Phone,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  defaultRole?: UserRole;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signin',
  defaultRole = 'customer',
}: AuthModalProps) {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    setupPhoneRecaptcha,
    sendPhoneOtp,
    confirmPhoneOtp,
    quickLoginAs,
    error,
    clearError,
  } = useAuth();

  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [role, setRole] = useState<UserRole>(defaultRole);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsSignUp(initialMode === 'signup');
    setRole(defaultRole);
    clearError();
    setSuccessMessage(null);
  }, [isOpen, initialMode, defaultRole]);

  if (!isOpen) return null;

  // Handle Email Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    let ok = false;
    if (isSignUp) {
      if (!fullName) {
        setIsSubmitting(false);
        return;
      }
      ok = await signUpWithEmail(email, password, fullName, role);
    } else {
      ok = await signInWithEmail(email, password);
    }

    setIsSubmitting(false);
    if (ok) {
      setSuccessMessage(isSignUp ? 'Account created successfully!' : 'Signed in successfully!');
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1000);
    }
  };

  // Handle Google Submit
  const handleGoogleSubmit = async () => {
    setIsSubmitting(true);
    clearError();
    const ok = await signInWithGoogle(role);
    setIsSubmitting(false);
    if (ok) {
      setSuccessMessage('Signed in with Google!');
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1000);
    }
  };

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setIsSubmitting(true);
    clearError();

    const verifier = setupPhoneRecaptcha('recaptcha-container');
    if (!verifier) {
      setIsSubmitting(false);
      return;
    }

    const result = await sendPhoneOtp(phone, verifier);
    setIsSubmitting(false);
    if (result) {
      setConfirmationResult(result);
      setOtpSent(true);
      setSuccessMessage('OTP sent successfully to your phone!');
    }
  };

  // Handle Confirm OTP
  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !confirmationResult) return;
    setIsSubmitting(true);
    clearError();

    const ok = await confirmPhoneOtp(confirmationResult, otpCode, fullName || 'Phone User', role);
    setIsSubmitting(false);
    if (ok) {
      setSuccessMessage('Phone verified and logged in successfully!');
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>

      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header decoration */}
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isSignUp ? 'Create Marketplace Account' : 'Welcome to Companion Marketplace'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verified 18+ adult network • 10% transparent platform fee
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Role selection if signing up */}
          {isSignUp && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Join As:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition flex items-center justify-center space-x-1.5 ${
                    role === 'customer'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                      : 'bg-slate-800/60 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Customer (Client)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('companion')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition flex items-center justify-center space-x-1.5 ${
                    role === 'companion'
                      ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                      : 'bg-slate-800/60 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Companion (Partner)</span>
                </button>
              </div>
            </div>
          )}

          {/* Method tabs: Email vs Phone */}
          <div className="flex border-b border-white/10 mb-4 text-xs font-medium">
            <button
              onClick={() => {
                setAuthMethod('email');
                setOtpSent(false);
              }}
              className={`flex-1 py-2 text-center border-b-2 transition ${
                authMethod === 'email'
                  ? 'border-purple-500 text-purple-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => {
                setAuthMethod('phone');
                setOtpSent(false);
              }}
              className={`flex-1 py-2 text-center border-b-2 transition ${
                authMethod === 'phone'
                  ? 'border-purple-500 text-purple-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Phone (India +91 OTP)
            </button>
          </div>

          {/* EMAIL / PASSWORD FORM */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {isSignUp && (
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aryan Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-800/80 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* PHONE OTP FORM */}
          {authMethod === 'phone' && (
            <div className="space-y-3">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  {isSignUp && (
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Aryan Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Indian Mobile Number</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center space-x-1 text-slate-400 text-xs">
                        <Phone className="w-3.5 h-3.5" />
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-800/80 border border-white/10 rounded-lg pl-16 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">We will send a 6-digit SMS verification code</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || phone.length < 10}
                    className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Sending OTP...' : 'Send SMS OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmOtp} className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-slate-300">Enter 6-Digit OTP</label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] text-purple-400 hover:underline"
                      >
                        Change Number (+91 {phone})
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-800/80 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white tracking-widest placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length < 6}
                    className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Verifying...' : 'Verify OTP & Continue'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* GOOGLE SIGN IN DIVIDER */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSubmit}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-white/10 text-white font-medium text-sm transition flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Google Account</span>
          </button>

          {/* DEMO / QUICK ROLE SWITCHER FOR EVALUATION */}
          <div className="mt-5 pt-3 border-t border-white/5">
            <div className="text-[11px] text-slate-400 text-center mb-2 font-medium">
              ⚡ Instant Demo Profiles (One-Click Sign In):
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  quickLoginAs('customer');
                  onClose();
                }}
                className="py-1.5 px-2 rounded bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-[11px] text-purple-200 transition"
              >
                Client Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  quickLoginAs('companion');
                  onClose();
                }}
                className="py-1.5 px-2 rounded bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-[11px] text-amber-200 transition"
              >
                Companion Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  quickLoginAs('admin');
                  onClose();
                }}
                className="py-1.5 px-2 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-[11px] text-rose-200 transition"
              >
                Admin Demo
              </button>
            </div>
          </div>

          {/* Toggle between Sign In and Sign Up */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                clearError();
              }}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              {isSignUp ? (
                <>
                  Already registered? <span className="text-purple-400 font-semibold underline">Sign In</span>
                </>
              ) : (
                <>
                  New here? <span className="text-purple-400 font-semibold underline">Create an Account</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
