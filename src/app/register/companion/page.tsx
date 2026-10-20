'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePlatformStore } from '@/lib/store';
import { INDIAN_STATES, INDIAN_CITIES } from '@/lib/geoData';
import { formatINR } from '@/lib/utils';
import {
  Sparkles,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Camera,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Info,
  DollarSign,
} from 'lucide-react';

export default function RegisterCompanionWizard() {
  const router = useRouter();
  const { registerCompanion, switchRole } = usePlatformStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Basic Information
  const [legalNamePrivate, setLegalNamePrivate] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dob, setDob] = useState('2000-01-01');
  const [age, setAge] = useState(24);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [stateSlug, setStateSlug] = useState('maharashtra');
  const [citySlug, setCitySlug] = useState('mumbai');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Non-Binary'>('Female');

  // Step 2: Public Profile
  const [primaryPhotoUrl, setPrimaryPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
  );
  const [bio, setBio] = useState('Art lover, fine dining enthusiast, and engaging conversationalist for high-end social and cultural gatherings.');
  const [interestsText, setInterestsText] = useState('Fine Dining, Art Galleries, Wine Tasting, Jazz, Philosophy');
  const [languagesText, setLanguagesText] = useState('English, Hindi');
  const [hourlyRate, setHourlyRate] = useState(3500);
  const [halfDayRate, setHalfDayRate] = useState(12000);
  const [fullDayRate, setFullDayRate] = useState(20000);

  // Step 3: Verification
  const [documentType, setDocumentType] = useState<'Aadhaar' | 'Passport' | 'Voter ID' | 'Driving License'>('Aadhaar');
  const [documentNumberMasked, setDocumentNumberMasked] = useState('XXXX-XXXX-4589');
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [backgroundConsent, setBackgroundConsent] = useState(false);

  // Status
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const availableCities = INDIAN_CITIES.filter((c) => c.stateSlug === stateSlug);
  const selectedState = INDIAN_STATES.find((s) => s.slug === stateSlug);
  const selectedCity = INDIAN_CITIES.find((c) => c.slug === citySlug) || availableCities[0];

  const handleNextStep = () => {
    setError(null);

    if (step === 1) {
      if (!legalNamePrivate.trim() || !displayName.trim() || !email.trim() || !password) {
        setError('Please fill out all required basic information fields.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (age < 18) {
        setError('Strict Legal Mandate: Companions must be at least 18 years of age.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!bio.trim() || !primaryPhotoUrl.trim()) {
        setError('Please provide a biography and profile photograph.');
        return;
      }
      if (hourlyRate < 1000) {
        setError('Minimum published hourly rate is ₹1,000.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!isAdultConfirmed || !termsAccepted || !backgroundConsent) {
        setError('You must confirm age verification, safety consent, and platform terms.');
        return;
      }
      setStep(4);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Call server API to create companion user record
      const res = await fetch('/api/auth/register/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legalNamePrivate,
          displayName,
          dob,
          email,
          password,
          phoneNumber,
          stateSlug,
          citySlug,
          bio,
          photoUrl: primaryPhotoUrl,
          languages: languagesText.split(',').map((s) => s.trim()).filter(Boolean),
          interests: interestsText.split(',').map((s) => s.trim()).filter(Boolean),
          hourlyRate,
          documentType,
          documentNumberMasked,
          isAdultConfirmed,
          termsAccepted,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Companion registration failed.');
        setIsSubmitting(false);
        return;
      }

      // 2. Also register into client platform state for instant simulation
      registerCompanion({
        displayName,
        legalNamePrivate,
        age,
        gender,
        bio,
        interests: interestsText.split(',').map((s) => s.trim()).filter(Boolean),
        languages: languagesText.split(',').map((s) => s.trim()).filter(Boolean),
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

      switchRole('companion');
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/companion');
        router.refresh();
      }, 2000);
    } catch {
      setError('Communication error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-12 px-4 sm:px-6 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Option B: Adult Companion Wizard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Companion Registration & Onboarding
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Complete the 4 steps below to register your sovereign companion profile. Keep 90% of all booking earnings with audited 10% platform commission.
        </p>
      </div>

      {/* Wizard Step Progress Indicator */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 flex items-center justify-between">
        {[
          { num: 1, label: 'Basic Info' },
          { num: 2, label: 'Public Profile' },
          { num: 3, label: 'Verification' },
          { num: 4, label: 'Review & Submit' },
        ].map((s) => (
          <div key={s.num} className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                step === s.num
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30'
                  : step > s.num
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={`text-xs hidden sm:inline font-medium ${
                step === s.num ? 'text-white' : 'text-slate-400'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Banner */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
          <div className="flex items-center space-x-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Application Submitted into Trust & Safety Queue!</span>
          </div>
          <p className="text-slate-300">
            Redirecting you to your Companion Management Hub...
          </p>
        </div>
      )}

      {/* Step Contents */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <User className="w-5 h-5 text-pink-400" />
              <span>Step 1: Private & Public Identity</span>
            </h2>
            <p className="text-xs text-slate-400">
              Legal name is collected confidentially for identity verification and is <strong className="text-pink-300">never published publicly</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Legal Name (Private)</label>
                <input
                  type="text"
                  required
                  value={legalNamePrivate}
                  onChange={(e) => setLegalNamePrivate(e.target.value)}
                  placeholder="As per Government ID"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Public Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Pooja M."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Age (18+ Mandate)</label>
                <input
                  type="number"
                  min={18}
                  max={65}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="companion@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Phone Number (Private)</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Account Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Primary State</label>
                <select
                  value={stateSlug}
                  onChange={(e) => {
                    setStateSlug(e.target.value);
                    const cities = INDIAN_CITIES.filter((c) => c.stateSlug === e.target.value);
                    if (cities.length > 0) setCitySlug(cities[0].slug);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Primary City Base</label>
                <select
                  value={citySlug}
                  onChange={(e) => setCitySlug(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                >
                  {availableCities.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} {c.isServed ? '• Active' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Public Profile */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Camera className="w-5 h-5 text-pink-400" />
              <span>Step 2: Public Profile, Bio & Rates</span>
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Primary Profile Photo URL</label>
              <input
                type="url"
                required
                value={primaryPhotoUrl}
                onChange={(e) => setPrimaryPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
              />
              <span className="text-[10px] text-slate-500">Provide an authentic, professional portrait URL for customer discovery.</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Biography / Introduction</label>
              <textarea
                rows={3}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your interests, conversational specialties, and booking preferences..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Interests & Activities (comma separated)</label>
                <input
                  type="text"
                  value={interestsText}
                  onChange={(e) => setInterestsText(e.target.value)}
                  placeholder="Fine Dining, Art, Jazz..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Languages Spoken</label>
                <input
                  type="text"
                  value={languagesText}
                  onChange={(e) => setLanguagesText(e.target.value)}
                  placeholder="English, Hindi, Marathi..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2">Published Pricing Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    min={1000}
                    step={250}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                  <span className="text-[10px] text-emerald-400 font-mono">You get ~{formatINR(hourlyRate * 0.9)}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Half-Day Rate (4 hrs) (₹)</label>
                  <input
                    type="number"
                    min={3000}
                    step={500}
                    value={halfDayRate}
                    onChange={(e) => setHalfDayRate(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                  <span className="text-[10px] text-emerald-400 font-mono">You get ~{formatINR(halfDayRate * 0.9)}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Full-Day Rate (8 hrs) (₹)</label>
                  <input
                    type="number"
                    min={6000}
                    step={1000}
                    value={fullDayRate}
                    onChange={(e) => setFullDayRate(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                  <span className="text-[10px] text-emerald-400 font-mono">You get ~{formatINR(fullDayRate * 0.9)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Verification */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Step 3: Identity & Safety Verification</span>
            </h2>
            <p className="text-xs text-slate-400">
              Government ID verification guarantees marketplace safety. Identity documents are stored privately in encrypted vaults and are never exposed to clients.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Identity Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="Passport">Indian Passport</option>
                  <option value="Voter ID">Voter ID (EPIC)</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Document Number (Masked)</label>
                <input
                  type="text"
                  required
                  value={documentNumberMasked}
                  onChange={(e) => setDocumentNumberMasked(e.target.value)}
                  placeholder="e.g. XXXX-XXXX-4589"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <label className="flex items-start space-x-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={isAdultConfirmed}
                  onChange={(e) => setIsAdultConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-pink-500 focus:ring-pink-500 w-4 h-4"
                />
                <span>
                  <strong className="text-white">I certify under penalty of law that I am at least 18 years of age</strong> and have the legal capacity to enter into binding independent contractor agreements.
                </span>
              </label>

              <label className="flex items-start space-x-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={backgroundConsent}
                  onChange={(e) => setBackgroundConsent(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-pink-500 focus:ring-pink-500 w-4 h-4"
                />
                <span>
                  I give consent for the platform Trust & Safety team to verify my government document records privately.
                </span>
              </label>

              <label className="flex items-start space-x-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-pink-500 focus:ring-pink-500 w-4 h-4"
                />
                <span>
                  I agree to the <Link href="/terms" target="_blank" className="text-pink-400 underline">Companion Code of Conduct</Link>, <Link href="/privacy" target="_blank" className="text-pink-400 underline">Privacy Policy</Link>, and acknowledge the 10% platform commission model.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-pink-400" />
              <span>Step 4: Review Your Sovereign Terms</span>
            </h2>

            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Public Display Name</span>
                <span className="font-bold text-white">{displayName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Age & Gender</span>
                <span className="text-white">{age} yrs • {gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Base Metro</span>
                <span className="text-white">{selectedCity?.name}, {selectedState?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Published Hourly Rate</span>
                <span className="font-bold text-pink-400 font-mono">{formatINR(hourlyRate)}/hr</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Net Take-Home (90%)</span>
                <span className="font-bold text-emerald-400 font-mono">{formatINR(hourlyRate * 0.9)}/hr</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Platform Commission (10%)</span>
                <span className="text-purple-300 font-mono">{formatINR(hourlyRate * 0.1)}/hr</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Initial Verification Status</span>
                <span className="text-amber-400 font-semibold">Pending Trust & Safety Approval</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
              <span>
                Upon submission, your profile will be queued for review. You can immediately access your companion portal, manage your schedule, and view incoming requests.
              </span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-pink-500/20 transition"
            >
              <span>Continue to Step {step + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || success}
              onClick={handleSubmit}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Submitting Application...' : 'Submit Profile for Verification'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
