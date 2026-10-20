'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { INDIAN_STATES, INDIAN_CITIES } from '@/lib/geoData';
import { Search, Star, Clock, Sparkles } from 'lucide-react';
import { SearchFilterState } from '@/lib/types';

interface SearchBarProps {
  filters?: SearchFilterState;
  totalCount?: number;
  initialStateSlug?: string;
  initialCitySlug?: string;
  initialQuery?: string;
  initialAvailability?: boolean;
  initialMinRating?: number;
  initialMaxPrice?: number;
  onFilterChange?: (filters: SearchFilterState) => void;
  isCompact?: boolean;
}

export default function SearchBar({
  filters,
  totalCount,
  initialStateSlug = '',
  initialCitySlug = '',
  initialQuery = '',
  initialAvailability = false,
  initialMinRating = 0,
  initialMaxPrice = 5000,
  onFilterChange,
  isCompact = false,
}: SearchBarProps) {
  const router = useRouter();

  const [stateSlug, setStateSlug] = useState(filters?.stateSlug ?? initialStateSlug);
  const [citySlug, setCitySlug] = useState(filters?.citySlug ?? initialCitySlug);
  const [query, setQuery] = useState(filters?.query ?? initialQuery);
  const [isAvailableTodayOnly, setIsAvailableTodayOnly] = useState(
    filters?.isAvailableTodayOnly ?? initialAvailability
  );
  const [minRating, setMinRating] = useState(filters?.minRating ?? initialMinRating);
  const [maxPrice, setMaxPrice] = useState(filters?.maxPrice ?? initialMaxPrice);

  // Sync state if external filters change
  useEffect(() => {
    if (filters) {
      if (filters.stateSlug !== undefined) setStateSlug(filters.stateSlug);
      if (filters.citySlug !== undefined) setCitySlug(filters.citySlug);
      if (filters.query !== undefined) setQuery(filters.query);
      if (filters.isAvailableTodayOnly !== undefined) setIsAvailableTodayOnly(filters.isAvailableTodayOnly);
      if (filters.minRating !== undefined) setMinRating(filters.minRating);
      if (filters.maxPrice !== undefined) setMaxPrice(filters.maxPrice);
    }
  }, [filters]);

  // Available cities filtered by selected state
  const availableCities = useMemo(() => {
    if (!stateSlug) {
      return INDIAN_CITIES;
    }
    return INDIAN_CITIES.filter((c) => c.stateSlug === stateSlug);
  }, [stateSlug]);

  const notifyChange = (updated: Partial<SearchFilterState>) => {
    if (!onFilterChange) return;
    onFilterChange({
      stateSlug: updated.stateSlug !== undefined ? updated.stateSlug : stateSlug,
      citySlug: updated.citySlug !== undefined ? updated.citySlug : citySlug,
      query: updated.query !== undefined ? updated.query : query,
      isAvailableTodayOnly:
        updated.isAvailableTodayOnly !== undefined ? updated.isAvailableTodayOnly : isAvailableTodayOnly,
      minRating: updated.minRating !== undefined ? updated.minRating : minRating,
      maxPrice: updated.maxPrice !== undefined ? updated.maxPrice : maxPrice,
      selectedInterests: filters?.selectedInterests || [],
      selectedLanguages: filters?.selectedLanguages || [],
      genderPreference: filters?.genderPreference || '',
    });
  };

  const handleStateChange = (newVal: string) => {
    setStateSlug(newVal);
    setCitySlug(''); // reset city when state changes
    notifyChange({ stateSlug: newVal, citySlug: '' });
  };

  const handleCityChange = (newVal: string) => {
    setCitySlug(newVal);
    notifyChange({ citySlug: newVal });
  };

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onFilterChange) {
      notifyChange({ stateSlug, citySlug, query, isAvailableTodayOnly, minRating, maxPrice });
    } else {
      // Navigate to /explore with query parameters
      const params = new URLSearchParams();
      if (stateSlug) params.set('state', stateSlug);
      if (citySlug) params.set('city', citySlug);
      if (query) params.set('q', query);
      if (isAvailableTodayOnly) params.set('available', 'true');
      if (minRating > 0) params.set('rating', String(minRating));
      if (maxPrice < 10000) params.set('maxPrice', String(maxPrice));

      router.push(`/explore?${params.toString()}`);
    }
  };

  const handleReset = () => {
    setStateSlug('');
    setCitySlug('');
    setQuery('');
    setIsAvailableTodayOnly(false);
    setMinRating(0);
    setMaxPrice(5000);
    notifyChange({
      stateSlug: '',
      citySlug: '',
      query: '',
      isAvailableTodayOnly: false,
      minRating: 0,
      maxPrice: 5000,
    });
  };

  return (
    <div className="w-full glass rounded-2xl p-4 sm:p-5 border border-white/10 shadow-2xl relative">
      <form onSubmit={handleApply} className="space-y-4">
        {/* Top Primary Row: State, City, Text Query & Submit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Select State */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 tracking-wider uppercase">
              1. Select State
            </label>
            <div className="relative">
              <select
                value={stateSlug}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-slate-900/90 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-pink-500 focus:outline-none appearance-none"
              >
                <option value="">All States & UTs (India)</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state.id} value={state.slug}>
                    {state.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                ▼
              </div>
            </div>
          </div>

          {/* Select City */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 tracking-wider uppercase">
              2. Select City
            </label>
            <div className="relative">
              <select
                value={citySlug}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-slate-900/90 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-pink-500 focus:outline-none appearance-none"
              >
                <option value="">
                  {stateSlug ? 'All Cities in Selected State' : 'Select City or Region'}
                </option>
                {availableCities.map((city) => (
                  <option key={city.id} value={city.slug}>
                    {city.name} {city.isServed ? '● Active' : '○ Upcoming'}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                ▼
              </div>
            </div>
          </div>

          {/* Search Profiles Query */}
          <div className="lg:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 tracking-wider uppercase">
              3. Search Profiles
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, fine dining, art, literature, gala..."
                className="w-full bg-slate-900/90 text-slate-100 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-700/80 focus:border-pink-500 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Search Action Button */}
          <div className="lg:col-span-2 pt-5 sm:pt-0">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 transition text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Search Now</span>
            </button>
          </div>
        </div>

        {/* Second Row: Filter by Availability, Rating, Published Price Range */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Filter by Availability */}
            <label className="flex items-center space-x-2 bg-slate-900/80 hover:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAvailableTodayOnly}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsAvailableTodayOnly(checked);
                  notifyChange({ isAvailableTodayOnly: checked });
                }}
                className="rounded border-slate-700 text-pink-500 focus:ring-0 w-3.5 h-3.5 bg-slate-800"
              />
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Available Today Only
              </span>
            </label>

            {/* Filter by Rating */}
            <div className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-700">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-slate-400">Rating:</span>
              <select
                value={minRating}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMinRating(val);
                  notifyChange({ minRating: val });
                }}
                className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer"
              >
                <option value={0} className="bg-slate-900">Any Rating</option>
                <option value={4.0} className="bg-slate-900">4.0+ Stars</option>
                <option value={4.5} className="bg-slate-900">4.5+ Stars</option>
                <option value={4.8} className="bg-slate-900">4.8+ Stars</option>
                <option value={5.0} className="bg-slate-900">5.0 Perfect</option>
              </select>
            </div>

            {/* Filter by Published Price Range */}
            <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-700">
              <span className="text-slate-400">Max Rate:</span>
              <span className="text-pink-400 font-semibold font-mono">₹{maxPrice}/hr</span>
              <input
                type="range"
                min={1500}
                max={15000}
                step={250}
                value={maxPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxPrice(val);
                  notifyChange({ maxPrice: val });
                }}
                className="w-24 accent-pink-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Reset Filters & Total count */}
          <div className="flex items-center space-x-4">
            {totalCount !== undefined && (
              <span className="text-xs text-slate-400">
                Found <span className="text-white font-semibold">{totalCount}</span> profiles
              </span>
            )}
            {(stateSlug || citySlug || query || isAvailableTodayOnly || minRating > 0 || maxPrice < 5000) && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
