import { NextResponse } from 'next/server';
import { authenticateCustomerRequest } from '@/lib/session';
import { ServerDatabase } from '@/lib/serverDatabase';

export async function GET(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const favoriteIds = ServerDatabase.getCustomerFavorites(auth.user.id);
  const companions = ServerDatabase.getCompanions();
  const favoriteCompanions = companions.filter((c) => favoriteIds.includes(c.id));

  const recentlyViewedIds = ServerDatabase.getCustomerRecentlyViewed(auth.user.id);
  const recentCompanions = companions.filter((c) => recentlyViewedIds.includes(c.id));

  return NextResponse.json({
    success: true,
    favorites: favoriteCompanions,
    favoriteIds,
    recentlyViewed: recentCompanions,
  });
}

export async function POST(request: Request) {
  const auth = await authenticateCustomerRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { companionId, trackView } = body;

    if (!companionId) {
      return NextResponse.json({ success: false, error: 'Companion ID is required.' }, { status: 400 });
    }

    if (trackView) {
      const recent = ServerDatabase.addCustomerRecentlyViewed(auth.user.id, companionId);
      return NextResponse.json({ success: true, recentlyViewed: recent });
    }

    const result = ServerDatabase.toggleCustomerFavorite(auth.user.id, companionId);
    return NextResponse.json({
      success: true,
      isFavorite: result.isFavorite,
      favorites: result.favorites,
      message: result.isFavorite ? 'Added to favorites' : 'Removed from favorites',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 400 });
  }
}
