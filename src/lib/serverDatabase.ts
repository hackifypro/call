import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  User,
  CompanionProfile,
  BookingRequest,
  PaymentRecord,
  RefundRecord,
  BookingCredit,
  CommissionLedgerEntry,
  PayoutRecord,
  SubscriptionPlan,
  ReviewRecord,
  ReportRecord,
  SupportTicket,
  CouponCode,
  NotificationRecord,
  AdminAuditLog,
  FeatureSettings,
  CityData,
  ChatConversation,
  ChatMessage,
  SupportTicketReply,
} from './types';
import {
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
  INITIAL_COUPONS,
} from './mockData';
import { INDIAN_CITIES } from './geoData';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? path.join(os.tmpdir(), 'aura_db') : path.join(process.cwd(), '.data');

// In-memory table cache to ensure zero crashes in serverless read-only environments
const memoryTableStore = new Map<string, any>();

function ensureDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // Read-only filesystem warning, memory cache will serve as fallback
  }
}

function readTable<T>(filename: string, defaultData: T): T {
  if (memoryTableStore.has(filename)) {
    return memoryTableStore.get(filename);
  }
  ensureDirectory();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      memoryTableStore.set(filename, parsed);
      return parsed;
    }
  } catch (err) {
    console.warn(`Could not read ${filename} from disk, using default:`, err);
  }
  // Initialize file with default data
  memoryTableStore.set(filename, defaultData);
  writeTable(filename, defaultData);
  return defaultData;
}

function writeTable<T>(filename: string, data: T) {
  memoryTableStore.set(filename, data);
  ensureDirectory();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`Failed to write table ${filename} to disk (preserved in memory):`, err);
  }
}

export interface WebsiteSettings {
  siteName: string;
  tagline: string;
  supportEmail: string;
  emergencyHelpline: string;
  grievanceOfficerEmail: string;
  defaultCommissionRate: number;
  maintenanceMode: boolean;
  allowPublicCompanionRegistration: boolean;
  minAgeRequirement: number;
  currencyCode: string;
  currencySymbol: string;
  gstRate: number;
}

export interface RolePermissionConfig {
  role: string;
  title: string;
  description: string;
  permissions: string[];
}

export interface SeoConfig {
  defaultTitle: string;
  defaultDescription: string;
  canonicalDomain: string;
  cityOverrides: {
    citySlug: string;
    title: string;
    description: string;
    keywords: string[];
  }[];
}

const DEFAULT_SETTINGS: WebsiteSettings = {
  siteName: 'Aura India',
  tagline: 'Verified Adult Companionship Marketplace',
  supportEmail: 'safety@aura-india.com',
  emergencyHelpline: '+91 1800-209-AURA',
  grievanceOfficerEmail: 'grievance@aura-india.com',
  defaultCommissionRate: 10,
  maintenanceMode: false,
  allowPublicCompanionRegistration: true,
  minAgeRequirement: 18,
  currencyCode: 'INR',
  currencySymbol: '₹',
  gstRate: 18,
};

const DEFAULT_ROLE_PERMISSIONS: RolePermissionConfig[] = [
  {
    role: 'super_admin',
    title: 'Super Administrator',
    description: 'Unrestricted root authority across all operational, financial, and security modules.',
    permissions: ['all'],
  },
  {
    role: 'finance',
    title: 'Finance Administrator',
    description: 'Manages payments, 10% commission ledger, escrow accounts, refunds, and companion payouts.',
    permissions: [
      'analytics.view',
      'bookings.view',
      'payments.view',
      'payments.manage',
      'commissions.view',
      'commissions.manage',
      'refunds.manage',
      'payouts.manage',
      'subscriptions.manage',
      'coupons.manage',
      'audit.view',
    ],
  },
  {
    role: 'moderator',
    title: 'Trust & Safety Moderator',
    description: 'Verifies companion government identities, audits reviews, and investigates dispute reports.',
    permissions: [
      'analytics.view',
      'users.view',
      'profiles.view',
      'profiles.verify',
      'cities.manage',
      'reviews.moderate',
      'reports.resolve',
      'seo.manage',
      'notifications.broadcast',
    ],
  },
  {
    role: 'support',
    title: 'Customer Support Agent',
    description: 'Handles incoming member help requests, booking status queries, and general inquiries.',
    permissions: [
      'analytics.view',
      'profiles.view',
      'bookings.view',
      'reviews.view',
      'reports.view',
      'tickets.manage',
    ],
  },
];

const DEFAULT_SEO_CONFIG: SeoConfig = {
  defaultTitle: 'Aura India | Verified Adult Companions Across Indian Metros',
  defaultDescription: 'Discover 100% ID-verified adult companions for dinners, cultural events, and social galas in Mumbai, Delhi, Bengaluru, Pune, and Hyderabad with 10% transparent commission.',
  canonicalDomain: 'https://companion-marketplace.in',
  cityOverrides: [
    {
      citySlug: 'mumbai',
      title: 'Verified Adult Companions in Mumbai | Aura India',
      description: 'Book verified companions in South Mumbai, Bandra, and Juhu for high-profile dining and cultural galas.',
      keywords: ['Mumbai companions', 'South Mumbai escort', 'Bandra companion service', 'Verified adult escort Mumbai'],
    },
    {
      citySlug: 'delhi',
      title: 'Verified Adult Companions in Delhi NCR | Aura India',
      description: 'Elite companionship in Connaught Place, Vasant Kunj, and Gurgaon for galas and corporate dinners.',
      keywords: ['Delhi companions', 'Gurgaon companion', 'Delhi adult escort', 'CP dinner companion'],
    },
    {
      citySlug: 'bengaluru',
      title: 'Verified Adult Companions in Bengaluru | Aura India',
      description: 'Engaging companions in Indiranagar, Koramangala, and Whitefield for social and dining events.',
      keywords: ['Bengaluru companions', 'Indiranagar escort', 'Koramangala companion', 'Bangalore adult companionship'],
    },
  ],
};

