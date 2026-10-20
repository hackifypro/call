'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Star,
  Shield,
  Heart,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Ban,
  Share2,
  Sparkles,
  Info,
  Check,
  RotateCcw,
} from 'lucide-react';
import { CompanionProfile, ReviewRecord, BookingCredit } from '@/lib/types';
import { formatINR, formatDateOnly } from '@/lib/utils';

export default function CustomerProfileDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const companionId = params.id;

  const [companion, setCompanion] = useState<CompanionProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeCredits, setActiveCredits] = useState<BookingCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('19:00');
  const [durationHours, setDurationHours] = useState(2);
  const [meetupLocation, setMeetupLocation] = useState('');
  const [occasionType, setOccasionType] = useState('Fine Dining & Social Companion');
  const [specialNotes, setSpecialNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI (Instant Escrow)');
  const [appliedCreditId, setAppliedCreditId] = useState('');
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{ bookingRef: string; message: string } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Safety Action state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Misleading photos or description');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [blockSuccess, setBlockSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [compRes, favRes, dashRes] = await Promise.all([
          fetch('/api/companions'),
          fetch('/api/customer/favorites'),
          fetch('/api/customer/dashboard'),
        ]);

        if (compRes.ok) {
          const json = await compRes.json();
          const match = (json.companions || []).find((c: CompanionProfile) => c.id === companionId);
          setCompanion(match || null);
        }

        if (favRes.ok) {
          const favJson = await favRes.json();
          setIsFavorite((favJson.favoriteIds || []).includes(companionId));
        }

        if (dashRes.ok) {
          const dashJson = await dashRes.json();
          setActiveCredits(dashJson.activeCredits || []);
        }

        // Track as recently viewed
        await fetch('/api/customer/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companionId, trackView: true }),
        });
      } catch (err) {
        console.error('Failed to load companion profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [companionId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-96 bg-white/5 rounded-3xl" />
        <div className="h-48 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  if (!companion) {
    return (
      <div className="text-center py-20 rounded-3xl bg-[#0e1024] border border-white/10 space-y-4">
        <h2 className="text-xl font-bold text-white">Profile Not Found</h2>
        <p className="text-slate-400 text-sm">
          This companion listing may be inactive, unverified, or does not exist.
        </p>
        <Link
          href="/customer/explore"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Explore</span>
        </Link>
      </div>
    );
  }

  const photos = [companion.primaryPhotoUrl, ...(companion.galleryPhotos || [])].filter(Boolean);

  const handleToggleFav = async () => {
    try {
      const res = await fetch('/api/customer/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId: companion.id }),
      });
      if (res.ok) {
        const json = await res.json();
        setIsFavorite(json.isFavorite);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customer/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'report',
          reportedProfileId: companion.id,
          reason: reportReason,
          details: reportDetails,
        }),
      });
      if (res.ok) {
        setReportSuccess(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlock = async () => {
    if (!window.confirm(`Are you sure you want to block ${companion.displayName}? You will no longer see their listing.`)) {
      return;
    }
    try {
      const res = await fetch('/api/customer/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block', blockUserId: companion.id }),
      });
      if (res.ok) {
        setBlockSuccess(true);
        setTimeout(() => router.push('/customer/explore'), 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pricing calculations
  const selectedCredit = activeCredits.find((c) => c.id === appliedCreditId);
  const baseBookingAmount = companion.hourlyRate * durationHours;
  const platformFee = Math.round(baseBookingAmount * 0.1);
  const creditDiscount = selectedCredit ? Math.min(selectedCredit.creditAmount, baseBookingAmount) : 0;
  const totalPayable = Math.max(0, baseBookingAmount - creditDiscount);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!bookingDate) {
      setBookingError('Please choose a valid booking date.');
      return;
    }
    if (!meetupLocation.trim()) {
      setBookingError('Please specify the meeting venue (hotel, fine dining restaurant, lounge).');
      return;
    }
    if (!acceptPolicy) {
      setBookingError('You must agree to the Section 11 cancellation and refund policy.');
      return;
    }

    setBookingSubmitting(true);
    try {
      const res = await fetch('/api/customer/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companionId: companion.id,
          bookingDate,
          startTime: bookingTime,
          durationHours,
          meetupLocation: meetupLocation.trim(),
          occasionType,
          specialNotes: specialNotes.trim(),
          paymentMethod,
          useCreditId: appliedCreditId || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Booking request failed.');
      }

      setBookingSuccess({
        bookingRef: json.booking.bookingRef,
        message: 'Your booking has been reserved in escrow. Awaiting companion confirmation.',
      });
    } catch (err: any) {
      setBookingError(err.message || 'Failed to submit booking.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/customer/explore"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleFav}
            className={`p-2 rounded-xl border transition-all flex items-center space-x-1.5 text-xs font-bold ${
              isFavorite
                ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-900/40'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-pink-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
            <span>{isFavorite ? 'Saved' : 'Favorite'}</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 transition-colors"
            title="Report Profile"
          >
            <Flag className="w-4 h-4" />
          </button>

          <button
            onClick={handleBlock}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 transition-colors"
            title="Block User"
          >
            <Ban className="w-4 h-4" />
          </button>
        </div>
      </div>

      {blockSuccess && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-semibold text-center">
          Companion profile blocked. Redirecting to explore...
        </div>
      )}

      {/* Main Grid: Gallery & Bio on Left, Booking Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Photos and Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Photo Gallery */}
          <div className="rounded-3xl overflow-hidden bg-[#0e1024] border border-white/10 shadow-xl space-y-3 p-4">
            <div className="relative h-96 sm:h-[460px] w-full rounded-2xl overflow-hidden bg-slate-900">
              <Image
                src={photos[selectedPhotoIndex] || companion.primaryPhotoUrl}
                alt={companion.displayName}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-3xl font-black text-white">{companion.displayName}, {companion.age}</h1>
                    {companion.isVerified && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-bold flex items-center space-x-1">
                        <Shield className="w-3.5 h-3.5" />
                        <span>18+ Adult Verified</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-purple-300 font-semibold">{companion.gender} Companion • {companion.cityName}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-300 block">Published Hourly</span>
                  <span className="text-2xl font-black text-white">{formatINR(companion.hourlyRate)}</span>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {photos.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedPhotoIndex === idx
                        ? 'border-purple-500 ring-2 ring-purple-500/40'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={p} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Biography & Key Attributes */}
          <div className="rounded-3xl bg-[#0e1024] border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <h2 className="text-lg font-bold text-white mb-2">About {companion.displayName}</h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {companion.bio}
              </p>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div>
                <p className="text-xs text-slate-400">Rating</p>
                <p className="text-lg font-bold text-amber-400 flex items-center space-x-1">
                  <span>★</span>
                  <span>{companion.rating} ({companion.reviewCount || 0})</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Completed Dates</p>
                <p className="text-lg font-bold text-white">{companion.completedBookings || 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Primary City</p>
                <p className="text-lg font-bold text-white">{companion.cityName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Verification</p>
                <p className="text-lg font-bold text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aadhaar/Govt</span>
                </p>
              </div>
            </div>

            {/* Languages & Interests */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Fluent Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {companion.languages?.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Areas of Interest & Occasions</h3>
                <div className="flex flex-wrap gap-2">
                  {companion.interests?.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 rounded-xl bg-white/5 text-slate-200 border border-white/10 text-xs font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Permitted Cities & Service Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {companion.supportedCities?.map((city) => (
                    <span
                      key={city}
                      className="px-3 py-1 rounded-xl bg-white/5 text-slate-300 border border-white/10 text-xs flex items-center space-x-1"
                    >
                      <MapPin className="w-3 h-3 text-purple-400" />
                      <span>{city}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Standard Tier Packages */}
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">Published Pricing Tiers</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-[11px] text-slate-400 block">Hourly</span>
                  <span className="text-base font-bold text-white">{formatINR(companion.hourlyRate)}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-[11px] text-slate-400 block">Half-Day (4 hrs)</span>
                  <span className="text-base font-bold text-white">
                    {formatINR(companion.halfDayRate || companion.hourlyRate * 4)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-[11px] text-slate-400 block">Full-Day (8 hrs)</span>
                  <span className="text-base font-bold text-white">
                    {formatINR(companion.fullDayRate || companion.hourlyRate * 8)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Booking Request Panel */}
        <div className="space-y-6">
          <div className="sticky top-20 rounded-3xl bg-[#0e1024] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Reserve Appointment</span>
              </h3>
              <span className="text-xs text-purple-300 font-extrabold">{formatINR(companion.hourlyRate)}/hr</span>
            </div>

            {bookingSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-white text-base">Booking Request Submitted!</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {bookingSuccess.message}
                </p>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block">Reference</span>
                  <span className="font-mono font-bold text-purple-300 text-sm">{bookingSuccess.bookingRef}</span>
                </div>
                <div className="pt-2">
                  <Link
                    href="/customer/bookings"
                    className="block w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs text-center"
                  >
                    View in My Bookings
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                {bookingError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Date & Time */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Appointment Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration (Hours)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 4, 8].map((hrs) => (
                      <button
                        type="button"
                        key={hrs}
                        onClick={() => setDurationHours(hrs)}
                        className={`py-2 rounded-xl font-bold border transition-all ${
                          durationHours === hrs
                            ? 'bg-purple-600 text-white border-purple-400'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {hrs}h
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meeting Venue */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Meeting Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Taj Mahal Palace, Colaba"
                    value={meetupLocation}
                    onChange={(e) => setMeetupLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Occasion */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Occasion</label>
                  <select
                    value={occasionType}
                    onChange={(e) => setOccasionType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#14162e] border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Fine Dining & Social Companion">Fine Dining & Social</option>
                    <option value="Corporate Gala & Reception">Corporate Gala</option>
                    <option value="Art Exhibition & Museum Walk">Art & Cultural Event</option>
                    <option value="Travel & City Guide">City Exploration</option>
                  </select>
                </div>

                {/* Replacement Credit Dropdown */}
                {activeCredits.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
                    <span className="text-emerald-300 font-semibold flex items-center space-x-1">
                      <RotateCcw className="w-3 h-3" />
                      <span>Section 11 Credit Available</span>
                    </span>
                    <select
                      value={appliedCreditId}
                      onChange={(e) => setAppliedCreditId(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#0d1f1a] border border-emerald-500/40 text-emerald-200 text-xs"
                    >
                      <option value="">Do not apply credit</option>
                      {activeCredits.map((c) => (
                        <option key={c.id} value={c.id}>
                          Apply {formatINR(c.creditAmount)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>Base ({durationHours} hrs × {formatINR(companion.hourlyRate)}):</span>
                    <span className="font-semibold text-white">{formatINR(baseBookingAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>10% Platform Escrow Fee:</span>
                    <span>{formatINR(platformFee)} (Included)</span>
                  </div>
                  {creditDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Replacement Credit:</span>
                      <span>- {formatINR(creditDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-white/10 text-white font-extrabold text-sm">
                    <span>Total Payable:</span>
                    <span className="text-purple-300">{formatINR(totalPayable)}</span>
                  </div>
                </div>

                {/* Section 11 Checkbox */}
                <label className="flex items-start space-x-2 pt-1 text-slate-400 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptPolicy}
                    onChange={(e) => setAcceptPolicy(e.target.checked)}
                    className="mt-0.5 rounded accent-purple-600"
                  />
                  <span>
                    I agree to the <strong className="text-slate-200">Section 11 Cancellation Policy</strong> (100% refund &gt;24h, 50% 12-24h, 0% &lt;12h).
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-900/40 disabled:opacity-50 transition-all"
                >
                  {bookingSubmitting ? 'Securing Escrow...' : `Request & Pay ${formatINR(totalPayable)}`}
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Payment Protected by Platform Escrow</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confidential Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101226] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Report Profile to Trust & Safety</h3>
            <p className="text-xs text-slate-400 mb-4">
              Your report is completely confidential and investigated by our administrative moderation staff within 2 hours.
            </p>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <p className="font-bold text-white text-sm">Report Submitted Confidentially</p>
                <p className="text-xs text-slate-400">Our trust & safety team has logged this incident.</p>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reason for Report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#14162e] border border-white/10 text-white"
                  >
                    <option value="Misleading photos or description">Misleading photos or bio</option>
                    <option value="Unprofessional communication">Unprofessional communication</option>
                    <option value="Attempted off-platform payment request">Off-platform payment solicitation</option>
                    <option value="Safety or boundary concern">Safety concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Additional Confidential Details</label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific context for our safety team..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
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
