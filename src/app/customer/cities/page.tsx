'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Search,
  Building2,
  Sparkles,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { INDIAN_STATES, INDIAN_CITIES } from '@/lib/geoData';
import { CompanionProfile } from '@/lib/types';

export default function CustomerCitiesPage() {
  const [companions, setCompanions] = useState<CompanionProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateSlug, setSelectedStateSlug] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'Tier 1' | 'Tier 2'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanions() {
      try {
        const res = await fetch('/api/companions');
        if (res.ok) {
          const json = await res.json();
          setCompanions((json.companions || []).filter((c: CompanionProfile) => c.status === 'approved'));
        }
      } catch (err) {
        console.error('Failed to load companions for cities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCompanions();
  }, []);

  // Compute active companions per city
  const cityCounts = companions.reduce<Record<string, number>>((acc, c) => {
    const key = c.cityName.toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Flatten all cities with state metadata
  const allCities = INDIAN_CITIES.map((city) => ({
    ...city,
    activeCompanions: cityCounts[city.name.toLowerCase()] || 0,
  }));

  // Filter cities
  const filteredCities = allCities.filter((city) => {
    if (selectedStateSlug && city.stateSlug !== selectedStateSlug) return false;
    if (tierFilter !== 'all' && `Tier ${city.tier}` !== tierFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCity = city.name.toLowerCase().includes(q);
      const matchState = city.stateName.toLowerCase().includes(q);
      if (!matchCity && !matchState) return false;
    }
    return true;
  }).sort((a, b) => b.activeCompanions - a.activeCompanions || a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>India City Explorer</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              36 States & UTs
            </span>
          </h1>
          <p className="text-sm text-slate-400">
            Browse verified companion availability by city. Only cities with actively verified profiles are displayed as served.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0e1024] border border-white/10 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city or state name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <select
            value={selectedStateSlug}
            onChange={(e) => setSelectedStateSlug(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#14162e] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="">All 36 States & Territories</option>
            {INDIAN_STATES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={tierFilter}
            onChange={(e: any) => setTierFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#14162e] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="all">All City Tiers</option>
            <option value="Tier 1">Tier 1 Metros (Mumbai, Delhi, Bengaluru, etc.)</option>
            <option value="Tier 2">Tier 2 Emerging Cities (Pune, Jaipur, etc.)</option>
          </select>
        </div>
      </div>

      {/* City Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCities.map((city) => {
          const isServed = city.activeCompanions > 0;

          return (
            <div
              key={city.id}
              className={`p-5 rounded-2xl border transition-all ${
                isServed
                  ? 'bg-[#0e1024] border-white/10 hover:border-purple-500/40 shadow-lg'
                  : 'bg-[#0e1024]/40 border-white/5 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isServed
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                        : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{city.name}</h3>
                    <p className="text-xs text-slate-400">{city.stateName}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    city.tier === 1
                      ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  Tier {city.tier}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <div>
                  {isServed ? (
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{city.activeCompanions} Verified Active</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Opening Soon</span>
                    </span>
                  )}
                </div>

                {isServed ? (
                  <Link
                    href={`/customer/explore`}
                    className="inline-flex items-center space-x-1 text-purple-400 hover:text-purple-300 font-bold"
                  >
                    <span>Browse</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="text-[11px] text-slate-500">Waitlist</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
