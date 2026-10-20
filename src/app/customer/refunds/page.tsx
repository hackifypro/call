'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Info,
  Calendar,
  CreditCard,
  FileText,
} from 'lucide-react';
import { formatINR, formatDateOnly } from '@/lib/utils';
import { BookingCredit, BookingRequest } from '@/lib/types';

export default function CustomerRefundsPage() {
  const [credits, setCredits] = useState<BookingCredit[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [cancelledBookings, setCancelledBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRefunds() {
      try {
        const res = await fetch('/api/customer/refunds');
        if (res.ok) {
          const json = await res.json();
          setCredits(json.credits || []);
          setAvailableBalance(json.availableBalance || 0);
          setCancelledBookings(json.cancelledOrRefundedBookings || []);
        }
      } catch (err) {
        console.error('Failed to load refunds data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRefunds();
  }, []);

  const activeCredits = credits.filter((c) => c.status === 'available');
  const usedCredits = credits.filter((c) => c.status === 'redeemed' || c.status === 'expired');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Refunds & Replacement Credits</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Section 11 Policy
            </span>
          </h1>
          <p className="text-sm text-slate-400">
            Automated replacement booking credits, cancellation settlement statuses, and transparent refund terms.
          </p>
        </div>

        <Link
          href="/customer/explore"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 self-start sm:self-auto"
        >
          <span>Use Credits to Book</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Credit Balance Hero Card */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/60 via-[#0e1024] to-teal-950/40 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Available Balance
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              Instant Redemption
            </span>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-white">{formatINR(availableBalance)}</p>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Replacement credits are issued under our Section 11 guarantee for cancellations and unfulfilled appointments. They automatically deduct from your payable total on checkout.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs space-y-2 w-full md:w-72">
          <div className="flex justify-between text-slate-300">
            <span>Active Credits Count:</span>
            <span className="font-bold text-white">{activeCredits.length}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Historical Redeemed:</span>
            <span className="font-bold text-slate-400">{usedCredits.length}</span>
          </div>
          <div className="flex justify-between text-slate-300 pt-1 border-t border-white/10">
            <span>Validity:</span>
            <span className="text-emerald-400 font-semibold">12 Months from Issue</span>
          </div>
        </div>
      </div>

      {/* Published Section 11 Cancellation Policy Rules */}
      <div className="rounded-3xl bg-[#0e1024] border border-white/10 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Section 11 Cancellation & Refund Policy</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          To maintain fair protection for both clients and registered adult companions, our escrow engine strictly adheres to the following graduated cancellation windows:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">Window A: &gt; 24 Hours Notice</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-black text-xs">
                100%
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Full 100% replacement booking credit or original bank refund if cancelled more than 24 hours prior to appointment time.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">Window B: 12 - 24 Hours Notice</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-black text-xs">
                50%
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              50% replacement booking credit issued immediately. 50% retained to compensate companion for reserved calendar commitment.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300">Window C: &lt; 12 Hours Notice</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-black text-xs">
                0%
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Non-refundable. Escrow released to companion to cover last-minute schedule loss, grooming, and transit expenses.
            </p>
          </div>
        </div>
      </div>

      {/* Available Replacement Credits List */}
      <div className="rounded-3xl bg-[#0e1024] border border-white/10 p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          <span>Active Replacement Credits</span>
        </h3>

        {activeCredits.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No active replacement credits. When you cancel an eligible booking with advance notice, credits appear here automatically.
          </div>
        ) : (
          <div className="space-y-3">
            {activeCredits.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-emerald-300">{c.id}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white">{c.reason}</p>
                  <p className="text-[11px] text-slate-400">
                    Issued: {formatDateOnly(c.createdAt)} • Valid until: {c.expiresAt ? formatDateOnly(c.expiresAt) : 'No expiry'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-emerald-300 block">{formatINR(c.creditAmount)}</span>
                  <Link
                    href="/customer/explore"
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 inline-flex items-center space-x-1"
                  >
                    <span>Redeem Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancelled Bookings & Refund Status History */}
      <div className="rounded-3xl bg-[#0e1024] border border-white/10 p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>Cancellation & Refund Processing Ledger</span>
        </h3>

        {cancelledBookings.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No cancelled or refunded appointments on file.
          </div>
        ) : (
          <div className="space-y-3">
            {cancelledBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-white">{b.bookingRef}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                      {b.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-300 font-semibold pt-1">Companion: {b.companionDisplayName} ({b.cityName})</p>
                  <p className="text-slate-400 text-[11px]">
                    Reason: {b.cancellationReason || 'Cancelled per customer request'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Escrow Record</span>
                  <span className="font-extrabold text-white text-sm">
                    {formatINR(b.priceBreakdown?.totalPayableByCustomer || b.priceBreakdown?.baseAmount || 0)}
                  </span>
                  <span className="text-emerald-400 text-[10px] block font-semibold">Processed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
