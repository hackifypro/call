'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Heart,
  CreditCard,
  Star,
  Shield,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Compass,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  MapPin,
  MessageSquare,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { formatINR, formatDateOnly, getBookingStatusBadge } from '@/lib/utils';
import { BookingRequest, CompanionProfile, NotificationRecord, SupportTicket, BookingCredit } from '@/lib/types';

export default function CustomerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    user: { fullName: string; email: string; role: string };
    metrics: {
      totalBookings: number;
      upcomingCount: number;
      pendingCount: number;
      completedCount: number;
      cancelledCount: number;
      favoritesCount: number;
      totalCreditBalance: number;
      unreadNotificationsCount: number;
      openTicketsCount: number;
    };
    upcomingBookings: BookingRequest[];
    pendingRequests: BookingRequest[];
    completedBookings: BookingRequest[];
    favoriteCompanions: CompanionProfile[];
    recentCompanions: CompanionProfile[];
    recentNotifications: NotificationRecord[];
    recentTickets: SupportTicket[];
    activeCredits: BookingCredit[];
  } | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/customer/dashboard');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setData(json);
          }
        }
      } catch (err) {
        console.error('Failed to fetch customer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-white/5 rounded-3xl border border-white/10" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl border border-white/10" />
          ))}
        </div>
        <div className="h-64 bg-white/5 rounded-3xl border border-white/10" />
      </div>
    );
  }

  const {
    user,
    metrics,
    upcomingBookings = [],
    pendingRequests = [],
    completedBookings = [],
    favoriteCompanions = [],
    recentCompanions = [],
    recentNotifications = [],
    recentTickets = [],
    activeCredits = [],
  } = data || {
    user: { fullName: 'Customer', email: '', role: 'customer' },
    metrics: {
      totalBookings: 0,
      upcomingCount: 0,
      pendingCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      favoritesCount: 0,
      totalCreditBalance: 0,
      unreadNotificationsCount: 0,
      openTicketsCount: 0,
    },
    upcomingBookings: [],
    pendingRequests: [],
    completedBookings: [],
    favoriteCompanions: [],
    recentCompanions: [],
    recentNotifications: [],
    recentTickets: [],
    activeCredits: [],
  };

  return (
    <div className="space-y-8">
      {/* Welcoming Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/70 via-[#12132d] to-pink-950/50 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Verified 18+ Adult Companion Marketplace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">{user.fullName || 'Member'}</span>
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Discover verified companions across 36 Indian States and UTs. All appointments are protected by our 10% platform fee and Section 11 cancellation guarantee.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/customer/explore"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Profiles</span>
            </Link>
            <Link
              href="/customer/bookings"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>My Bookings</span>
            </Link>
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/customer/explore"
            className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center space-x-3 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white">Explore & Swipe</p>
              <p className="text-slate-400">Discover verified</p>
            </div>
          </Link>

          <Link
            href="/customer/favorites"
            className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center space-x-3 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white">Saved Favorites</p>
              <p className="text-slate-400">{metrics.favoritesCount} saved</p>
            </div>
          </Link>

          <Link
            href="/customer/payments"
            className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center space-x-3 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white">Payments & Receipts</p>
              <p className="text-slate-400">Escrow ledger</p>
            </div>
          </Link>

          <Link
            href="/customer/support"
            className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center space-x-3 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white">Help & Safety</p>
              <p className="text-slate-400">24/7 dedicated</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-[#0e1024] border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{metrics.upcomingCount}</p>
          <p className="text-xs text-purple-300 mt-1">Confirmed appointments</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1024] border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Acceptance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{metrics.pendingCount}</p>
          <p className="text-xs text-amber-300 mt-1">Awaiting companion</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1024] border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{metrics.completedCount}</p>
          <p className="text-xs text-emerald-300 mt-1">Verified past dates</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1024] border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Credits</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{formatINR(metrics.totalCreditBalance)}</p>
          <p className="text-xs text-pink-300 mt-1">Section 11 replacement</p>
        </div>
      </div>

      {/* Main Two Column Section: Upcoming Bookings & Saved Favorites */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Upcoming & Pending Bookings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Upcoming Appointments</h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
                {upcomingBookings.length}
              </span>
            </div>
            <Link
              href="/customer/bookings"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
            >
              <span>View all bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="rounded-3xl bg-[#0e1024] border border-white/10 p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white">No Upcoming Appointments</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  You have no scheduled bookings at the moment. Browse approved companions in your city and request a booking.
                </p>
              </div>
              <Link
                href="/customer/explore"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Discover Companions</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl bg-[#0e1024] border border-white/10 p-5 hover:border-purple-500/30 transition-all shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
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
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-white text-base">{b.companionDisplayName}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getBookingStatusBadge(b.status)}`}>
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span>{b.cityName} • {b.meetupLocation}</span>
                      </p>
                      <p className="text-xs text-slate-300 flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDateOnly(b.bookingDate)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.startTime} ({b.durationHours} hrs)</span>
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Escrow Amount</p>
                      <p className="font-extrabold text-white text-base">
                        {formatINR(b.priceBreakdown?.totalPayableByCustomer || b.priceBreakdown?.baseAmount || 0)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Link
                        href="/customer/messages"
                        className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors"
                        title="Direct Messaging"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/customer/bookings?ref=${b.bookingRef}`}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 border border-white/10 transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Pending Companion Acceptance</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
                  {pendingRequests.length}
                </span>
              </div>
              <div className="space-y-3">
                {pendingRequests.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-[#0e1024]/60 border border-amber-500/20 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Request for {b.companionDisplayName} ({b.cityName})
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDateOnly(b.bookingDate)} at {b.startTime} • Awaiting companion confirmation
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/customer/bookings"
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      Track
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently Completed Appointments */}
          {completedBookings.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Recent Completed Dates</h3>
                <Link href="/customer/reviews" className="text-xs font-semibold text-purple-400 hover:text-purple-300">
                  Manage Reviews
                </Link>
              </div>
              <div className="space-y-3">
                {completedBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-[#0e1024] border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-white">{b.companionDisplayName}</p>
                        <p className="text-xs text-slate-400">
                          Completed on {formatDateOnly(b.bookingDate)} • {b.cityName}
                        </p>
                      </div>
                    </div>
                    {!b.hasReview ? (
                      <Link
                        href={`/customer/reviews?bookingId=${b.id}`}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-xs font-bold transition-colors"
                      >
                        Rate & Review
                      </Link>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Reviewed</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Saved Favorites & Platform Trust Sidebar */}
        <div className="space-y-6">
          {/* Favorite Companions Card */}
          <div className="rounded-3xl bg-[#0e1024] border border-white/10 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-pink-400" />
                <h3 className="font-bold text-white text-base">Favorite Profiles</h3>
              </div>
              <Link href="/customer/favorites" className="text-xs font-semibold text-purple-400 hover:text-purple-300">
                View All
              </Link>
            </div>

            {favoriteCompanions.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-slate-400">No favorite companions saved yet.</p>
                <p className="text-[11px] text-slate-500">
                  Swipe right on profiles in Explore to save companions to this list.
                </p>
                <Link
                  href="/customer/explore"
                  className="inline-block mt-2 text-xs font-semibold text-purple-400 hover:text-purple-300"
                >
                  Start Swiping →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {favoriteCompanions.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                        <Image src={c.primaryPhotoUrl} alt={c.displayName} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs font-bold text-white">{c.displayName}</p>
                          <span className="text-[10px] text-amber-400 flex items-center">
                            ★ {c.averageRating || c.rating || 5.0}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{c.cityName} • {formatINR(c.hourlyRate)}/hr</p>
                      </div>
                    </div>
                    <Link
                      href={`/customer/profiles/${c.id}`}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 text-xs font-bold transition-all"
                    >
                      Book
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 11 Replacement Credits Widget */}
          {activeCredits.length > 0 && (
            <div className="rounded-3xl bg-gradient-to-br from-emerald-950/40 via-[#0e1024] to-teal-950/30 border border-emerald-500/30 p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-white text-sm">Replacement Credits</h4>
                </div>
                <span className="text-xs font-extrabold text-emerald-300">
                  {formatINR(metrics.totalCreditBalance)}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You have active credits available under our Section 11 policy. They apply automatically at checkout for future bookings.
              </p>
              <Link
                href="/customer/refunds"
                className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                <span>View credits & policy terms</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* 24/7 Safety & Assistance Box */}
          <div className="rounded-3xl bg-gradient-to-br from-purple-950/30 to-[#0e1024] border border-purple-500/20 p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <h4 className="font-bold text-white text-sm">Client Safety & Privacy</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your contact numbers and legal identity are never revealed to companions or third parties. All payments are held in escrow until mutual completion.
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              <span className="text-[11px] text-slate-400">Need immediate help?</span>
              <Link
                href="/customer/support"
                className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center space-x-1"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Contact Desk</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
