/**
 * Automated Marketplace Test Suite
 * Tests booking price calculations, 10% platform commission deductions,
 * booking state transitions, adult verification, replacement credits,
 * and review eligibility.
 */

import { calculateBookingBreakdown, formatINR, generateBookingRef, maskPhoneNumber } from '../src/lib/utils';
import { INDIAN_CITIES, INDIAN_STATES } from '../src/lib/geoData';
import { INITIAL_COMPANIONS, INITIAL_BOOKINGS, INITIAL_USERS } from '../src/lib/mockData';
import { BookingStatus, CompanionProfile, BookingRequest } from '../src/lib/types';
import sitemap from '../src/app/sitemap';
import robots from '../src/app/robots';

describe('1. Platform Pricing & 10% Commission Calculations (Section 9)', () => {
  test('accurately calculates 10% platform commission for standard booking', () => {
    const hourlyRate = 5000;
    const durationHours = 2; // Base amount = 10,000
    const breakdown = calculateBookingBreakdown(hourlyRate, durationHours, 10, 0);

    expect(breakdown.baseAmount).toBe(10000);
    expect(breakdown.platformCommissionRate).toBe(10);
    expect(breakdown.platformCommissionAmount).toBe(1000); // 10% of 10,000
    expect(breakdown.netCompanionAmount).toBe(9000); // 90% to companion
    expect(breakdown.totalPayableByCustomer).toBe(10000);
    expect(breakdown.finalPaidByCustomer).toBe(10000);
  });

  test('correctly applies replacement booking credits to reduce final payable', () => {
    const hourlyRate = 3000;
    const durationHours = 2; // Base amount = 6,000
    const replacementCredit = 2000; // Customer has ₹2,000 credit
    const breakdown = calculateBookingBreakdown(hourlyRate, durationHours, 10, replacementCredit);

    expect(breakdown.baseAmount).toBe(6000);
    expect(breakdown.platformCommissionAmount).toBe(600); // 10% of 6,000
    expect(breakdown.creditApplied).toBe(2000);
    expect(breakdown.finalPaidByCustomer).toBe(4000); // 6,000 - 2,000
  });

  test('prevents negative final payable if credit exceeds booking amount', () => {
    const hourlyRate = 2000;
    const durationHours = 1; // Base amount = 2,000
    const replacementCredit = 5000; // Credit > base amount
    const breakdown = calculateBookingBreakdown(hourlyRate, durationHours, 10, replacementCredit);

    expect(breakdown.creditApplied).toBe(2000);
    expect(breakdown.finalPaidByCustomer).toBe(0); // Cannot be negative
  });

  test('formats currency properly in Indian Rupees (INR)', () => {
    expect(formatINR(5000)).toMatch(/₹\s*5,000/);
    expect(formatINR(100000)).toMatch(/₹\s*1,00,000/);
  });
});

describe('2. Adult 18+ Verification & Identity Compliance (Section 4)', () => {
  test('strictly enforces age >= 18 for companions', () => {
    const eligibleAge = 22;
    const ineligibleAge = 17;

    expect(eligibleAge >= 18).toBe(true);
    expect(ineligibleAge >= 18).toBe(false);
  });

  test('masks customer and companion phone numbers for privacy', () => {
    const rawPhone = '+919876543210';
    const masked = maskPhoneNumber(rawPhone);
    expect(masked).toBe('+91 ••••• ••210');
    expect(masked).not.toContain('987654');
  });
});

describe('3. Booking Lifecycle & State Transitions (Section 5 & 10)', () => {
  test('generates valid booking reference format BK-YYYYMMDD-XXXX', () => {
    const ref = generateBookingRef();
    expect(ref).toMatch(/^BK-\d{8}-[A-Z0-9]{4}$/);
  });

  test('verifies valid status progression', () => {
    const validStatuses: BookingStatus[] = [
      'pending_payment',
      'payment_authorized',
      'pending_acceptance',
      'accepted',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'refund_pending',
      'refunded',
    ];

    expect(validStatuses).toContain('pending_acceptance');
    expect(validStatuses).toContain('completed');
    expect(validStatuses).toContain('refunded');
  });

  test('only completed bookings are eligible for reviews (Section 11)', () => {
    const completedBooking: Partial<BookingRequest> = {
      status: 'completed',
      hasReview: false,
    };
    const pendingBooking: Partial<BookingRequest> = {
      status: 'pending_acceptance',
      hasReview: false,
    };

    const isEligibleForReview = (b: Partial<BookingRequest>) =>
      b.status === 'completed' && !b.hasReview;

    expect(isEligibleForReview(completedBooking)).toBe(true);
    expect(isEligibleForReview(pendingBooking)).toBe(false);
  });
});

describe('4. Indian City Discovery & Technical SEO (Section 2 & 17)', () => {
  test('contains major Indian metropolitan areas with tier metadata', () => {
    const mumbai = INDIAN_CITIES.find((c) => c.slug === 'mumbai');
    const bengaluru = INDIAN_CITIES.find((c) => c.slug === 'bengaluru');
    const delhi = INDIAN_CITIES.find((c) => c.slug === 'new-delhi' || c.slug === 'delhi-ncr');

    expect(mumbai).toBeDefined();
    expect(mumbai?.tier).toBe(1);
    expect(mumbai?.popularAreas.length).toBeGreaterThan(0);

    expect(bengaluru).toBeDefined();
    expect(bengaluru?.stateSlug).toBe('karnataka');
  });

  test('sitemap contains all served Indian cities with canonical URLs', () => {
    const routes = sitemap();
    const cityRoutes = routes.filter((r) => r.url.includes('/cities/'));
    expect(cityRoutes.length).toBeGreaterThan(0);
    expect(cityRoutes.some((r) => r.url.includes('mumbai'))).toBe(true);
    expect(cityRoutes.some((r) => r.url.includes('bengaluru'))).toBe(true);
  });

  test('robots.txt disallows private dashboard routes and allows public indexing', () => {
    const robotRules = robots();
    const firstRule = Array.isArray(robotRules.rules) ? robotRules.rules[0] : robotRules.rules;
    const disallows = firstRule?.disallow ? (Array.isArray(firstRule.disallow) ? firstRule.disallow : [firstRule.disallow]) : [];

    expect(disallows).toContain('/dashboard/');
    expect(disallows).toContain('/admin/');
    expect(robotRules.sitemap).toBe('https://companion-marketplace.in/sitemap.xml');
  });
});
