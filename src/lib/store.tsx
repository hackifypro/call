'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  CompanionProfile,
  BookingRequest,
  ReviewRecord,
  CommissionLedgerEntry,
  FeatureSettings,
  VerificationRecord,
  BookingCredit,
  PayoutRecord,
  AdminAuditLog,
  NotificationRecord,
  SupportTicket,
  ChatConversation,
  ChatMessage,
  CouponCode,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_COMPANIONS,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
  INITIAL_COMMISSION_LEDGER,
  INITIAL_FEATURE_SETTINGS,
  INITIAL_VERIFICATIONS,
  INITIAL_BOOKING_CREDITS,
  INITIAL_PAYOUTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_COUPONS,
} from './mockData';
import { calculateBookingBreakdown, generateBookingRef } from './utils';

interface PlatformStoreContextType {
  // Current session
  currentRole: UserRole;
  currentUser: User;
  switchRole: (role: UserRole) => void;

  // Data
  companions: CompanionProfile[];
  bookings: BookingRequest[];
  reviews: ReviewRecord[];
  commissionLedger: CommissionLedgerEntry[];
  featureSettings: FeatureSettings;
  verifications: VerificationRecord[];
  bookingCredits: BookingCredit[];
  payouts: PayoutRecord[];
  auditLogs: AdminAuditLog[];
  favorites: string[];
  recentlyViewed: string[];
  notifications: NotificationRecord[];
  supportTickets: SupportTicket[];
  conversations: ChatConversation[];
  messages: ChatMessage[];
  coupons: CouponCode[];

  // Actions
  toggleFavorite: (companionId: string) => void;
  recordView: (companionId: string) => void;
  createBooking: (params: {
    companionId: string;
    bookingDate: string;
    startTime: string;
    durationHours: number;
    cityName: string;
    meetupLocation: string;
    occasionType: string;
    specialNotes?: string;
    useCredit?: boolean;
    couponCode?: string;
    paymentMethod: string;
  }) => { success: boolean; booking?: BookingRequest; error?: string };
  acceptBooking: (bookingId: string) => void;
  rejectBooking: (bookingId: string, reason: string, issueCreditInsteadOfRefund?: boolean) => void;
  completeBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string, reason: string, cancelledBy: 'customer' | 'companion' | 'admin') => void;
  submitReview: (bookingId: string, rating: number, comment: string) => { success: boolean; error?: string };
  registerCompanion: (data: Partial<CompanionProfile> & {
    legalNamePrivate: string;
    documentType: 'Aadhaar' | 'Passport' | 'Voter ID' | 'Driving License';
    documentNumberMasked: string;
  }) => { success: boolean; companionId?: string };
  approveCompanion: (companionId: string, notes?: string) => void;
  rejectCompanionProfile: (companionId: string, reason: string) => void;
  updateCompanionProfile: (companionId: string, updates: Partial<CompanionProfile>) => void;
  updateFeatureSettings: (settings: Partial<FeatureSettings>) => void;
  requestPayout: (companionId: string, amount: number, bankAccountMasked: string, ifscCode: string) => void;
  approvePayout: (payoutId: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<NotificationRecord, 'id' | 'createdAt'>) => void;
  createSupportTicket: (ticket: {
    subject: string;
    category: SupportTicket['category'];
    message: string;
  }) => { success: boolean; ticketRef: string };
  addTicketReply: (ticketId: string, message: string, isStaff?: boolean) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  sendChatMessage: (conversationId: string, messageText: string) => void;
  applyCoupon: (code: string, bookingAmount: number) => { valid: boolean; discountAmount: number; error?: string };
  deleteAccount: (userId: string) => { success: boolean };
  resetToDefaults: () => void;
}

const PlatformStoreContext = createContext<PlatformStoreContextType | null>(null);

const STORAGE_KEY = 'aura_platform_prod_v3_store';

