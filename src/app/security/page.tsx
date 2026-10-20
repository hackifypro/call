'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Key,
  Server,
  FileCheck,
  AlertTriangle,
  EyeOff,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Information Security & Cryptographic Integrity</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Security & Data Architecture
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          How Aura India safeguards your identity, prevents data leakage, and enforces strict adult compliance under Indian privacy legislation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Zero Public Exposure of Identity</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Legal names, government identity documents (Aadhaar, Passport, Voter ID), private residential locations, and phone numbers are isolated from public profile endpoints. Public profiles only render sovereign display names and curated photography.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Bcrypt Hashing & Edge JWT</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All user credentials are cryptographically hashed using standard Bcrypt with 10 salt rounds. Authentication sessions use tamper-proof HMAC-SHA256 JWT tokens transmitted over HTTP-Only, Secure, SameSite cookies with strict Edge verification.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Login-First Access Enforcement</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Discovery catalogs, bookings, messages, and admin portals are guarded server-side by Next.js Edge Middleware. Unauthenticated callers attempting to reach private URLs or internal APIs receive automated 401/403 denials and immediate redirection to login.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">DPDP Act (India) Compliance</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            In compliance with the Digital Personal Data Protection Act, 2023, data principals retain full rights of erasure, rectification, and withdrawal of consent. Personal data is never monetized or distributed to marketing third parties.
          </p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Vulnerability Disclosure Policy</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          We encourage security researchers to practice responsible disclosure. If you identify a potential security vulnerability affecting our platform, please report it immediately to our Trust & Security response team at <span className="text-pink-400 font-mono">security@aura-india.com</span>. We provide acknowledgments and resolution tracking for verified findings.
        </p>
        <div className="pt-2">
          <Link
            href="/contact"
            className="text-xs text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-4"
          >
            Contact Security & Trust Team →
          </Link>
        </div>
      </div>
    </div>
  );
}