const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 1,
    name: 'Verified Silver Tier',
    slug: 'silver',
    price: 0,
    durationDays: 30,
    features: ['Standard directory listing', '90% Net booking payout', 'In-app chat access', 'Standard support'],
    isActive: true,
  },
  {
    id: 2,
    name: 'Gold Elite Spotlight',
    slug: 'gold',
    price: 4999,
    durationDays: 30,
    features: ['Top 3 City Search Spotlight', 'Instant Push Booking Notifications', 'Zero onboarding fee', 'Dedicated Account Manager'],
    isActive: true,
  },
  {
    id: 3,
    name: 'Platinum Concierge',
    slug: 'platinum',
    price: 9999,
    durationDays: 90,
    features: ['Nationwide Metro Featured Carousel', 'Fast-Track Escrow Payouts (Same Day)', 'VIP Verification Badge', '24/7 Priority SOS Hotline'],
    isActive: true,
  },
];

/**
 * Server Database Manager Class
 */
export class ServerDatabase {
  // 1. Companions
  static getCompanions(): CompanionProfile[] {
    return readTable<CompanionProfile[]>('companions.json', INITIAL_COMPANIONS);
  }

  static saveCompanions(data: CompanionProfile[]) {
    writeTable('companions.json', data);
  }

  static getCompanionById(id: string): CompanionProfile | null {
    return this.getCompanions().find((c) => c.id === id) || null;
  }

  static updateCompanionStatus(
    id: string,
    status: CompanionProfile['status'],
    rejectionReason?: string,
    operatorEmail: string = 'admin@aura-india.com'
  ): boolean {
    const companions = this.getCompanions();
    const index = companions.findIndex((c) => c.id === id);
    if (index === -1) return false;

    companions[index].status = status;
    if (rejectionReason) companions[index].rejectionReason = rejectionReason;
    companions[index].updatedAt = new Date().toISOString();
    this.saveCompanions(companions);

    this.recordAuditLog({
      adminEmail: operatorEmail,
      action: `COMPANION_${status.toUpperCase()}`,
      targetType: 'companion',
      targetId: id,
      details: rejectionReason || `Status updated to ${status}`,
    });

    return true;
  }

  // 2. Bookings
  static getBookings(): BookingRequest[] {
    return readTable<BookingRequest[]>('bookings.json', INITIAL_BOOKINGS);
  }

  static saveBookings(data: BookingRequest[]) {
    writeTable('bookings.json', data);
  }

  static updateBookingStatus(
    id: string,
    status: BookingRequest['status'],
    operatorEmail: string = 'admin@aura-india.com',
    cancellationReason?: string
  ): boolean {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return false;

    bookings[index].status = status;
    if (cancellationReason) {
      bookings[index].cancellationReason = cancellationReason;
      bookings[index].cancelledBy = 'admin';
      bookings[index].cancelledAt = new Date().toISOString();
    }
    bookings[index].updatedAt = new Date().toISOString();
    this.saveBookings(bookings);

    this.recordAuditLog({
      adminEmail: operatorEmail,
      action: `BOOKING_${status.toUpperCase()}`,
      targetType: 'booking',
      targetId: id,
      details: cancellationReason || `Status modified to ${status}`,
    });

    return true;
  }

  // 3. Commission Ledger
  static getCommissionLedger(): CommissionLedgerEntry[] {
    return readTable<CommissionLedgerEntry[]>('ledger.json', INITIAL_COMMISSION_LEDGER);
  }

  static saveCommissionLedger(data: CommissionLedgerEntry[]) {
    writeTable('ledger.json', data);
  }