export function PlatformStoreProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  // States
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [companions, setCompanions] = useState<CompanionProfile[]>(INITIAL_COMPANIONS);
  const [bookings, setBookings] = useState<BookingRequest[]>(INITIAL_BOOKINGS);
  const [reviews, setReviews] = useState<ReviewRecord[]>(INITIAL_REVIEWS);
  const [commissionLedger, setCommissionLedger] = useState<CommissionLedgerEntry[]>(INITIAL_COMMISSION_LEDGER);
  const [featureSettings, setFeatureSettings] = useState<FeatureSettings>(INITIAL_FEATURE_SETTINGS);
  const [verifications, setVerifications] = useState<VerificationRecord[]>(INITIAL_VERIFICATIONS);
  const [bookingCredits, setBookingCredits] = useState<BookingCredit[]>(INITIAL_BOOKING_CREDITS);
  const [payouts, setPayouts] = useState<PayoutRecord[]>(INITIAL_PAYOUTS);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>(INITIAL_NOTIFICATIONS);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [coupons, setCoupons] = useState<CouponCode[]>(INITIAL_COUPONS);

  // Load from LocalStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.companions) setCompanions(parsed.companions);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.reviews) setReviews(parsed.reviews);
        if (parsed.commissionLedger) setCommissionLedger(parsed.commissionLedger);
        if (parsed.featureSettings) setFeatureSettings(parsed.featureSettings);
        if (parsed.verifications) setVerifications(parsed.verifications);
        if (parsed.bookingCredits) setBookingCredits(parsed.bookingCredits);
        if (parsed.payouts) setPayouts(parsed.payouts);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.favorites) setFavorites(parsed.favorites);
        if (parsed.recentlyViewed) setRecentlyViewed(parsed.recentlyViewed);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.supportTickets) setSupportTickets(parsed.supportTickets);
        if (parsed.conversations) setConversations(parsed.conversations);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.coupons) setCoupons(parsed.coupons);
        if (parsed.currentRole) {
          setCurrentRole(parsed.currentRole);
          const foundUser = INITIAL_USERS.find((u) => u.role === parsed.currentRole) || INITIAL_USERS[0];
          setCurrentUser(foundUser);
        }
      }
    } catch {
      // Fallback to initial seed
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const payload = {
        currentRole,
        companions,
        bookings,
        reviews,
        commissionLedger,
        featureSettings,
        verifications,
        bookingCredits,
        payouts,
        auditLogs,
        favorites,
        recentlyViewed,
        notifications,
        supportTickets,
        conversations,
        messages,
        coupons,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [
    isLoaded,
    currentRole,
    companions,
    bookings,
    reviews,
    commissionLedger,
    featureSettings,
    verifications,
    bookingCredits,
    payouts,
    auditLogs,
    favorites,
    recentlyViewed,
    notifications,
    supportTickets,
    conversations,
    messages,
    coupons,
  ]);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const targetUser = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(targetUser);
  };

  const toggleFavorite = (companionId: string) => {
    setFavorites((prev) =>
      prev.includes(companionId) ? prev.filter((id) => id !== companionId) : [...prev, companionId]
    );
  };

  const recordView = (companionId: string) => {
    setRecentlyViewed((prev) => [companionId, ...prev.filter((id) => id !== companionId)].slice(0, 10));
  };

  const createBooking = (params: {
    companionId: string;
    bookingDate: string;
    startTime: string;
    durationHours: number;
    cityName: string;
    meetupLocation: string;
    occasionType: string;
    specialNotes?: string;
    useCredit?: boolean;
    paymentMethod: string;
  }) => {
    const companion = companions.find((c) => c.id === params.companionId);
    if (!companion) {
      return { success: false, error: 'Companion profile not found.' };
    }
    if (companion.status !== 'approved') {
      return { success: false, error: 'Only approved companions can receive bookings.' };
    }

    // Check replacement credits
    let creditAmountToApply = 0;
    let appliedCreditId: string | undefined = undefined;

    if (params.useCredit) {
      const availableCredit = bookingCredits.find(
        (c) => c.userId === currentUser.id && c.status === 'available'
      );
      if (availableCredit) {
        creditAmountToApply = availableCredit.creditAmount;
        appliedCreditId = availableCredit.id;
      }
    }

    // Calculate server-side breakdown with 10% platform commission
    const breakdown = calculateBookingBreakdown(
      companion.hourlyRate,
      params.durationHours,
      featureSettings.platformCommissionRate,
      creditAmountToApply
    );

    const bookingRef = generateBookingRef();
    const newBookingId = `bk-${Date.now()}`;

    const newBooking: BookingRequest = {
      id: newBookingId,
      bookingRef,
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      customerPhone: currentUser.phoneNumber,
      customerEmail: currentUser.email,
      companionId: companion.id,
      companionDisplayName: companion.displayName,
      companionPhotoUrl: companion.primaryPhotoUrl,
      bookingDate: params.bookingDate,
      startTime: params.startTime,
      durationHours: params.durationHours,
      cityName: params.cityName,
      meetupLocation: params.meetupLocation,
      occasionType: params.occasionType,
      specialNotes: params.specialNotes,
      priceBreakdown: breakdown,
      status: 'pending_acceptance', // Companion must accept/confirm
      paymentId: `pay-${Date.now()}`,
      paymentMethod: params.paymentMethod,
      creditUsedId: appliedCreditId,
      hasReview: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update state atomically
    setBookings((prev) => [newBooking, ...prev]);

    // Ensure conversation exists for in-app messaging
    const existingConv = conversations.find(
      (c) => c.companionId === companion.id && c.customerId === currentUser.id
    );
    if (!existingConv) {
      const newConv: ChatConversation = {
        id: `conv-${newBookingId}`,
        bookingId: newBookingId,
        bookingRef,
        customerId: currentUser.id,
        customerName: currentUser.fullName,
        companionId: companion.id,
        companionName: companion.displayName,
        companionPhoto: companion.primaryPhotoUrl,
        lastMessage: `Booking request ${bookingRef} created for ${params.bookingDate}`,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1,
      };
      setConversations((prev) => [newConv, ...prev]);
    }

    // Customer Notification
    const custNotif: NotificationRecord = {
      id: `notif-${Date.now()}-c`,
      userId: currentUser.id,
      title: 'Booking Request Submitted',
      message: `Your booking request ${bookingRef} for ${companion.displayName} (${params.durationHours} hrs in ${params.cityName}) has been submitted with escrow payment authorization.`,
      type: 'booking',
      link: '/dashboard/customer',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Companion Notification
    const compNotif: NotificationRecord = {
      id: `notif-${Date.now()}-p`,
      userId: companion.userId,
      title: 'New Booking Request Received',
      message: `${currentUser.fullName} requested a ${params.durationHours}-hour booking on ${params.bookingDate} at ${params.startTime} in ${params.cityName}. Review and accept in your dashboard.`,
      type: 'booking',
      link: '/dashboard/companion',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [custNotif, compNotif, ...prev]);

    // Mark credit as redeemed if used
    if (appliedCreditId) {
      setBookingCredits((prev) =>
        prev.map((c) =>
          c.id === appliedCreditId
            ? { ...c, status: 'redeemed', redeemedInBookingId: newBookingId }
            : c
        )
      );
    }

    // Record in Commission Ledger (10% Platform fee tracking)
    const ledgerEntry: CommissionLedgerEntry = {
      id: `ledg-${Date.now()}`,
      bookingId: newBookingId,
      bookingRef,
      transactionType: 'commission_credit',
      amount: breakdown.platformCommissionAmount,
      ratePercentage: breakdown.platformCommissionRate,
      balanceAfter:
        (commissionLedger[0]?.balanceAfter || 24700) + breakdown.platformCommissionAmount,
      notes: `10% Platform commission on booking ${bookingRef} in ${params.cityName}`,
      createdAt: new Date().toISOString(),
    };
    setCommissionLedger((prev) => [ledgerEntry, ...prev]);

    // Update companion's total request counter
    setCompanions((prev) =>
      prev.map((c) =>
        c.id === companion.id
          ? {
              ...c,
              totalRequests: c.totalRequests + 1,
            }
          : c
      )
    );

    // Audit log
    const audit: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminEmail: 'system@aura-india.com',
      action: 'BOOKING_CREATED_AND_PAID',
      targetType: 'booking_request',
      targetId: newBookingId,
      details: `Created booking ${bookingRef} for ₹${breakdown.totalPayableByCustomer} with 10% commission ₹${breakdown.platformCommissionAmount}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    return { success: true, booking: newBooking };
  };

  const acceptBooking = (bookingId: string) => {
    let targetBooking: BookingRequest | undefined;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        targetBooking = b;
        return {
          ...b,
          status: 'confirmed',
          acceptedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          companionPhone: '+919876543210',
        };
      })
    );

    const booking = targetBooking || bookings.find((b) => b.id === bookingId);
    if (booking) {
      setCompanions((prev) =>
        prev.map((c) =>
          c.id === booking.companionId
            ? {
                ...c,
                acceptedBookings: c.acceptedBookings + 1,
              }
            : c
        )
      );

      // Notify customer
      const notif: NotificationRecord = {
        id: `notif-${Date.now()}`,
        userId: booking.customerId,
        title: 'Booking Accepted & Confirmed!',
        message: `${booking.companionDisplayName} has accepted your booking request (${booking.bookingRef}). Authorized contact number is now unlocked.`,
        type: 'booking',
        link: '/dashboard/customer',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const rejectBooking = (
    bookingId: string,
    reason: string,
    issueCreditInsteadOfRefund: boolean = false
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          status: issueCreditInsteadOfRefund ? 'refunded' : 'refund_pending',
          cancelledAt: new Date().toISOString(),
          cancellationReason: reason,
          cancelledBy: 'companion',
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Section 11: Option A (Refund to source) OR Option B (Replacement Credit)
    if (issueCreditInsteadOfRefund) {
      const newCredit: BookingCredit = {
        id: `crd-${Date.now()}`,
        userId: booking.customerId,
        creditAmount: booking.priceBreakdown.totalPayableByCustomer,
        originalBookingId: booking.id,
        reason: `Replacement Booking Credit (Companion declined: ${reason})`,
        status: 'available',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      setBookingCredits((prev) => [newCredit, ...prev]);
    }

    // Reverse Commission in Ledger
    const ledgerEntry: CommissionLedgerEntry = {
      id: `ledg-${Date.now()}`,
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      transactionType: 'commission_refund',
      amount: -booking.priceBreakdown.platformCommissionAmount,
      ratePercentage: booking.priceBreakdown.platformCommissionRate,
      balanceAfter:
        (commissionLedger[0]?.balanceAfter || 24700) -
        booking.priceBreakdown.platformCommissionAmount,
      notes: `Reversal of 10% platform commission due to companion declination`,
      createdAt: new Date().toISOString(),
    };
    setCommissionLedger((prev) => [ledgerEntry, ...prev]);

    setCompanions((prev) =>
      prev.map((c) =>
        c.id === booking.companionId
          ? {
              ...c,
              rejectedRequests: c.rejectedRequests + 1,
            }
          : c
      )
    );
  };

  const completeBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          status: 'completed',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Update Companion Verified Statistics & Earnings
    setCompanions((prev) =>
      prev.map((c) => {
        if (c.id !== booking.companionId) return c;
        const newCompleted = c.completedBookings + 1;
        const newGross = c.grossEarnings + booking.priceBreakdown.baseAmount;
        const newCommission =
          c.totalCommissionPaid + booking.priceBreakdown.platformCommissionAmount;
        const newNet = c.netEligibleEarnings + booking.priceBreakdown.netCompanionAmount;
        return {
          ...c,
          completedBookings: newCompleted,
          grossEarnings: newGross,
          totalCommissionPaid: newCommission,
          netEligibleEarnings: newNet,
        };
      })
    );
  };

  const cancelBooking = (
    bookingId: string,
    reason: string,
    cancelledBy: 'customer' | 'companion' | 'admin'
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancellationReason: reason,
          cancelledBy,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Update companion cancellations
    setCompanions((prev) =>
      prev.map((c) =>
        c.id === booking.companionId
          ? {
              ...c,
              cancelledBookings: c.cancelledBookings + 1,
            }
          : c
      )
    );
  };

  const submitReview = (bookingId: string, rating: number, comment: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return { success: false, error: 'Booking record not found.' };
    }
    if (booking.status !== 'completed') {
      return { success: false, error: 'Only completed bookings can be reviewed.' };
    }
    if (booking.hasReview) {
      return { success: false, error: 'A review has already been submitted for this booking.' };
    }

    const newReview: ReviewRecord = {
      id: `rev-${Date.now()}`,
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      companionId: booking.companionId,
      companionDisplayName: booking.companionDisplayName,
      rating: Math.max(1, Math.min(5, Math.round(rating))),
      comment,
      isVerified: true, // genuine completed booking
      isFlagged: false,
      createdAt: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);

    // Mark booking as having a review
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, hasReview: true } : b))
    );

    // Compute updated average rating for companion strictly from all reviews
    const companionAllReviews = [
      newReview,
      ...reviews.filter((r) => r.companionId === booking.companionId),
    ];
    const totalScore = companionAllReviews.reduce((sum, r) => sum + r.rating, 0);
    const newAverage = Number((totalScore / companionAllReviews.length).toFixed(2));

    setCompanions((prev) =>
      prev.map((c) =>
        c.id === booking.companionId
          ? {
              ...c,
              reviewCount: companionAllReviews.length,
              averageRating: newAverage,
            }
          : c
      )
    );

    return { success: true };
  };

  const registerCompanion = (
    data: Partial<CompanionProfile> & {
      legalNamePrivate: string;
      documentType: 'Aadhaar' | 'Passport' | 'Voter ID' | 'Driving License';
      documentNumberMasked: string;
    }
  ) => {
    const newId = `comp-${Date.now()}`;
    const newCompanion: CompanionProfile = {
      id: newId,
      userId: currentUser.id,
      displayName: data.displayName || 'Companion',
      legalNamePrivate: data.legalNamePrivate,
      age: data.age || 24,
      gender: data.gender || 'Female',
      bio: data.bio || '',
      interests: data.interests || ['Fine Dining', 'City Exploration'],
      languages: data.languages || ['English', 'Hindi'],
      stateId: data.stateId || 1,
      stateName: data.stateName || 'Maharashtra',
      stateSlug: data.stateSlug || 'maharashtra',
      cityId: data.cityId || 101,
      cityName: data.cityName || 'Mumbai',
      citySlug: data.citySlug || 'mumbai',
      supportedCities: data.supportedCities || [data.cityName || 'Mumbai'],
      primaryPhotoUrl:
        data.primaryPhotoUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      galleryPhotos: [
        data.primaryPhotoUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      ],
      hourlyRate: data.hourlyRate || 2000,
      halfDayRate: (data.hourlyRate || 2000) * 3.5,
      fullDayRate: (data.hourlyRate || 2000) * 6.5,
      permittedDurations: [1, 2, 4, 8],
      status: featureSettings.autoApproveCompanions ? 'approved' : 'pending_approval',
      isAvailable: true,
      availabilitySchedule: [
        { day: 'Friday', startTime: '18:00', endTime: '23:00', active: true },
        { day: 'Saturday', startTime: '12:00', endTime: '23:00', active: true },
        { day: 'Sunday', startTime: '12:00', endTime: '21:00', active: true },
      ],
      averageRating: 0,
      reviewCount: 0,
      totalRequests: 0,
      acceptedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      rejectedRequests: 0,
      grossEarnings: 0,
      totalCommissionPaid: 0,
      netEligibleEarnings: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCompanions((prev) => [newCompanion, ...prev]);

    // Create private verification record
    const newVerification: VerificationRecord = {
      id: `ver-${Date.now()}`,
      userId: currentUser.id,
      profileId: newId,
      documentType: data.documentType,
      documentNumberMasked: data.documentNumberMasked,
      documentImageUrl:
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      selfieImageUrl: newCompanion.primaryPhotoUrl,
      age: data.age || 24,
      isAdultVerified: true,
      status: 'pending',
      reviewerNotes: 'New companion registered. Pending adult age and document check by Trust & Safety admin.',
      createdAt: new Date().toISOString(),
    };
    setVerifications((prev) => [newVerification, ...prev]);

    // Audit log
    const audit: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminEmail: 'system@aura-india.com',
      action: 'NEW_COMPANION_REGISTRATION_SUBMITTED',
      targetType: 'companion_profile',
      targetId: newId,
      details: `Companion ${newCompanion.displayName} in ${newCompanion.cityName} submitted verification documentation.`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    return { success: true, companionId: newId };
  };

  const approveCompanion = (companionId: string, notes?: string) => {
    setCompanions((prev) =>
      prev.map((c) =>
        c.id === companionId ? { ...c, status: 'approved', isAvailable: true } : c
      )
    );

    setVerifications((prev) =>
      prev.map((v) =>
        v.profileId === companionId
          ? {
              ...v,
              status: 'approved',
              reviewerNotes: notes || 'Verified official document and adult consent. Approved.',
              reviewedAt: new Date().toISOString(),
            }
          : v
      )
    );

    const audit: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminEmail: currentUser.email || 'compliance@aura-india.com',
      action: 'COMPANION_APPROVAL_GRANTED',
      targetType: 'companion_profile',
      targetId: companionId,
      details: `Profile approved for public discovery. Notes: ${notes || 'Verified.'}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const rejectCompanionProfile = (companionId: string, reason: string) => {
    setCompanions((prev) =>
      prev.map((c) =>
        c.id === companionId
          ? { ...c, status: 'rejected', rejectionReason: reason, isAvailable: false }
          : c
      )
    );

    setVerifications((prev) =>
      prev.map((v) =>
        v.profileId === companionId
          ? {
              ...v,
              status: 'rejected',
              reviewerNotes: reason,
              reviewedAt: new Date().toISOString(),
            }
          : v
      )
    );

    const audit: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminEmail: currentUser.email || 'compliance@aura-india.com',
      action: 'COMPANION_APPLICATION_REJECTED',
      targetType: 'companion_profile',
      targetId: companionId,
      details: `Application declined. Reason: ${reason}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const updateCompanionProfile = (companionId: string, updates: Partial<CompanionProfile>) => {
    setCompanions((prev) =>
      prev.map((c) =>
        c.id === companionId
          ? { ...c, ...updates, updatedAt: new Date().toISOString() }
          : c
      )
    );
  };

  const updateFeatureSettings = (settings: Partial<FeatureSettings>) => {
    setFeatureSettings((prev) => ({ ...prev, ...settings }));
    const audit: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminEmail: currentUser.email || 'compliance@aura-india.com',
      action: 'SETTINGS_UPDATED',
      targetType: 'feature_settings',
      targetId: 'platform_config',
      details: JSON.stringify(settings),
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const requestPayout = (
    companionId: string,
    amount: number,
    bankAccountMasked: string,
    ifscCode: string
  ) => {
    const companion = companions.find((c) => c.id === companionId);
    if (!companion) return;

    const newPayout: PayoutRecord = {
      id: `payo-${Date.now()}`,
      companionId,
      companionDisplayName: companion.displayName,
      amount,
      bankAccountMasked,
      ifscCode,
      referenceId: `NEFT-${Date.now().toString().slice(-6)}`,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    setPayouts((prev) => [newPayout, ...prev]);
  };

  const approvePayout = (payoutId: string) => {
    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? { ...p, status: 'completed', paidAt: new Date().toISOString() }
          : p
      )
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const addNotification = (notif: Omit<NotificationRecord, 'id' | 'createdAt'>) => {
    const newNotif: NotificationRecord = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const createSupportTicket = (ticket: {
    subject: string;
    category: any;
    message: string;
  }) => {
    const ticketRef = `TKT-${Date.now().toString().slice(-6)}`;
    const newTicket: any = {
      id: `tkt-${Date.now()}`,
      ticketRef,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userEmail: currentUser.email,
      category: ticket.category,
      subject: ticket.subject,
      status: 'open',
      priority: 'normal',
      messages: [
        {
          id: `tmsg-${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.fullName,
          message: ticket.message,
          timestamp: new Date().toISOString(),
          isStaff: false,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    return { success: true, ticketRef };
  };

  const addTicketReply = (ticketId: string, message: string, isStaff: boolean = false) => {
    setSupportTickets((prev) =>
      prev.map((t: any) => {
        if (t.id === ticketId) {
          const newMsg = {
            id: `tmsg-${Date.now()}`,
            senderId: currentUser.id,
            senderName: isStaff ? 'Support Specialist' : currentUser.fullName,
            message,
            timestamp: new Date().toISOString(),
            isStaff,
          };
          return {
            ...t,
            messages: [...t.messages, newMsg],
            status: isStaff ? 'waiting_for_user' : 'in_progress',
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const updateTicketStatus = (ticketId: string, status: any) => {
    setSupportTickets((prev) =>
      prev.map((t: any) => (t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );
  };

  const sendChatMessage = (conversationId: string, messageText: string) => {
    const newMsg: any = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      text: messageText,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setConversations((prev) =>
      prev.map((c: any) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: messageText,
              lastMessageTimestamp: new Date().toISOString(),
              unreadCount: (c.unreadCount || 0) + 1,
            }
          : c
      )
    );
  };

  const applyCoupon = (code: string, bookingAmount: number) => {
    const match = coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
    );
    if (!match) {
      return { valid: false, discountAmount: 0, error: 'Invalid or expired coupon code' };
    }
    if (bookingAmount < match.minBookingValue) {
      return { valid: false, discountAmount: 0, error: `Minimum booking value of ₹${match.minBookingValue} required` };
    }
    const rawDiscount = Math.round((bookingAmount * match.discountPercentage) / 100);
    const discount = Math.min(rawDiscount, match.maxDiscount);
    return { valid: true, discountAmount: discount };
  };

  const deleteAccount = (userId: string) => {
    setCompanions((prev) => prev.filter((c) => c.userId !== userId));
    return { success: true };
  };

  const resetToDefaults = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setCompanions(INITIAL_COMPANIONS);
    setBookings(INITIAL_BOOKINGS);
    setReviews(INITIAL_REVIEWS);
    setCommissionLedger(INITIAL_COMMISSION_LEDGER);
    setFeatureSettings(INITIAL_FEATURE_SETTINGS);
    setVerifications(INITIAL_VERIFICATIONS);
    setBookingCredits(INITIAL_BOOKING_CREDITS);
    setPayouts(INITIAL_PAYOUTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setFavorites(['comp-101', 'comp-103']);
    setRecentlyViewed(['comp-101', 'comp-102']);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSupportTickets(INITIAL_SUPPORT_TICKETS);
    setConversations(INITIAL_CONVERSATIONS);
    setMessages(INITIAL_MESSAGES);
    setCoupons(INITIAL_COUPONS);
    setCurrentRole('customer');
    setCurrentUser(INITIAL_USERS[0]);
  };

  return (
    <PlatformStoreContext.Provider
      value={{
        currentRole,
        currentUser,
        switchRole,
        companions,
        bookings,
        reviews,
        commissionLedger,
        featureSettings,
        verifications,
        bookingCredits,
        payouts,
        auditLogs,
        favorites,
        recentlyViewed,
        notifications,
        supportTickets,
        conversations,
        messages,
        coupons,
        toggleFavorite,
        recordView,
        createBooking,
        acceptBooking,
        rejectBooking,
        completeBooking,
        cancelBooking,
        submitReview,
        registerCompanion,
        approveCompanion,
        rejectCompanionProfile,
        updateCompanionProfile,
        updateFeatureSettings,
        requestPayout,
        approvePayout,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        createSupportTicket,
        addTicketReply,
        updateTicketStatus,
        sendChatMessage,
        applyCoupon,
        deleteAccount,
        resetToDefaults,
      }}
    >
      {children}
    </PlatformStoreContext.Provider>
  );
}

export function usePlatformStore() {
  const context = useContext(PlatformStoreContext);
  if (!context) {
    throw new Error('usePlatformStore must be used within a PlatformStoreProvider');
  }
  return context;
}
