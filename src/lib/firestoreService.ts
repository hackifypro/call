import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  CompanionProfile,
  BookingRequest,
  ReviewRecord,
  VerificationRecord,
  CommissionLedgerEntry,
  BookingCredit,
  PayoutRecord,
  AdminAuditLog,
  FeatureSettings,
  SearchFilterState,
} from './types';
import {
  INITIAL_COMPANIONS,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
  INITIAL_VERIFICATIONS,
  INITIAL_COMMISSION_LEDGER,
  INITIAL_BOOKING_CREDITS,
  INITIAL_PAYOUTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FEATURE_SETTINGS,
} from './mockData';

// Collection references
const COMPANIONS_COL = 'companions';
const BOOKINGS_COL = 'bookings';
const REVIEWS_COL = 'reviews';
const VERIFICATIONS_COL = 'verifications';
const COMMISSIONS_COL = 'commission_ledger';
const CREDITS_COL = 'booking_credits';
const PAYOUTS_COL = 'payouts';
const AUDIT_LOGS_COL = 'audit_logs';
const SETTINGS_COL = 'feature_settings';

/**
 * 1. Seed Cloud Firestore with initial Indian marketplace records
 */
export async function seedFirestoreDatabase(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    let count = 0;

    // Seed Companions
    for (const comp of INITIAL_COMPANIONS) {
      await setDoc(doc(db, COMPANIONS_COL, comp.id), comp);
      count++;
    }

    // Seed Bookings
    for (const bk of INITIAL_BOOKINGS) {
      await setDoc(doc(db, BOOKINGS_COL, bk.id), bk);
      count++;
    }

    // Seed Reviews
    for (const rev of INITIAL_REVIEWS) {
      await setDoc(doc(db, REVIEWS_COL, rev.id), rev);
      count++;
    }

    // Seed Verifications
    for (const ver of INITIAL_VERIFICATIONS) {
      await setDoc(doc(db, VERIFICATIONS_COL, ver.id), ver);
      count++;
    }

    // Seed Commission Ledger
    for (const comm of INITIAL_COMMISSION_LEDGER) {
      await setDoc(doc(db, COMMISSIONS_COL, comm.id), comm);
      count++;
    }

    // Seed Booking Credits
    for (const cred of INITIAL_BOOKING_CREDITS) {
      await setDoc(doc(db, CREDITS_COL, cred.id), cred);
      count++;
    }

    // Seed Payouts
    for (const pay of INITIAL_PAYOUTS) {
      await setDoc(doc(db, PAYOUTS_COL, pay.id), pay);
      count++;
    }

    // Seed Feature Settings
    await setDoc(doc(db, SETTINGS_COL, 'general'), INITIAL_FEATURE_SETTINGS);
    count++;

    console.log(`Firestore seeded successfully with ${count} documents.`);
    return { success: true, count };
  } catch (err: any) {
    console.error('Failed to seed Firestore:', err);
    return { success: false, count: 0, error: err.message };
  }
}

/**
 * 2. Fetch Companions from Firestore with filter support
 */
export async function getFirestoreCompanions(filters?: Partial<SearchFilterState>): Promise<CompanionProfile[]> {
  try {
    const compRef = collection(db, COMPANIONS_COL);
    let q = query(compRef);

    if (filters?.citySlug) {
      q = query(compRef, where('citySlug', '==', filters.citySlug));
    } else if (filters?.stateSlug) {
      q = query(compRef, where('stateSlug', '==', filters.stateSlug));
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return INITIAL_COMPANIONS;
    }

    const profiles: CompanionProfile[] = [];
    snapshot.forEach((d) => profiles.push(d.data() as CompanionProfile));
    return profiles;
  } catch (err) {
    console.warn('Firestore fetch companions error, falling back to cached seed data:', err);
    return INITIAL_COMPANIONS;
  }
}

/**
 * 3. Save new Booking Request to Firestore
 */
export async function saveFirestoreBooking(booking: BookingRequest): Promise<boolean> {
  try {
    await setDoc(doc(db, BOOKINGS_COL, booking.id), booking);
    return true;
  } catch (err) {
    console.error('Error saving booking to Firestore:', err);
    return false;
  }
}

/**
 * 4. Update Booking Status in Firestore
 */
export async function updateFirestoreBookingStatus(
  bookingId: string,
  updates: Partial<BookingRequest>
): Promise<boolean> {
  try {
    await updateDoc(doc(db, BOOKINGS_COL, bookingId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('Error updating booking in Firestore:', err);
    return false;
  }
}

/**
 * 5. Record Commission Ledger Entry in Firestore
 */
export async function recordFirestoreCommission(entry: CommissionLedgerEntry): Promise<boolean> {
  try {
    await setDoc(doc(db, COMMISSIONS_COL, entry.id), entry);
    return true;
  } catch (err) {
    console.error('Error recording commission in Firestore:', err);
    return false;
  }
}

/**
 * 6. Save Adult Identity Verification Record
 */
export async function saveFirestoreVerification(ver: VerificationRecord): Promise<boolean> {
  try {
    await setDoc(doc(db, VERIFICATIONS_COL, ver.id), ver);
    return true;
  } catch (err) {
    console.error('Error saving verification in Firestore:', err);
    return false;
  }
}

/**
 * 7. Submit Review
 */
export async function saveFirestoreReview(review: ReviewRecord): Promise<boolean> {
  try {
    await setDoc(doc(db, REVIEWS_COL, review.id), review);
    return true;
  } catch (err) {
    console.error('Error saving review in Firestore:', err);
    return false;
  }
}
