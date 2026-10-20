export type UserRole = 
  | 'guest'
  | 'customer'
  | 'companion'
  | 'admin'
  | 'support'
  | 'moderator'
  | 'finance'
  | 'super_admin';

export type AdminRole = 'admin' | 'support' | 'moderator' | 'finance' | 'super_admin';

export const ADMIN_ROLES: UserRole[] = ['admin', 'support', 'moderator', 'finance', 'super_admin'];

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  avatarUrl?: string;
}

export type CompanionStatus = 
  | 'draft'
  | 'pending_verification'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'deactivated';

export type BookingStatus =
  | 'pending_payment'
  | 'payment_authorized'
  | 'pending_acceptance'
  | 'accepted'
  | 'rejected'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded';

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  phoneVerified: boolean;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  passwordHash?: string;
  createdAt: string;
}

export interface StateData {
  id: number;
  name: string;
  slug: string;
  code: string;
  tier?: number;
  cities?: CityData[];
}

export interface CityData {
  id: number;
  stateId: number;
  stateName: string;
  stateSlug: string;
  name: string;
  slug: string;
  tier: 1 | 2 | 3;
  latitude: number;
  longitude: number;
  metaDescription: string;
  popularAreas: string[];
  nearbyCities: { name: string; slug: string; stateSlug: string }[];
  isServed: boolean; // Computed dynamically: true only if approved profiles exist
}

export interface ProfilePhoto {
  id: string;
  profileId: string;
  url: string;
  isPrimary: boolean;
  isApproved: boolean;
  caption?: string;
}

