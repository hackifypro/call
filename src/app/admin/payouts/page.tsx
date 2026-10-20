'use client';

import React, { useState, useEffect } from 'react';
import { Banknote, CheckCircle2, Clock, AlertTriangle, RefreshCw, ShieldCheck, ArrowUpRight, AlertCircle } from 'lucide-react';
import { formatINR, formatDateOnly } from '@/lib/utils';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payouts');
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to fetch payouts.');
        setLoading(false);
        return;
      }
      setPayouts(json.payouts || []);
      setLoading(false);
    } catch {
      setError('Connection to payout reconciliation service failed.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleAuthorize = async (payoutId: string) => {
    setProcessingId(payoutId);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to authorize payout.');
        setProcessingId(null);
        return;
      }

      setSuccessMsg(json.message);
      setProcessingId(null);
      fetchPayouts();
    } catch {
      setError('Failed to dispatch payout command.');
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading payout records...</p>
      </div>
    );
  }

  const pendingTotal = payouts.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const settledTotal = payouts.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Banknote className="w-6 h-6 text-emerald-400" />
            <span>Companion Payout Reconciliation</span>
          </h1>
          <p className="text-xs text-slate-400">
            Escrow release queue for companion 90% net earnings via NEFT/IMPS banking rails.
          </p>
        </div>

        <button
          onClick={fetchPayouts}
          className="inline-flex items-center space-x-1.5 text-xs bg-slate-900 text-slate-200 border border-slate-800 px-3 py-2 rounded-xl"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refresh</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-amber-500/30 space-y-1">
          <span className="text-xs text-amber-300">Pending Escrow Payout Authorization</span>
          <div className="text-2xl font-black text-amber-300 font-mono">{formatINR(pendingTotal)}</div>
          <span className="text-[10px] text-slate-400">{payouts.filter((p) => p.status === 'pending').length} Companion Requests Waiting</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-slate-400">Settled Companion Disbursements</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{formatINR(settledTotal)}</div>
          <span className="text-[10px] text-emerald-400">Successfully transferred to bank accounts</span>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl p-5 space-y-4">
        <h2 className="text-base font-bold text-white">Disbursement Batch Queue</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Companion</th>
                <th className="py-2.5 px-3 font-semibold">Requested Amount</th>
                <th className="py-2.5 px-3 font-semibold">Bank Details (Private Masked)</th>
                <th className="py-2.5 px-3 font-semibold">Transaction Ref</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white">{p.companionDisplayName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.companionId}</div>
                  </td>
                  <td className="py-2.5 px-3 font-bold font-mono text-emerald-400 text-sm">
                    {formatINR(p.amount)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">
                    <div>{p.bankAccountMasked}</div>
                    <div className="text-slate-500">IFSC: {p.ifscCode}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-purple-300">
                    {p.referenceId || 'PENDING_DISPATCH'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {p.status === 'pending' ? (
                      <button
                        onClick={() => handleAuthorize(p.id)}
                        disabled={processingId === p.id}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
                      >
                        {processingId === p.id ? 'Authorizing...' : 'Release Payout'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Settled</span>
                      </span>
                    )}
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
