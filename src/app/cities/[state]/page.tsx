import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { INDIAN_STATES, INDIAN_CITIES } from '@/lib/geoData';
import { MapPin, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

interface StatePageProps {
  params: {
    state: string;
  };
}

export async function generateStaticParams() {
  return INDIAN_STATES.map((s) => ({
    state: s.slug,
  }));
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const state = INDIAN_STATES.find((s) => s.slug === params.state);
  return {
    title: state ? `Verified Companions in ${state.name} | Aura India` : 'State Directory',
    description: `Discover verified adult companionship services across cities in ${state?.name || 'India'}.`,
  };
}

export default function StateDirectoryPage({ params }: StatePageProps) {
  const state = INDIAN_STATES.find((s) => s.slug === params.state);

  if (!state) {
    notFound();
  }

  const citiesInState = INDIAN_CITIES.filter((c) => c.stateSlug === state.slug);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-pink-400 transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/cities" className="hover:text-pink-400 transition">Cities</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-pink-400 font-semibold">{state.name}</span>
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
          <MapPin className="w-3.5 h-3.5 text-pink-400" />
          <span>State Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Verified Companions in <span className="gradient-text">{state.name}</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Browse verified adult companion profiles, dining partners, and event escorts in {state.name}. All companions are 18+ and identity-verified.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {citiesInState.map((city) => (
          <Link
            key={city.id}
            href={`/cities/${state.slug}/${city.slug}`}
            className="p-5 rounded-2xl glass-card border border-white/5 hover:border-pink-500/40 transition group space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white group-hover:text-pink-400 transition">
                {city.name}
              </span>
              {city.isServed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {city.isServed ? 'Verified companions available' : 'Service area coming soon'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