  static addCommissionEntry(entry: Omit<CommissionLedgerEntry, 'id' | 'createdAt'>): CommissionLedgerEntry {
    const ledger = this.getCommissionLedger();
    const newEntry: CommissionLedgerEntry = {
      id: `led-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    };
    ledger.unshift(newEntry);
    this.saveCommissionLedger(ledger);
    return newEntry;
  }

  // 4. Refunds & Replacement Credits
  static getCredits(): BookingCredit[] {
    return readTable<BookingCredit[]>('credits.json', INITIAL_BOOKING_CREDITS);
  }

  static saveCredits(data: BookingCredit[]) {
    writeTable('credits.json', data);
  }

  static issueReplacementCredit(params: {
    userId: string;
    originalBookingId: string;
    creditAmount: number;
    reason: string;
    operatorEmail: string;
  }): BookingCredit {
    const credits = this.getCredits();
    const newCredit: BookingCredit = {
      id: `crd-${Date.now().toString().slice(-6)}`,
      userId: params.userId,
      originalBookingId: params.originalBookingId,
      creditAmount: params.creditAmount,
      reason: params.reason,
      status: 'available',
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days validity
      createdAt: new Date().toISOString(),
    };
    credits.unshift(newCredit);
    this.saveCredits(credits);

    this.recordAuditLog({
      adminEmail: params.operatorEmail,
      action: 'ISSUE_REPLACEMENT_CREDIT',
      targetType: 'credit',
      targetId: newCredit.id,
      details: `Issued ₹${params.creditAmount} replacement credit for booking ${params.originalBookingId}. Reason: ${params.reason}`,
    });

    return newCredit;
  }

  // 5. Payouts
  static getPayouts(): PayoutRecord[] {
    return readTable<PayoutRecord[]>('payouts.json', INITIAL_PAYOUTS);
  }

  static savePayouts(data: PayoutRecord[]) {
    writeTable('payouts.json', data);
  }

  static authorizePayout(id: string, operatorEmail: string): boolean {
    const payouts = this.getPayouts();
    const index = payouts.findIndex((p) => p.id === id);
    if (index === -1) return false;

    payouts[index].status = 'completed';
    payouts[index].paidAt = new Date().toISOString();
    payouts[index].referenceId = `TXN-CMS-${Date.now().toString().slice(-8)}`;
    this.savePayouts(payouts);

    this.recordAuditLog({
      adminEmail: operatorEmail,
      action: 'PAYOUT_AUTHORIZED',
      targetType: 'payout',
      targetId: id,
      details: `Authorized bank transfer of ₹${payouts[index].amount} to ${payouts[index].companionDisplayName}. Ref: ${payouts[index].referenceId}`,
    });

    return true;
  }

  // 6. Subscriptions
  static getSubscriptions(): SubscriptionPlan[] {
    return readTable<SubscriptionPlan[]>('subscriptions.json', DEFAULT_SUBSCRIPTION_PLANS);
  }

  static saveSubscriptions(data: SubscriptionPlan[]) {
    writeTable('subscriptions.json', data);
  }

  // 7. Feature Flags & Configuration
  static getFeatureSettings(): FeatureSettings {
    return readTable<FeatureSettings>('features.json', INITIAL_FEATURE_SETTINGS);
  }

  static updateFeatureSettings(updates: Partial<FeatureSettings>, operatorEmail: string = 'admin@aura-india.com'): FeatureSettings {
    const current = this.getFeatureSettings();
    const updated = { ...current, ...updates };
    writeTable('features.json', updated);

    this.recordAuditLog({
      adminEmail: operatorEmail,
      action: 'UPDATE_FEATURE_SETTINGS',
      targetType: 'settings',
      targetId: 'features',
      details: JSON.stringify(updates),
    });

    return updated;
  }

  // 8. Cities Overrides
  static getCities(): CityData[] {
    return readTable<CityData[]>('cities.json', INDIAN_CITIES);
  }

  static toggleCityServed(cityId: number, operatorEmail: string): boolean {
    const cities = this.getCities();
    const index = cities.findIndex((c) => c.id === cityId);
    if (index === -1) return false;

    cities[index].isServed = !cities[index].isServed;
    writeTable('cities.json', cities);

    this.recordAuditLog({
      adminEmail: operatorEmail,
      action: 'TOGGLE_CITY_AVAILABILITY',
      targetType: 'city',
      targetId: String(cityId),
      details: `City ${cities[index].name} service status set to ${cities[index].isServed ? 'ACTIVE' : 'INACTIVE'}`,
    });

    return true;
  }

  // 9. Reviews & Content Moderation
  static getReviews(): ReviewRecord[] {
    return readTable<ReviewRecord[]>('reviews.json', INITIAL_REVIEWS);
  }

  static saveReviews(data: ReviewRecord[]) {
    writeTable('reviews.json', data);
  }

  static toggleReviewFlag(reviewId: string, operatorEmail: string): boolean {
    const reviews = this.getReviews();
    const index = reviews.findIndex((r) => r.id === reviewId);
    if (index === -1) return false;

    reviews[index].isFlagged = !reviews[index].isFlagged;
    this.saveReviews(reviews);

    this.recordAuditLog({
      adminEmail: operatorEmail,
      action: 'TOGGLE_REVIEW_FLAG',
      targetType: 'review',
      targetId: reviewId,
      details: `Review ${reviewId} flagged status set to ${reviews[index].isFlagged}`,
    });

    return true;
  }

  // 10. Reports & Dispute Resolution
  static getReports(): ReportRecord[] {
    const defaultReports: ReportRecord[] = [
      {
        id: 'rep-101',
        reporterId: 'usr-customer-1',
        reporterName: 'Rahul Sharma',
        reportedProfileId: 'comp-102',
        reportedDisplayName: 'Kabir V.',
        reason: 'Late arrival to dinner appointment',
        details: 'Companion arrived 45 minutes late without prior notification at restaurant venue in Bandra.',
        status: 'pending',
        createdAt: '2026-02-14T21:30:00Z',
      },
      {
        id: 'rep-102',
        reporterId: 'usr-companion-1',
        reporterName: 'Pooja Mehta',
        reportedProfileId: 'usr-customer-2',
        reportedDisplayName: 'Amit Patel',
        reason: 'Unreasonable request violating code of conduct',
        details: 'Client attempted to propose private unapproved arrangements violating platform terms.',
        status: 'investigated',
        createdAt: '2026-02-10T18:15:00Z',
      },
    ];
    return readTable<ReportRecord[]>('reports.json', defaultReports);
  }

  static updateReportStatus(
    id: string,
    status: ReportRecord['status'],
    operatorEmail: string,
    resolutionNotes?: string
  ): boolean {
    const reports = this.getReports();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) return false;

    reports[index].status = status;
    writeTable('reports.json', reports);

    this.recordAuditLog({
      adminEmail: operatorEmail,
      action: 'UPDATE_REPORT_STATUS',
      targetType: 'report',
      targetId: id,
      details: `Report status set to ${status}. Notes: ${resolutionNotes || 'None'}`,
    });

    return true;
  }

  // 11. Customer Support Tickets
  static getTickets(): SupportTicket[] {
    return readTable<SupportTicket[]>('tickets.json', INITIAL_SUPPORT_TICKETS);
  }

  static saveTickets(data: SupportTicket[]) {
    writeTable('tickets.json', data);
  }

  static addTicketReply(ticketId: string, message: string, operatorEmail: string): boolean {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index === -1) return false;

    tickets[index].replies.push({
      id: `rep-${Date.now().toString().slice(-6)}`,
      senderName: 'Trust & Support Specialist',
      isStaff: true,
      message,
      createdAt: new Date().toISOString(),
    });
    tickets[index].status = 'in_progress';
    tickets[index].updatedAt = new Date().toISOString();
    this.saveTickets(tickets);

    this.recordAuditLog({
      adminEmail: operatorEmail,
      action: 'SUPPORT_TICKET_REPLY',
      targetType: 'ticket',
      targetId: ticketId,
      details: `Replied to ticket #${tickets[index].ticketRef}`,
    });

