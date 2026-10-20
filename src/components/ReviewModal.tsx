'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/lib/store';
import { BookingRequest } from '@/lib/types';
import { X, Star, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface ReviewModalProps {
  booking: BookingRequest;
  onClose: () => void;
}

export default function ReviewModal({ booking, onClose }: ReviewModalProps) {
  const { submitReview } = usePlatformStore();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = submitReview(booking.id, rating, comment);
    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(res.error || 'Failed to submit review.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-card rounded-3xl p-6 border border-white/10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Review Verified & Published!</h3>
            <p className="text-xs text-slate-300">
              Thank you for contributing to verified ratings and trust on the platform.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Rate Your Experience with {booking.companionDisplayName}
              </h3>
              <p className="text-xs text-slate-400">
                Verified Booking Ref: <span className="font-mono text-purple-300">{booking.bookingRef}</span>
              </p>
            </div>

            {/* Star Rating Input */}
            <div className="py-2 flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-125 transition"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-amber-300">
                {rating === 5
                  ? '5 Stars — Exceptional'
                  : rating === 4
                  ? '4 Stars — Very Good'
                  : rating === 3
                  ? '3 Stars — Average'
                  : rating === 2
                  ? '2 Stars — Below Expectations'
                  : '1 Star — Poor'}
              </span>
            </div>

            {/* Written Review */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Written Review (Optional)
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your feedback on etiquette, punctuality, conversation, and dining experience..."
                className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl p-3 border border-slate-700 focus:border-pink-500 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            {error && (
              <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-500/20 text-xs flex items-center justify-center space-x-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit Verified Review</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
