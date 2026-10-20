'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [verified, setVerified] = useState(Boolean(code));

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-12 px-4 sm:px-6 max-w-md mx-auto flex flex-col justify-center space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Trust & Safety</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Verify Your Email
        </h1>
        <p className="text-slate-400 text-xs">
          Mandatory contact verification for all adult marketplace participants.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 text-center">
        <div className="w-14 h-14 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/30 flex items-center justify-center mx-auto">
          {verified ? <CheckCircle2 className="w-7 h-7 text-emerald-400" /> : <Mail className="w-7 h-7" />}
        </div>

        {verified ? (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">Email Verified Successfully</h3>
            <p className="text-xs text-slate-300">
              Your email address has been verified against our identity records. You now have full access to your account.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-pink-500/20"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              We have dispatched a verification link to your registered email address. Please click the link inside your inbox to activate your account.
            </p>
            <button
              onClick={() => setVerified(true)}
              className="text-xs text-pink-400 hover:text-pink-300 underline font-semibold"
            >
              Simulate Instant Verification Link Click
            </button>
            <div className="pt-2 border-t border-slate-800">
              <Link
                href="/login"
                className="text-xs text-slate-400 hover:text-white"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">Loading...</div>}>
      <VerifyEmailContent />
    </React.Suspense>
  );
}
