'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatformStore } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { INDIAN_STATES, INDIAN_CITIES } from '@/lib/geoData';
import { formatINR } from '@/lib/utils';
import {
  ShieldCheck,
  Sparkles,
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function RegisterCompanionPage() {
  const router = useRouter();
  const { registerCompanion, featureSettings } = usePlatformStore();
  const { appUser } = useAuth();

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [legalNamePrivate, setLegalNamePrivate] = useState('');
  const [age, setAge] = useState(24);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Non-Binary'>('Female');
  const [bio, setBio] = useState('');
  const [interestsText, setInterestsText] = useState('Fine Dining, Art Galleries, Wine Tasting, Jazz');
  const [languagesText, setLanguagesText] = useState('English, Hindi');
  const [stateSlug, setStateSlug] = useState('maharashtra');
  const [citySlug, setCitySlug] = useState('mumbai');
  const [hourlyRate, setHourlyRate] = useState(3500);
  const [halfDayRate, setHalfDayRate] = useState(12000);
  const [fullDayRate, setFullDayRate] = useState(20000);
  const [primaryPhotoUrl, setPrimaryPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
  );

  // Adult ID Verification
  const [documentType, setDocumentType] = useState<'Aadhaar' | 'Passport' | 'Voter ID' | 'Driving License'>('Aadhaar');
  const [documentNumberMasked, setDocumentNumberMasked] = useState('XXXX-XXXX-4589');
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Filter cities for selected state
  const availableCities = INDIAN_CITIES.filter((c) => c.stateSlug === stateSlug);
  const selectedState = INDIAN_STATES.find((s) => s.slug === stateSlug);
  const selectedCity = INDIAN_CITIES.find((c) => c.slug === citySlug) || availableCities[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (age < 18) {
      setErrorMessage('Strict Platform Mandate: Companions must be at least 18 years of age.');
      return;
    }

    if (!consentConfirmed) {
      setErrorMessage('You must confirm age verification and consent to proceed.');
      return;
    }

    setIsSubmitting(true);

    const interests = interestsText.split(',').map((s) => s.trim()).filter(Boolean);
    const languages = languagesText.split(',').map((s) => s.trim()).filter(Boolean);

    setTimeout(() => {
      const result = registerCompanion({
        displayName,
        legalNamePrivate,
        age,
        gender,
        bio,
        interests,
        languages,
        stateId: selectedState?.id || 1,
        stateName: selectedState?.name || 'Maharashtra',
        stateSlug: selectedState?.slug || 'maharashtra',
        cityId: selectedCity?.id || 101,
        cityName: selectedCity?.name || 'Mumbai',
        citySlug: selectedCity?.slug || 'mumbai',
        supportedCities: [selectedCity?.name || 'Mumbai'],
        primaryPhotoUrl,
        galleryPhotos: [primaryPhotoUrl],
        hourlyRate,
        halfDayRate,
        fullDayRate,
        permittedDurations: [1, 2, 4, 8],
        documentType,
        documentNumberMasked,
      });

      setIsSubmitting(false);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/companion');
        }, 1500);
      } else {
        setErrorMessage('Registration failed. Please check the inputs.');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Professional Companion Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Register as an Elite Companion
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Monetize your cultured social presence. Connect with verified clients for dining, galas, and events with a transparent 10% platform fee and guaranteed escrow settlements.
        </p>
      </div>

      {success ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-emerald-500/40 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Application Submitted!</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Your profile and adult verification documents have been received. Redirecting to your Companion Dashboard...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-slate-900/90 border border-white/10 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Profile Basics */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2 border-b border-white/5 pb-2">
              <UserCheck className="w-4 h-4" />
              <span>1. Public & Private Profile Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Public Display Name (Shown to clients)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kiara, Rohan, Ananya"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Legal Full Name (Private & Confidential)
                </label>
                <input
                  type="text"
                  required
                  placeholder="As per Government ID"
                  value={legalNamePrivate}
                  onChange={(e) => setLegalNamePrivate(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Never displayed publicly. Strictly used for verification & bank payouts.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Age (18+ Mandatory)</label>
                <input
                  type="number"
                  required
                  min={18}
                  max={65}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Gender Identity</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Short Biography / Personality Description
              </label>
              <textarea
                required
                rows={3}
                placeholder="Share your background, conversational style, cultured interests, and expectations for dinner dates or social events..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Interests (Comma separated)</label>
                <input
                  type="text"
                  value={interestsText}
                  onChange={(e) => setInterestsText(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Languages Spoken</label>
                <input
                  type="text"
                  value={languagesText}
                  onChange={(e) => setLanguagesText(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location and Service Area */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2 border-b border-white/5 pb-2">
              <MapPin className="w-4 h-4" />
              <span>2. Supported Indian Location & Metros</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State / Union Territory</label>
                <select
                  value={stateSlug}
                  onChange={(e) => {
                    setStateSlug(e.target.value);
                    const matched = INDIAN_CITIES.find((c) => c.stateSlug === e.target.value);
                    if (matched) setCitySlug(matched.slug);
                  }}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.id} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary City</label>
                <select
                  value={citySlug}
                  onChange={(e) => setCitySlug(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {availableCities.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} (Tier {c.tier})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Pricing and Rates */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>3. Hourly Pricing & Rates (INR ₹)</span>
              </h3>
              <span className="text-[11px] text-purple-400 font-semibold">10% Platform Cut Deducted Automatically</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Standard Hourly Rate</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={500}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  You earn: {formatINR(hourlyRate * 0.9)}/hr
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Half-Day Rate (4 hrs)</label>
                <input
                  type="number"
                  min={2000}
                  step={500}
                  value={halfDayRate}
                  onChange={(e) => setHalfDayRate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full-Day Rate (8 hrs)</label>
                <input
                  type="number"
                  min={4000}
                  step={1000}
                  value={fullDayRate}
                  onChange={(e) => setFullDayRate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Photo & Identity Document */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2 border-b border-white/5 pb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>4. Adult Verification & Photo Upload</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                <Camera className="w-3.5 h-3.5 text-purple-400" />
                <span>Primary Profile Photo (Direct Image URL)</span>
              </label>
              <input
                type="url"
                required
                value={primaryPhotoUrl}
                onChange={(e) => setPrimaryPhotoUrl(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Identity Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="Passport">Indian Passport</option>
                  <option value="Voter ID">Voter ID Card</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Masked Document Number
                </label>
                <input
                  type="text"
                  required
                  value={documentNumberMasked}
                  onChange={(e) => setDocumentNumberMasked(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Strict 18+ Consent checkbox */}
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2">
              <label className="flex items-start space-x-2 text-xs text-purple-200 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 bg-slate-800 border-white/10 focus:ring-purple-500"
                />
                <span>
                  I legally affirm that I am an adult aged 18 or older, the owner of the uploaded photographs and credentials, and give consent for accompaniment bookings under the platform's safety guidelines and 10% platform commission policy.
                </span>
              </label>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-950/40 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Submit Companion Application'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
