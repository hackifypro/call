'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { usePlatformStore } from '@/lib/store';
import { formatINR, formatDateOnly } from '@/lib/utils';
import {
  ShieldCheck,
  Star,
  MapPin,
  Heart,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Flag,
  Ban,
  ArrowLeft,
  Share2,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import BookingModal from '@/components/BookingModal';
import ReportModal from '@/components/ReportModal';

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const { companions, reviews, favorites, toggleFavorite } = usePlatformStore();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const profile = companions.find((c) => c.id === profileId);

  // If companion does not exist or is not approved, return appropriate message or 404
  if (!profile || profile.status !== 'approved') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 max-w-md text-center border border-white/10 shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Profile Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This companion profile is either under administrative verification, currently deactivated,
            or does not exist.
          </p>
          <Link
            href="/explore"
            className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl"
          >
            Explore Active Profiles
          </Link>
        </div>
      </div>
    );
  }

  // Eligible verified reviews for this companion
  const companionReviews = reviews.filter((r) => r.companionId === profile.id);
  const isFavorited = favorites.includes(profile.id);
  const photos = profile.galleryPhotos?.length ? profile.galleryPhotos : [profile.primaryPhotoUrl];

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (blocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 max-w-md text-center border border-white/10 shadow-2xl space-y-4">
          <Ban className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Profile Blocked</h2>
          <p className="text-xs text-slate-400">
            You have blocked {profile.displayName}. This profile will not appear in your future search
            results.
          </p>
          <button
            onClick={() => setBlocked(false)}
            className="text-xs text-pink-400 hover:text-pink-300 underline"
          >
            Unblock Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-1 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleShare}
            className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-pink-400" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
          </button>

          <button
            onClick={() => toggleFavorite(profile.id)}
            className={`p-2 rounded-lg border transition ${
              isFavorited
                ? 'bg-pink-950/60 border-pink-500/50 text-pink-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Save to favorites"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-pink-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Photo Gallery (Col-span 5) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Main Selected Image */}
          <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900">
            <Image
              src={photos[selectedPhotoIndex] || profile.primaryPhotoUrl}
              alt={profile.displayName}
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />

            {/* 18+ Verified Adult Badge */}
            <div className="absolute top-4 left-4 flex items-center space-x-1.5 bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>18+ Verified Adult</span>
            </div>

            {/* Gallery Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-slate-900/80 text-white transition"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedPhotoIndex((prev) => (prev + 1) % photos.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-slate-900/80 text-white transition"
                  aria-label="Next Photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Row */}
          {photos.length > 1 && (
            <div className="flex space-x-2.5 overflow-x-auto pb-1">
              {photos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${
                    selectedPhotoIndex === idx
                      ? 'border-pink-500 scale-95 shadow-lg'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={url} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Profile Information, Verified Statistics & Booking CTA (Col-span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Basic Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                {profile.displayName}, {profile.age}
              </h1>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-extrabold text-pink-400 font-mono">
                  {formatINR(profile.hourlyRate)}
                </div>
                <span className="text-xs text-slate-400 block -mt-1">per hour</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center text-pink-400 font-medium">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {profile.cityName}, {profile.stateName}
              </span>
              <span>•</span>
              <span className="flex items-center text-amber-300 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                {profile.averageRating.toFixed(2)}{' '}
                <span className="text-slate-400 font-normal ml-1">
                  ({profile.reviewCount} verified reviews)
                </span>
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">
                {profile.isAvailable ? '● Available for Meetups' : '○ Advance Booking Required'}
              </span>
            </div>
          </div>

          {/* Section 6 Verified Database Statistics Grid (Never manually entered) */}
          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Verified Database Statistics</span>
              <span className="text-[10px] text-pink-400 uppercase tracking-wider">
                Audited & Computed Server-Side
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
              <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Accepted Bookings</span>
                <span className="text-base font-bold text-slate-200">
                  {profile.acceptedBookings}
                </span>
              </div>
              <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Completed</span>
                <span className="text-base font-bold text-emerald-400">
                  {profile.completedBookings}
                </span>
              </div>
              <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Cancellations</span>
                <span className="text-base font-bold text-slate-300">
                  {profile.cancelledBookings}
                </span>
              </div>
              <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Completion Rate</span>
                <span className="text-base font-bold text-blue-400">
                  {profile.acceptedBookings > 0
                    ? Math.round((profile.completedBookings / profile.acceptedBookings) * 100)
                    : 100}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">About Me</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{profile.bio}</p>
          </div>

          {/* Interests & Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Interests & Activities
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="bg-purple-950/40 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-1 rounded-lg"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Languages Spoken
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-900 text-slate-300 border border-slate-800 text-xs px-2.5 py-1 rounded-lg"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Supported Cities */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Supported Cities & Regions
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.supportedCities.map((city, idx) => (
                <span
                  key={idx}
                  className="bg-slate-900 text-slate-300 border border-slate-800 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-pink-400" />
                  <span>{city}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Transparent Rate Card (1 Hr, 2 Hr, 4 Hr, Full Day) */}
          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Transparent Pricing Packages</span>
              <span className="text-emerald-400 text-[10px] font-semibold">10% Platform Fee Included</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">1 Hour Meetup</span>
                <span className="font-bold text-white font-mono mt-0.5 block">
                  {formatINR(profile.hourlyRate)}
                </span>
              </div>
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">2 Hours (Dinner)</span>
                <span className="font-bold text-white font-mono mt-0.5 block">
                  {formatINR(profile.hourlyRate * 2)}
                </span>
              </div>
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">Half Day (4 Hrs)</span>
                <span className="font-bold text-white font-mono mt-0.5 block">
                  {formatINR(profile.halfDayRate || profile.hourlyRate * 3.5)}
                </span>
              </div>
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">Full Day (8 Hrs)</span>
                <span className="font-bold text-white font-mono mt-0.5 block">
                  {formatINR(profile.fullDayRate || profile.hourlyRate * 6.5)}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setBookingModalOpen(true)}
              className="w-full sm:flex-1 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl shadow-pink-500/25 flex items-center justify-center space-x-2 text-sm transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Request Booking with {profile.displayName}</span>
            </button>

            {/* Report & Block Options (Section 6 Requirement) */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setReportModalOpen(true)}
                className="flex-1 sm:flex-none p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition text-xs flex items-center justify-center gap-1.5"
                title="Report profile to trust team"
              >
                <Flag className="w-4 h-4" />
                <span className="sm:hidden">Report</span>
              </button>

              <button
                onClick={() => setBlocked(true)}
                className="flex-1 sm:flex-none p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition text-xs flex items-center justify-center gap-1.5"
                title="Block profile"
              >
                <Ban className="w-4 h-4" />
                <span className="sm:hidden">Block</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section (Section 6 & 12 requirement: Genuine Completed Bookings only) */}
      <section className="pt-10 border-t border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Verified Booking Reviews</h2>
            <p className="text-xs text-slate-400">
              Restricted strictly to genuine completed bookings. Unverified claims or fake reviews are
              prohibited.
            </p>
          </div>
          <div className="flex items-center space-x-1.5 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-xl text-amber-300 font-bold text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{profile.averageRating.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
        </div>

        {companionReviews.length === 0 ? (
          <div className="bg-slate-900/60 rounded-2xl p-6 text-center border border-slate-800 text-xs text-slate-400">
            No reviews yet. Completed bookings will appear here with customer feedback.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companionReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                      <span>{rev.customerName}</span>
                      <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-semibold">
                        Verified Booking
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">{formatDateOnly(rev.createdAt)}</div>
                  </div>

                  <div className="flex items-center space-x-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {bookingModalOpen && (
        <BookingModal
          companion={profile}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={() => setBookingModalOpen(false)}
        />
      )}
      {reportModalOpen && (
        <ReportModal companion={profile} onClose={() => setReportModalOpen(false)} />
      )}
    </div>
  );
}
