'use client';

import React from 'react';
import { usePlatformStore } from '@/lib/store';
import { CreditCard, DollarSign, TrendingUp, CheckCircle2, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { formatINR, formatDateOnly } from '@/lib/utils';

export default function AdminPaymentsPage() {
  const { commissionLedger, payouts, approvePayout, bookings } = usePlatformStore();

  const totalGross = commissionLedger.reduce((sum, e) => sum + (e.grossBookingAmount || ((e.amount || 0) * 10)), 0);
  const totalCommission = commissionLedger.reduce((sum, e) => sum + (e.platformCommission || e.amount || 0), 0);
  const totalNetCompanion = commissionLedger.reduce((sum, e) => sum + (e.companionPayoutAmount || ((e.amount || 0) * 9)), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <CreditCard className="w-6 h-6 text-pink-400" />
          <span>Financial Audits & Payouts</span>
        </h1>
        <p className="text-xs text-slate-400">
          Strict 10% auditable commission ledger and companion automated bank transfers.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-slate-400">Total Gross Marketplace Volume</span>
          <div className="text-2xl font-black text-white font-mono">{formatINR(totalGross)}</div>
          <span className="text-[10px] text-emerald-400">All India verified transactions</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-purple-500/30 space-y-1">
          <span className="text-xs text-purple-300">Audited 10% Platform Revenue</span>
          <div className="text-2xl font-black text-purple-300 font-mono">{formatINR(totalCommission)}</div>
          <span className="text-[10px] text-purple-400">Retained platform commission</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-slate-400">Companion Net Payouts (90%)</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{formatINR(totalNetCompanion)}</div>
          <span className="text-[10px] text-emerald-400">Direct companion earnings</span>
        </div>
      </div>

      {/* Commission Ledger Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl space-y-4 p-5">
        <h2 className="text-base font-bold text-white">Immutable 10% Commission Ledger</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Ledger ID</th>
                <th className="py-2.5 px-3 font-semibold">Booking Ref</th>
                <th className="py-2.5 px-3 font-semibold">Gross (₹)</th>
                <th className="py-2.5 px-3 font-semibold">Commission (10%)</th>
                <th className="py-2.5 px-3 font-semibold">Companion Net (90%)</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {commissionLedger.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-400">{entry.id}</td>
                  <td className="py-2.5 px-3 font-mono text-pink-400 font-semibold">{entry.bookingRef}</td>
                  <td className="py-2.5 px-3 font-mono text-white">{formatINR(entry.grossBookingAmount || ((entry.amount || 0) * 10))}</td>
                  <td className="py-2.5 px-3 font-mono text-purple-300 font-bold">{formatINR(entry.platformCommission || entry.amount || 0)}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{formatINR(entry.companionPayoutAmount || ((entry.amount || 0) * 9))}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      SETTLED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payouts Approvals */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl space-y-4 p-5">
        <h2 className="text-base font-bold text-white">Companion Direct Bank Transfers</h2>

        <div className="divide-y divide-slate-800">
          {payouts.map((p) => (
            <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-white flex items-center space-x-2">
                  <span>Companion ID: {p.companionId}</span>
                  <span className="text-emerald-400 font-mono font-bold">{formatINR(p.amount)}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Bank: {p.bankAccountMasked} • IFSC: {p.ifscCode || p.bankIfscMasked}
                </div>
              </div>

              <div>
                {p.status === 'pending' ? (
                  <button
                    onClick={() => approvePayout(p.id)}
                    className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-1.5 px-3 rounded-lg text-xs shadow-md transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Authorize Payout</span>
                  </button>
                ) : (
                  <span className="text-emerald-400 flex items-center space-x-1 font-semibold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Processed (Ref: {p.referenceId || p.transactionRef})</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
