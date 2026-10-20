import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, AlertTriangle, PhoneCall, CheckCircle2 } from 'lucide-react';

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Trust & Safety Mandate
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          100% ID-Verified & Safe Environment
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          We operate a zero-tolerance marketplace upholding strict Indian legal compliance, adult age verification, and personal safety.
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/5 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>1. Mandatory Adult Government ID Verification</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every companion must submit verified government-issued identification (Aadhaar, Passport, Voter ID, or Driving License) confirming legal adulthood (18+). No unverified profiles are ever published on the platform.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-white/5 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Lock className="w-5 h-5 text-purple-400" />
            <span>2. Strict Public Venue Mandate</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All initial meetups must occur at commercial, well-lit, public venues such as fine dining restaurants, hotel lounges, corporate galas, or public art exhibitions. Private residential bookings without verified consent are strictly prohibited.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-white/5 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>3. Instant Report & Moderator Intervention</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Both companions and clients have access to 1-click report and block tools. Reports are prioritized by human safety moderators and investigated within 2 hours.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-white/5 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <PhoneCall className="w-5 h-5 text-rose-400" />
            <span>4. Emergency Helpline & Assistance</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            In case of any safety concern during an accompaniment booking, our dedicated 24/7 safety response desk is available. For emergencies in India, dial local emergency services (112) immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
