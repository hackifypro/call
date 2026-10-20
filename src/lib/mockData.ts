import {
  CompanionProfile,
  BookingRequest,
  ReviewRecord,
  CommissionLedgerEntry,
  FeatureSettings,
  User,
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

/**
 * Super Administrator initial seed
 * Zero fake users: Only authorized platform administrator credentials.
 */
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@aura-india.com',
    phoneNumber: '+919811000001',
    phoneVerified: true,
    fullName: 'Platform Administrator',
    role: 'admin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

/**
 * Platform Governance & Feature Settings
 */
export const INITIAL_FEATURE_SETTINGS: FeatureSettings = {
  platformCommissionRate: 10, // 10% Platform commission strictly enforced
  registrationFee: 0, // Free launch promotion
  isRegistrationFree: true,
  autoApproveCompanions: false, // Strict manual verification queue
  maintenanceMode: false,
  minBookingDuration: 1, // 1 hour minimum
  maxBookingDuration: 8, // 8 hours maximum
  allowInstantBooking: false, // Companion acceptance required
  enableReviews: true,
  enableReplacementCredit: true,
  platformContactEmail: 'trust@aura-india.com',
  emergencyHelplineNumber: '+91 1800-209-AURA (2872)',
};

/**
 * Genuine Production Data Stores
 * All fabricated fake mock profiles, bookings, reviews, and fake financial records are permanently removed.
 * Only genuine database records created by real registered users will be loaded.
 */
export const INITIAL_COMPANIONS: CompanionProfile[] = [];
export const INITIAL_BOOKINGS: BookingRequest[] = [];
export const INITIAL_REVIEWS: ReviewRecord[] = [];
export const INITIAL_COMMISSION_LEDGER: CommissionLedgerEntry[] = [];
export const INITIAL_VERIFICATIONS: VerificationRecord[] = [];
export const INITIAL_BOOKING_CREDITS: BookingCredit[] = [];
export const INITIAL_PAYOUTS: PayoutRecord[] = [];
export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [];
export const INITIAL_NOTIFICATIONS: NotificationRecord[] = [];
export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [];
export const INITIAL_CONVERSATIONS: ChatConversation[] = [];
export const INITIAL_MESSAGES: ChatMessage[] = [];
export const INITIAL_COUPONS: CouponCode[] = [];
