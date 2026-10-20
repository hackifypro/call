import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Sparkles,
  CreditCard,
  Lock,
  CheckCircle2,
  Calendar,
  Gift,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works — Transparent Booking & Verified Companionship',
  description:
    'Learn how Aura India works: browse verified adult companions, book transparently with 10% platform fee, and enjoy secure, private meetings in public venues.',
  keywords: ['how companion booking works', 'booking guide aura india', 'verified companionship process', 'safe booking steps'],
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-12 px-4 sm:px-6 max-w-5xl mx-auto w-full space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
          Transparent Marketplace Standards
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          How Aura India Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          A secure, auditable platform connecting ID-verified adult companions with cultured clients across Indian metros with an upfront 10% platform fee.
        </p>
      </div>

      {/* 4 Step Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center text-lg">
            1
          </div>
          <h3 className="text-base font-bold text-white">Discover & Filter</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Search approved profiles by Indian state, city, tier, availability, and specific interests. Use swipe or grid discovery.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 font-bold flex items-center justify-center text-lg">
            2
          </div>
          <h3 className="text-base font-bold text-white">Transparent Price</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Select duration (1h to 8h). View exact breakdown: 90% goes to companion, 10% platform commission, 0 hidden charges.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-lg">
            3
          </div>
          <h3 className="text-base font-bold text-white">Escrow Payment</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Funds are securely authorized via UPI or cards and held in safe escrow until the companion accepts and completes the booking.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-lg">
            4
          </div>
          <h3 className="text-base font-bold text-white">Meetup & Review</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Meet at a public commercial venue (lounge, gala, restaurant). After completion, leave an authentic verified review.
          </p>
        </div>
      </div>

      {/* 10% Auditable Commission Policy (Section 9) */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 space-y-4">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <CreditCard className="w-4 h-4" />
          <span>Section 9 Marketplace Commission Standard</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Fixed 10% Marketplace Commission</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Unlike opaque agencies that take 40-60% of earnings, our platform operates on a strictly audited, flat 10% platform fee. Companions retain 90% of their gross earnings before personal tax deductions.
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-white/10 max-w-lg space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Booking Amount Example:</span>
            <span className="text-white font-bold">₹10,000</span>
          </div>
          <div className="flex justify-between text-amber-400">
            <span>Platform Commission (10%):</span>
            <span className="font-mono font-bold">- ₹1,000</span>
          </div>
          <div className="flex justify-between text-emerald-400 border-t border-white/10 pt-2 font-bold text-sm">
            <span>Companion’s Eligible Net Settlement:</span>
            <span>₹9,000</span>
          </div>
        </div>
      </div>

      {/* Refund & Replacement Credits Policy (Section 10) */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-purple-500/30 space-y-4">
        <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
          <Gift className="w-4 h-4" />
          <span>Section 10 Client Protection Policy</span>
        </div>
        <h2 className="text-2xl font-bold text-white">100% Refund or Replacement Credits</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          If a booking cannot be fulfilled or is declined by a companion, the client is immediately offered two remedies:
        </p>
        <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
          <li>
            <strong>Option A — Full Refund:</strong> 100% of the authorized funds are released back to the original bank account/card without penalty.
          </li>
          <li>
            <strong>Option B — Instant Replacement Credit:</strong> Receive one eligible replacement booking credit immediately in your dashboard to book another available companion without waiting for banking settlement times.
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          href="/#explore-section"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xl transition"
        >
          <span>Explore Verified Companions</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
