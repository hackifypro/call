import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { INDIAN_CITIES, INDIAN_STATES } from '@/lib/geoData';
import { INITIAL_COMPANIONS } from '@/lib/mockData';
import { formatINR } from '@/lib/utils';
import {
  MapPin,
  ShieldCheck,
  Star,
  Compass,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface CityPageProps {
  params: {
    state: string;
    city: string;
  };
}

export async function generateStaticParams() {
  return INDIAN_CITIES.filter((c) => c.isServed).map((c) => ({
    state: c.stateSlug,
    city: c.slug,
  }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const city = INDIAN_CITIES.find(
    (c) => c.slug === params.city && c.stateSlug === params.state
  );

  if (!city) {
    return {
      title: 'City Directory | Aura India',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://call-boy-4ef22.web.app';
  const pageUrl = `${siteUrl}/cities/${params.state}/${params.city}`;

  return {
    title: `Verified Adult Companions in ${city.name}, ${city.stateName}`,
    description: `Book 100% ID-verified adult companions and social escorts in ${city.name}, ${city.stateName}. Serving ${city.popularAreas.slice(0, 4).join(', ')}. Transparent 10% platform fee, discrete private bookings.`,
    keywords: [
      `${city.name} companions`,
      `call boy ${city.name}`,
      `male companions ${city.name}`,
      `female companions ${city.name}`,
      `escorts in ${city.name}`,
      `verified companion service ${city.name}`,
      `adult companionship ${city.stateName}`,
      `${city.name} dinner date companion`,
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `Verified Adult Companions in ${city.name}, ${city.stateName} | Aura India`,
      description: `Explore trusted, ID-verified adult companions in ${city.name}. Available for dinner dates, social events, and private companionship.`,
      url: pageUrl,
      siteName: 'Aura India',
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Verified Companions in ${city.name} | Aura India`,
      description: `Book 100% ID-verified companions in ${city.name}, ${city.stateName}. Transparent pricing and complete privacy.`,
    },
  };
}

export default function CityLandingPage({ params }: CityPageProps) {
  const city = INDIAN_CITIES.find(
    (c) => c.slug === params.city && c.stateSlug === params.state
  );

  if (!city) {
    notFound();
  }

  // Find companions in this city
  const cityCompanions = INITIAL_COMPANIONS.filter(
    (c) => c.citySlug === city.slug && c.status === 'approved'
  );

  // Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Companion Service in ${city.name}`,
    provider: {
      '@type': 'Organization',
      name: 'Aura India',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://call-boy-4ef22.web.app',
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: city.stateName,
      },
    },
    description: city.metaDescription,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: '3000',
      highPrice: '12000',
    },
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-10 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-10">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <Link href="/cities" className="hover:text-white transition">
          Cities Directory
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-300">{city.stateName}</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-purple-400 font-bold">{city.name}</span>
      </nav>

      {/* City Hero Section */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 border border-white/10 relative overflow-hidden space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5" />
          <span>Tier {city.tier} Metropolis • {city.stateName}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Elite Verified Companions in{' '}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {city.name}
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          {city.metaDescription}
        </p>

        {/* Popular Neighborhoods in this city */}
        <div className="pt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Popular Meetup Areas in {city.name}:
          </span>
          <div className="flex flex-wrap gap-2">
            {city.popularAreas.map((area) => (
              <span
                key={area}
                className="px-3 py-1 rounded-lg text-xs bg-slate-800/80 text-purple-200 border border-white/5"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Approved Companion Profiles in this city */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              Approved Companions Serving {city.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              100% ID-verified adults available for reservations in {city.name}.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            {cityCompanions.length} Verified Active
          </span>
        </div>

        {cityCompanions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
            <Compass className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">New Service Expansion in {city.name}</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We are currently onboarding ID-verified adult companions for {city.name}.
            </p>
            <Link
              href="/register-companion"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              <span>Be the First Companion in {city.name}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cityCompanions.map((comp) => (
              <div
                key={comp.id}
                className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/40 transition shadow-xl flex flex-col"
              >
                <div className="relative aspect-[4/5] w-full">
                  <img
                    src={comp.primaryPhotoUrl}
                    alt={comp.displayName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>18+ Verified</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-bold">
                      {comp.displayName}, {comp.age}
                    </h3>
                    <div className="flex items-center space-x-1 text-xs text-amber-400 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{comp.averageRating.toFixed(1)} ({comp.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-300 line-clamp-2">{comp.bio}</p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Rate</span>
                      <span className="text-sm font-bold text-white">
                        {formatINR(comp.hourlyRate)}/hr
                      </span>
                    </div>
                    <Link
                      href="/#explore-section"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                    >
                      Book Companion
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nearby Cities Internal Linking Section (SEO requirement) */}
      {city.nearbyCities.length > 0 && (
        <div className="pt-6 border-t border-white/5 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Explore Companions in Nearby Cities
          </h3>
          <div className="flex flex-wrap gap-3">
            {city.nearbyCities.map((near) => (
              <Link
                key={near.slug}
                href={`/cities/${near.stateSlug}/${near.slug}`}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 hover:border-purple-500/30 text-xs text-slate-300 hover:text-white transition flex items-center space-x-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>{near.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
