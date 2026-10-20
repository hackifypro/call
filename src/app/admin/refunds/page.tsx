'use client';

import React from 'react';
import { usePlatformStore } from '@/lib/store';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle, CreditCard, Info } from 'lucide-react';
import { formatINR, formatDateOnly } from '@/lib/utils';

export default function AdminRefundsPage() {
  const { bookingCredits } = usePlatformStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <RotateCcw className="w-6 h-6 text-pink-400" />
          <span>Section 11 Cancellation & Refund Manager</span>
        </h1>
        <p className="text-xs text-slate-400">
          Escrow dispute resolutions, partial/full refunds, and replacement booking credit issuance.
        </p>
      </div>

      {/* Policy Rules Callout */}
      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-pink-400" />
          <span>Statutory Section 11 Platform Cancellation Schedule:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <strong className="text-emerald-400 block">&gt; 24 Hours Notice:</strong>
            <span>100% Full Refund or 100% Replacement Credit (Customer choice).</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <strong className="text-amber-400 block">12 to 24 Hours Notice:</strong>
            <span>50% Refund issued. 50% retained for companion opportunity cost.</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <strong className="text-rose-400 block">&lt; 12 Hours Notice / No-Show:</strong>
            <span>Non-refundable. 90% disbursed to companion to protect livelihood.</span>
          </div>
        </div>
      </div>

      {/* Active Replacement Credits Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl p-5 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>Active Customer Replacement Credits</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Credit ID</th>
                <th className="py-2.5 px-3 font-semibold">User ID</th>
                <th className="py-2.5 px-3 font-semibold">Credit Amount</th>
                <th className="py-2.5 px-3 font-semibold">Reason</th>
                <th className="py-2.5 px-3 font-semibold">Expires</th>
                <th className="py-2.5 px-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bookingCredits.map((credit) => (
                <tr key={credit.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-2.5 px-3 font-mono text-pink-400">{credit.id}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{credit.userId}</td>
                  <td className="py-2.5 px-3 font-bold font-mono text-emerald-400">
                    {formatINR(credit.creditAmount)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{credit.reason}</td>
                  <td className="py-2.5 px-3 text-slate-400">{formatDateOnly(credit.expiresAt)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                      {credit.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
