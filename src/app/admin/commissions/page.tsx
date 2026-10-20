'use client';

import React, { useState, useEffect } from 'react';
import { Percent, DollarSign, TrendingUp, ShieldCheck, AlertCircle, RefreshCw, Key, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function AdminCommissionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Commission change state
  const [newRate, setNewRate] = useState(10);
  const [reason, setReason] = useState('Quarterly compliance review');
  const [showConfirm, setShowConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/commissions');
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to fetch commission ledger.');
        setLoading(false);
        return;
      }
      setData(json);
      setNewRate(json.currentRate || 10);
      setLoading(false);
    } catch {
      setError('Connection to commission ledger failed.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handleUpdateRate = async () => {
    setUpdating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratePercentage: newRate, reason }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to update commission rate.');
        setUpdating(false);
        return;
      }

      setSuccessMsg(json.message);
      setShowConfirm(false);
      setUpdating(false);
      fetchCommissions();
    } catch {
      setError('Failed to communicate with rate management server.');
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading commission ledger...</p>
      </div>
    );
  }

  const { currentRate, summary, ledger } = data || { currentRate: 10, summary: {}, ledger: [] };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Percent className="w-6 h-6 text-pink-400" />
            <span>Platform Commission Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Immutable escrow ledger, platform fee configuration, and contractor split accounting.
          </p>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition"
        >
          Modify Platform Rate (Current: {currentRate}%)
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

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-slate-400">Total Bookings Volume</span>
          <div className="text-2xl font-black text-white font-mono">{formatINR(summary.totalGross || 0)}</div>
          <span className="text-[10px] text-slate-500">{summary.totalTransactions || 0} Settled Transactions</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-purple-500/30 space-y-1">
          <span className="text-xs text-purple-300">Total 10% Platform Retained</span>
          <div className="text-2xl font-black text-purple-300 font-mono">{formatINR(summary.totalCommission || 0)}</div>
          <span className="text-[10px] text-purple-400">Statutory platform commission</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-slate-400">Total Companion Disbursements</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{formatINR(summary.totalCompanionPayout || 0)}</div>
          <span className="text-[10px] text-emerald-400">Net contractor remuneration (90%)</span>
        </div>
      </div>

      {/* Ledger Records Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl p-5 space-y-4">
        <h2 className="text-base font-bold text-white">Audited Commission Transactions</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Ledger ID</th>
                <th className="py-2.5 px-3 font-semibold">Booking Ref</th>
                <th className="py-2.5 px-3 font-semibold">Gross Booking (₹)</th>
                <th className="py-2.5 px-3 font-semibold">Platform Fee ({currentRate}%)</th>
                <th className="py-2.5 px-3 font-semibold">Companion Net</th>
                <th className="py-2.5 px-3 font-semibold text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ledger.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-400">{entry.id}</td>
                  <td className="py-2.5 px-3 font-mono text-pink-400 font-bold">{entry.bookingRef}</td>
                  <td className="py-2.5 px-3 font-mono text-white">{formatINR(entry.grossBookingAmount || 0)}</td>
                  <td className="py-2.5 px-3 font-mono text-purple-300 font-bold">{formatINR(entry.platformCommission || 0)}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{formatINR(entry.companionPayoutAmount || 0)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      CONFIRMED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Change Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-purple-500/40 shadow-2xl space-y-5">
            <div className="flex items-center space-x-2 text-pink-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Privileged Operation: Update Commission Rate</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Modifying the platform commission rate affects all upcoming bookings nationwide. This action is permanently recorded in the administrator audit log.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Platform Rate (%)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={newRate}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Justification / Reason</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={handleUpdateRate}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
              >
                {updating ? 'Recording...' : 'Authorize Rate Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
