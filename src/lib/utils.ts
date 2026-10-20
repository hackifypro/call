import { BookingPriceBreakdown, BookingStatus, CompanionStatus } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian Rupees (INR ₹) with appropriate comma grouping
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate transparent booking price breakdown with 10% platform commission
 * Guaranteed server-side logic — never trust client amounts!
 */
export function calculateBookingBreakdown(
  hourlyRate: number,
  durationHours: number,
  customCommissionRate: number = 10,
  replacementCreditAmount: number = 0
): BookingPriceBreakdown {
  const safeHours = Math.max(1, durationHours);
  const baseAmount = Math.round(hourlyRate * safeHours);
  
  // Platform Commission: Configured rate (default 10%)
  const rate = Number(customCommissionRate) || 10;
  const platformCommissionAmount = Math.round((baseAmount * rate) / 100);
  
  // Tax (GST if applicable - currently 0% or included in total)
  const taxAmount = 0;
  
  const totalPayableByCustomer = baseAmount + taxAmount;
  const netCompanionAmount = baseAmount - platformCommissionAmount;
  
  // Credit application logic
  const creditApplied = Math.min(replacementCreditAmount, totalPayableByCustomer);
  const finalPaidByCustomer = Math.max(0, totalPayableByCustomer - creditApplied);

  return {
    baseAmount,
    durationHours: safeHours,
    platformCommissionRate: rate,
    platformCommissionAmount,
    taxAmount,
    totalPayableByCustomer,
    netCompanionAmount,
    creditApplied,
    finalPaidByCustomer,
  };
}

/**
 * Format ISO date string into readable Indian standard format (e.g. 24 Oct 2026, 7:30 PM)
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatDateOnly(dateString: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Mask legal name or phone for privacy compliance
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '••••••••••';
  if (phone.length <= 4) return '••••' + phone;
  return phone.slice(0, 3) + '••••' + phone.slice(-4);
}

export function maskLegalName(name?: string): string {
  if (!name) return '••••••';
  const parts = name.trim().split(' ');
  return parts.map(p => p[0] + '••••').join(' ');
}

/**
 * Generate human-readable booking reference
 */
export function generateBookingRef(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${year}${month}${day}-${rand}`;
}

/**
 * Status styling utilities
 */
export function getBookingStatusBadge(status: BookingStatus) {
  switch (status) {
    case 'accepted':
    case 'confirmed':
      return { label: 'Confirmed & Accepted', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    case 'in_progress':
      return { label: 'In Progress', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    case 'completed':
      return { label: 'Completed', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    case 'pending_acceptance':
      return { label: 'Awaiting Companion Acceptance', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    case 'pending_payment':
      return { label: 'Pending Payment', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
    case 'payment_authorized':
      return { label: 'Payment Authorized', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
    case 'rejected':
      return { label: 'Declined by Companion', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    case 'cancelled':
      return { label: 'Cancelled', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
    case 'refund_pending':
      return { label: 'Refund In Progress', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
    case 'refunded':
      return { label: 'Refunded to Source', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    default:
      return { label: status, color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
  }
}

export function getCompanionStatusBadge(status: CompanionStatus) {
  switch (status) {
    case 'approved':
      return { label: 'Verified & Active', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    case 'pending_approval':
      return { label: 'Under Review', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    case 'pending_verification':
      return { label: 'Pending ID Verification', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
    case 'rejected':
      return { label: 'Application Rejected', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
    case 'suspended':
      return { label: 'Suspended', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    case 'deactivated':
      return { label: 'Deactivated', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
    case 'draft':
      return { label: 'Draft Profile', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
  }
}
