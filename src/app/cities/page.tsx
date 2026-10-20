'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { INDIAN_STATES, INDIAN_CITIES } from '@/lib/geoData';
import { usePlatformStore } from '@/lib/store';
import { MapPin, Search, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CitiesDirectoryPage() {
  const { companions } = usePlatformStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStateSlug, setSelectedStateSlug] = useState('');

  const approvedCompanions = companions.filter((c) => c.status === 'approved');

  // Filter cities by search term & selected state
  const displayedCities = INDIAN_CITIES.filter((city) => {
    if (selectedStateSlug && city.stateSlug !== selectedStateSlug) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchCity = city.name.toLowerCase().includes(q);
      const matchState = city.stateName.toLowerCase().includes(q);
      return matchCity || matchState;
    }
    return true;
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Directory Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>India-Wide Geographic Coverage</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          All-India Cities & States Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Explore dedicated city landing pages for verified adult companions across India. Accurate,
          audited availability with zero false claims.
        </p>
      </div>

      {/* Search and State Filters */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 shadow-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by city or state name (e.g., Mumbai, Nashik, Bengaluru, Jaipur)..."
            className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:border-pink-500 focus:outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedStateSlug}
            onChange={(e) => setSelectedStateSlug(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:border-pink-500 focus:outline-none"
          >
            <option value="">All Indian States & UTs</option>
            {INDIAN_STATES.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedCities.map((city) => {
          const companionCount = approvedCompanions.filter(
            (c) => c.cityName.toLowerCase() === city.name.toLowerCase()
          ).length;
          const isActivelyServed = companionCount > 0;

          return (
            <Link
              key={city.id}
              href={`/cities/${city.stateSlug}/${city.slug}`}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-pink-500/40 hover:bg-slate-800/60 transition duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">{city.stateName}</span>
                  {isActivelyServed ? (
                    <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                      Expanding Soon
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition">
                  {city.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {city.metaDescription}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/60 mt-4 flex items-center justify-between text-xs">
                <span className="text-pink-400 font-semibold">
                  {companionCount} {companionCount === 1 ? 'Verified Companion' : 'Verified Companions'}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
