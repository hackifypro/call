'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Star,
  MapPin,
  Trash2,
  Calendar,
  Sparkles,
  Shield,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { CompanionProfile } from '@/lib/types';

export default function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState<CompanionProfile[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<CompanionProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetch('/api/customer/favorites');
      if (res.ok) {
        const json = await res.json();
        setFavorites(json.favorites || []);
        setRecentlyViewed(json.recentlyViewed || []);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemoveFavorite = async (companionId: string) => {
    try {
      const res = await fetch('/api/customer/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId }),
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((c) => c.id !== companionId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Saved Favorites & History</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              {favorites.length} Saved
            </span>
          </h1>
          <p className="text-sm text-slate-400">
            Companions saved from swipe gestures or catalog browsing. Saved privately to your account only.
          </p>
        </div>

        <Link
          href="/customer/explore"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Swipe Profiles</span>
        </Link>
      </div>

      {/* Favorites Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
          <span>My Favorite Companions</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-3xl bg-[#0e1024] border border-white/10 p-12 text-center space-y-4">
            <Heart className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Favorite Profiles Yet</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              When exploring companion profiles, tap the heart icon or swipe right to save your favorite adult companions for fast rebooking.
            </p>
            <Link
              href="/customer/explore"
              className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((c) => (
              <div
                key={c.id}
                className="rounded-3xl overflow-hidden bg-[#0e1024] border border-white/10 hover:border-pink-500/30 transition-all shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-60 w-full bg-slate-900 overflow-hidden">
                    <Image
                      src={c.primaryPhotoUrl}
                      alt={c.displayName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e1024] via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span>{c.cityName}</span>
                      </span>

                      <button
                        onClick={() => handleRemoveFavorite(c.id)}
                        className="p-2 rounded-full bg-black/60 hover:bg-rose-600/80 text-white border border-white/20 transition-colors"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4 text-rose-300" />
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-black text-xs font-black flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-black" />
                        <span>{c.rating}</span>
                      </span>
                      {c.isVerified && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[11px] font-bold flex items-center space-x-1">
                          <Shield className="w-3 h-3" />
                          <span>18+ Verified</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-lg font-bold text-white">{c.displayName}, {c.age}</h3>
                      <span className="font-extrabold text-white text-sm">{formatINR(c.hourlyRate)}/hr</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{c.bio}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <Link
                    href={`/customer/profiles/${c.id}`}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs text-center border border-white/10 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/customer/profiles/${c.id}`}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 text-white font-bold text-xs text-center shadow-md shadow-purple-900/30 transition-all"
                  >
                    Book Date
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Viewed Profiles */}
      {recentlyViewed.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <span>Recently Viewed Profiles</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentlyViewed.map((c) => (
              <Link
                key={c.id}
                href={`/customer/profiles/${c.id}`}
                className="p-3 rounded-2xl bg-[#0e1024] border border-white/10 hover:border-purple-500/30 transition-all group space-y-2 text-center"
              >
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden mx-auto bg-slate-900">
                  <Image src={c.primaryPhotoUrl} alt={c.displayName} fill className="object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-purple-300 truncate">{c.displayName}</p>
                  <p className="text-[10px] text-slate-400">{c.cityName}</p>
                  <p className="text-[11px] font-bold text-purple-400 mt-0.5">{formatINR(c.hourlyRate)}/hr</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
