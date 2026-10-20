'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CompanionProfile } from '@/lib/types';
import { usePlatformStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import {
  ShieldCheck,
  Star,
  MapPin,
  Heart,
  Calendar,
  Sparkles,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import BookingModal from './BookingModal';

interface ProfileCardProps {
  profile: CompanionProfile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const { favorites, toggleFavorite } = usePlatformStore();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const isFavorited = favorites.includes(profile.id);

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-xl hover:border-pink-500/40 transition duration-300 flex flex-col justify-between group">
        <div>
          {/* Photo Container */}
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
            <Image
              src={profile.primaryPhotoUrl}
              alt={profile.displayName}
              fill
              className="object-cover object-top group-hover:scale-105 transition duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(profile.id);
              }}
              className="absolute top-3 right-3 p-2 rounded-full glass hover:bg-slate-900/80 transition z-10"
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-4 h-4 transition ${
                  isFavorited ? 'text-pink-500 fill-pink-500' : 'text-white'
                }`}
              />
            </button>

            {/* 18+ Verified Badge */}
            <div className="absolute top-3 left-3 flex items-center space-x-1 bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-lg">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>18+ Verified</span>
            </div>

            {/* Bottom info on photo */}
            <div className="absolute bottom-3 inset-x-3 text-white flex items-baseline justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {profile.displayName}, {profile.age}
                </h3>
                <div className="flex items-center space-x-1 text-xs text-slate-300">
                  <MapPin className="w-3 h-3 text-pink-400" />
                  <span>
                    {profile.cityName}, {profile.stateName}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-extrabold text-pink-400 font-mono">
                  {formatINR(profile.hourlyRate)}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1">/hr</span>
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-4 space-y-3">
            {/* Rating and Availability */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-amber-300 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{profile.averageRating.toFixed(1)}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({profile.reviewCount} verified reviews)
                </span>
              </div>

              {profile.isAvailable ? (
                <span className="flex items-center space-x-1 text-emerald-400 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Available Today</span>
                </span>
              ) : (
                <span className="text-slate-400 text-[10px]">Advance Booking</span>
              )}
            </div>

            {/* Bio snippet */}
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
              {profile.bio}
            </p>

            {/* Interests tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.interests.slice(0, 3).map((item, idx) => (
                <span
                  key={idx}
                  className="bg-slate-900 text-slate-300 border border-slate-800 text-[10px] px-2 py-0.5 rounded-md"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Verified Statistics Ribbon */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
              <div>
                <span>Completed Bookings: </span>
                <span className="font-semibold text-emerald-400">
                  {profile.completedBookings}
                </span>
              </div>
              <div className="text-right">
                <span>Cancellations: </span>
                <span className="font-semibold text-slate-400">{profile.cancelledBookings}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-0 grid grid-cols-2 gap-2">
          <Link
            href={`/profiles/${profile.id}`}
            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold py-2 rounded-xl border border-slate-700/80 text-center flex items-center justify-center gap-1 transition"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Profile</span>
          </Link>

          <button
            onClick={() => setBookingModalOpen(true)}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold py-2 rounded-xl shadow-md shadow-pink-500/20 text-center flex items-center justify-center gap-1 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Book</span>
          </button>
        </div>
      </div>

      {bookingModalOpen && (
        <BookingModal
          companion={profile}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={() => setBookingModalOpen(false)}
        />
      )}
    </>
  );
}
