'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { CompanionProfile } from '@/lib/types';
import { usePlatformStore } from '@/lib/store';
import {
  Heart,
  X,
  RotateCcw,
  Star,
  MapPin,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import BookingModal from './BookingModal';

interface SwipeDeckProps {
  profiles?: CompanionProfile[];
  companions?: CompanionProfile[];
  onOpenBooking?: (profile: CompanionProfile) => void;
  onCardClick?: (comp: CompanionProfile) => void;
  onBookNow?: (comp: CompanionProfile) => void;
  favorites?: string[];
  onToggleFavorite?: (companionId: string) => void;
}

export default function SwipeDeck({
  profiles,
  companions,
  onOpenBooking,
  onCardClick,
  onBookNow,
  favorites: externalFavorites,
  onToggleFavorite: externalOnToggleFavorite,
}: SwipeDeckProps) {
  const router = useRouter();
  const {
    favorites: storeFavorites,
    toggleFavorite: storeToggleFavorite,
    recordView,
  } = usePlatformStore();

  const list = companions || profiles || [];
  const favorites = externalFavorites || storeFavorites;
  const toggleFavorite = externalOnToggleFavorite || storeToggleFavorite;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [activePhotoIndices, setActivePhotoIndices] = useState<Record<string, number>>({});
  const [selectedBookingCompanion, setSelectedBookingCompanion] = useState<CompanionProfile | null>(null);

  const activeProfile = list[currentIndex];
  const nextProfile = list[currentIndex + 1];

  // Motion values for current card dragging
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 0.9, 1, 0.9, 0]);
  const likeBadgeOpacity = useTransform(x, [20, 120], [0, 1]);
  const skipBadgeOpacity = useTransform(x, [-20, -120], [0, 1]);

  // Record profile view
  useEffect(() => {
    if (activeProfile) {
      recordView(activeProfile.id);
    }
  }, [activeProfile, recordView]);

  // Swipe Action Handler
  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (!activeProfile) return;

      if (direction === 'right') {
        if (!favorites.includes(activeProfile.id)) {
          toggleFavorite(activeProfile.id);
        }
      }

      setHistory((prev) => [...prev, currentIndex]);
      setCurrentIndex((prev) => prev + 1);
      x.set(0);
    },
    [activeProfile, currentIndex, favorites, toggleFavorite, x]
  );

  // Undo Action
  const handleUndo = () => {
    if (history.length === 0) return;
    const lastIndex = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setCurrentIndex(lastIndex);
    x.set(0);
  };

  // Keyboard navigation for desktop accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedBookingCompanion) return; // don't intercept when modal is open
      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      } else if (e.key === 'ArrowUp' && activeProfile) {
        router.push(`/profiles/${activeProfile.id}`);
      } else if (e.key === 'z' || e.key === 'Z') {
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, activeProfile, router, selectedBookingCompanion]);

  const handleNextPhoto = (e: React.MouseEvent, profile: CompanionProfile) => {
    e.stopPropagation();
    const photos = profile.galleryPhotos || [profile.primaryPhotoUrl];
    const current = activePhotoIndices[profile.id] || 0;
    setActivePhotoIndices((prev) => ({
      ...prev,
      [profile.id]: (current + 1) % photos.length,
    }));
  };

  const handlePrevPhoto = (e: React.MouseEvent, profile: CompanionProfile) => {
    e.stopPropagation();
    const photos = profile.galleryPhotos || [profile.primaryPhotoUrl];
    const current = activePhotoIndices[profile.id] || 0;
    setActivePhotoIndices((prev) => ({
      ...prev,
      [profile.id]: (current - 1 + photos.length) % photos.length,
    }));
  };

  // Finished Deck State
  if (!activeProfile || currentIndex >= list.length) {
    return (
      <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-8 text-center border border-white/10 shadow-2xl space-y-6 my-8">
        <div className="w-20 h-20 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center mx-auto text-pink-400">
          <Sparkles className="w-10 h-10 animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">You&apos;ve browsed all profiles!</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            You&apos;ve viewed all currently approved and active companion profiles in this search view.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setHistory([]);
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Profiles</span>
          </button>
          <Link
            href="/cities"
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition"
          >
            Browse Other Cities
          </Link>
        </div>
      </div>
    );
  }

  const photos = activeProfile.galleryPhotos?.length
    ? activeProfile.galleryPhotos
    : [activeProfile.primaryPhotoUrl];
  const currentPhotoIndex = activePhotoIndices[activeProfile.id] || 0;
  const currentPhoto = photos[currentPhotoIndex] || activeProfile.primaryPhotoUrl;
  const isFavorited = favorites.includes(activeProfile.id);

  return (
    <div className="w-full max-w-md mx-auto relative select-none">
      {/* Tinder-like Card Deck Container */}
      <div className="relative h-[610px] w-full">
        {/* Underneath Card (Preview of next profile) */}
        {nextProfile && (
          <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-900 transform scale-95 translate-y-3 opacity-60 pointer-events-none">
            <div className="relative w-full h-full">
              <Image
                src={nextProfile.primaryPhotoUrl}
                alt={nextProfile.displayName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 450px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="text-xl font-bold">{nextProfile.displayName}, {nextProfile.age}</div>
                <div className="text-xs text-slate-300">{nextProfile.cityName} • {formatINR(nextProfile.hourlyRate)}/hr</div>
              </div>
            </div>
          </div>
        )}

        {/* Current Active Swipable Card */}
        <AnimatePresence>
          <motion.div
            key={activeProfile.id}
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) {
                handleSwipe('right');
              } else if (info.offset.x < -100) {
                handleSwipe('left');
              }
            }}
            className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 cursor-grab active:cursor-grabbing z-10"
          >
            {/* Stamp Overlays during Drag */}
            <motion.div
              style={{ opacity: likeBadgeOpacity }}
              className="absolute top-8 left-8 z-30 pointer-events-none border-4 border-emerald-400 text-emerald-400 font-extrabold text-2xl tracking-widest px-4 py-1 rounded-xl rotate-[-15deg] bg-slate-950/60 shadow-lg"
            >
              FAVORITE ❤️
            </motion.div>

            <motion.div
              style={{ opacity: skipBadgeOpacity }}
              className="absolute top-8 right-8 z-30 pointer-events-none border-4 border-rose-500 text-rose-500 font-extrabold text-2xl tracking-widest px-4 py-1 rounded-xl rotate-[15deg] bg-slate-950/60 shadow-lg"
            >
              SKIP ❌
            </motion.div>

            {/* Profile Photo with Clickable Gallery Segments */}
            <div className="relative w-full h-[68%]">
              <Image
                src={currentPhoto}
                alt={activeProfile.displayName}
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 450px"
              />

              {/* Photo Segments Progress Bars */}
              {photos.length > 1 && (
                <div className="absolute top-3 inset-x-4 z-20 flex space-x-1.5">
                  {photos.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        idx === currentPhotoIndex ? 'bg-white shadow-md' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Left / Right Photo Tap Zones */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={(e) => handlePrevPhoto(e, activeProfile)}
                    className="absolute inset-y-0 left-0 w-1/3 z-10 flex items-center justify-start pl-2 text-white/40 hover:text-white transition group focus:outline-none"
                    aria-label="Previous Photo"
                  >
                    <ChevronLeft className="w-6 h-6 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                  <button
                    onClick={(e) => handleNextPhoto(e, activeProfile)}
                    className="absolute inset-y-0 right-0 w-1/3 z-10 flex items-center justify-end pr-2 text-white/40 hover:text-white transition group focus:outline-none"
                    aria-label="Next Photo"
                  >
                    <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                </>
              )}

              {/* Verified 18+ Adult Badge */}
              <div className="absolute top-7 left-4 z-20 flex items-center space-x-1.5 bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>18+ Verified Adult</span>
              </div>

              {/* Availability Pill */}
              <div className="absolute top-7 right-4 z-20">
                {activeProfile.isAvailable ? (
                  <span className="flex items-center space-x-1 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Available Today</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 bg-slate-900/80 border border-slate-700 text-slate-300 text-[10px] font-medium px-2.5 py-1 rounded-full">
                    <span>Advance Booking</span>
                  </span>
                )}
              </div>

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>

            {/* Profile Information Card Details (Section 5 requirements) */}
            <div className="relative p-5 bg-gradient-to-b from-slate-950 to-slate-900 h-[32%] flex flex-col justify-between">
              <div>
                {/* Header Row: Name, Age, Rating, Price */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        {activeProfile.displayName}, {activeProfile.age}
                      </h2>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-300 mt-0.5">
                      <span className="flex items-center text-pink-400">
                        <MapPin className="w-3.5 h-3.5 mr-0.5" />
                        {activeProfile.cityName}, {activeProfile.stateName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center text-amber-300 font-semibold">
                        <Star className="w-3.5 h-3.5 mr-0.5 fill-amber-400 text-amber-400" />
                        {activeProfile.averageRating.toFixed(1)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({activeProfile.reviewCount})
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-extrabold text-pink-400 font-mono">
                      {formatINR(activeProfile.hourlyRate)}
                    </div>
                    <span className="text-[10px] text-slate-400 block -mt-1">per hour</span>
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                  {activeProfile.bio}
                </p>

                {/* Verified Database Statistics (Section 5 & 6 requirement: Never self-reported!) */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-[10px]">
                  <div className="bg-slate-900/90 rounded-lg p-1.5 text-center border border-slate-800">
                    <span className="text-slate-400 block">Accepted</span>
                    <span className="font-semibold text-slate-200">
                      {activeProfile.acceptedBookings}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-1.5 text-center border border-slate-800">
                    <span className="text-slate-400 block">Completed</span>
                    <span className="font-semibold text-emerald-400">
                      {activeProfile.completedBookings}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-1.5 text-center border border-slate-800">
                    <span className="text-slate-400 block">Cancelled</span>
                    <span className="font-semibold text-slate-400">
                      {activeProfile.cancelledBookings}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe Interactive Controls (Desktop & Mobile accessible) */}
      <div className="flex items-center justify-center space-x-4 mt-6">
        {/* Undo Button */}
        <button
          onClick={handleUndo}
          disabled={history.length === 0}
          className={`w-12 h-12 rounded-full glass flex items-center justify-center border border-white/10 shadow-lg transition ${
            history.length > 0
              ? 'text-amber-400 hover:bg-amber-400/20 active:scale-95'
              : 'text-slate-600 opacity-40 cursor-not-allowed'
          }`}
          title="Undo (Z)"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Skip Button (Swipe Left) */}
        <button
          onClick={() => handleSwipe('left')}
          className="w-14 h-14 rounded-full bg-slate-900 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20 hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg transition"
          title="Skip / Pass (Arrow Left)"
        >
          <X className="w-7 h-7" />
        </button>

        {/* View Full Profile Details CTA */}
        <Link
          href={`/profiles/${activeProfile.id}`}
          className="w-12 h-12 rounded-full glass flex items-center justify-center border border-white/10 text-blue-400 hover:bg-blue-400/20 hover:scale-105 active:scale-95 shadow-lg transition"
          title="View Full Profile Details (Arrow Up)"
        >
          <Eye className="w-5 h-5" />
        </Link>

        {/* Favorite Button (Swipe Right) */}
        <button
          onClick={() => handleSwipe('right')}
          className={`w-14 h-14 rounded-full bg-slate-900 border text-emerald-400 hover:bg-emerald-500/20 hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg transition ${
            isFavorited ? 'border-pink-500 text-pink-500 bg-pink-950/40' : 'border-emerald-500/30'
          }`}
          title="Save to Favorites (Arrow Right)"
        >
          <Heart className={`w-7 h-7 ${isFavorited ? 'fill-pink-500' : ''}`} />
        </button>

        {/* Direct Request Booking CTA */}
        <button
          onClick={() => setSelectedBookingCompanion(activeProfile)}
          className="px-5 h-12 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-pink-500/30 hover:brightness-110 active:scale-95 flex items-center space-x-1.5 transition"
          title="Request Booking"
        >
          <Sparkles className="w-4 h-4" />
          <span>Book</span>
        </button>
      </div>

      {/* Desktop Keyboard Helper Tip */}
      <div className="hidden sm:flex items-center justify-center space-x-4 text-[11px] text-slate-400 mt-4">
        <span>← Arrow Left: Skip</span>
        <span>•</span>
        <span>→ Arrow Right: Favorite</span>
        <span>•</span>
        <span>↑ Arrow Up: Details</span>
        <span>•</span>
        <span>Z: Undo</span>
      </div>

      {/* Interactive Booking Modal */}
      {selectedBookingCompanion && (
        <BookingModal
          companion={selectedBookingCompanion}
          isOpen={!!selectedBookingCompanion}
          onClose={() => setSelectedBookingCompanion(null)}
          onSuccess={() => setSelectedBookingCompanion(null)}
        />
      )}
    </div>
  );
}
