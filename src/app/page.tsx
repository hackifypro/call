'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRoleDefaultRedirect } from '@/lib/session';
import { Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function RootPage() {
  const router = useRouter();
  const { appUser, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!appUser) {
        router.replace('/login');
      } else {
        const target = getRoleDefaultRedirect(appUser.role);
        router.replace(target);
      }
    }
  }, [appUser, loading, router]);

  // Clean fallback authentication landing screen for logged-out visitors
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pink-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              AURA <span className="text-pink-400 font-light text-sm">INDIA</span>
            </span>
            <span className="block text-[10px] text-slate-400 tracking-wider -mt-1 uppercase">
              Private Adult Companionship
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-medium transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-md shadow-pink-500/20 hover:opacity-90 transition"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Main Clean Portal */}
      <main className="max-w-md w-full mx-auto my-auto glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-purple-500/30">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
            18+ Restricted Access Platform
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Aura India Member Portal
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Please sign in to access discovery, verified companion profiles, real-time messaging, and bookings.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/login"
            className="w-full flex items-center justify-center py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 hover:opacity-95 transition"
          >
            Sign In with Email or Phone
          </Link>

          <Link
            href="/register"
            className="w-full flex items-center justify-center py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium text-sm border border-slate-700 transition"
          >
            Register as Customer or Companion
          </Link>
        </div>

        <div className="pt-2 text-[11px] text-slate-400">
          <Link href="/forgot-password" className="hover:text-pink-400 transition">
            Forgot Password?
          </Link>
        </div>
      </main>

      {/* Footer Legal & Safety Links */}
      <footer className="max-w-4xl w-full mx-auto py-6 text-center text-xs text-slate-500 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
          <Link href="/cities" className="hover:text-pink-400 transition">
            Cities Directory
          </Link>
          <span>•</span>
          <Link href="/how-it-works" className="hover:text-pink-400 transition">
            How It Works
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-pink-400 transition">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-pink-400 transition">
            Terms & Conditions
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
          © {new Date().getFullYear()} AURA INDIA. Strictly 18+ adult age verification and Indian legal compliance mandate.
        </p>
      </footer>
    </div>
  );
}
