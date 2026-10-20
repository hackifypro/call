'use client';

import React, { useState } from 'react';
import { CompanionProfile, BookingPriceBreakdown } from '@/lib/types';
import { usePlatformStore } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { calculateBookingBreakdown, formatINR } from '@/lib/utils';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import Link from 'next/link';

interface BookingModalProps {
  companion: CompanionProfile | null;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: (bookingRef: string) => void;
}

export default function BookingModal({
  companion,
  isOpen = true,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const { createBooking, bookingCredits, featureSettings, applyCoupon } = usePlatformStore();
  const { appUser } = useAuth();

  // Form states
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // default tomorrow
  );
  const [startTime, setStartTime] = useState('18:00');
  const [durationHours, setDurationHours] = useState(2);
  const [cityName, setCityName] = useState(companion?.cityName || 'Mumbai');
  const [meetupLocation, setMeetupLocation] = useState('');
  const [occasionType, setOccasionType] = useState('Dinner & Conversation');
  const [specialNotes, setSpecialNotes] = useState('');
  const [useCredit, setUseCredit] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  if (!isOpen || !companion) return null;

  // Calculate available credits for customer
  const availableCredits = bookingCredits
    .filter((c) => c.userId === (appUser?.id || 'cust-01') && c.status === 'available')
    .reduce((sum, c) => sum + c.creditAmount, 0);

  // Calculate transparent server-side breakdown
  const breakdown: BookingPriceBreakdown = calculateBookingBreakdown(
    companion.hourlyRate,
    durationHours,
    featureSettings.platformCommissionRate || 10,
    useCredit ? availableCredits : 0
  );

  const finalCustomerPayable = Math.max(0, breakdown.finalPaidByCustomer - couponDiscount);

  const handleApplyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim(), breakdown.baseAmount);
    if (res.valid) {
      setAppliedCoupon(couponInput.trim().toUpperCase());
      setCouponDiscount(res.discountAmount);
      setCouponMsg({ text: `Coupon ${couponInput.trim().toUpperCase()} applied! Saved ₹${res.discountAmount}`, isError: false });
    } else {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponMsg({ text: res.error || 'Invalid or expired coupon code', isError: true });
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetupLocation) {
      setBookingError('Please enter a public meetup location (e.g., hotel lounge, cafe, restaurant).');
      return;
    }

    setIsProcessing(true);
    setBookingError(null);

    // Simulate payment transaction with idempotency key
    setTimeout(() => {
      const result = createBooking({
        companionId: companion.id,
        bookingDate,
        startTime,
        durationHours,
        cityName: companion.cityName,
        meetupLocation,
        occasionType,
        specialNotes,
        useCredit,
        couponCode: appliedCoupon || undefined,
        paymentMethod: paymentMethod.toUpperCase(),
      });

      setIsProcessing(false);
      if (result.success && result.booking) {
        setConfirmedBookingRef(result.booking.bookingRef);
        onSuccess?.(result.booking.bookingRef);
      } else {
        setBookingError(result.error || 'Failed to complete booking request. Please try again.');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-base font-bold text-white">Book {companion.displayName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBookingRef ? (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Booking Request Submitted!</h3>
              <p className="text-xs text-slate-400">
                Your request has been routed to {companion.displayName}. Platform funds are safely locked until acceptance.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Booking Reference:</span>
                <span className="font-mono font-bold text-purple-400">{confirmedBookingRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Scheduled Date:</span>
                <span className="text-white font-medium">
                  {bookingDate} at {startTime} ({durationHours} hrs)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid / Authorized:</span>
                <span className="text-emerald-400 font-bold">{formatINR(breakdown.finalPaidByCustomer)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                  Pending Companion Acceptance
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/dashboard/customer"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition text-center"
              >
                View in Customer Dashboard
              </Link>
              <button
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmitBooking} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {bookingError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Companion quick card */}
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/40 border border-white/5">
              <img
                src={companion.primaryPhotoUrl}
                alt={companion.displayName}
                className="w-12 h-14 rounded-lg object-cover border border-white/10"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-sm font-bold text-white">{companion.displayName}</h4>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1 rounded">18+</span>
                </div>
                <p className="text-xs text-slate-400">
                  {companion.cityName} • {formatINR(companion.hourlyRate)}/hr
                </p>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Booking Date</span>
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Start Time</span>
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Duration Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Permitted Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 4, 8].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setDurationHours(hrs)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      durationHours === hrs
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                        : 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {hrs} {hrs === 1 ? 'Hour' : 'Hours'}
                  </button>
                ))}
              </div>
            </div>

            {/* Meetup details */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>Public Meetup Venue / Location</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bastian Restaurant, Bandra West or Marriott Hotel Lounge"
                  value={meetupLocation}
                  onChange={(e) => setMeetupLocation(e.target.value)}
                  className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Mandatory safety rule: Initial meetups must be at public commercial venues.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Occasion / Event Type</label>
                <select
                  value={occasionType}
                  onChange={(e) => setOccasionType(e.target.value)}
                  className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Dinner & Conversation">Fine Dining & Conversation</option>
                  <option value="Social Gala / Wedding">Social Gala / Wedding Guest</option>
                  <option value="City Tour & Sightseeing">City Tour & Cultural Sightseeing</option>
                  <option value="Corporate Evening">Corporate Dinner / Business Event</option>
                  <option value="Movie or Concert">Movie / Concert Accompaniment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Special Notes or Preferences (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Dress code, dietary preferences, or specific conversation topics..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Replacement Credit Application */}
            {availableCredits > 0 && (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-purple-200 block">
                    Use Replacement Credit: {formatINR(availableCredits)}
                  </span>
                  <span className="text-[10px] text-purple-400">Available from previous unfulfilled bookings</span>
                </div>
                <input
                  type="checkbox"
                  checked={useCredit}
                  onChange={(e) => setUseCredit(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-slate-800 border-white/10 focus:ring-purple-500 cursor-pointer"
                />
              </div>
            )}

            {/* Promotional / Referral Coupon Code */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Promo or Referral Coupon Code (Optional)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10 or FIRSTBOOK"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 uppercase focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <div
                  className={`text-[11px] font-medium ${
                    couponMsg.isError ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {couponMsg.text}
                </div>
              )}
            </div>

            {/* 10% Transparent Price Breakdown */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 space-y-2 text-xs">
              <div className="font-semibold text-slate-300 flex items-center justify-between border-b border-white/5 pb-1.5">
                <span>Transparent Price Calculation</span>
                <span className="text-[10px] text-purple-400">Section 9 Marketplace Policy</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>
                  Base Rate ({formatINR(companion.hourlyRate)} × {durationHours} hrs)
                </span>
                <span className="text-white">{formatINR(breakdown.baseAmount)}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span className="flex items-center space-x-1">
                  <span>Platform Commission ({breakdown.platformCommissionRate}%)</span>
                  <Info className="w-3 h-3 text-slate-500" />
                </span>
                <span className="text-amber-400 font-mono">
                  {formatINR(breakdown.platformCommissionAmount)} (Included)
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Companion's Eligible Earnings (90%)</span>
                <span className="text-purple-300 font-medium">{formatINR(breakdown.netCompanionAmount)}</span>
              </div>

              {breakdown.creditApplied ? (
                <div className="flex justify-between text-emerald-400">
                  <span>Replacement Credit Applied</span>
                  <span>- {formatINR(breakdown.creditApplied)}</span>
                </div>
              ) : null}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>- {formatINR(couponDiscount)}</span>
                </div>
              )}

              <div className="border-t border-white/10 pt-2 flex justify-between items-center text-sm font-bold">
                <span className="text-white">Total Payable:</span>
                <span className="text-emerald-400 text-base">{formatINR(finalCustomerPayable)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                    paymentMethod === 'upi'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                      : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Instant UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                    paymentMethod === 'card'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                      : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Cards (Visa/MC)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                    paymentMethod === 'netbanking'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                      : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  NetBanking
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-purple-950/50 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Locking Availability & Processing Payment...</span>
              ) : (
                <>
                  <span>
                    Pay & Submit Request ({formatINR(breakdown.finalPaidByCustomer)})
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-500">
              Double-booking protected. If rejected or unfulfilled, 100% refund or replacement credit is provided.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
