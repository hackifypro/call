'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePlatformStore } from '@/lib/store';
import {
  ShieldAlert,
  Lock,
  Mail,
  Key,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/admin/dashboard';

  const { switchRole } = usePlatformStore();

  // Pre-filled working default admin credentials for hassle-free login
  const [email, setEmail] = useState('admin@aura-india.com');
  const [password, setPassword] = useState('admin123');
  const [mfaCode, setMfaCode] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide administrative email and password.');
      setIsLoading(false);
      return;
    }

    try {
      // Call secure server auth endpoint to obtain HTTP-only JWT session cookie
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          rememberMe: false,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid administrative credentials.');
        setIsLoading(false);
        return;
      }

      // Check if administrative role
      const adminRoles = ['admin', 'super_admin', 'finance', 'moderator', 'support'];
      if (!adminRoles.includes(data.user?.role)) {
        setError('Forbidden: This portal is strictly restricted to authorized platform administrators.');
        setIsLoading(false);
        return;
      }

      switchRole(data.user.role);
      // Hard navigation to guarantee session cookie is passed and state rehydrates
      window.location.href = redirectTarget || '/admin/dashboard';
    } catch {
      setError('Communication with authentication server failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSelectRole = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setMfaCode('123456');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-purple-500/20">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Staff Security Gateway
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Administrative Access</h1>
          <p className="text-xs text-slate-400">
            Aura India Platform Management & Audit Console
          </p>
        </div>

        {/* 1-Click Role Quick Fill Tabs */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
            Click to auto-fill staff credentials:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSelectRole('admin@aura-india.com', 'admin123')}
              className={`p-2 rounded-xl text-center border text-[11px] font-semibold transition ${
                email === 'admin@aura-india.com'
                  ? 'bg-purple-600/30 border-purple-400 text-white'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleSelectRole('finance@aura-india.com', 'admin123')}
              className={`p-2 rounded-xl text-center border text-[11px] font-semibold transition ${
                email === 'finance@aura-india.com'
                  ? 'bg-purple-600/30 border-purple-400 text-white'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Finance Lead
            </button>
            <button
              type="button"
              onClick={() => handleSelectRole('moderator@aura-india.com', 'admin123')}
              className={`p-2 rounded-xl text-center border text-[11px] font-semibold transition ${
                email === 'moderator@aura-india.com'
                  ? 'bg-purple-600/30 border-purple-400 text-white'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Moderator
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 text-xs text-rose-300 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {/* Admin Email / ID */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Admin ID / Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aura-india.com or admin"
                className="w-full bg-slate-900 text-white rounded-xl pl-10 pr-4 py-2.5 border border-slate-700/80 focus:border-purple-500 focus:outline-none placeholder:text-slate-500 text-xs"
              />
            </div>
          </div>

          {/* Admin Password */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Passphrase
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123 or Admin@2026Secure"
                className="w-full bg-slate-900 text-white rounded-xl pl-10 pr-10 py-2.5 border border-slate-700/80 focus:border-purple-500 focus:outline-none placeholder:text-slate-500 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* MFA Authenticator Token */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              MFA Security Code <span className="text-slate-400 text-[10px] font-normal">(Default: 123456 or leave blank)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-900 text-white rounded-xl pl-10 pr-4 py-2.5 border border-slate-700/80 focus:border-purple-500 focus:outline-none placeholder:text-slate-500 text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50 text-xs mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Authenticate Staff Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-800">
          <Link href="/login" className="text-slate-400 hover:text-white transition">
            ← Return to Member Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading admin gateway...</span>
          </div>
        </div>
      }
    >
      <AdminLoginContent />
    </React.Suspense>
  );
}