    return true;
  }

  // 12. Coupons & Referrals
  static getCoupons(): CouponCode[] {
    return readTable<CouponCode[]>('coupons.json', INITIAL_COUPONS);
  }

  static saveCoupons(data: CouponCode[]) {
    writeTable('coupons.json', data);
  }

  static createCoupon(coupon: CouponCode, operatorEmail: string): CouponCode {
    const coupons = this.getCoupons();
    coupons.unshift(coupon);
    this.saveCoupons(coupons);

    this.recordAuditLog({
      adminEmail: operatorEmail,
      action: 'CREATE_COUPON',
      targetType: 'coupon',
      targetId: coupon.code,
      details: `Created coupon ${coupon.code} (${coupon.discountPercentage}% off, max ₹${coupon.maxDiscount})`,
    });

    return coupon;
  }

  // 13. SEO Configuration
  static getSeoConfig(): SeoConfig {
    return readTable<SeoConfig>('seo.json', DEFAULT_SEO_CONFIG);
  }

  static updateSeoConfig(updates: Partial<SeoConfig>, operatorEmail: string): SeoConfig {
    const current = this.getSeoConfig();
    const updated = { ...current, ...updates };
    writeTable('seo.json', updated);

    this.recordAuditLog({
      adminEmail: operatorEmail,
      action: 'UPDATE_SEO_CONFIG',
      targetType: 'seo',
      targetId: 'global',
      details: 'Updated global or city SEO metadata',
    });

    return updated;
  }

  // 14. Notifications & Broadcasts
  static getNotifications(): NotificationRecord[] {
    return readTable<NotificationRecord[]>('notifications.json', INITIAL_NOTIFICATIONS);
  }

  static saveNotifications(notifications: NotificationRecord[]): void {
    writeTable('notifications.json', notifications);
  }

  static broadcastNotification(params: {
    title: string;
    message: string;
    type: NotificationRecord['type'];
    targetRole?: string;
    operatorEmail: string;
  }): NotificationRecord {
    const notifications = this.getNotifications();
    const newNotif: NotificationRecord = {
      id: `notif-${Date.now().toString().slice(-6)}`,
      userId: params.targetRole || 'all',
      title: params.title,
      message: params.message,
      type: params.type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    notifications.unshift(newNotif);
    writeTable('notifications.json', notifications);

    this.recordAuditLog({
      adminEmail: params.operatorEmail,
      action: 'BROADCAST_NOTIFICATION',
      targetType: 'notification',
      targetId: newNotif.id,
      details: `Broadcast: ${params.title} to ${params.targetRole || 'all users'}`,
    });

    return newNotif;
  }

  // 15. Security & Immutable Audit Logs
  static getAuditLogs(): AdminAuditLog[] {
    return readTable<AdminAuditLog[]>('audit_logs.json', INITIAL_AUDIT_LOGS);
  }

  static recordAuditLog(params: {
    adminEmail: string;
    action: string;
    targetType: string;
    targetId: string;
    details: string;
  }): AdminAuditLog {
    const logs = this.getAuditLogs();
    const newLog: AdminAuditLog = {
      id: `aud-${Date.now().toString().slice(-7)}`,
      adminEmail: params.adminEmail,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      details: params.details,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    writeTable('audit_logs.json', logs);
    return newLog;
  }

  // 16. Website Settings
  static getWebsiteSettings(): WebsiteSettings {
    return readTable<WebsiteSettings>('settings.json', DEFAULT_SETTINGS);
  }

  static updateWebsiteSettings(updates: Partial<WebsiteSettings>, operatorEmail: string): WebsiteSettings {
    const current = this.getWebsiteSettings();
    const updated = { ...current, ...updates };
    writeTable('settings.json', updated);

    this.recordAuditLog({
      adminEmail: operatorEmail,
      action: 'UPDATE_WEBSITE_SETTINGS',
      targetType: 'settings',
      targetId: 'website',
      details: JSON.stringify(updates),
    });

    return updated;
  }

  // 17. Role & Permission Management
  static getRolePermissions(): RolePermissionConfig[] {
    return readTable<RolePermissionConfig[]>('roles.json', DEFAULT_ROLE_PERMISSIONS);
  }

  static updateRolePermissions(role: string, permissions: string[], operatorEmail: string): boolean {
    const roles = this.getRolePermissions();
    const index = roles.findIndex((r) => r.role === role);
    if (index === -1) return false;

    roles[index].permissions = permissions;
    writeTable('roles.json', roles);

    this.recordAuditLog({
      adminEmail: operatorEmail,
      action: 'UPDATE_ROLE_PERMISSIONS',
      targetType: 'role',
      targetId: role,
      details: `Permissions updated for ${role}: ${permissions.join(', ')}`,
    });

    return true;
  }

  // 18. Real-Time Dynamic Dashboard Analytics Aggregator
  static getRealTimeAnalytics() {
    const companions = this.getCompanions();
    const bookings = this.getBookings();
    const ledger = this.getCommissionLedger();
    const reports = this.getReports();
    const tickets = this.getTickets();
    const credits = this.getCredits();

    const grossVolume = bookings.reduce((sum, b) => sum + (b.priceBreakdown?.baseAmount || 0), 0);
    const platformCommission = ledger.reduce((sum, l) => sum + (l.platformCommission || 0), 0);
    const companionNetPayouts = ledger.reduce((sum, l) => sum + (l.companionPayoutAmount || 0), 0);

    const pendingVerifications = companions.filter((c) => c.status === 'pending_approval' || c.status === 'pending_verification').length;
    const approvedCompanions = companions.filter((c) => c.status === 'approved').length;
    const completedBookings = bookings.filter((b) => b.status === 'completed').length;
    const activeDisputes = reports.filter((r) => r.status === 'pending' || r.status === 'investigated').length;
    const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
    const activeReplacementCredits = credits.filter((c) => c.status === 'available').reduce((sum, c) => sum + c.creditAmount, 0);

    // City distribution
    const cityBreakdown = companions.reduce<Record<string, number>>((acc, c) => {
      acc[c.cityName] = (acc[c.cityName] || 0) + 1;
      return acc;
    }, {});

    return {
      financials: {
        grossVolume,
        platformCommission,
        companionNetPayouts,
        activeReplacementCredits,
      },
      counts: {
        totalCompanions: companions.length,
        approvedCompanions,
        pendingVerifications,
        totalBookings: bookings.length,
        completedBookings,
        activeDisputes,
        openTickets,
      },
      cityBreakdown,
      recentBookings: bookings.slice(0, 5),
      recentAuditLogs: this.getAuditLogs().slice(0, 8),
    };
  }

  // ==========================================
  // CUSTOMER DASHBOARD & OPERATIONS METHODS
  // ==========================================

  // Favorites
  static getCustomerFavorites(customerId: string): string[] {
    const defaultFavorites: Record<string, string[]> = {
      'usr-customer-1': ['comp-101', 'comp-103'],
      'usr-customer-default': ['comp-101', 'comp-103'],
    };
    const store = readTable<Record<string, string[]>>('favorites.json', defaultFavorites);
    if (store[customerId]) {
      return store[customerId];
    }
    if (customerId === 'usr-customer-1' || customerId === 'usr-customer-default' || customerId.includes('customer')) {
      return store['usr-customer-1'] || ['comp-101', 'comp-103'];
    }
    return [];
  }

  static toggleCustomerFavorite(customerId: string, companionId: string): { isFavorite: boolean; favorites: string[] } {
    const store = readTable<Record<string, string[]>>('favorites.json', {
      'usr-customer-1': ['comp-101', 'comp-103'],
    });
    const current = store[customerId] || (customerId === 'usr-customer-1' || customerId === 'usr-customer-default' ? ['comp-101', 'comp-103'] : []);
    const exists = current.includes(companionId);
    let updated: string[];

    if (exists) {
      updated = current.filter((id) => id !== companionId);
    } else {
      updated = [...current, companionId];
    }

    store[customerId] = updated;
    writeTable('favorites.json', store);
    return { isFavorite: !exists, favorites: updated };
  }

  // Recently Viewed Profiles
  static getCustomerRecentlyViewed(customerId: string): string[] {
    const defaultRecent: Record<string, string[]> = {
      'usr-customer-1': ['comp-102', 'comp-104'],
      'usr-customer-default': ['comp-102', 'comp-104'],
    };
    const store = readTable<Record<string, string[]>>('recently_viewed.json', defaultRecent);
    if (store[customerId]) {
      return store[customerId];
    }
    if (customerId === 'usr-customer-1' || customerId === 'usr-customer-default') {
      return ['comp-102', 'comp-104'];
    }
    return [];
  }

  static addCustomerRecentlyViewed(customerId: string, companionId: string): string[] {
    const store = readTable<Record<string, string[]>>('recently_viewed.json', {
      'usr-customer-1': ['comp-102', 'comp-104'],
    });
    const current = store[customerId] || [...(store['usr-customer-1'] || [])];
    const updated = [companionId, ...current.filter((id) => id !== companionId)].slice(0, 10);
    store[customerId] = updated;
    writeTable('recently_viewed.json', store);
    return updated;
  }

  // Customer Bookings
  static getCustomerBookings(customerId: string, email?: string): BookingRequest[] {
    const all = this.getBookings();
    return all.filter(
      (b) =>
        b.customerId === customerId ||
        (email && b.customerEmail?.toLowerCase() === email.toLowerCase()) ||
        (email && email.toLowerCase() === 'customer@aura-india.com' && (b.customerId === 'usr-customer-1' || b.customerEmail === 'rahul.sharma@example.in')) ||
        (customerId.includes('customer') && b.customerId === 'usr-customer-1')
    );
  }

  static createCustomerBooking(params: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    companionId: string;
    bookingDate: string;
    startTime: string;
    durationHours: number;
    meetupLocation: string;
    occasionType?: string;
    specialNotes?: string;
    paymentMethod?: string;
    useCreditId?: string;
  }): BookingRequest {
    const companion = this.getCompanionById(params.companionId);
    if (!companion) {
      throw new Error('Selected companion profile not found or unavailable.');
    }

    if (companion.status !== 'approved') {
      throw new Error('This companion is not currently approved for bookings.');
    }

    // Availability conflict check
    const bookings = this.getBookings();
    const conflict = bookings.find(
      (b) =>
        b.companionId === params.companionId &&
        b.bookingDate === params.bookingDate &&
        b.startTime === params.startTime &&
        ['confirmed', 'accepted', 'in_progress'].includes(b.status)
    );
    if (conflict) {
      throw new Error('This time slot is already reserved for this companion. Please pick another time or date.');
    }

    const hourlyRate = companion.hourlyRate || 2500;
    const baseAmount = hourlyRate * params.durationHours;
    const platformCommission = Math.round(baseAmount * 0.1); // 10% Section 10 rule
    const netCompanion = baseAmount - platformCommission;

    let creditApplied = 0;
    if (params.useCreditId) {
      const credits = this.getCredits();
      const creditIndex = credits.findIndex((c) => c.id === params.useCreditId && c.status === 'available');
      if (creditIndex !== -1) {
        creditApplied = Math.min(credits[creditIndex].creditAmount, baseAmount);
        credits[creditIndex].status = 'redeemed';
        this.saveCredits(credits);
      }
    }

    const totalPayable = Math.max(0, baseAmount - creditApplied);
    const bookingRef = `BK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newBooking: BookingRequest = {
      id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      bookingRef,
      customerId: params.customerId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone || '+919820112233',
      companionId: companion.id,
      companionDisplayName: companion.displayName,
      companionPhone: '+919876543210',
      companionPhotoUrl: companion.primaryPhotoUrl,
      bookingDate: params.bookingDate,
      startTime: params.startTime,
      durationHours: params.durationHours,
      cityName: companion.cityName,
      meetupLocation: params.meetupLocation,
      occasionType: params.occasionType || 'Social & Dining Companion',
      specialNotes: params.specialNotes || '',
      priceBreakdown: {
        baseAmount,
        durationHours: params.durationHours,
        platformCommissionRate: 10,
        platformCommissionAmount: platformCommission,
        taxAmount: 0,
        totalPayableByCustomer: totalPayable,
        netCompanionAmount: netCompanion,
        finalPaidByCustomer: totalPayable,
      },
      status: 'confirmed',
      paymentId: `pay-${Date.now()}`,
      paymentMethod: params.paymentMethod || 'UPI (Instant Escrow)',
      hasReview: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    bookings.unshift(newBooking);
    this.saveBookings(bookings);

    // Record 10% platform commission ledger
    this.addCommissionEntry({
      bookingId: newBooking.id,
      bookingRef: newBooking.bookingRef,
      customerGrossAmount: baseAmount,
      platformCommissionRate: 10,
      platformCommission,
      companionPayoutAmount: netCompanion,
      isSettled: false,
    });

    // Notify Companion and Customer
    this.broadcastNotification({
      title: 'New Booking Confirmed',
      message: `Booking ${bookingRef} has been confirmed for ${companion.displayName} on ${params.bookingDate} at ${params.startTime}.`,
      type: 'booking',
      targetRole: 'customer',
      operatorEmail: 'system@aura-india.com',
    });

    return newBooking;
  }

  static cancelCustomerBooking(
    bookingId: string,
    customerId: string,
    customerEmail?: string,
    reason: string = 'Customer schedule change'
  ): { success: boolean; creditIssued?: number; status: string; message: string } {
    const bookings = this.getBookings();
    const index = bookings.findIndex(
      (b) =>
        b.id === bookingId &&
        (b.customerId === customerId ||
          (customerEmail && b.customerEmail?.toLowerCase() === customerEmail.toLowerCase()) ||
          (customerId.includes('customer') && b.customerId === 'usr-customer-1'))
    );

    if (index === -1) {
      throw new Error('Booking not found or you are not authorized to cancel this booking.');
    }

    const booking = bookings[index];
    if (['completed', 'cancelled', 'refunded', 'rejected'].includes(booking.status)) {
      throw new Error(`Cannot cancel a booking that is already ${booking.status}.`);
    }

    // Section 11 Cancellation Policy Evaluation
    const bookingDateTime = new Date(`${booking.bookingDate}T${booking.startTime || '12:00'}:00`);
    const now = new Date();
    const hoursNotice = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let creditAmount = 0;
    let policyTier = 'Non-refundable (<12 hours notice)';

    const baseAmount = booking.priceBreakdown?.totalPayableByCustomer || booking.priceBreakdown?.baseAmount || 0;

    if (hoursNotice >= 24) {
      creditAmount = baseAmount;
      policyTier = '100% Replacement Credit (>24 hours notice)';
    } else if (hoursNotice >= 12) {
      creditAmount = Math.round(baseAmount * 0.5);
      policyTier = '50% Replacement Credit (12-24 hours notice)';
    } else {
      creditAmount = 0;
      policyTier = '0% Refund (<12 hours notice per Section 11 Terms)';
    }

    // Issue replacement credit if eligible
    if (creditAmount > 0) {
      this.issueReplacementCredit({
        userId: booking.customerId,
        creditAmount: creditAmount,
        originalBookingId: booking.id,
        reason: `Section 11 Cancellation: ${policyTier}`,
        operatorEmail: 'system@aura-india.com',
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = `${reason} (${policyTier})`;
    booking.cancelledBy = 'customer';
    booking.cancelledAt = new Date().toISOString();
    booking.updatedAt = new Date().toISOString();
    this.saveBookings(bookings);

    return {
      success: true,
      creditIssued: creditAmount,
      status: 'cancelled',
      message: `Booking cancelled successfully under Section 11 policy. ${policyTier}.`,
    };
  }

  // Customer Credits
  static getCustomerCredits(customerId: string, email?: string): BookingCredit[] {
    const all = this.getCredits();
    return all.filter(
      (c) =>
        c.userId === customerId ||
        (email && email.toLowerCase() === 'customer@aura-india.com' && c.userId === 'usr-customer-1') ||
        (customerId.includes('customer') && c.userId === 'usr-customer-1')
    );
  }

  // Customer Payments & Receipts
  static getCustomerPayments(customerId: string, email?: string) {
    const bookings = this.getCustomerBookings(customerId, email);
    const credits = this.getCustomerCredits(customerId, email);

    const transactions = bookings.map((b) => ({
      id: b.paymentId || `pay-${b.id}`,
      bookingId: b.id,
      bookingRef: b.bookingRef,
      companionDisplayName: b.companionDisplayName,
      cityName: b.cityName,
      date: b.createdAt,
      bookingDate: b.bookingDate,
      grossAmount: b.priceBreakdown?.baseAmount || 0,
      platformFee: b.priceBreakdown?.platformCommissionAmount || 0,
      totalPaid: b.priceBreakdown?.totalPayableByCustomer || 0,
      paymentMethod: b.paymentMethod || 'UPI Instant Escrow',
      status: b.status === 'cancelled' ? 'refunded_or_cancelled' : b.status === 'rejected' ? 'failed' : 'successful',
      isRefunded: b.status === 'cancelled' || b.status === 'refunded',
      invoiceNumber: `INV-${b.bookingRef.replace('BK-', '')}`,
    }));

    const totalPaid = transactions
      .filter((t) => t.status === 'successful')
      .reduce((sum, t) => sum + t.totalPaid, 0);

    const availableCredits = credits
      .filter((c) => c.status === 'available')
      .reduce((sum, c) => sum + c.creditAmount, 0);

    return {
      transactions,
      totalPaid,
      availableCredits,
      creditsList: credits,
    };
  }

  // Customer Reviews
  static getCustomerReviews(customerId: string): ReviewRecord[] {
    const all = this.getReviews();
    return all.filter(
      (r) => r.customerId === customerId || (customerId.includes('customer') && r.customerId === 'usr-customer-1')
    );
  }

  static createCustomerReview(params: {
    customerId: string;
    customerName: string;
    bookingId: string;
    rating: number;
    comment: string;
  }): ReviewRecord {
    const bookings = this.getBookings();
    const booking = bookings.find((b) => b.id === params.bookingId);
    if (!booking) {
      throw new Error('Booking record not found.');
    }

    if (booking.status !== 'completed') {
      throw new Error('Reviews can only be submitted for completed companion appointments.');
    }

    const reviews = this.getReviews();
    const existing = reviews.find((r) => r.bookingId === params.bookingId);
    if (existing) {
      throw new Error('You have already submitted a review for this booking.');
    }

    const newReview: ReviewRecord = {
      id: `rev-${Date.now()}`,
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      customerId: params.customerId,
      customerName: params.customerName,
      companionId: booking.companionId,
      companionDisplayName: booking.companionDisplayName,
      rating: Math.max(1, Math.min(5, Math.round(params.rating))),
      comment: params.comment,
      isVerified: true,
      isFlagged: false,
      createdAt: new Date().toISOString(),
    };

    reviews.unshift(newReview);
    this.saveReviews(reviews);

    booking.hasReview = true;
    this.saveBookings(bookings);

    // Update companion's average rating & review count
    const companions = this.getCompanions();
    const compIndex = companions.findIndex((c) => c.id === booking.companionId);
    if (compIndex !== -1) {
      const compReviews = reviews.filter((r) => r.companionId === booking.companionId && !r.isFlagged);
      const avg = compReviews.reduce((sum, r) => sum + r.rating, 0) / compReviews.length;
      companions[compIndex].averageRating = Number(avg.toFixed(1));
      companions[compIndex].reviewCount = compReviews.length;
      this.saveCompanions(companions);
    }

    return newReview;
  }

  // Customer Support Tickets
  static getCustomerSupportTickets(customerId: string, email?: string): SupportTicket[] {
    const all = this.getTickets();
    return all.filter(
      (t) =>
        t.customerId === customerId ||
        (email && t.customerEmail?.toLowerCase() === email.toLowerCase()) ||
        (customerId.includes('customer') && t.customerId === 'usr-customer-1')
    );
  }

  static createCustomerSupportTicket(params: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    subject: string;
    category: SupportTicket['category'];
    priority: SupportTicket['priority'];
    message: string;
    bookingRef?: string;
  }): SupportTicket {
    const tickets = this.getTickets();
    const ticketRef = `TCK-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTicket: SupportTicket = {
      id: `tck-${Date.now()}`,
      ticketRef,
      customerId: params.customerId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      bookingRef: params.bookingRef,
      category: params.category,
      subject: params.subject,
      priority: params.priority,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [
        {
          id: `rep-${Date.now()}`,
          senderName: params.customerName,
          authorName: params.customerName,
          isStaff: false,
          message: params.message,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    tickets.unshift(newTicket);
    this.saveTickets(tickets);
    return newTicket;
  }

  static addCustomerTicketReply(
    ticketId: string,
    customerId: string,
    customerName: string,
    message: string
  ): boolean {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index === -1) return false;

    tickets[index].replies.push({
      id: `rep-${Date.now()}`,
      senderName: customerName,
      authorName: customerName,
      isStaff: false,
      message,
      createdAt: new Date().toISOString(),
    });
    tickets[index].updatedAt = new Date().toISOString();
    tickets[index].status = 'open'; // Re-open if replied
    this.saveTickets(tickets);
    return true;
  }

  // Messages & Booking Chat
  static getCustomerMessages(customerId: string) {
    const defaultMessages: ChatConversation[] = [
      {
        id: 'conv-101',
        bookingId: 'bk-20261020-001',
        bookingRef: 'BK-20261020-84A1',
        customerId: 'usr-customer-1',
        customerName: 'Rahul Sharma',
        companionId: 'comp-101',
        companionDisplayName: 'Pooja M.',
        companionPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        lastMessage: 'Looking forward to our dinner appointment at The Table!',
        lastMessageAt: '2026-10-19T18:30:00Z',
        unreadCount: 0,
        messages: [
          {
            id: 'msg-1',
            conversationId: 'conv-101',
            senderId: 'usr-customer-1',
            senderName: 'Rahul Sharma',
            senderRole: 'customer',
            text: 'Hello Pooja, looking forward to meeting at The Table, Colaba on the 24th.',
            createdAt: '2026-10-19T18:15:00Z',
          },
          {
            id: 'msg-2',
            conversationId: 'conv-101',
            senderId: 'comp-101',
            senderName: 'Pooja M.',
            senderRole: 'companion',
            text: 'Good evening Rahul! Delighted to connect. The Table is a wonderful choice. I will see you at 7:00 PM.',
            createdAt: '2026-10-19T18:30:00Z',
          },
        ],
      },
    ];

    const store = readTable<ChatConversation[]>('messages.json', defaultMessages);
    return store.filter(
      (c) => c.customerId === customerId || (customerId.includes('customer') && c.customerId === 'usr-customer-1')
    );
  }

  static sendCustomerMessage(params: {
    customerId: string;
    customerName: string;
    companionId: string;
    companionName: string;
    bookingId: string;
    bookingRef: string;
    message: string;
    sender: 'customer' | 'companion';
  }): ChatConversation {
    const store = readTable<ChatConversation[]>('messages.json', []);
    let conv = store.find((c) => c.bookingId === params.bookingId);

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: conv?.id || `conv-${Date.now()}`,
      senderId: params.sender === 'customer' ? params.customerId : params.companionId,
      senderName: params.sender === 'customer' ? params.customerName : params.companionName,
      senderRole: params.sender,
      messageText: params.message,
      text: params.message,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    if (conv) {
      if (!conv.messages) conv.messages = [];
      conv.messages.push(newMsg);
      conv.lastMessage = params.message;
      conv.lastMessageAt = new Date().toISOString();
    } else {
      conv = {
        id: `conv-${Date.now()}`,
        bookingId: params.bookingId,
        bookingRef: params.bookingRef,
        customerId: params.customerId,
        customerName: params.customerName,
        companionId: params.companionId,
        companionName: params.companionName,
        companionDisplayName: params.companionName,
        companionPhoto: '',
        lastMessage: params.message,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        messages: [newMsg],
      };
      store.push(conv);
    }

    writeTable('messages.json', store);
    return conv;
  }

  // Customer Notifications
  static getCustomerNotifications(customerId: string): NotificationRecord[] {
    const all = this.getNotifications();
    return all.filter((n) => n.targetRole === 'all' || n.targetRole === 'customer');
  }

  static markCustomerNotificationsRead(customerId: string): boolean {
    const all = this.getNotifications();
    all.forEach((n) => {
      n.isRead = true;
    });
    this.saveNotifications(all);
    return true;
  }

  // Report Profile
  static reportCompanionProfile(params: {
    reporterId: string;
    reporterName: string;
    reportedProfileId: string;
    reason: string;
    details: string;
  }): ReportRecord {
    const companion = this.getCompanionById(params.reportedProfileId);
    const reports = this.getReports();
    const newReport: ReportRecord = {
      id: `rep-${Date.now()}`,
      reporterId: params.reporterId,
      reporterName: params.reporterName,
      reportedProfileId: params.reportedProfileId,
      reportedDisplayName: companion?.displayName || 'Companion Profile',
      reason: params.reason,
      details: params.details,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    reports.unshift(newReport);
    writeTable('reports.json', reports);
    return newReport;
  }

  // Block User
  static blockUser(userId: string, blockedUserId: string): { blocked: boolean } {
    const store = readTable<Record<string, string[]>>('blocked_users.json', {});
    const current = store[userId] || [];
    if (!current.includes(blockedUserId)) {
      current.push(blockedUserId);
      store[userId] = current;
      writeTable('blocked_users.json', store);
    }
    return { blocked: true };
  }
}
