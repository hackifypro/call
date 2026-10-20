'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Star,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MessageSquare,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatINR, formatDateOnly } from '@/lib/utils';
import { ReviewRecord, BookingRequest } from '@/lib/types';

export default function CustomerReviewsPage() {
  const searchParams = useSearchParams();
  const preselectedBookingId = searchParams.get('bookingId');

  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [eligibleBookings, setEligibleBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Form State
  const [selectedBookingId, setSelectedBookingId] = useState(preselectedBookingId || '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadReviewsData = async () => {
    try {
      const res = await fetch('/api/customer/reviews');
      if (res.ok) {
        const json = await res.json();
        setReviews(json.reviews || []);
        setEligibleBookings(json.eligibleToReview || []);
        if (preselectedBookingId && json.eligibleToReview?.some((b: any) => b.id === preselectedBookingId)) {
          setSelectedBookingId(preselectedBookingId);
        } else if (json.eligibleToReview?.length > 0 && !selectedBookingId) {
          setSelectedBookingId(json.eligibleToReview[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewsData();
  }, [preselectedBookingId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !comment.trim()) {
      setSubmitError('Please select a completed booking and write your review.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch('/api/customer/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          rating,
          comment: comment.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit review.');
      }

      setSubmitSuccess('Thank you! Your verified review has been published.');
      setComment('');
      setSelectedBookingId('');
      await loadReviewsData();
    } catch (err: any) {
      setSubmitError(err.message || 'Review submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>Ratings & Verified Reviews</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Authenticity Guaranteed
          </span>
        </h1>
        <p className="text-sm text-slate-400">
          Reviews are restricted exclusively to clients who completed verified appointments on the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 1 Col: Leave a Review Form */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-[#0e1024] border border-white/15 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Leave a Verified Review</span>
            </h3>

            {eligibleBookings.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-300">No Pending Reviews</p>
                <p className="text-[11px] leading-relaxed">
                  You have reviewed all completed dates or have no past appointments awaiting feedback.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                {submitSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{submitSuccess}</span>
                  </div>
                )}

                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Completed Date</label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#14162e] border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Choose appointment...</option>
                    {eligibleBookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.companionDisplayName} ({formatDateOnly(b.bookingDate)} - {b.bookingRef})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Star Rating Picker */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Rating (1 to 5 Stars)</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            (hoverRating || rating) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm font-bold text-amber-300 pl-2">{rating}.0 / 5.0</span>
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Written Experience</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe their punctuality, conversational etiquette, warmth, and overall demeanor..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 text-white font-bold shadow-lg shadow-purple-900/30 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Publishing...' : 'Submit Verified Review'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right 2 Cols: My Submitted Reviews History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>My Submitted Review History</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
              {reviews.length}
            </span>
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#0e1024] border border-white/10 text-center text-xs text-slate-400 space-y-2">
              <Star className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-white">No Review History</p>
              <p>You haven't submitted any companion reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-[#0e1024] border border-white/10 shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{r.companionDisplayName}</h4>
                      <span className="font-mono text-[10px] text-purple-300">{r.bookingRef}</span>
                    </div>

                    <div className="flex items-center space-x-1 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-amber-300">{r.rating}.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed italic bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    "{r.comment}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Verified Client Feedback</span>
                    </span>
                    <span>Published on {formatDateOnly(r.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
