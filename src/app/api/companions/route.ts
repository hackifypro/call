import { NextResponse } from 'next/server';
import { INITIAL_COMPANIONS } from '@/lib/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const state = searchParams.get('state');

  let results = INITIAL_COMPANIONS.filter((c) => c.status === 'approved');

  if (city) {
    results = results.filter((c) => c.citySlug.toLowerCase() === city.toLowerCase());
  }
  if (state) {
    results = results.filter((c) => c.stateSlug.toLowerCase() === state.toLowerCase());
  }

  // Sanitize: Never expose private legal names or verification documents
  const sanitized = results.map((c) => ({
    id: c.id,
    displayName: c.displayName,
    age: c.age,
    gender: c.gender,
    bio: c.bio,
    interests: c.interests,
    languages: c.languages,
    stateName: c.stateName,
    cityName: c.cityName,
    hourlyRate: c.hourlyRate,
    primaryPhotoUrl: c.primaryPhotoUrl,
    galleryPhotos: c.galleryPhotos,
    averageRating: c.averageRating,
    reviewCount: c.reviewCount,
    completedBookings: c.completedBookings,
    isAvailable: c.isAvailable,
  }));

  return NextResponse.json({ success: true, count: sanitized.length, data: sanitized });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validate adult age
    if (!body.age || body.age < 18) {
      return NextResponse.json(
        { success: false, error: 'Registration requires strict 18+ adult age.' },
        { status: 400 }
      );
    }

    const newCompanionId = `comp-${Date.now()}`;
    return NextResponse.json({
      success: true,
      message: 'Companion application submitted into Trust & Safety queue.',
      companionId: newCompanionId,
      status: 'pending_approval',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Malformed request payload.' },
      { status: 400 }
    );
  }
}
