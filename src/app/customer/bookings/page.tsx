'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Shield,
  CreditCard,
  FileText,
  X,
  ChevronRight,
  Star,
  Info,
} from 'lucide-react';
import { BookingRequest } from '@/lib/types';
import { formatINR, formatDateOnly, getBookingStatusBadge } from '@/lib/utils';

type TabKey =
  | 'all'
  | 'pending'
  | 'awaiting'
  | 'confirmed'
  | 'upcoming'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'refunds';

function CustomerBookingsContent() {
  const searchParams = useSearchParams();
  const highlightRef = searchParams.get('ref');

  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);

  // Cancellation Modal State
  const [cancellingBooking, setCancellingBooking] = useState<BookingRequest | null>(null);
  const [cancelReason, setCancelReason] = useState('Personal schedule conflict');
  const [cancellingSubmitting, setCancellingSubmitting] = useState(false);
  const [cancelResult, setCancelResult] = useState<{ creditIssued?: number; message: string } | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/customer/bookings');
      if (res.ok) {
        const json = await res.json();
        setBookings(json.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load customer bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (highlightRef && bookings.length > 0) {
      const found = bookings.find((b) => b.bookingRef === highlightRef);
      if (found) {
        setSelectedBooking(found);
      }
    }
  }, [highlightRef, bookings]);

  // Tab Filtering Logic
  const filteredBookings = bookings.filter((b) => {
    switch (activeTab) {
      case 'all':
        return true;
      case 'pending':
        return b.status === 'pending_acceptance';
      case 'awaiting':
        return b.status === 'pending_acceptance';
      case 'confirmed':
        return b.status === 'confirmed' || b.status === 'accepted';
      case 'upcoming':
        return (
          b.status === 'confirmed' ||
          b.status === 'accepted' ||
          b.status === 'pending_acceptance' ||
          b.status === 'in_progress'
        );
      case 'in_progress':
        return b.status === 'in_progress';
      case 'completed':
        return b.status === 'completed';
      case 'rejected':
        return b.status === 'rejected';
      case 'cancelled':
        return b.status === 'cancelled';
      case 'refunds':
        return b.status === 'refunded' || b.status === 'cancelled';
      default:
        return true;
    }
  });

  // Calculate cancellation policy eligibility
  const getCancellationEstimate = (booking: BookingRequest) => {
    const bookingDateTime = new Date(`${booking.bookingDate}T${booking.startTime || '12:00'}:00`);
    const now = new Date();
    const hoursNotice = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    const baseAmount = booking.priceBreakdown?.totalPayableByCustomer || booking.priceBreakdown?.baseAmount || 0;

    if (hoursNotice >= 24) {
      return {
        hoursNotice: Math.round(hoursNotice),
        tier: '100% Replacement Credit',
        creditAmount: baseAmount,
        color: 'text-emerald-400',
      };
    } else if (hoursNotice >= 12) {
      return {
        hoursNotice: Math.round(hoursNotice),
        tier: '50% Replacement Credit',
        creditAmount: Math.round(baseAmount * 0.5),
        color: 'text-amber-400',
      };
    } else {
      return {
        hoursNotice: Math.max(0, Math.round(hoursNotice)),
        tier: 'Non-refundable (<12 hours notice)',
        creditAmount: 0,
        color: 'text-rose-400',
      };
    }
  };

  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingBooking) return;

    setCancellingSubmitting(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/customer/bookings/${cancellingBooking.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Cancellation failed.');
      }

      setCancelResult({
        creditIssued: json.creditIssued,
        message: json.message,
      });
      await fetchBookings();
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancellingSubmitting(false);
    }
  };

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'All Bookings', count: bookings.length },
    {
      key: 'upcoming',
      label: 'Upcoming',
      count: bookings.filter(
        (b) =>
          b.status === 'confirmed' ||
          b.status === 'accepted' ||
          b.status === 'pending_acceptance' ||
          b.status === 'in_progress'
      ).length,
    },
    { key: 'confirmed', label: 'Confirmed', count: bookings.filter((b) => b.status === 'confirmed' || b.status === 'accepted').length },
    { key: 'pending', label: 'Pending Acceptance', count: bookings.filter((b) => b.status === 'pending_acceptance').length },
    { key: 'in_progress', label: 'In Progress', count: bookings.filter((b) => b.status === 'in_progress').length },
    { key: 'completed', label: 'Completed', count: bookings.filter((b) => b.status === 'completed').length },
    { key: 'cancelled', label: 'Cancelled', count: bookings.filter((b) => b.status === 'cancelled').length },
    { key: 'refunds', label: 'Refunds & Credits', count: bookings.filter((b) => b.status === 'refunded' || b.status === 'cancelled').length },
    { key: 'rejected', label: 'Rejected', count: bookings.filter((b) => b.status === 'rejected').length },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>My Bookings</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {bookings.length} Total
            </span>
          </h1>
          <p className="text-sm text-slate-400">
            Track appointment statuses, escrow transactions, meeting itineraries, and Section 11 cancellation policies.
          </p>
        </div>

        <Link
          href="/customer/explore"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 self-start sm:self-auto"
        >
          <span>Book Another Date</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeTab === tab.key
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 border border-purple-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.key ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-3xl bg-[#0e1024] border border-white/10 space-y-4">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Bookings in this Category</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            You don't have any bookings matching the "{activeTab.replace('_', ' ')}" filter.
          </p>
          <Link
            href="/customer/explore"
            className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
          >
            Explore Profiles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const canCancel = ['pending_acceptance', 'confirmed', 'accepted'].includes(b.status);

            return (
              <div
                key={b.id}
                className="rounded-3xl bg-[#0e1024] border border-white/10 hover:border-purple-500/30 p-5 sm:p-6 shadow-xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left Companion Details */}
                <div className="flex items-start sm:items-center space-x-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                    {b.companionPhotoUrl ? (
                      <Image
                        src={b.companionPhotoUrl}
                        alt={b.companionDisplayName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-white bg-purple-900">
                        {b.companionDisplayName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
                        {b.bookingRef}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getBookingStatusBadge(b.status)}`}>
                        {b.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{b.companionDisplayName}</h3>

                    <p className="text-xs text-slate-300 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{b.cityName} • {b.meetupLocation}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDateOnly(b.bookingDate)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{b.startTime} ({b.durationHours} hrs)</span>
                      </span>
                      <span className="text-slate-400">Occasion: {b.occasionType || 'Dining Companion'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5 gap-3">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Escrow Paid</span>
                    <span className="text-xl font-black text-white">
                      {formatINR(b.priceBreakdown?.totalPayableByCustomer || b.priceBreakdown?.baseAmount || 0)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{b.paymentMethod || 'UPI Escrow'}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors"
                    >
                      Audit Details
                    </button>

                    <Link
                      href="/customer/messages"
                      className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors"
                      title="Direct Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>

                    {b.status === 'completed' && !b.hasReview && (
                      <Link
                        href={`/customer/reviews?bookingId=${b.id}`}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors"
                      >
                        Review
                      </Link>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => {
                          setCancellingBooking(b);
                          setCancelResult(null);
                          setCancelError(null);
                        }}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BOOKING DETAIL AUDIT MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#101226] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="font-mono text-xs font-bold text-purple-300">{selectedBooking.bookingRef}</span>
                <h3 className="text-lg font-bold text-white">Booking Itinerary & Audit Record</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Timeline */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Chronological Status</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Request Created & Escrow Secured ({formatDateOnly(selectedBooking.createdAt)})</span>
                </div>
                {['confirmed', 'accepted', 'in_progress', 'completed'].includes(selectedBooking.status) && (
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Companion Accepted & Confirmed</span>
                  </div>
                )}
                {selectedBooking.status === 'completed' && (
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Appointment Completed & Mutual Sign-off</span>
                  </div>
                )}
                {selectedBooking.status === 'cancelled' && (
                  <div className="flex items-center space-x-2 text-rose-400 font-semibold">
                    <XCircle className="w-4 h-4" />
                    <span>Cancelled: {selectedBooking.cancellationReason || 'Cancelled by customer'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Companion & Venue Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 block">Companion</span>
                <span className="font-bold text-white text-sm">{selectedBooking.companionDisplayName}</span>
                <span className="text-slate-400 block">{selectedBooking.cityName}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 block">Date & Time</span>
                <span className="font-bold text-white text-sm">{formatDateOnly(selectedBooking.bookingDate)}</span>
                <span className="text-purple-300 block">{selectedBooking.startTime} ({selectedBooking.durationHours} hours)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs space-y-1">
              <span className="text-slate-400 block">Meeting Venue / Permitted Location</span>
              <p className="font-bold text-white">{selectedBooking.meetupLocation}</p>
              {selectedBooking.specialNotes && (
                <p className="text-slate-300 pt-1">Notes: {selectedBooking.specialNotes}</p>
              )}
            </div>

            {/* Itemized Pricing */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Itemized Financial Ledger</h4>
              <div className="flex justify-between text-slate-300">
                <span>Base Amount ({selectedBooking.durationHours} hrs):</span>
                <span>{formatINR(selectedBooking.priceBreakdown?.baseAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform Commission & Escrow (10%):</span>
                <span>{formatINR(selectedBooking.priceBreakdown?.platformCommissionAmount || 0)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-white text-sm pt-2 border-t border-white/10">
                <span>Final Paid by Client:</span>
                <span className="text-purple-300">
                  {formatINR(selectedBooking.priceBreakdown?.totalPayableByCustomer || selectedBooking.priceBreakdown?.baseAmount || 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 11 CANCELLATION MODAL */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101226] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Cancel Appointment</h3>
                <span className="font-mono text-xs text-slate-400">{cancellingBooking.bookingRef}</span>
              </div>
            </div>

            {cancelResult ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-base">Appointment Cancelled</h4>
                <p className="text-slate-300 text-xs leading-relaxed">{cancelResult.message}</p>
                {cancelResult.creditIssued && cancelResult.creditIssued > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
                    {formatINR(cancelResult.creditIssued)} credited to your account!
                  </div>
                )}
                <button
                  onClick={() => setCancellingBooking(null)}
                  className="px-5 py-2 rounded-xl bg-white/10 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCancelBooking} className="space-y-4 text-xs">
                {cancelError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {cancelError}
                  </div>
                )}

                {/* Policy Estimate Box */}
                {(() => {
                  const est = getCancellationEstimate(cancellingBooking);
                  return (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Notice Given:</span>
                        <span className="font-bold text-white">{est.hoursNotice} hours prior</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Section 11 Policy Tier:</span>
                        <span className={`font-bold ${est.color}`}>{est.tier}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-slate-300 font-semibold">Refund/Credit Amount:</span>
                        <span className={`font-black text-sm ${est.color}`}>{formatINR(est.creditAmount)}</span>
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reason for Cancellation</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#14162e] border border-white/10 text-white"
                  >
                    <option value="Personal schedule conflict">Personal schedule conflict</option>
                    <option value="Work/business emergency">Work or business emergency</option>
                    <option value="Travel cancellation">Travel / flight change</option>
                    <option value="Accidental booking">Accidental reservation</option>
                    <option value="Other personal reasons">Other personal reason</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setCancellingBooking(null)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white"
                  >
                    Keep Booking
                  </button>
                  <button
                    type="submit"
                    disabled={cancellingSubmitting}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-950/40 disabled:opacity-50"
                  >
                    {cancellingSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
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

export default function CustomerBookingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading bookings...</span>
          </div>
        </div>
      }
    >
      <CustomerBookingsContent />
    </React.Suspense>
  );
}
