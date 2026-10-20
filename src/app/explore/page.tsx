'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePlatformStore } from '@/lib/store';
import SwipeDeck from '@/components/SwipeDeck';
import ProfileCard from '@/components/ProfileCard';
import SearchBar from '@/components/SearchBar';
import { INDIAN_CITIES } from '@/lib/geoData';
import {
  Compass,
  Grid,
  Layers,
  Filter,
  Sparkles,
  MapPin,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

function ExploreContent() {
  const searchParams = useSearchParams();
  const { companions } = usePlatformStore();

  const [viewMode, setViewMode] = useState<'deck' | 'grid'>('deck');
  const [filterState, setFilterState] = useState({
    stateSlug: searchParams.get('state') || '',
    citySlug: searchParams.get('city') || '',
    query: searchParams.get('q') || '',
    isAvailableTodayOnly: searchParams.get('available') === 'true',
    minRating: Number(searchParams.get('rating') || 0),
    maxPrice: Number(searchParams.get('maxPrice') || 6000),
  });

  // Filter approved companions according to search criteria
  const filteredProfiles = useMemo(() => {
    return companions.filter((profile) => {
      // Must be approved to appear publicly (Section 4 & 5 rule)
      if (profile.status !== 'approved') return false;

      // State filter
      if (filterState.stateSlug && profile.stateSlug !== filterState.stateSlug) {
        return false;
      }

      // City filter
      if (filterState.citySlug && profile.citySlug !== filterState.citySlug) {
        return false;
      }

      // Available today only
      if (filterState.isAvailableTodayOnly && !profile.isAvailable) {
        return false;
      }

      // Min rating
      if (filterState.minRating > 0 && profile.averageRating < filterState.minRating) {
        return false;
      }

      // Max price
      if (profile.hourlyRate > filterState.maxPrice) {
        return false;
      }

      // Free text query (name, bio, interests, languages, city)
      if (filterState.query.trim()) {
        const q = filterState.query.toLowerCase();
        const matchName = profile.displayName.toLowerCase().includes(q);
        const matchBio = profile.bio.toLowerCase().includes(q);
        const matchCity = profile.cityName.toLowerCase().includes(q);
        const matchInterest = profile.interests.some((i) => i.toLowerCase().includes(q));
        const matchLang = profile.languages.some((l) => l.toLowerCase().includes(q));

        if (!matchName && !matchBio && !matchCity && !matchInterest && !matchLang) {
          return false;
        }
      }

      return true;
    });
  }, [companions, filterState]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-pink-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Swipe Discovery & Discovery Grid</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Discover Verified Companions
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            100% ID-verified adults • Showing {filteredProfiles.length} verified{' '}
            {filteredProfiles.length === 1 ? 'profile' : 'profiles'}
          </p>
        </div>

        {/* View Mode Switcher: Swipe Deck vs Grid */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('deck')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'deck'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Swipe Deck</span>
          </button>

          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'grid'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>
        </div>
      </div>

      {/* Embedded Filter Bar */}
      <SearchBar
        initialStateSlug={filterState.stateSlug}
        initialCitySlug={filterState.citySlug}
        initialQuery={filterState.query}
        initialAvailability={filterState.isAvailableTodayOnly}
        initialMinRating={filterState.minRating}
        initialMaxPrice={filterState.maxPrice}
        onFilterChange={(newFilters) => setFilterState(newFilters)}
        isCompact
      />

      {/* Main Content Area */}
      {filteredProfiles.length === 0 ? (
        /* Empty State */
        <div className="glass-card rounded-3xl p-10 text-center max-w-md mx-auto my-12 border border-white/10 shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Verified Profiles Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No approved adult companion profiles match your current search filters or selected city.
            </p>
          </div>
          <button
            onClick={() =>
              setFilterState({
                stateSlug: '',
                citySlug: '',
                query: '',
                isAvailableTodayOnly: false,
                minRating: 0,
                maxPrice: 6000,
              })
            }
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      ) : viewMode === 'deck' ? (
        /* Tinder-like Swipe Deck View */
        <div className="py-4">
          <SwipeDeck profiles={filteredProfiles} />
        </div>
      ) : (
        /* Grid Discovery View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          {filteredProfiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading discovery...</span>
          </div>
        </div>
      }
    >
      <ExploreContent />
    </React.Suspense>
  );
}
