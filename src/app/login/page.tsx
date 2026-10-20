'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePlatformStore } from '@/lib/store';
import {
  Lock,
  Mail,
  Key,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  const {
    signInWithEmail,
    setupPhoneRecaptcha,
    sendPhoneOtp,
    confirmPhoneOtp,
    error: authError,
    clearError,
  } = useAuth();

  const { switchRole } = usePlatformStore();

  // Authentication method: 'email' | 'phone'
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [otpSent, setOtpSent] = useState(false);

  // Status state
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [method]);

  useEffect(() => {
    if (errorParam === 'unauthorized_admin') {
      setLocalError('Access Denied: The requested area requires verified administrative privileges.');
    } else if (errorParam === 'session_expired') {
      setLocalError('Your session has expired. Please sign in again.');
    }
  }, [errorParam]);

  const displayError = localError || authError;

  // 1. Handle Email & Password Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    try {
      // Step A: Authenticate on the secure server endpoint to set HTTP-only JWT cookie
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLocalError(data.error || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      // Step B: Update client state
      switchRole(data.user.role);
      clearError();
      setLocalError(null);

      // Step C: Hard navigation guarantees cookie is sent and session is hydrated immediately
      const destination = redirectTarget || data.redirectUrl || '/explore';
      window.location.href = destination;
    } catch {
      setLocalError('Unable to connect to the authentication service. Please check your connection.');
      setIsLoading(false);
    }
  };

  // 2. Handle Indian Phone OTP Flow
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setLocalError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const verifier = setupPhoneRecaptcha('phone-recaptcha-container');
      if (!verifier) {
        setLocalError('Unable to initialize reCAPTCHA security verifier.');
        setIsLoading(false);
        return;
      }

      const confirmation = await sendPhoneOtp(cleanPhone, verifier);
      if (confirmation) {
        setConfirmationResult(confirmation);
        setOtpSent(true);
      } else {
        setLocalError('Failed to send OTP SMS. Please verify the mobile number.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Error sending OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (otpCode.length !== 6) {
      setLocalError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!confirmationResult) {
      setLocalError('Verification session expired. Please request a new OTP code.');
      return;
    }

    setIsLoading(true);
    try {
      const ok = await confirmPhoneOtp(confirmationResult, otpCode, 'Verified Member', 'customer');
      if (ok) {
        switchRole('customer');
        router.push(redirectTarget || '/explore');
        router.refresh();
      } else {
        setLocalError('Invalid or expired OTP code. Please try again.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Invisible reCAPTCHA container for phone auth */}
      <div id="phone-recaptcha-container" />

      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <Link href="/login" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pink-400 group-hover:scale-110 transition duration-300" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              AURA <span className="text-pink-400 font-light text-sm">INDIA</span>
            </span>
            <span className="block text-[10px] text-slate-400 tracking-wider -mt-1 uppercase">
              Adult Companionship
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-400 hidden sm:inline">Don&apos;t have an account?</span>
          <Link
            href="/register"
            className="text-xs font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-4 py-2 rounded-xl shadow-md shadow-pink-500/20 transition"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Login Card */}
      <main className="max-w-md w-full mx-auto my-6 glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>18+ Verified Indian Marketplace</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Sign In</h1>
          <p className="text-xs text-slate-400">
            Access your secure companion discovery and booking portal
          </p>
        </div>

        {/* Error Notification */}
        {displayError && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 text-xs text-rose-300 flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{displayError}</span>
          </div>
        )}

        {/* Authentication Mode Switcher */}
        <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setMethod('email')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition ${
              method === 'email'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Login</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod('phone')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition ${
              method === 'phone'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Mobile OTP</span>
          </button>
        </div>

        {/* METHOD 1: EMAIL & PASSWORD */}
        {method === 'email' && (
          <form onSubmit={handleEmailSignIn} className="space-y-4 text-xs">
            {/* Email Field */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-900/90 text-white rounded-xl pl-10 pr-4 py-2.5 border border-slate-700/80 focus:border-pink-500 focus:outline-none placeholder:text-slate-500 text-xs transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-pink-400 hover:text-pink-300 hover:underline transition"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/90 text-white rounded-xl pl-10 pr-10 py-2.5 border border-slate-700/80 focus:border-pink-500 focus:outline-none placeholder:text-slate-500 text-xs transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 text-pink-500 focus:ring-0 bg-slate-900 w-3.5 h-3.5"
                />
                <span>Remember me on this secure device</span>
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50 text-xs"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* METHOD 2: PHONE OTP */}
        {method === 'phone' && (
          <div className="space-y-4 text-xs">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Mobile Number (India +91)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-xs">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full bg-slate-900/90 text-white rounded-xl pl-12 pr-4 py-2.5 border border-slate-700/80 focus:border-pink-500 focus:outline-none placeholder:text-slate-500 font-mono text-xs"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    A secure 6-digit OTP code will be sent via SMS.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50 text-xs"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending OTP SMS...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-300 font-semibold">Enter 6-Digit OTP</label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-pink-400 hover:underline"
                    >
                      Change Number
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-900 text-white text-center tracking-widest text-lg font-mono rounded-xl py-2.5 border border-slate-700 focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50 text-xs"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Sign In</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Registration Redirection Callout */}
        <div className="pt-2 border-t border-slate-800 text-center text-xs text-slate-400 space-y-2">
          <p>
            New to Aura India?{' '}
            <Link href="/register" className="text-pink-400 font-semibold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </main>

      {/* Footer Legal & Safety Links */}
      <footer className="max-w-4xl w-full mx-auto py-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
          <Link href="/privacy" className="hover:text-pink-400 transition">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-pink-400 transition">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/safety" className="hover:text-pink-400 transition">
            Safety & Trust Code
          </Link>
          <span>•</span>
          <Link href="/security" className="hover:text-pink-400 transition">
            Security Overview
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-pink-400 transition">
            Contact & Support
          </Link>
        </div>
        <p className="text-[10px] text-slate-600">
          AURA INDIA • Strictly 18+ adult age verification and Indian legal compliance mandate.
        </p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading authentication...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}
