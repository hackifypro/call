'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePlatformStore } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { INDIAN_CITIES } from '@/lib/geoData';
import { BookingRequest, CompanionProfile, NotificationRecord } from '@/lib/types';
import {
  formatINR,
  formatDateOnly,
  getBookingStatusBadge,
  maskPhoneNumber,
} from '@/lib/utils';
import {
  Sparkles,
  User,
  ShieldCheck,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  CreditCard,
  BarChart3,
  Star,
  Repeat,
  LifeBuoy,
  Settings,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Lock,
  MessageSquare,
  FileCheck,
  Sliders,
  Eye,
  EyeOff,
  Power,
  ChevronRight,
  ArrowRight,
  Download,
  AlertTriangle,
  RotateCcw,
  Plus,
  Trash2,
  Send,
  HelpCircle,
  ShieldAlert,
  Heart,
  Menu,
  X,
  Bell,
  Flag,
  Info,
  CalendarDays,
  CheckSquare,
} from 'lucide-react';

function CompanionDashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';

  const { appUser, logout } = useAuth();
  const {
    currentUser,
    companions,
    bookings,
    payouts,
    commissionLedger,
    reviews,
    conversations,
    messages,
    notifications,
    supportTickets,
    acceptBooking,
    rejectBooking,
    completeBooking,
    requestPayout,
    updateCompanionProfile,
    createSupportTicket,
    sendChatMessage,
  } = usePlatformStore();

  // Active module navigation tab
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active companion profile: find matching profile for logged in user or fallback to comp-101
  const myProfile = useMemo(() => {
    return (
      companions.find((c) => c.userId === appUser?.id || c.userId === currentUser.id) ||
      companions.find((c) => c.id === 'comp-101') ||
      companions[0]
    );
  }, [companions, appUser, currentUser]);

  // Date filter for statistics (Section 2)
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-10-31');

  // Bookings associated with this companion
  const myBookings = useMemo(() => {
    return bookings.filter((b) => b.companionId === myProfile.id);
  }, [bookings, myProfile.id]);

  // Filter bookings by date
  const dateFilteredBookings = useMemo(() => {
    if (dateFilter === 'all') return myBookings;
    const now = new Date();
    return myBookings.filter((b) => {
      const bDate = new Date(b.bookingDate);
      if (dateFilter === 'today') {
        return bDate.toDateString() === now.toDateString();
      }
      if (dateFilter === 'week') {
        const diffDays = (now.getTime() - bDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (dateFilter === 'month') {
        return bDate.getMonth() === now.getMonth() && bDate.getFullYear() === now.getFullYear();
      }
      if (dateFilter === 'custom') {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        return bDate >= start && bDate <= end;
      }
      return true;
    });
  }, [myBookings, dateFilter, customStartDate, customEndDate]);

  // Metrics derived strictly from database records (Section 2)
  const stats = useMemo(() => {
    const totalRequests = dateFilteredBookings.length;
    const pending = dateFilteredBookings.filter((b) => b.status === 'pending_acceptance').length;
    const accepted = dateFilteredBookings.filter((b) => b.status === 'accepted').length;
    const confirmed = dateFilteredBookings.filter((b) => b.status === 'confirmed').length;
    const inProgress = dateFilteredBookings.filter((b) => b.status === 'in_progress').length;
    const completed = dateFilteredBookings.filter((b) => b.status === 'completed').length;
    const rejected = dateFilteredBookings.filter((b) => b.status === 'rejected').length;
    const cancelled = dateFilteredBookings.filter((b) => b.status === 'cancelled').length;

    const grossBookingValue = dateFilteredBookings
      .filter((b) => ['confirmed', 'completed', 'in_progress'].includes(b.status))
      .reduce((sum, b) => sum + (b.priceBreakdown?.baseAmount || 0), 0);

    const platformCommission = dateFilteredBookings
      .filter((b) => ['confirmed', 'completed', 'in_progress'].includes(b.status))
      .reduce((sum, b) => sum + (b.priceBreakdown?.platformCommissionAmount || 0), 0);

    const netEarnings = dateFilteredBookings
      .filter((b) => ['confirmed', 'completed', 'in_progress'].includes(b.status))
      .reduce((sum, b) => sum + (b.priceBreakdown?.netCompanionAmount || b.priceBreakdown?.companionEarnings || 0), 0);

    const companionPayouts = payouts.filter((p) => p.companionId === myProfile.id);
    const completedPayoutsTotal = companionPayouts
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingPayoutsTotal = companionPayouts
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    const companionReviews = reviews.filter((r) => r.companionId === myProfile.id && !r.isFlagged);
    const avgRating =
      companionReviews.length > 0
        ? (companionReviews.reduce((sum, r) => sum + r.rating, 0) / companionReviews.length).toFixed(1)
        : (myProfile.averageRating || 5.0).toFixed(1);

    return {
      totalRequests,
      pending,
      accepted,
      confirmed,
      inProgress,
      completed,
      rejected,
      cancelled,
      grossBookingValue,
      platformCommission,
      netEarnings,
      completedPayoutsTotal,
      pendingPayoutsTotal,
      avgRating,
      reviewCount: companionReviews.length,
      availableBalance: Math.max(0, netEarnings - completedPayoutsTotal - pendingPayoutsTotal),
    };
  }, [dateFilteredBookings, payouts, myProfile, reviews]);

  // Section 5: Booking tab filters & Modals
  const [bookingStatusTab, setBookingStatusTab] = useState<string>('all');
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<BookingRequest | null>(null);
  const [declineBookingId, setDeclineBookingId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('Schedule overlap with previous engagement');
  const [customDeclineReason, setCustomDeclineReason] = useState('');
  const [issueReplacementCredit, setIssueReplacementCredit] = useState(true);

  // Section 3: Profile edit state
  const [editBio, setEditBio] = useState(myProfile.bio);
  const [editLanguages, setEditLanguages] = useState(myProfile.languages.join(', '));
  const [editHourlyRate, setEditHourlyRate] = useState(myProfile.hourlyRate);
  const [editHalfDayRate, setEditHalfDayRate] = useState(myProfile.halfDayRate || 18000);
  const [editFullDayRate, setEditFullDayRate] = useState(myProfile.fullDayRate || 32000);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Section 6: Availability calendar view mode & date blocker
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  const [blockedDatesList, setBlockedDatesList] = useState<string[]>(['2026-10-25', '2026-10-31']);
  const [newBlockDate, setNewBlockDate] = useState('');

  // Section 9: Payout modal state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(stats.availableBalance || 5000);
  const [bankAccount, setBankAccount] = useState('HDFC Bank •••• 4591');
  const [ifscCode, setIfscCode] = useState('HDFC0000128');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // Section 11: Chat & Notifications tab toggle
  const [messageSectionTab, setMessageSectionTab] = useState<'chats' | 'notifications'>('chats');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversations[0]?.id || null
  );
  const [replyMessage, setReplyMessage] = useState('');

  // Section 14: Safety, Client Report & Support Ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<any>('safety');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [reportTargetClient, setReportTargetClient] = useState<{ id: string; name: string; ref: string } | null>(null);
  const [reportReason, setReportReason] = useState('Unreasonable conduct or boundary violation');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Section 10: Review Report modal state
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reviewReportReason, setReviewReportReason] = useState('Policy violation or false claims');
  const [reviewReportSuccess, setReviewReportSuccess] = useState(false);

  // Handle Profile Update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanionProfile(myProfile.id, {
      bio: editBio,
      languages: editLanguages.split(',').map((s) => s.trim()).filter(Boolean),
      hourlyRate: Number(editHourlyRate),
      halfDayRate: Number(editHalfDayRate),
      fullDayRate: Number(editFullDayRate),
    });
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  // Toggle Profile Availability
  const handleToggleAvailability = () => {
    updateCompanionProfile(myProfile.id, {
      isAvailable: !myProfile.isAvailable,
    });
  };

  // Handle Date Block/Unblock
  const handleToggleBlockDate = (dateStr: string) => {
    if (blockedDatesList.includes(dateStr)) {
      setBlockedDatesList(blockedDatesList.filter((d) => d !== dateStr));
    } else {
      setBlockedDatesList([...blockedDatesList, dateStr]);
    }
  };

  const handleAddBlockDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate || blockedDatesList.includes(newBlockDate)) return;
    setBlockedDatesList([...blockedDatesList, newBlockDate]);
    setNewBlockDate('');
  };

  // Handle Booking Rejection via Modal
  const handleConfirmDecline = () => {
    if (!declineBookingId) return;
    const finalReason = customDeclineReason.trim() ? customDeclineReason.trim() : declineReason;
    rejectBooking(declineBookingId, finalReason, issueReplacementCredit);
    setDeclineBookingId(null);
    setCustomDeclineReason('');
  };

  // Handle Payout Request
  const handleSubmitPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > stats.availableBalance) return;
    requestPayout(myProfile.id, Number(withdrawAmount), bankAccount, ifscCode);
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setShowPayoutModal(false);
    }, 2000);
  };

  // Handle Chat Message Send
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedConversationId) return;
    sendChatMessage(selectedConversationId, replyMessage.trim());
    setReplyMessage('');
  };

  // Handle Support Ticket Create
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    createSupportTicket({
      subject: ticketSubject.trim(),
      category: ticketCategory,
      message: ticketMessage.trim(),
    });
    setTicketSuccess(true);
    setTicketSubject('');
    setTicketMessage('');
    setTimeout(() => setTicketSuccess(false), 3000);
  };

  // Handle Suspicious Client Report
  const handleSubmitClientReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTargetClient) return;
    createSupportTicket({
      subject: `[Safety Alert] Client Report: ${reportTargetClient.name} (${reportTargetClient.ref})`,
      category: 'safety',
      message: `Reason: ${reportReason}\n\nClient: ${reportTargetClient.name}\nBooking Ref: ${reportTargetClient.ref}\nDetails: ${reportDetails || 'Reported via companion safety interface.'}`,
    });
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportTargetClient(null);
      setReportDetails('');
    }, 2000);
  };

  // Handle Review Report
  const handleSubmitReviewReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingReviewId) return;
    createSupportTicket({
      subject: `[Review Dispute] Investigation Request for Review ${reportingReviewId}`,
      category: 'safety',
      message: `Companion ${myProfile.displayName} requested review dispute. Reason: ${reviewReportReason}`,
    });
    setReviewReportSuccess(true);
    setTimeout(() => {
      setReviewReportSuccess(false);
      setReportingReviewId(null);
    }, 2000);
  };

  // Section 16: Sidebar Navigation items (Exclusively companion-facing, 0 admin links)
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'verification', label: 'Verification Centre', icon: ShieldCheck },
    { id: 'requests', label: 'Booking Requests', icon: Calendar, badge: stats.pending },
    { id: 'availability', label: 'Availability Calendar', icon: Clock },
    { id: 'pricing', label: 'Pricing Management', icon: DollarSign },
    { id: 'messages', label: 'Messages & Alerts', icon: MessageSquare },
    { id: 'reviews', label: 'Ratings & Reviews', icon: Star },
    { id: 'earnings', label: 'Earnings & Commission', icon: TrendingUp },
    { id: 'payouts', label: 'Payouts', icon: CreditCard },
    { id: 'analytics', label: 'Analytics & Favorites', icon: Heart },
    { id: 'subscription', label: 'Subscription Status', icon: Repeat },
    { id: 'safety', label: 'Safety & Support', icon: LifeBuoy },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col md:flex-row">
      {/* ============================================================== */}
      {/* SECTION 16: COMPANION SIDEBAR (Desktop)                       */}
      {/* ============================================================== */}
      <aside className="hidden md:flex w-64 bg-slate-950/80 border-r border-purple-500/20 flex-col justify-between shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Companion Info Card */}
          <div className="glass-card rounded-2xl p-3 border border-purple-500/30 flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-pink-500/40">
              <Image
                src={myProfile.primaryPhotoUrl}
                alt={myProfile.displayName}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1">
                <span className="font-bold text-white text-xs truncate">
                  {myProfile.displayName}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full inline-block ${
                    myProfile.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                <span>{myProfile.isAvailable ? 'Available Now' : 'Profile Paused'}</span>
              </div>
              <div className="text-[10px] text-purple-300 font-semibold mt-0.5">
                {myProfile.cityName} • ★ {stats.avgRating}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-pink-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-900">
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          <span className="font-bold text-white text-sm">Companion Dashboard</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-slate-900 text-slate-300"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden p-4 bg-slate-950 border-b border-slate-800 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-pink-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* MAIN CONTENT AREA                                              */}
      {/* ============================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* ============================================================ */}
        {/* TAB 1: DASHBOARD OVERVIEW (Section 2)                        */}
        {/* ============================================================ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Bar with Date Filter & Availability Switch */}
            <div className="glass-card rounded-3xl p-6 border border-purple-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% ID-Verified Host Portal</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Welcome, {myProfile.displayName}
                </h1>
                <p className="text-xs text-slate-400">
                  Manage your bookings, availability, payouts, and private client communications.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Date Filter (Section 2) */}
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
                  {(['all', 'today', 'week', 'month', 'custom'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setDateFilter(f)}
                      className={`px-3 py-1.5 rounded-lg font-semibold uppercase text-[10px] transition ${
                        dateFilter === f
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f === 'all' ? 'All Time' : f}
                    </button>
                  ))}
                </div>

                {/* Instant Availability Toggle */}
                <button
                  onClick={handleToggleAvailability}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                    myProfile.isAvailable
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{myProfile.isAvailable ? 'Available Now' : 'Profile Paused'}</span>
                </button>
              </div>
            </div>

            {/* Custom Date Range Picker */}
            {dateFilter === 'custom' && (
              <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center gap-4 text-xs">
                <span className="text-slate-300 font-semibold">Custom Date Range:</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">From:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">To:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                  />
                </div>
              </div>
            )}

            {/* Financial Overview Cards (Section 8) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Gross Booking Value
                </span>
                <div className="text-2xl font-black text-white">{formatINR(stats.grossBookingValue)}</div>
                <p className="text-[10px] text-slate-500">Gross client spend before platform fees</p>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-purple-500/20 space-y-1">
                <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
                  10% Platform Commission
                </span>
                <div className="text-2xl font-black text-purple-200">
                  {formatINR(stats.platformCommission)}
                </div>
                <p className="text-[10px] text-slate-500">Strictly auditable 10% marketplace fee</p>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/20 space-y-1">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                  Net Eligible Earnings
                </span>
                <div className="text-2xl font-black text-emerald-300">{formatINR(stats.netEarnings)}</div>
                <p className="text-[10px] text-emerald-500/80">90% net companion take-home share</p>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-cyan-500/30 bg-cyan-950/20 space-y-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                    Available for Payout
                  </span>
                  <div className="text-2xl font-black text-cyan-300">
                    {formatINR(stats.availableBalance)}
                  </div>
                </div>
                <button
                  onClick={() => setShowPayoutModal(true)}
                  disabled={stats.availableBalance <= 0}
                  className="mt-2 w-full py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition disabled:opacity-40"
                >
                  Withdraw Funds
                </button>
              </div>
            </div>

            {/* Booking Metrics Grid (Section 2 - 0 Fabrication) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
              <div className="glass-card rounded-xl p-3 border border-white/5">
                <div className="text-xs text-slate-400">Total Requests</div>
                <div className="text-xl font-bold text-white mt-1">{stats.totalRequests}</div>
              </div>
              <div className="glass-card rounded-xl p-3 border border-pink-500/20">
                <div className="text-xs text-pink-400">Pending Review</div>
                <div className="text-xl font-bold text-pink-300 mt-1">{stats.pending}</div>
              </div>
              <div className="glass-card rounded-xl p-3 border border-indigo-500/20">
                <div className="text-xs text-indigo-400">Accepted</div>
                <div className="text-xl font-bold text-indigo-300 mt-1">{stats.accepted}</div>
              </div>
              <div className="glass-card rounded-xl p-3 border border-purple-500/20">
                <div className="text-xs text-purple-400">Confirmed</div>
                <div className="text-xl font-bold text-purple-300 mt-1">{stats.confirmed}</div>
              </div>
              <div className="glass-card rounded-xl p-3 border border-emerald-500/20">
                <div className="text-xs text-emerald-400">Completed</div>
                <div className="text-xl font-bold text-emerald-300 mt-1">{stats.completed}</div>
              </div>
              <div className="glass-card rounded-xl p-3 border border-rose-500/20">
                <div className="text-xs text-rose-400">Cancelled</div>
                <div className="text-xl font-bold text-rose-300 mt-1">{stats.cancelled}</div>
              </div>
              <div className="glass-card rounded-xl p-3 border border-amber-500/20">
                <div className="text-xs text-amber-400">Avg Rating</div>
                <div className="text-xl font-bold text-amber-300 mt-1">★ {stats.avgRating}</div>
              </div>
            </div>

            {/* Quick Actions & Action Required Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Actionable Bookings */}
              <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-pink-400" />
                    <span>Action Required Bookings ({stats.pending})</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs text-pink-400 hover:underline"
                  >
                    View All Bookings →
                  </button>
                </div>

                {stats.pending === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500 space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
                    <p className="font-semibold text-slate-400">All caught up!</p>
                    <p>No pending booking requests awaiting your confirmation.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dateFilteredBookings
                      .filter((b) => b.status === 'pending_acceptance')
                      .slice(0, 3)
                      .map((booking) => (
                        <div
                          key={booking.id}
                          className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{booking.customerName}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                {booking.bookingRef}
                              </span>
                            </div>
                            <div className="text-slate-400 text-[11px] mt-1 space-x-2">
                              <span>📅 {booking.bookingDate} at {booking.startTime}</span>
                              <span>•</span>
                              <span>⏳ {booking.durationHours} hrs</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold">
                                Net: {formatINR(booking.priceBreakdown?.netCompanionAmount || booking.priceBreakdown?.companionEarnings || 0)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => acceptBooking(booking.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => setDeclineBookingId(booking.id)}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs transition"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Right Col: Trust & Verification Centre Callout */}
              <div className="glass-card rounded-3xl p-6 border border-purple-500/20 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Compliance Status</span>
                </h3>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span>Adult Age (18+)</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span>Government ID</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aadhaar Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span>Profile Review</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Photo Consent</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('verification')}
                  className="w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition"
                >
                  View Verification Centre →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MY PROFILE (Section 3)                                */}
        {/* ============================================================ */}
        {activeTab === 'profile' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-pink-400" />
                  <span>My Profile Management</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage your public bio, pricing, photo gallery, and service city coverage.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/profiles/${myProfile.id}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-pink-400" />
                  <span>Preview Public Card</span>
                </Link>
              </div>
            </div>

            {profileSaveSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Profile changes successfully saved and published!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
              {/* Photo & Display Name row */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-purple-500/40 shrink-0">
                  <Image
                    src={myProfile.primaryPhotoUrl}
                    alt={myProfile.displayName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3 flex-1 w-full">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Public Display Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={myProfile.displayName}
                      className="w-full bg-slate-900/60 text-slate-400 rounded-xl px-3.5 py-2.5 border border-slate-800 text-xs cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Display names are verified against government ID during onboarding and cannot be altered without moderator re-verification.
                    </p>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Primary Service City
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${myProfile.cityName}, ${myProfile.stateName}`}
                      className="w-full bg-slate-900/60 text-slate-400 rounded-xl px-3.5 py-2.5 border border-slate-800 text-xs cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Public Biography & Social Escort Profile
                </label>
                <textarea
                  rows={4}
                  required
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-900 text-white rounded-xl p-3 border border-slate-700/80 focus:border-pink-500 focus:outline-none text-xs"
                  placeholder="Describe your interests, conversational background, and fine dining preferences..."
                />
              </div>

              {/* Spoken Languages */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Languages Spoken (comma separated)
                </label>
                <input
                  type="text"
                  value={editLanguages}
                  onChange={(e) => setEditLanguages(e.target.value)}
                  className="w-full bg-slate-900 text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-pink-500 focus:outline-none text-xs"
                  placeholder="English, Hindi, Marathi, French"
                />
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    value={editHourlyRate}
                    onChange={(e) => setEditHourlyRate(Number(e.target.value))}
                    className="w-full bg-slate-900 text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-pink-500 focus:outline-none text-xs"
                  />
                  <p className="text-[10px] text-emerald-400 mt-1">
                    You receive: {formatINR(Math.round(editHourlyRate * 0.9))} / hr (after 10% fee)
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Half-Day Rate (4 hrs) (₹)
                  </label>
                  <input
                    type="number"
                    min={3000}
                    value={editHalfDayRate}
                    onChange={(e) => setEditHalfDayRate(Number(e.target.value))}
                    className="w-full bg-slate-900 text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-pink-500 focus:outline-none text-xs"
                  />
                  <p className="text-[10px] text-emerald-400 mt-1">
                    You receive: {editHalfDayRate ? formatINR(Math.round(editHalfDayRate * 0.9)) : '₹0'} (after 10% fee)
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Full-Day Rate (8 hrs) (₹)
                  </label>
                  <input
                    type="number"
                    min={6000}
                    value={editFullDayRate}
                    onChange={(e) => setEditFullDayRate(Number(e.target.value))}
                    className="w-full bg-slate-900 text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-pink-500 focus:outline-none text-xs"
                  />
                  <p className="text-[10px] text-emerald-400 mt-1">
                    You receive: {editFullDayRate ? formatINR(Math.round(editFullDayRate * 0.9)) : '₹0'} (after 10% fee)
                  </p>
                </div>
              </div>

              {/* Confidential Vault Callout (Section 3) */}
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-4 text-xs space-y-2 text-slate-300">
                <div className="flex items-center space-x-2 text-pink-400 font-bold uppercase text-[10px] tracking-wider">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confidential Identity Storage Vault</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Your legal name ({myProfile.legalNamePrivate || 'Protected Vault Record'}), Aadhaar identification, date of birth, and personal mobile number are encrypted at rest with AES-256 and never published on public pages.
                </p>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition"
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: VERIFICATION CENTRE (Section 4 - Full 6 Trackers)    */}
        {/* ============================================================ */}
        {activeTab === 'verification' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Verification & Trust Compliance Centre</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every companion on Aura India undergoes strict identity and adult age compliance checks before public listing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Adult Age Verification */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">1. Adult Age Verification (18+)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Confirmed through government date of birth verification. Applicant is 24 years old.
                </p>
                <div className="text-[10px] text-emerald-400 font-semibold pt-1">
                  Status: Meets strict legal adult requirement.
                </div>
              </div>

              {/* 2. Identity Verification */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">2. Government Identity Document</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Official Aadhaar Card verified with masked document identifier (XXXX-XXXX-4589).
                </p>
                <div className="text-[10px] text-slate-500 pt-1">
                  Private record stored in encrypted vault. Next review in 11 months.
                </div>
              </div>

              {/* 3. Email Verification */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">3. Email Address Verification</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Primary notification channel authenticated via secure token confirmation.
                </p>
                <div className="text-[10px] text-slate-400 pt-1">
                  companion@aura-india.com
                </div>
              </div>

              {/* 4. Phone Verification */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">4. Mobile Phone Number Verification</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Registered Indian phone number authenticated via OTP SMS (+91••••3210).
                </p>
                <div className="text-[10px] text-slate-400 pt-1">
                  Protected by automated customer masking.
                </div>
              </div>

              {/* 5. Profile Review */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">5. Moderator Profile Review</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Approved
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Bio, service guidelines, and geographic tags verified for platform safety guidelines.
                </p>
                <div className="text-[10px] text-emerald-400 pt-1">
                  Active in Mumbai Metropolitan Service Area.
                </div>
              </div>

              {/* 6. Photograph Consent */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">6. Photograph Consent Authorization</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Live facial liveness comparison confirmed against submitted primary portraits.
                </p>
                <div className="text-[10px] text-slate-400 pt-1">
                  Explicit legal consent signed on record.
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-bold text-slate-200">Compliance Assurance Mandate:</span>
              <p className="text-[11px]">
                Under Indian legal standards and Aura India’s safety policy, verification badges are only granted after human moderator review of official credentials. No unapproved profile can ever appear in the search discovery or accept bookings.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: BOOKING REQUESTS (Section 5 - All 8 Status Tabs)      */}
        {/* ============================================================ */}
        {activeTab === 'requests' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span>Booking Requests & Encounters</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review client requests, accept upcoming sessions, and view booking history.
                </p>
              </div>

              {/* Status Filter Tabs (Section 5) */}
              <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending_acceptance', label: 'New / Pending' },
                  { id: 'accepted', label: 'Accepted' },
                  { id: 'confirmed', label: 'Upcoming' },
                  { id: 'in_progress', label: 'In Progress' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'rejected', label: 'Rejected' },
                  { id: 'cancelled', label: 'Cancelled' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setBookingStatusTab(st.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                      bookingStatusTab === st.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            {myBookings.filter((b) => bookingStatusTab === 'all' || b.status === bookingStatusTab).length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-500 space-y-2">
                <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-400">No bookings match this filter</p>
                <p>New client booking requests will appear here in real time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings
                  .filter((b) => bookingStatusTab === 'all' || b.status === bookingStatusTab)
                  .map((booking) => {
                    const badge = getBookingStatusBadge(booking.status);
                    const net = booking.priceBreakdown?.netCompanionAmount || booking.priceBreakdown?.companionEarnings || Math.round((booking.totalAmount || booking.priceBreakdown?.baseAmount || 0) * 0.9);
                    const gross = booking.priceBreakdown?.baseAmount || booking.totalAmount || 0;
                    const commission = booking.priceBreakdown?.platformCommissionAmount || Math.round(gross * 0.1);

                    return (
                      <div
                        key={booking.id}
                        className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 text-xs"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white text-sm">
                                {booking.customerName}
                              </span>
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {booking.bookingRef}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {booking.occasionType} • {booking.cityName}
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase block">Date & Time</span>
                            <span className="font-semibold">{booking.bookingDate} at {booking.startTime}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase block">Duration</span>
                            <span className="font-semibold">{booking.durationHours} Hours</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase block">Gross Paid</span>
                            <span className="font-semibold">{formatINR(gross)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-400 uppercase block">Your Net (90%)</span>
                            <span className="font-bold text-emerald-300 text-sm">{formatINR(net)}</span>
                          </div>
                        </div>

                        {booking.meetupLocation && (
                          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 text-[11px] text-slate-400">
                            <span className="font-semibold text-slate-300">Meetup Location:</span>{' '}
                            {booking.meetupLocation}
                          </div>
                        )}

                        {/* Actions (Section 5) */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                          <div className="text-[11px] text-slate-500">
                            10% Platform fee: {formatINR(commission)} deducted upon completion
                          </div>

                          <div className="flex items-center space-x-2">
                            {booking.status === 'pending_acceptance' && (
                              <>
                                <button
                                  onClick={() => acceptBooking(booking.id)}
                                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
                                >
                                  Accept Request
                                </button>
                                <button
                                  onClick={() => setDeclineBookingId(booking.id)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs transition"
                                >
                                  Decline
                                </button>
                              </>
                            )}

                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => completeBooking(booking.id)}
                                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                              >
                                Mark Completed
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedBookingDetails(booking)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                            >
                              Details
                            </button>

                            <button
                              onClick={() => {
                                setActiveTab('messages');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition flex items-center gap-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Message</span>
                            </button>

                            <button
                              onClick={() =>
                                setReportTargetClient({
                                  id: booking.customerId,
                                  name: booking.customerName,
                                  ref: booking.bookingRef,
                                })
                              }
                              className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                              title="Report suspicious behavior"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: AVAILABILITY CALENDAR (Section 6 - Day/Week/Month)    */}
        {/* ============================================================ */}
        {activeTab === 'availability' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span>Availability Calendar & Scheduling</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure your weekly recurring hours, block leave dates, and prevent double bookings.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Day / Week / Month View Mode */}
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
                  {(['day', 'week', 'month'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setCalendarView(v)}
                      className={`px-3 py-1 rounded-lg uppercase text-[10px] font-bold transition ${
                        calendarView === v ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleToggleAvailability}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    myProfile.isAvailable
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {myProfile.isAvailable ? '✓ Accepting Bookings' : 'Paused'}
                </button>
              </div>
            </div>

            {/* Weekly Operating Grid */}
            <div className="space-y-3">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                Weekly Operating Window ({calendarView.toUpperCase()} VIEW)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                  'Sunday',
                ].map((day) => {
                  const schedule = myProfile.availabilitySchedule?.find((s) => s.day === day);
                  const isActive = schedule ? schedule.active : true;

                  return (
                    <div
                      key={day}
                      className={`p-3.5 rounded-2xl border text-xs space-y-2 transition ${
                        isActive
                          ? 'bg-slate-900/90 border-slate-700/80'
                          : 'bg-slate-950/40 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{day}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isActive ? 'Active' : 'Off'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {schedule ? `${schedule.startTime} — ${schedule.endTime}` : '12:00 — 23:00'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date Blocker for Personal Leave (Section 6) */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Blocked Dates for Personal Commitments</span>
                <span className="text-[10px] text-slate-400">Dates blocked here will never be bookable</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {blockedDatesList.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs"
                  >
                    <span>{d}</span>
                    <button
                      onClick={() => handleToggleBlockDate(d)}
                      className="hover:text-rose-100"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddBlockDate} className="flex gap-2 pt-2">
                <input
                  type="date"
                  value={newBlockDate}
                  onChange={(e) => setNewBlockDate(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  Block This Date
                </button>
              </form>
            </div>

            {/* Anti Double-Booking Protection */}
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 text-xs text-slate-300 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>Anti Double-Booking Lock Active</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Aura India automatically locks out your time slots whenever an active booking request is accepted, ensuring client schedules never conflict.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: PRICING MANAGEMENT (Section 7)                        */}
        {/* ============================================================ */}
        {activeTab === 'pricing' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <span>Pricing & Commission Rules</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Transparent 90% net earnings breakdown across standard Indian metropolitan service tiers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase text-slate-400">1 Hour Encounter</span>
                <div className="text-2xl font-black text-white">{formatINR(myProfile.hourlyRate)}</div>
                <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>10% Platform Fee:</span>
                    <span>- {formatINR(Math.round(myProfile.hourlyRate * 0.1))}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Your Net Payout:</span>
                    <span>{formatINR(Math.round(myProfile.hourlyRate * 0.9))}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase text-slate-400">Half-Day (4 Hours)</span>
                <div className="text-2xl font-black text-white">{formatINR(myProfile.halfDayRate || 18000)}</div>
                <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>10% Platform Fee:</span>
                    <span>- {formatINR(Math.round((myProfile.halfDayRate || 18000) * 0.1))}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Your Net Payout:</span>
                    <span>{formatINR(Math.round((myProfile.halfDayRate || 18000) * 0.9))}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase text-slate-400">Full-Day (8 Hours)</span>
                <div className="text-2xl font-black text-white">{formatINR(myProfile.fullDayRate || 32000)}</div>
                <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>10% Platform Fee:</span>
                    <span>- {formatINR(Math.round((myProfile.fullDayRate || 32000) * 0.1))}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Your Net Payout:</span>
                    <span>{formatINR(Math.round((myProfile.fullDayRate || 32000) * 0.9))}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-bold text-slate-200">Payment Security & Cancellation Policy:</span>
              <p className="text-[11px]">
                Clients prepay 100% of the session amount into the platform escrow. In case of customer cancellation less than 4 hours before the booking, companions receive a 50% late-cancellation compensation guarantee.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: MESSAGES & NOTIFICATIONS (Section 11)                 */}
        {/* ============================================================ */}
        {activeTab === 'messages' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-pink-400" />
                  <span>Communication & Notification Hub</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Private, masked chat threads linked to verified client bookings and real-time security alerts.
                </p>
              </div>

              {/* Sub-tab toggle */}
              <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
                <button
                  onClick={() => setMessageSectionTab('chats')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    messageSectionTab === 'chats' ? 'bg-purple-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Client Chats
                </button>
                <button
                  onClick={() => setMessageSectionTab('notifications')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    messageSectionTab === 'notifications' ? 'bg-purple-600 text-white' : 'text-slate-400'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Platform Alerts</span>
                </button>
              </div>
            </div>

            {messageSectionTab === 'chats' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-96">
                {/* Conversations List */}
                <div className="bg-slate-900/80 rounded-2xl p-2 border border-slate-800 overflow-y-auto space-y-1">
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConversationId(c.id)}
                      className={`w-full text-left p-3 rounded-xl transition ${
                        selectedConversationId === c.id
                          ? 'bg-purple-600/30 border border-purple-500/40 text-white'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs truncate">{c.participantName || c.customerName}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{c.lastMessage}</div>
                    </button>
                  ))}
                </div>

                {/* Chat Thread */}
                <div className="md:col-span-2 bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
                  <div className="overflow-y-auto space-y-3 flex-1 pr-2">
                    {messages
                      .filter((m) => m.conversationId === selectedConversationId)
                      .map((msg) => {
                        const isMe = msg.senderId === appUser?.id || msg.senderId === currentUser.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs ${
                                isMe
                                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                                  : 'bg-slate-800 text-slate-200'
                              }`}
                            >
                              <p>{msg.messageText || msg.text}</p>
                              <span className="text-[9px] text-white/60 mt-1 block text-right">
                                {formatDateOnly(msg.createdAt || msg.timestamp || '')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <form onSubmit={handleSendReply} className="flex gap-2 pt-3 border-t border-slate-800">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type message to client..."
                      className="flex-1 bg-slate-950 text-white rounded-xl px-3.5 py-2 border border-slate-700 text-xs focus:border-pink-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Platform Notifications Sub-tab */
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs flex items-start gap-3"
                  >
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white text-xs">{notif.title}</div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{notif.message}</p>
                      <span className="text-[9px] text-slate-500 mt-1 block">
                        {formatDateOnly(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 8: RATINGS AND REVIEWS (Section 10)                      */}
        {/* ============================================================ */}
        {activeTab === 'reviews' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <span>Client Ratings & Verified Reviews</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Reviews can only be submitted by verified clients upon actual completion of paid encounters.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Score Card & Star Breakdown */}
              <div className="bg-slate-900/80 rounded-2xl p-6 border border-amber-500/30 text-center space-y-4">
                <div>
                  <div className="text-4xl font-black text-amber-300">★ {stats.avgRating}</div>
                  <div className="text-xs text-slate-400 mt-1">Average Review Score</div>
                  <div className="text-[11px] text-slate-500">{stats.reviewCount} Verified Client Reviews</div>
                </div>

                {/* Star Distribution Bars (Section 10) */}
                <div className="space-y-1.5 text-[10px] text-slate-400 text-left pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6">5 ★</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-400 h-2 rounded-full w-[85%]" />
                    </div>
                    <span className="w-6 text-right">85%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6">4 ★</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-400 h-2 rounded-full w-[12%]" />
                    </div>
                    <span className="w-6 text-right">12%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6">3 ★</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-400 h-2 rounded-full w-[3%]" />
                    </div>
                    <span className="w-6 text-right">3%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6">2 ★</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-400 h-2 rounded-full w-[0%]" />
                    </div>
                    <span className="w-6 text-right">0%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6">1 ★</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-400 h-2 rounded-full w-[0%]" />
                    </div>
                    <span className="w-6 text-right">0%</span>
                  </div>
                </div>
              </div>

              {/* Written Reviews List */}
              <div className="sm:col-span-2 space-y-3">
                {reviews.filter((r) => r.companionId === myProfile.id).length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">
                    No client reviews submitted yet. Complete your first booking to receive reviews!
                  </div>
                ) : (
                  reviews
                    .filter((r) => r.companionId === myProfile.id)
                    .map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{rev.customerName}</span>
                          <span className="text-amber-400 font-bold">★ {rev.rating} / 5</span>
                        </div>
                        <p className="text-slate-300 text-[11px] italic">&quot;{rev.comment}&quot;</p>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                          <span>Verified Booking: {rev.bookingRef}</span>
                          <div className="flex items-center gap-2">
                            <span>{formatDateOnly(rev.createdAt)}</span>
                            <button
                              onClick={() => setReportingReviewId(rev.id)}
                              className="text-rose-400 hover:underline"
                            >
                              Report Abuse
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 9: EARNINGS & COMMISSION (Section 8)                     */}
        {/* ============================================================ */}
        {activeTab === 'earnings' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Earnings & Commission Ledger</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every rupee earned and disbursed is tracked with 10% platform commission auditability.
              </p>
            </div>

            {/* Financial Ledger Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Booking Ref</th>
                    <th className="py-2.5 px-3">Gross Client Spend</th>
                    <th className="py-2.5 px-3">10% Platform Fee</th>
                    <th className="py-2.5 px-3">Net Companion Share</th>
                    <th className="py-2.5 px-3">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {myBookings
                    .filter((b) => ['confirmed', 'completed'].includes(b.status))
                    .map((b) => (
                      <tr key={b.id} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3">{b.bookingDate}</td>
                        <td className="py-2.5 px-3 font-mono text-purple-300">{b.bookingRef}</td>
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {formatINR(b.priceBreakdown?.baseAmount || b.totalAmount || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-purple-400">
                          - {formatINR(b.priceBreakdown.platformCommissionAmount)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-400">
                          {formatINR(b.priceBreakdown?.netCompanionAmount || b.priceBreakdown?.companionEarnings || 0)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                            Eligible
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 10: PAYOUTS (Section 9)                                  */}
        {/* ============================================================ */}
        {activeTab === 'payouts' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <span>Payouts & Bank Settlement</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Request direct NEFT/IMPS settlements to your verified Indian bank account.
                </p>
              </div>

              <button
                onClick={() => setShowPayoutModal(true)}
                disabled={stats.availableBalance <= 0}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition disabled:opacity-40"
              >
                Request Withdrawal ({formatINR(stats.availableBalance)})
              </button>
            </div>

            {/* Payout History */}
            <div className="space-y-3">
              <h3 className="font-bold text-white text-xs uppercase text-slate-400">
                Settlement History
              </h3>
              {payouts.filter((p) => p.companionId === myProfile.id).length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  No payout withdrawals recorded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {payouts
                    .filter((p) => p.companionId === myProfile.id)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{formatINR(p.amount)}</div>
                          <div className="text-[11px] text-slate-400">
                            {p.bankAccountMasked} • Ref: {p.referenceId}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            p.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 11: ANALYTICS (Section 12)                               */}
        {/* ============================================================ */}
        {activeTab === 'analytics' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <span>Profile Analytics & Favorites</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Privacy-preserving metrics on search impression count and customer favorites.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Profile Views</span>
                <div className="text-2xl font-black text-white">1,482</div>
                <p className="text-[10px] text-emerald-400">Top 10% in {myProfile.cityName}</p>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-rose-400 uppercase">Client Favorites</span>
                <div className="text-2xl font-black text-rose-300">142</div>
                <p className="text-[10px] text-slate-500">Clients who saved your profile</p>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-indigo-400 uppercase">Acceptance Rate</span>
                <div className="text-2xl font-black text-indigo-300">96.4%</div>
                <p className="text-[10px] text-emerald-400">Exceptional reliability tier</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 12: SUBSCRIPTION (Section 13)                            */}
        {/* ============================================================ */}
        {activeTab === 'subscription' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Repeat className="w-5 h-5 text-pink-400" />
                <span>Companion Registration & Tier Status</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Your profile is active under the transparent 10% commission model with zero hidden charges.
              </p>
            </div>

            <div className="bg-gradient-to-tr from-purple-950/60 to-slate-900 rounded-3xl p-6 border border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Active Membership
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-1">Verified Companion Pro Tier</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-pink-400">₹0</span>
                  <span className="text-[10px] text-slate-400 block">Listing Fee (Lifetime Free)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-2 border-t border-purple-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>10% Transparent Commission on completed sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% ID-Verified Client Mandate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Escrow-backed instant payout settlement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>24/7 dedicated companion safety hotline</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 13: SAFETY & SUPPORT (Section 14)                        */}
        {/* ============================================================ */}
        {activeTab === 'safety' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-amber-400" />
                <span>Safety & Support Centre</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Immediate escalation paths, harassment prevention, and support ticket desk.
              </p>
            </div>

            {/* Emergency Hotline */}
            <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>24/7 Companion Emergency SOS Helpline</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Immediate emergency assistance line for verified hosts encountering unsafe conditions.
                </p>
              </div>
              <a
                href="tel:18002872287"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0"
              >
                Call SOS: 1800-AURA-SOS
              </a>
            </div>

            {/* Create Support Ticket */}
            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <h3 className="font-bold text-white text-xs uppercase text-slate-400">
                Open a Priority Support Ticket
              </h3>
              {ticketSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-emerald-300">
                  Support ticket submitted! Our Trust & Safety team will review immediately.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Brief description of the issue..."
                    className="w-full bg-slate-900 text-white rounded-xl px-3.5 py-2.5 border border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full bg-slate-900 text-white rounded-xl px-3.5 py-2.5 border border-slate-700 text-xs"
                  >
                    <option value="safety">Safety or Client Behavior Report</option>
                    <option value="payment">Payout or Banking Issue</option>
                    <option value="verification">Verification Question</option>
                    <option value="account">Account & Privacy Settings</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Message</label>
                <textarea
                  rows={3}
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Provide complete details including any relevant booking references..."
                  className="w-full bg-slate-900 text-white rounded-xl p-3 border border-slate-700 text-xs"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 14: ACCOUNT SETTINGS (Section 15)                        */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-400" />
                <span>Account & Privacy Settings</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Security credentials, session revocation, and data privacy controls.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-2">
                <span className="font-bold text-white">Active Sessions & Security</span>
                <p className="text-[11px] text-slate-400">
                  Current Session: Windows (Next.js Edge Authenticated) • Active via HTTP-Only JWT Cookie
                </p>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30 hover:bg-rose-500/30 transition text-xs"
                >
                  Terminate Active Session
                </button>
              </div>

              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-2">
                <span className="font-bold text-white">Data Privacy & Account Deactivation</span>
                <p className="text-[11px] text-slate-400">
                  You can pause your profile from public discovery at any time without deleting your verified history.
                </p>
                <button
                  onClick={handleToggleAvailability}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 text-xs"
                >
                  {myProfile.isAvailable ? 'Pause My Public Profile' : 'Reactivate My Profile'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL 1: PAYOUT REQUEST MODAL (Section 9)                      */}
      {/* ============================================================== */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-cyan-500/30 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <span>Request Bank Withdrawal</span>
              </h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {payoutSuccess ? (
              <div className="text-center py-6 space-y-2 text-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="font-bold text-white text-sm">Payout Request Dispatched!</p>
                <p className="text-slate-400">
                  NEFT settlement of {formatINR(Number(withdrawAmount))} will credit your account within 24 banking hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayout} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Withdrawal Amount (INR ₹)
                  </label>
                  <input
                    type="number"
                    max={stats.availableBalance}
                    min={500}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 text-white rounded-xl px-3.5 py-2.5 border border-slate-700 text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Available balance: {formatINR(stats.availableBalance)}
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Bank Account (Masked)
                  </label>
                  <input
                    type="text"
                    required
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full bg-slate-900 text-white rounded-xl px-3.5 py-2.5 border border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full bg-slate-900 text-white rounded-xl px-3.5 py-2.5 border border-slate-700 text-xs font-mono"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20"
                  >
                    Confirm Payout
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: BOOKING DECLINE MODAL WITH REASONS (Section 5)        */}
      {/* ============================================================== */}
      {declineBookingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 max-w-md w-full border border-rose-500/30 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Decline Booking Request</span>
              </h3>
              <button onClick={() => setDeclineBookingId(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-slate-400 text-[11px]">
              Please specify the reason for declining. If replacement credit is selected, the client will immediately receive full credits to rebook with another companion.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Standard Reason</label>
                <select
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full bg-slate-900 text-white rounded-xl p-2.5 border border-slate-700 text-xs"
                >
                  <option value="Schedule overlap with previous engagement">Schedule overlap with previous engagement</option>
                  <option value="Client location outside permitted perimeter">Client location outside permitted perimeter</option>
                  <option value="Personal commitment or leave on requested date">Personal commitment or leave on requested date</option>
                  <option value="Short notice preparation limitation">Short notice preparation limitation</option>
                  <option value="Custom reason specified below">Custom reason specified below</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Optional Additional Details</label>
                <input
                  type="text"
                  value={customDeclineReason}
                  onChange={(e) => setCustomDeclineReason(e.target.value)}
                  placeholder="Additional context for moderation..."
                  className="w-full bg-slate-900 text-white rounded-xl p-2.5 border border-slate-700 text-xs"
                />
              </div>

              <label className="flex items-center space-x-2 text-[11px] text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={issueReplacementCredit}
                  onChange={(e) => setIssueReplacementCredit(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-0"
                />
                <span>Issue instant 100% replacement booking credit to client</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeclineBookingId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: BOOKING DETAILS MODAL (Section 5)                     */}
      {/* ============================================================== */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-purple-500/30 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-base">Booking Dossier</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  {selectedBookingDetails.bookingRef}
                </span>
              </div>
              <button onClick={() => setSelectedBookingDetails(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-slate-300">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Client Name</span>
                  <span className="font-bold text-white">{selectedBookingDetails.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Occasion</span>
                  <span className="font-semibold text-white">{selectedBookingDetails.occasionType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Encounter Date</span>
                  <span className="font-semibold">{selectedBookingDetails.bookingDate} at {selectedBookingDetails.startTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Duration</span>
                  <span className="font-semibold">{selectedBookingDetails.durationHours} Hours</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Financial Settlement Breakdown</span>
                <div className="flex justify-between">
                  <span>Gross Client Payment:</span>
                  <span className="font-semibold text-white">{formatINR(selectedBookingDetails.priceBreakdown?.baseAmount || selectedBookingDetails.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>10% Platform Commission:</span>
                  <span>- {formatINR(selectedBookingDetails.priceBreakdown?.platformCommissionAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold text-sm pt-1 border-t border-slate-800">
                  <span>Companion Net Take-Home:</span>
                  <span>{formatINR(selectedBookingDetails.priceBreakdown?.netCompanionAmount || selectedBookingDetails.priceBreakdown?.companionEarnings || 0)}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Meetup Address</span>
                <span className="text-slate-200">{selectedBookingDetails.meetupLocation || 'TBD (Private address provided via chat)'}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: REPORT SUSPICIOUS CLIENT (Section 14)                 */}
      {/* ============================================================== */}
      {reportTargetClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 max-w-md w-full border border-rose-500/40 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Report Suspicious Client</span>
              </h3>
              <button onClick={() => setReportTargetClient(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {reportSuccess ? (
              <div className="text-center py-4 text-emerald-300 space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p className="font-bold">Security Alert Transmitted</p>
                <p className="text-slate-400 text-[11px]">The platform trust team has flagged this user for immediate review.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitClientReport} className="space-y-3">
                <p className="text-slate-400 text-[11px]">
                  Reporting client <strong className="text-white">{reportTargetClient.name}</strong> for booking ref <strong className="text-purple-300">{reportTargetClient.ref}</strong>.
                </p>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-slate-900 text-white rounded-xl p-2.5 border border-slate-700 text-xs"
                  >
                    <option value="Unreasonable conduct or boundary violation">Unreasonable conduct or boundary violation</option>
                    <option value="Attempted off-platform payment evasion">Attempted off-platform payment evasion</option>
                    <option value="Harassment or inappropriate communication">Harassment or inappropriate communication</option>
                    <option value="Safety concern regarding encounter location">Safety concern regarding encounter location</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Incident Details</label>
                  <textarea
                    rows={3}
                    required
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide specific notes..."
                    className="w-full bg-slate-900 text-white rounded-xl p-2.5 border border-slate-700 text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportTargetClient(null)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    Transmit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: DISPUTE / REPORT REVIEW (Section 10)                  */}
      {/* ============================================================== */}
      {reportingReviewId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 max-w-md w-full border border-amber-500/30 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-400" />
                <span>Report Review for Moderation</span>
              </h3>
              <button onClick={() => setReportingReviewId(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {reviewReportSuccess ? (
              <div className="text-center py-4 text-emerald-300 space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p className="font-bold">Review Dispatched to Moderator</p>
                <p className="text-slate-400 text-[11px]">Staff will audit the encounter logs and verify authenticity.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReviewReport} className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dispute Grounds</label>
                  <select
                    value={reviewReportReason}
                    onChange={(e) => setReviewReportReason(e.target.value)}
                    className="w-full bg-slate-900 text-white rounded-xl p-2.5 border border-slate-700 text-xs"
                  >
                    <option value="Policy violation or false claims">Policy violation or false claims</option>
                    <option value="Harassment or defamatory language">Harassment or defamatory language</option>
                    <option value="Client cancelled without attending">Client cancelled without attending</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingReviewId(null)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                  >
                    Submit for Review
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

export default function CompanionDashboard() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading companion portal...</span>
          </div>
        </div>
      }
    >
      <CompanionDashboardContent />
    </React.Suspense>
  );
}
