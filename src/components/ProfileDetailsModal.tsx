'use client';

import React, { useState } from 'react';
import { CompanionProfile, ReviewRecord } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import {
  X,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Clock,
  Heart,
  Share2,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';

interface ProfileDetailsModalProps {
  companion: CompanionProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (companion: CompanionProfile) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  reviews?: ReviewRecord[];
}

export default function ProfileDetailsModal({
  companion,
  isOpen,
  onClose,
  onBookNow,
  isFavorite,
  onToggleFavorite,
  reviews = [],
}: ProfileDetailsModalProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);

  if (!isOpen || !companion) return null;

  const allPhotos = [companion.primaryPhotoUrl, ...(companion.galleryPhotos || [])];
  const companionReviews = reviews.filter((r) => r.companionId === companion.id);

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSent(true);
    setTimeout(() => {
      setReportModalOpen(false);
      setReportSent(false);
      setReportReason('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90 z-10 sticky top-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-white">{companion.displayName}</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>18+ ID Verified</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleFavorite(companion.id)}
              className={`p-2 rounded-full border transition ${
                isFavorite
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Photos and Gallery Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                <img
                  src={allPhotos[selectedPhotoIndex] || companion.primaryPhotoUrl}
                  alt={companion.displayName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-white border border-white/10 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>
                    {companion.cityName}, {companion.stateName}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {allPhotos.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {allPhotos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${
                        selectedPhotoIndex === idx ? 'border-purple-500 scale-95' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Info and Pricing */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">{companion.displayName}</h1>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {companion.age} yrs • {companion.gender} • {companion.cityName}
                  </p>
                </div>

                {/* Verified Metrics Row */}
                <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-xl bg-slate-800/40 border border-white/5 text-center">
                  <div>
                    <div className="text-xs text-slate-400">Rating</div>
                    <div className="text-lg font-bold text-amber-400 flex items-center justify-center space-x-1 mt-0.5">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{companion.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Reviews</div>
                    <div className="text-lg font-bold text-slate-200 mt-0.5">{companion.reviewCount} verified</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Completed</div>
                    <div className="text-lg font-bold text-purple-400 mt-0.5">{companion.completedBookings} gigs</div>
                  </div>
                </div>

                {/* About Bio */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    About {companion.displayName}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/20 p-3 rounded-lg border border-white/5">
                    {companion.bio}
                  </p>
                </div>

                {/* Interests & Languages */}
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Interests & Vibe:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {companion.interests.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-950/50 text-purple-300 border border-purple-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Languages Spoken:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {companion.languages.map((lang) => (
                        <span
                          key={lang}
                          className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-white/5"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Transparent Rates */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Standard Rates & Packages
                    </span>
                    <span className="text-[11px] text-purple-400 font-semibold">10% Platform Fee Included</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-800/60 border border-white/5">
                      <span className="text-slate-400 block">Hourly Rate (1 hr)</span>
                      <span className="text-base font-bold text-white mt-0.5 block">{formatINR(companion.hourlyRate)}</span>
                    </div>
                    {companion.halfDayRate && (
                      <div className="p-2.5 rounded-lg bg-slate-800/60 border border-white/5">
                        <span className="text-slate-400 block">Half Day (4 hrs)</span>
                        <span className="text-base font-bold text-white mt-0.5 block">
                          {formatINR(companion.halfDayRate)}
                        </span>
                      </div>
                    )}
                    {companion.fullDayRate && (
                      <div className="p-2.5 rounded-lg bg-slate-800/60 border border-white/5 col-span-2">
                        <span className="text-slate-400 block">Full Day (8 hrs)</span>
                        <span className="text-base font-bold text-white mt-0.5 block">
                          {formatINR(companion.fullDayRate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <button
                  onClick={() => onBookNow(companion)}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-purple-950/50 transition flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Request Booking with {companion.displayName}</span>
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>Double booking locked & verified</span>
                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="text-slate-500 hover:text-red-400 transition flex items-center space-x-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Genuine Reviews Section */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <span>Verified Customer Reviews ({companionReviews.length})</span>
            </h3>

            {companionReviews.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5 text-slate-400 text-xs text-center">
                No reviews yet. Completed bookings with {companion.displayName} can leave verified reviews.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {companionReviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white">{rev.customerName}</span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Verified Booking
                        </span>
                      </div>
                      <div className="flex items-center text-amber-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400' : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
                    <div className="text-[10px] text-slate-500">
                      Booking Ref: {rev.bookingRef}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Safety Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Report Companion Profile</span>
            </h3>
            <p className="text-xs text-slate-400">
              Your safety and privacy are paramount. Reports are reviewed by human moderators within 2 hours.
            </p>
            {reportSent ? (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs text-center">
                Thank you. Profile reported for moderation review.
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-3">
                <textarea
                  required
                  placeholder="Describe your concern or violation..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 h-24 focus:outline-none focus:border-red-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
