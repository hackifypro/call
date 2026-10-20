'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Filter,
  Sparkles,
  MapPin,
  Star,
  Shield,
  Heart,
  X,
  RotateCcw,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info,
  CreditCard,
} from 'lucide-react';
import { INDIAN_STATES, INDIAN_CITIES } from '@/lib/geoData';
import { CompanionProfile, BookingCredit } from '@/lib/types';
import { formatINR, formatDateOnly } from '@/lib/utils';

export default function CustomerExplorePage() {
  const [companions, setCompanions] = useState<CompanionProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeCredits, setActiveCredits] = useState<BookingCredit[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'rating'>('recommended');
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('swipe');

  // Swipe Deck state
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState<{ id: string; action: 'skip' | 'favorite' }[]>([]);

  // Booking Modal State
  const [bookingCompanion, setBookingCompanion] = useState<CompanionProfile | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('18:00');
  const [durationHours, setDurationHours] = useState(2);
  const [meetupLocation, setMeetupLocation] = useState('');
  const [occasionType, setOccasionType] = useState('Fine Dining & Social Companion');
  const [specialNotes, setSpecialNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI (Instant Escrow)');
  const [appliedCreditId, setAppliedCreditId] = useState<string>('');
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{ bookingRef: string; message: string } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch verified companions & customer favorites
  useEffect(() => {
    async function initExplore() {
      try {
        const [compRes, favRes, dashRes] = await Promise.all([
          fetch('/api/companions'),
          fetch('/api/customer/favorites'),
          fetch('/api/customer/dashboard'),
        ]);

        if (compRes.ok) {
          const compData = await compRes.json();
          // Filter only approved companions
          const approved = (compData.companions || []).filter((c: CompanionProfile) => c.status === 'approved');
          setCompanions(approved);
        }

        if (favRes.ok) {
          const favData = await favRes.json();
          if (favData.favoriteIds) {
            setFavorites(favData.favoriteIds);
          }
        }

        if (dashRes.ok) {
          const dashData = await dashRes.json();
          if (dashData.activeCredits) {
            setActiveCredits(dashData.activeCredits);
          }
        }
      } catch (err) {
        console.error('Failed to initialize explore:', err);
      } finally {
        setLoading(false);
      }
    }
    initExplore();
  }, []);

  // Filter & sort companions
  const filteredCompanions = companions.filter((c) => {
    if (selectedState && c.stateSlug !== selectedState) return false;
    if (selectedCity && c.cityName.toLowerCase() !== selectedCity.toLowerCase()) return false;
    if (c.hourlyRate > maxPrice) return false;
    if (minRating > 0 && c.rating < minRating) return false;
    if (verifiedOnly && !c.isVerified) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.displayName.toLowerCase().includes(q);
      const matchBio = c.bio.toLowerCase().includes(q);
      const matchInterests = c.interests?.some((i) => i.toLowerCase().includes(q));
      const matchLanguages = c.languages?.some((l) => l.toLowerCase().includes(q));
      const matchCity = c.cityName.toLowerCase().includes(q);
      if (!matchName && !matchBio && !matchInterests && !matchLanguages && !matchCity) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_low') return a.hourlyRate - b.hourlyRate;
    if (sortBy === 'price_high') return b.hourlyRate - a.hourlyRate;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.completedBookings || 0) - (a.completedBookings || 0);
  });

  // Toggle favorite API call
  const handleToggleFavorite = async (companionId: string) => {
    try {
      const res = await fetch('/api/customer/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId }),
      });
      if (res.ok) {
        const json = await res.json();
        setFavorites(json.favorites || []);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  // Swipe card handler
  const handleSwipe = async (action: 'skip' | 'favorite') => {
    const current = filteredCompanions[currentDeckIndex];
    if (!current) return;

    if (action === 'favorite') {
      await handleToggleFavorite(current.id);
    }

    setSwipeHistory([...swipeHistory, { id: current.id, action }]);
    setCurrentDeckIndex((prev) => prev + 1);
  };

  const handleUndoSwipe = () => {
    if (swipeHistory.length === 0 || currentDeckIndex === 0) return;
    const last = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory((prev) => prev.slice(0, -1));
    setCurrentDeckIndex((prev) => Math.max(0, prev - 1));
  };

  // Pricing calculations for booking
  const selectedCredit = activeCredits.find((c) => c.id === appliedCreditId);
  const baseBookingAmount = bookingCompanion ? bookingCompanion.hourlyRate * durationHours : 0;
  const platformFee = Math.round(baseBookingAmount * 0.1); // 10%
  const creditDiscount = selectedCredit ? Math.min(selectedCredit.creditAmount, baseBookingAmount) : 0;
  const totalPayable = Math.max(0, baseBookingAmount - creditDiscount);

  // Submit booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCompanion) return;
    setBookingError(null);

    if (!bookingDate) {
      setBookingError('Please choose a valid booking date.');
      return;
    }
    if (!meetupLocation.trim()) {
      setBookingError('Please specify the meeting venue (hotel, fine dining restaurant, lounge).');
      return;
    }
    if (!acceptPolicy) {
      setBookingError('You must agree to the Section 11 cancellation and refund policy.');
      return;
    }

    setBookingSubmitting(true);
    try {
      const res = await fetch('/api/customer/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companionId: bookingCompanion.id,
          bookingDate,
          startTime: bookingTime,
          durationHours,
          meetupLocation: meetupLocation.trim(),
          occasionType,
          specialNotes: specialNotes.trim(),
          paymentMethod,
          useCreditId: appliedCreditId || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Booking request failed.');
      }

      setBookingSuccess({
        bookingRef: json.booking.bookingRef,
        message: 'Your booking has been reserved in escrow. Awaiting companion confirmation.',
      });
    } catch (err: any) {
      setBookingError(err.message || 'Failed to submit booking.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Get available cities for selected state
  const availableCities = selectedState ? INDIAN_CITIES.filter((c) => c.stateSlug === selectedState) : INDIAN_CITIES;

  return (
    <div className="space-y-6">
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Explore Companions</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {filteredCompanions.length} Verified
            </span>
          </h1>
          <p className="text-sm text-slate-400">
            Swipe through verified companions or browse the catalog by city and pricing.
          </p>
        </div>

        {/* View Switcher: Swipe Deck vs Grid */}
        <div className="inline-flex rounded-2xl bg-[#0e1024] p-1 border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('swipe')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'swipe'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Swipe Deck</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Catalog Grid</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0e1024] border border-white/10 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, interests, languages..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* State Select */}
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity('');
              setCurrentDeckIndex(0);
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-[#14162e] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="">All Indian States & UTs (36)</option>
            {INDIAN_STATES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>

          {/* City Select */}
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setCurrentDeckIndex(0);
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-[#14162e] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="">All Supported Cities</option>
            {availableCities.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.tier})
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#14162e] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="recommended">Sort: Most Booked</option>
            <option value="rating">Sort: Top Rated (★)</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Max Rate:</span>
              <span className="font-bold text-purple-300">{formatINR(maxPrice)}/hr</span>
              <input
                type="range"
                min="1500"
                max="15000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 sm:w-32 accent-purple-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Rating:</span>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
              >
                <option value={0}>Any</option>
                <option value={4.5}>4.5+ ★</option>
                <option value={4.8}>4.8+ ★</option>
              </select>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded accent-purple-600"
              />
              <span>Verified Adult ID Only</span>
            </label>
          </div>

          {(searchQuery || selectedState || selectedCity || minRating > 0 || verifiedOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedState('');
                setSelectedCity('');
                setMinRating(0);
                setMaxPrice(10000);
                setVerifiedOnly(false);
                setCurrentDeckIndex(0);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* SWIPE DECK MODE */}
      {viewMode === 'swipe' && (
        <div className="max-w-md mx-auto py-4">
          {filteredCompanions.length === 0 ? (
            <div className="text-center py-16 px-6 rounded-3xl bg-[#0e1024] border border-white/10 space-y-4">
              <Sparkles className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Profiles Found</h3>
              <p className="text-slate-400 text-xs max-w-xs mx-auto">
                No companions matched your selected filters or city. Try resetting filters or expanding search range.
              </p>
            </div>
          ) : currentDeckIndex >= filteredCompanions.length ? (
            <div className="text-center py-16 px-6 rounded-3xl bg-[#0e1024] border border-white/10 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">You've Explored All Profiles!</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                You reached the end of the deck for these filters. Check your favorites or start over.
              </p>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => setCurrentDeckIndex(0)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  Start Over
                </button>
                <Link
                  href="/customer/favorites"
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                >
                  View Favorites ({favorites.length})
                </Link>
              </div>
            </div>
          ) : (
            (() => {
              const profile = filteredCompanions[currentDeckIndex];
              const isFav = favorites.includes(profile.id);

              return (
                <div className="space-y-4">
                  {/* The Swipe Card */}
                  <div className="relative rounded-3xl overflow-hidden bg-[#0e1024] border border-white/15 shadow-2xl group transition-all">
                    {/* Hero Image */}
                    <div className="relative h-[440px] w-full bg-slate-900">
                      <Image
                        src={profile.primaryPhotoUrl}
                        alt={profile.displayName}
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e1024] via-[#0e1024]/30 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-purple-400" />
                            <span>{profile.cityName}</span>
                          </span>
                          {profile.isVerified && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-white text-xs font-bold flex items-center space-x-1">
                              <Shield className="w-3.5 h-3.5" />
                              <span>18+ Verified</span>
                            </span>
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-black font-extrabold text-xs flex items-center space-x-1">
                          <Star className="w-3.5 h-3.5 fill-black" />
                          <span>{profile.rating}</span>
                        </span>
                      </div>

                      {/* Bottom Info on Card */}
                      <div className="absolute bottom-4 left-4 right-4 space-y-2">
                        <div className="flex items-end justify-between">
                          <div>
                            <h2 className="text-2xl font-black text-white">
                              {profile.displayName}, {profile.age}
                            </h2>
                            <p className="text-xs text-purple-300 font-semibold">{profile.gender} Companion</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Hourly Rate</span>
                            <span className="text-xl font-extrabold text-white">{formatINR(profile.hourlyRate)}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                          {profile.bio}
                        </p>

                        {/* Interests Badges */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {profile.interests?.slice(0, 3).map((interest) => (
                            <span
                              key={interest}
                              className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-[10px] font-medium text-slate-200"
                            >
                              {interest}
                            </span>
                          ))}
                          {profile.languages?.slice(0, 2).map((lang) => (
                            <span
                              key={lang}
                              className="px-2 py-0.5 rounded-md bg-purple-500/20 text-[10px] font-medium text-purple-300 border border-purple-500/30"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick View Details Button */}
                    <div className="p-3 bg-[#0a0b1c] border-t border-white/5 flex items-center justify-between">
                      <Link
                        href={`/customer/profiles/${profile.id}`}
                        className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Full Profile & Availability</span>
                      </Link>
                      <span className="text-[10px] text-slate-400">
                        {currentDeckIndex + 1} of {filteredCompanions.length}
                      </span>
                    </div>
                  </div>

                  {/* Swipe Action Controls */}
                  <div className="flex items-center justify-center space-x-4 pt-2">
                    {/* Undo */}
                    <button
                      onClick={handleUndoSwipe}
                      disabled={swipeHistory.length === 0}
                      className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
                      title="Undo Previous Swipe"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>

                    {/* Dislike / Skip */}
                    <button
                      onClick={() => handleSwipe('skip')}
                      className="w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:scale-105 flex items-center justify-center shadow-lg shadow-rose-950/30 transition-all"
                      title="Skip (Swipe Left)"
                    >
                      <X className="w-8 h-8" />
                    </button>

                    {/* Favorite (Swipe Right) */}
                    <button
                      onClick={() => handleSwipe('favorite')}
                      className={`w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-lg transition-all hover:scale-105 ${
                        isFav
                          ? 'bg-pink-600 border-pink-400 text-white shadow-pink-900/50'
                          : 'bg-pink-500/10 border-pink-500/30 text-pink-400 hover:bg-pink-500/20 shadow-pink-950/30'
                      }`}
                      title="Favorite (Swipe Right)"
                    >
                      <Heart className={`w-8 h-8 ${isFav ? 'fill-white' : ''}`} />
                    </button>

                    {/* Book Now Instant */}
                    <button
                      onClick={() => {
                        setBookingCompanion(profile);
                        setBookingSuccess(null);
                        setBookingError(null);
                      }}
                      className="px-5 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-lg shadow-purple-900/40 hover:scale-105 transition-all flex items-center space-x-1.5"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Now</span>
                    </button>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* CATALOG GRID MODE */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanions.map((profile) => {
            const isFav = favorites.includes(profile.id);

            return (
              <div
                key={profile.id}
                className="rounded-3xl overflow-hidden bg-[#0e1024] border border-white/10 hover:border-purple-500/30 transition-all shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
                    <Image
                      src={profile.primaryPhotoUrl}
                      alt={profile.displayName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e1024] via-transparent to-transparent" />

                    {/* Top Pill Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span>{profile.cityName}</span>
                      </span>

                      <button
                        onClick={() => handleToggleFavorite(profile.id)}
                        className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                          isFav
                            ? 'bg-pink-600 text-white border-pink-400'
                            : 'bg-black/50 text-slate-300 border-white/20 hover:text-pink-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    {/* Rating & Verified */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-400/90 text-black text-xs font-black flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-black" />
                        <span>{profile.rating} ({profile.reviewCount || 0})</span>
                      </span>
                      {profile.isVerified && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/80 text-white text-[11px] font-bold flex items-center space-x-1">
                          <Shield className="w-3 h-3" />
                          <span>18+ Verified</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                          {profile.displayName}, {profile.age}
                        </h3>
                        <p className="text-xs text-slate-400">{profile.gender} • {profile.supportedCities?.slice(0, 2).join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Rate</span>
                        <span className="font-extrabold text-white text-base">{formatINR(profile.hourlyRate)}/hr</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {profile.bio}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {profile.interests?.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-medium text-slate-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <Link
                    href={`/customer/profiles/${profile.id}`}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs text-center border border-white/10 transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => {
                      setBookingCompanion(profile);
                      setBookingSuccess(null);
                      setBookingError(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 transition-all"
                  >
                    Request Booking
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingCompanion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#101226] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 shrink-0">
                  <Image
                    src={bookingCompanion.primaryPhotoUrl}
                    alt={bookingCompanion.displayName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Book {bookingCompanion.displayName}</h3>
                  <p className="text-xs text-purple-400">
                    {bookingCompanion.cityName} • {formatINR(bookingCompanion.hourlyRate)}/hr
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBookingCompanion(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white">Booking Confirmed & In Escrow!</h4>
                <p className="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
                  {bookingSuccess.message}
                </p>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 inline-block">
                  <span className="text-xs text-slate-400 block">Booking Reference:</span>
                  <span className="font-mono font-bold text-purple-300 text-base">{bookingSuccess.bookingRef}</span>
                </div>
                <div className="pt-4 flex items-center justify-center space-x-3">
                  <Link
                    href="/customer/bookings"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                  >
                    View in My Bookings
                  </Link>
                  <button
                    onClick={() => setBookingCompanion(null)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 pt-4 text-xs">
                {bookingError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Appointment Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration (Hours)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 4, 8].map((hrs) => (
                      <button
                        type="button"
                        key={hrs}
                        onClick={() => setDurationHours(hrs)}
                        className={`py-2 rounded-xl font-bold border transition-all ${
                          durationHours === hrs
                            ? 'bg-purple-600 text-white border-purple-400'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {hrs} {hrs === 1 ? 'Hour' : 'Hours'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meetup Venue */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Meeting Location (Public / Dining / Hotel Lounge)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Taj Mahal Palace, Colaba or Fine Dining Restaurant"
                    value={meetupLocation}
                    onChange={(e) => setMeetupLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Occasion / Notes */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Occasion Type</label>
                    <select
                      value={occasionType}
                      onChange={(e) => setOccasionType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#14162e] border border-white/10 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Fine Dining & Social Companion">Fine Dining & Social</option>
                      <option value="Corporate Gala & Reception">Corporate Gala</option>
                      <option value="Art Exhibition & Museum Walk">Art & Cultural Event</option>
                      <option value="Travel & City Guide">City Exploration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#14162e] border border-white/10 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="UPI (Instant Escrow)">UPI (Google Pay / PhonePe)</option>
                      <option value="Credit / Debit Card (Razorpay)">Credit / Debit Card</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>
                </div>

                {/* Section 11 Replacement Credits Available */}
                {activeCredits.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-300 font-semibold flex items-center space-x-1">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Apply Replacement Credit</span>
                      </span>
                    </div>
                    <select
                      value={appliedCreditId}
                      onChange={(e) => setAppliedCreditId(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#0d1f1a] border border-emerald-500/40 text-emerald-200 text-xs"
                    >
                      <option value="">Do not apply credit</option>
                      {activeCredits.map((c) => (
                        <option key={c.id} value={c.id}>
                          Apply {formatINR(c.creditAmount)} ({c.reason.slice(0, 30)}...)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Transparent Price Breakdown */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>Base Hourly ({durationHours} hrs × {formatINR(bookingCompanion.hourlyRate)}):</span>
                    <span className="font-semibold text-white">{formatINR(baseBookingAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Platform Service & Escrow Protection (10%):</span>
                    <span>{formatINR(platformFee)} (Included)</span>
                  </div>
                  {creditDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Replacement Credit Applied:</span>
                      <span>- {formatINR(creditDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-white/10 text-white font-extrabold text-sm">
                    <span>Total Amount Payable:</span>
                    <span className="text-purple-300">{formatINR(totalPayable)}</span>
                  </div>
                </div>

                {/* Section 11 Terms Checkbox */}
                <label className="flex items-start space-x-2 pt-1 text-slate-400 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptPolicy}
                    onChange={(e) => setAcceptPolicy(e.target.checked)}
                    className="mt-0.5 rounded accent-purple-600"
                  />
                  <span>
                    I agree to the <strong className="text-slate-200">Section 11 Cancellation Policy</strong> (100% refund/credit if cancelled &gt;24 hrs prior, 50% if 12-24 hrs, non-refundable within 12 hrs). All funds held in escrow.
                  </span>
                </label>

                {/* Submit Actions */}
                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setBookingCompanion(null)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-900/30 disabled:opacity-50"
                  >
                    {bookingSubmitting ? 'Securing Escrow...' : `Confirm & Pay ${formatINR(totalPayable)}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
