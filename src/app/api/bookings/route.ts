import { NextResponse } from 'next/server';
import { calculateBookingBreakdown, generateBookingRef } from '@/lib/utils';
import { INITIAL_COMPANIONS } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companionId, durationHours, bookingDate, startTime, meetupLocation } = body;

    const companion = INITIAL_COMPANIONS.find((c) => c.id === companionId);
    if (!companion) {
      return NextResponse.json(
        { success: false, error: 'Companion not found or inactive.' },
        { status: 404 }
      );
    }

    // SERVER-SIDE CALCULATION OF 10% COMMISSION (Section 10 requirement)
    const breakdown = calculateBookingBreakdown(companion.hourlyRate, durationHours, 10, 0);
    const bookingRef = generateBookingRef();

    return NextResponse.json({
      success: true,
      bookingRef,
      status: 'pending_acceptance',
      priceBreakdown: breakdown,
      message: 'Booking authorized in escrow. Awaiting companion confirmation.',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal booking server error.' },
      { status: 500 }
    );
  }
}
