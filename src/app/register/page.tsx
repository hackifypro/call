'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  FileCheck,
  Calendar,
  DollarSign,
  Heart,
} from 'lucide-react';

export default function RegisterChoicePage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
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
          <span className="text-slate-400 hidden sm:inline">Already registered?</span>
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Selection Cards */}
      <main className="max-w-4xl w-full mx-auto my-8 space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>18+ Strict Adult Verification Mandate</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Join the Aura India Marketplace
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Choose your account type to proceed with registration. All members must be eligible adults.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Customer Registration */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col justify-between hover:border-pink-500/40 transition duration-300 relative group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                  <User className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Customer / Client
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">Customer Registration</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Discover verified companions, explore city directories, swipe profiles, and book secure companionship sessions.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Public display name & preferences</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Email or Indian mobile phone verification</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>18+ Adult age verification confirmation</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Privacy-preserving masked communications</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Terms and privacy consent</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/register/customer"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center space-x-2 transition text-xs"
              >
                <span>Register as Customer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Companion Registration */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl flex flex-col justify-between hover:border-purple-500/50 transition duration-300 relative group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-6 h-6 text-pink-300" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Professional Companion
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">Companion Registration</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  List your verified profile across major Indian metropolitan hubs, set your own rates, and receive booking requests.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2.5">
                  <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Private legal identity & adult verification</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Public display name, city, and biography</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Authorized profile photos & gallery</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Custom hourly, half-day, and full-day rates</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <FileCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Profiles remain pending until manual safety approval</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/register/companion"
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 transition text-xs"
              >
                <span>Register as Companion</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Safety & Ordinary Registration Notice */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">
            Strict Identity Privacy & Safety Assurance
          </p>
          <p className="text-[11px] text-slate-500">
            Government identity documents, legal names, and private contact information are strictly encrypted and never published publicly. Ordinary registration never grants administrative permissions.
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
          AURA INDIA • 100% ID-verified adults • India-wide Companion Marketplace
        </p>
      </footer>
    </div>
  );
}