export interface VerificationRecord {
  id: string;
  userId: string;
  profileId: string;
  documentType: 'Aadhaar' | 'Passport' | 'Voter ID' | 'Driving License';
  documentNumberMasked: string;
  documentImageUrl: string;
  selfieImageUrl: string;
  age: number;
  isAdultVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  reviewerNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface CompanionProfile {
  id: string;
  userId: string;
  displayName: string;
  legalNamePrivate: string; // Stored securely, never publicly displayed
  age: number;
  gender: 'Female' | 'Male' | 'Non-Binary';
  bio: string;
  interests: string[];
  languages: string[];
  stateId: number;
  stateName: string;
  stateSlug: string;
  cityId: number;
  cityName: string;
  citySlug: string;
  supportedCities: string[];
  primaryPhotoUrl: string;
  galleryPhotos: string[];
  
  // Pricing & Permitted Durations
  hourlyRate: number; // in INR ₹
  halfDayRate?: number;
  fullDayRate?: number;
  permittedDurations: number[]; // [1, 2, 4, 8] hours
  
  // Status & Availability
  status: CompanionStatus;
  rejectionReason?: string;
  isAvailable: boolean;
  availabilitySchedule: {
    day: string; // 'Monday', etc.
    startTime: string;
    endTime: string;
    active: boolean;
  }[];
  blockedDates?: string[];
  profileViews?: number;

  // Verified Database Statistics (Strictly server computed, never user input)
  averageRating: number;
  rating?: number;
  isVerified?: boolean;
  reviewCount: number;
  totalRequests: number;
  acceptedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  rejectedRequests: number;
  
  // Financial totals
  grossEarnings: number;
  totalCommissionPaid: number;
  netEligibleEarnings: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface BookingPriceBreakdown {
  baseAmount: number;
  durationHours: number;
  platformCommissionRate: number; // default 10%
  platformCommissionAmount: number;
  taxAmount: number; // GST if applicable
  totalPayableByCustomer: number;
  netCompanionAmount: number;
  creditApplied?: number;
  finalPaidByCustomer: number;
  companionEarnings?: number;
}

export interface BookingRequest {
  id: string;
  bookingRef: string; // e.g. BK-20261020-XXXX
  customerId: string;
  customerName: string;
  customerPhone?: string; // Only shown when accepted/confirmed
  customerEmail?: string;
  companionId: string;
  companionDisplayName: string;
  companionPhone?: string; // Only shown when accepted/confirmed
  companionPhotoUrl: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationHours: number;
  cityName: string;
  meetupLocation: string;
  occasionType: string;
  specialNotes?: string;
  
  priceBreakdown: BookingPriceBreakdown;
  status: BookingStatus;
  
  totalAmount?: number;
  platformCommission?: number;
  
  paymentId?: string;
  paymentMethod?: string;
  refundId?: string;
  creditUsedId?: string;
  
  // Timestamp tracking
  acceptedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'companion' | 'admin' | 'system';
  
  hasReview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  currency: string;
  provider: 'Razorpay' | 'UPI' | 'Direct Gateway';
  transactionRef: string;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  method: string;
  createdAt: string;
}

export interface RefundRecord {
  id: string;
  paymentId: string;
  bookingId: string;
  customerId: string;
  amount: number;
  reason: string;
  providerRefundRef: string;
  status: 'pending' | 'completed' | 'failed';
  processedAt: string;
  createdAt: string;
}

export interface BookingCredit {
  id: string;
  userId: string;
  creditAmount: number;
  originalBookingId: string;
  reason: string;
  status: 'available' | 'redeemed' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export interface CommissionLedgerEntry {
  id: string;
  bookingId: string;
  bookingRef: string;
  transactionType?: 'commission_credit' | 'commission_refund' | 'registration_fee' | 'subscription_fee';
  amount?: number;
  ratePercentage?: number;
  balanceAfter?: number;
  notes?: string;
  createdAt: string;
  grossBookingAmount?: number;
  customerGrossAmount?: number;
  platformCommission?: number;
  platformCommissionRate?: number;
  companionPayoutAmount?: number;
  isSettled?: boolean;
}

export interface PayoutRecord {
  id: string;
  companionId: string;
  companionDisplayName: string;
  amount: number;
  bankAccountMasked: string;
  ifscCode: string;
  referenceId: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  paidAt?: string;
  bankIfscMasked?: string;
  transactionRef?: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  price: number;
  durationDays: number;
  features: string[];
  isActive: boolean;
}

export interface ReviewRecord {
  id: string;
  bookingId: string;
  bookingRef: string;
  customerId: string;
  customerName: string;
  companionId: string;
  companionDisplayName: string;
  rating: number; // 1 to 5
  comment: string;
  isVerified: boolean; // Must be true, tied to completed booking
  isFlagged: boolean;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'verification' | 'system' | 'safety';
  link?: string;
  isRead: boolean;
  targetRole?: UserRole | 'all';
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedProfileId: string;
  reportedDisplayName: string;
  reason: string;
  details: string;
  status: 'pending' | 'investigated' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface FeatureSettings {
  platformCommissionRate: number; // default 10%
  registrationFee: number; // default e.g. 999 or 0
  isRegistrationFree: boolean;
  autoApproveCompanions: boolean;
  maintenanceMode: boolean;
  minBookingDuration: number; // 1 hr
  maxBookingDuration: number; // 8 hrs
  allowInstantBooking: boolean;
  enableReviews: boolean;
  enableReplacementCredit: boolean;
  enableReplacementCredits?: boolean;
  enableSwipeDeck?: boolean;
  enableInstantChat?: boolean;
  enableRazorpayLive?: boolean;
  enableSosEmergency?: boolean;
  platformContactEmail: string;
  emergencyHelplineNumber: string;
}

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  adminName?: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface SearchFilterState {
  stateSlug: string;
  citySlug: string;
  query: string;
  isAvailableTodayOnly: boolean;
  minRating: number;
  maxPrice: number;
  selectedInterests: string[];
  selectedLanguages: string[];
  genderPreference: string;
}

export interface SupportTicketReply {
  id: string;
  senderName: string;
  authorName?: string;
  authorRole?: string;
  isStaff: boolean;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketRef: string;
  bookingRef?: string;
  userId?: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  userName?: string;
  userRole?: UserRole;
  subject: string;
  category: 'payment' | 'booking' | 'dispute' | 'verification' | 'safety' | 'technical';
  message?: string;
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  priority?: string;
  replies: SupportTicketReply[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  messageText?: string;
  text?: string;
  createdAt: string;
  timestamp?: string;
  isRead?: boolean;
}

export interface ChatConversation {
  id: string;
  bookingId?: string;
  bookingRef?: string;
  customerId: string;
  customerName: string;
  companionId: string;
  companionName?: string;
  companionDisplayName?: string;
  companionPhoto?: string;
  companionPhotoUrl?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  participantName?: string;
  messages?: ChatMessage[];
}

export interface CouponCode {
  code: string;
  discountPercentage: number;
  maxDiscount: number;
  minBookingValue: number;
  description: string;
  isActive: boolean;
}
