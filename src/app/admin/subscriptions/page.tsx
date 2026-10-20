'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, DollarSign, Tag } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fee, setFee] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions');
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to fetch subscription configuration.');
        setLoading(false);
        return;
      }
      setData(json);
      setFee(json.registrationFee || 0);
      setIsFree(Boolean(json.isRegistrationFree));
      setLoading(false);
    } catch {
      setError('Connection to subscription service failed.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationFee: fee,
          isRegistrationFree: isFree,
          updatedPlans: data.subscriptions,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to save subscription settings.');
        setSaving(false);
        return;
      }

      setSuccessMsg('Subscription tiers and registration fees updated.');
      setSaving(false);
    } catch {
      setError('Failed to update subscription data.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading subscription settings...</p>
      </div>
    );
  }

  const { subscriptions } = data || { subscriptions: [] };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-pink-400" />
            <span>Registration Fees & Subscription Plans</span>
          </h1>
          <p className="text-xs text-slate-400">
            Configure companion verification fees, spotlight tiers, and promotional memberships.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
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

      {/* Companion Registration Fee Card */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">One-Time Companion Registration & Verification Fee</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Charged to companions upon submitting their identity verification documents. Setting this to ₹0 makes registration completely free to attract top talent.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => {
                setIsFree(e.target.checked);
                if (e.target.checked) setFee(0);
              }}
              className="rounded bg-slate-900 border-slate-700 text-pink-500"
            />
            <span className="font-semibold text-white">Free Companion Registration (Promotional)</span>
          </label>

          {!isFree && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">One-Time Fee (₹):</span>
              <input
                type="number"
                min={0}
                step={100}
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-32 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {/* Subscription Tiers */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Companion Membership Tiers</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {subscriptions.map((plan: any) => (
            <div
              key={plan.id}
              className="glass-card rounded-2xl p-5 border border-white/10 hover:border-pink-500/30 transition flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{plan.name}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {plan.durationDays} Days
                  </span>
                </div>

                <div className="text-2xl font-black text-pink-400 font-mono">
                  {plan.price === 0 ? 'FREE' : formatINR(plan.price)}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  {plan.features.map((feat: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-semibold">Active & Live</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
