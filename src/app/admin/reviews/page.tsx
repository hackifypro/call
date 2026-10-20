'use client';

import React, { useState, useEffect } from 'react';
import { Star, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, Flag, EyeOff, Check } from 'lucide-react';
import { formatDateOnly } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to fetch reviews.');
        setLoading(false);
        return;
      }
      setReviews(json.reviews || []);
      setLoading(false);
    } catch {
      setError('Connection to review moderation service failed.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleFlag = async (reviewId: string) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });
      const json = await res.json();
      if (json.success) {
        fetchReviews();
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Star className="w-6 h-6 text-amber-400" />
            <span>Reviews & Content Moderation</span>
          </h1>
          <p className="text-xs text-slate-400">
            Moderate ratings submitted by customers following completed bookings. Flag or hide inappropriate feedback.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          className="inline-flex items-center space-x-1.5 text-xs bg-slate-900 text-slate-200 border border-slate-800 px-3 py-2 rounded-xl"
        >
          <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className={`glass-card rounded-2xl p-5 border transition space-y-3 shadow-xl ${
              rev.isFlagged ? 'border-rose-500/50 bg-rose-950/20' : 'border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">{rev.customerName}</span>
                <span className="text-[10px] text-slate-400">For companion: <strong className="text-pink-300">{rev.companionDisplayName}</strong></span>
              </div>

              <div className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg text-amber-400 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{rev.rating}.0</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              "{rev.comment}"
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
              <span className="text-slate-500 font-mono">Ref: {rev.bookingRef} • {formatDateOnly(rev.createdAt)}</span>
              <button
                onClick={() => handleToggleFlag(rev.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  rev.isFlagged
                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                }`}
              >
                {rev.isFlagged ? 'Restore Review' : 'Flag & Hide Review'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
