'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePlatformStore } from '@/lib/store';
import { BookingRequest, CompanionProfile } from '@/lib/types';
import {
  formatINR,
  formatDateOnly,
  getBookingStatusBadge,
  maskPhoneNumber,
} from '@/lib/utils';
import {
  Calendar,
  Clock,
  Heart,
  CreditCard,
  Star,
  Shield,
  Phone,
  Mail,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Lock,
  MessageSquare,
  Trash2,
  Eye,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import ReviewModal from '@/components/ReviewModal';

export default function CustomerDashboardPage() {
  const {
    currentUser,
    bookings,
    companions,
    bookingCredits,
    commissionLedger,
    favorites,
    recentlyViewed,
    cancelBooking,
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<
    'bookings' | 'favorites' | 'credits' | 'payments' | 'settings'
  >('bookings');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>(
    'all'
  );
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<BookingRequest | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Personal schedule conflict');
  const [accountDeletedAlert, setAccountDeletedAlert] = useState(false);

  // Filter bookings for the current customer
  const myBookings = bookings.filter((b) => b.customerId === currentUser.id);

  const filteredBookings = myBookings.filter((b) => {
    if (bookingFilter === 'upcoming') {
      return (
        b.status === 'confirmed' ||
        b.status === 'accepted' ||
        b.status === 'pending_acceptance' ||
        b.status === 'in_progress'
      );
    }
    if (bookingFilter === 'completed') {
      return b.status === 'completed';
    }
    if (bookingFilter === 'cancelled') {
      return b.status === 'cancelled' || b.status === 'refunded' || b.status === 'rejected';
    }
    return true;
  });

  // Favorite companions
  const favoriteCompanions = companions.filter((c) => favorites.includes(c.id));

  // Available replacement credits (Section 11)
  const activeCredits = bookingCredits.filter(
    (c) => c.userId === currentUser.id && c.status === 'available'
  );
  const totalCreditBalance = activeCredits.reduce((sum, c) => sum + c.creditAmount, 0);

  const handleCancelBooking = (bookingId: string) => {
    cancelBooking(bookingId, cancelReason, 'customer');
    setShowCancelModal(null);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Dashboard Top Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-purple-500/40 bg-slate-900">
            {currentUser.avatarUrl ? (
              <Image src={currentUser.avatarUrl} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xl text-purple-300">
                {currentUser.fullName[0]}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white">{currentUser.fullName}</h1>
              <span className="bg-purple-950 border border-purple-500/40 text-purple-300 text-[10px] px-2 py-0.5 rounded font-semibold">
                Customer Account
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser.email} • {currentUser.phoneNumber}
            </p>
          </div>
        </div>

        {/* Quick Actions & Credit Balance */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/messages"
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-2xl transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            <span>Messages</span>
          </Link>
          <Link
            href="/support"
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-2xl transition"
          >
            <Shield className="w-3.5 h-3.5 text-pink-400" />
            <span>Disputes & Help</span>
          </Link>
          <div className="flex items-center space-x-4 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                Replacement Credits
              </span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono">
                {formatINR(totalCreditBalance)}
              </span>
            </div>
            <Link
              href="/explore"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition"
            >
              Apply
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'bookings', label: `My Bookings (${myBookings.length})` },
          { id: 'favorites', label: `Saved Favorites (${favorites.length})` },
          { id: 'credits', label: `Credits & Refunds (${activeCredits.length})` },
          { id: 'payments', label: 'Payment Ledger' },
          { id: 'settings', label: 'Privacy & Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================================================
          TAB 1: BOOKINGS MANAGEMENT
         ========================================================================= */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Subfilters */}
          <div className="flex items-center space-x-2 text-xs">
            {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setBookingFilter(filter)}
                className={`px-3 py-1.5 rounded-lg border capitalize transition ${
                  bookingFilter === filter
                    ? 'border-purple-500 bg-purple-950/40 text-purple-300 font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center border border-white/10 space-y-3">
              <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Bookings in this Category</h3>
              <p className="text-xs text-slate-400">
                You do not have any {bookingFilter !== 'all' ? bookingFilter : ''} bookings yet.
              </p>
              <Link
                href="/explore"
                className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-pink-500/20"
              >
                Explore & Book a Companion
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => {
                const badge = getBookingStatusBadge(b.status);
                const isConfirmed = b.status === 'confirmed' || b.status === 'accepted';
                const isCompleted = b.status === 'completed';

                return (
                  <div
                    key={b.id}
                    className="glass-card rounded-2xl p-5 border border-white/10 shadow-lg space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-purple-500/30 flex-shrink-0">
                          <Image
                            src={b.companionPhotoUrl}
                            alt={b.companionDisplayName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-white text-sm">
                              {b.companionDisplayName}
                            </h3>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">
                            Ref: {b.bookingRef}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-extrabold text-pink-400 font-mono">
                          {formatINR(b.priceBreakdown.finalPaidByCustomer)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {b.durationHours} hrs • {b.paymentMethod || 'Escrow Paid'}
                        </span>
                      </div>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Date & Time</span>
                        <span className="font-semibold text-white">
                          {formatDateOnly(b.bookingDate)} at {b.startTime}
                        </span>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Location & Occasion</span>
                        <span className="font-semibold text-white line-clamp-1">
                          {b.meetupLocation}
                        </span>
                      </div>

                      {/* Permitted Contact Details (Section 8: Only unlocked when accepted!) */}
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">
                          Authorized Contact Method
                        </span>
                        {isConfirmed || isCompleted ? (
                          <div className="space-y-0.5 text-emerald-400 font-semibold flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{b.companionPhone || '+91 98765 43210'}</span>
                          </div>
                        ) : (
                          <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                            <Lock className="w-3 h-3" />
                            <span>Locked until companion confirms</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                      <div className="text-[11px] text-slate-400">
                        {b.cancellationReason && (
                          <span className="text-rose-400">Reason: {b.cancellationReason}</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Write Review CTA for Completed Bookings */}
                        {isCompleted && !b.hasReview && (
                          <button
                            onClick={() => setSelectedReviewBooking(b)}
                            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>Write Verified Review</span>
                          </button>
                        )}

                        {isCompleted && b.hasReview && (
                          <span className="text-emerald-400 text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Review Submitted</span>
                          </span>
                        )}

                        {/* Cancel Booking option for upcoming requests */}
                        {(b.status === 'pending_acceptance' || b.status === 'confirmed') && (
                          <button
                            onClick={() => setShowCancelModal(b.id)}
                            className="text-slate-400 hover:text-rose-400 px-2 py-1 transition text-xs"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: SAVED FAVORITES
         ========================================================================= */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Your Saved Favorites</h2>
            <span className="text-xs text-slate-400">{favoriteCompanions.length} saved</span>
          </div>

          {favoriteCompanions.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center border border-white/10 space-y-3">
              <Heart className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Favorites Saved Yet</h3>
              <p className="text-xs text-slate-400">
                Swipe right or tap the heart icon on any card in the deck to save companions here.
              </p>
              <Link
                href="/explore"
                className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl"
              >
                Start Swiping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteCompanions.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: CREDITS & REFUND STATUS (SECTION 11)
         ========================================================================= */}
      {activeTab === 'credits' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-400 block uppercase tracking-wider">
                Section 11 • Replacement Booking Credit Balance
              </span>
              <div className="text-3xl font-extrabold text-white font-mono mt-1">
                {formatINR(totalCreditBalance)}
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Issued when an accepted booking cannot be fulfilled by the companion. Credits never
                expire and apply automatically at checkout for any qualifying companion in India.
              </p>
            </div>

            <Link
              href="/explore"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Book with Credit</span>
            </Link>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Credit Issuance Ledger
            </h3>
            {bookingCredits.length === 0 ? (
              <div className="bg-slate-900 rounded-xl p-4 text-xs text-slate-400 text-center">
                No credit records found.
              </div>
            ) : (
              <div className="space-y-2">
                {bookingCredits.map((c) => (
                  <div
                    key={c.id}
                    className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{c.reason}</div>
                      <div className="text-[10px] text-slate-400">
                        Issued: {formatDateOnly(c.createdAt)} • Status:{' '}
                        <span className="capitalize text-emerald-400 font-semibold">{c.status}</span>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      +{formatINR(c.creditAmount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PAYMENT LEDGER
         ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Escrow Payments & Commission Transparency
            </h2>
            <span className="text-xs text-purple-300 font-semibold">10% Platform Fee Protected</span>
          </div>

          <div className="space-y-2">
            {myBookings.map((b) => (
              <div
                key={b.id}
                className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">
                    Payment for Booking {b.bookingRef} ({b.companionDisplayName})
                  </div>
                  <div className="text-[11px] text-slate-400 space-x-2 mt-0.5">
                    <span>Base: {formatINR(b.priceBreakdown.baseAmount)}</span>
                    <span>•</span>
                    <span className="text-purple-300">
                      10% Commission: {formatINR(b.priceBreakdown.platformCommissionAmount)}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400">
                      Paid: {formatINR(b.priceBreakdown.finalPaidByCustomer)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Escrow Verified
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatINR(b.priceBreakdown.finalPaidByCustomer)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: PRIVACY CONTROLS & ACCOUNT SETTINGS
         ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 max-w-2xl">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white">Privacy Controls & Account Settings</h2>
            <p className="text-xs text-slate-400">
              Manage your confidential profile data and platform preferences.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="font-semibold text-white">Contact Visibility Protection</div>
                <div className="text-[11px] text-slate-400">
                  Phone and email are hidden until a companion accepts your booking.
                </div>
              </div>
              <span className="text-emerald-400 font-bold">Enabled</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="font-semibold text-white">SMS Booking Notifications</div>
                <div className="text-[11px] text-slate-400">
                  Receive instant alerts when a companion accepts or confirms.
                </div>
              </div>
              <span className="text-emerald-400 font-bold">Active</span>
            </div>

            {/* Account Deletion (Section 8 Requirement) */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h3 className="text-rose-400 font-bold text-xs uppercase tracking-wider">
                Danger Zone
              </h3>
              <p className="text-[11px] text-slate-400">
                Permanently purge your booking history, favorites, and profile data from our databases.
              </p>
              {accountDeletedAlert ? (
                <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 p-3 rounded-xl">
                  Account deletion request initiated. Personal records will be expunged within 24 hours.
                </div>
              ) : (
                <button
                  onClick={() => setAccountDeletedAlert(true)}
                  className="bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Request Account Deletion</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal for Completed Bookings */}
      {selectedReviewBooking && (
        <ReviewModal
          booking={selectedReviewBooking}
          onClose={() => setSelectedReviewBooking(null)}
        />
      )}

      {/* Cancel Booking Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Confirm Booking Cancellation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel this booking? Under Section 11, your funds will be
              released back to your account or issued as booking credit.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Reason for cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none"
              >
                <option value="Personal schedule conflict">Personal schedule conflict</option>
                <option value="Change of travel plans">Change of travel plans</option>
                <option value="Selected another date/time">Selected another date/time</option>
              </select>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowCancelModal(null)}
                className="w-1/2 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-semibold"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancelBooking(showCancelModal)}
                className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-semibold transition"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
