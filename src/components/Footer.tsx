import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Heart, HelpCircle, Lock, Award, FileText } from 'lucide-react';
import { INDIAN_CITIES } from '@/lib/geoData';

export default function Footer() {
  const servedCities = INDIAN_CITIES.filter((c) => c.isServed).slice(0, 10);

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm mt-20">
      {/* Platform Guarantees Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-900/30 border border-purple-500/30 text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">100% ID & Age Verified</h4>
              <p className="text-xs text-slate-400 mt-1">
                Strict 18+ adult identity verification via official government ID before any profile goes public.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-pink-900/30 border border-pink-500/30 text-pink-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">10% Transparent Commission</h4>
              <p className="text-xs text-slate-400 mt-1">
                Zero hidden charges. Companions keep 90% of eligible booking earnings with full ledger transparency.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-900/30 border border-emerald-500/30 text-emerald-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Fair Refund & Credit Guarantee</h4>
              <p className="text-xs text-slate-400 mt-1">
                If an accepted booking cannot be fulfilled, choose between an instant full refund or a 100% Replacement Credit.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-900/30 border border-blue-500/30 text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Encrypted Privacy Protection</h4>
              <p className="text-xs text-slate-400 mt-1">
                Legal documents, private contact numbers, and verification records are never exposed publicly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              AURA <span className="text-pink-400 font-light">INDIA</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed pr-4">
            India’s premier verified adult companion discovery and booking marketplace. Facilitating cultured social
            presence, fine dining, art exhibitions, business summits, and travel companionship for consenting adults across India.
          </p>
          <div className="text-xs bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-400 space-y-1">
            <div className="text-pink-400 font-semibold flex items-center gap-1.5">
              <span>🔞</span> Strict Adult Policy
            </div>
            <p className="text-[11px]">
              Access to this platform is strictly restricted to individuals aged 18 and above. Exploitation, non-consensual activity,
              and unlawful conduct are strictly prohibited and immediately reported.
            </p>
          </div>
        </div>

        {/* Explore & Discover */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Explore Platform</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/explore" className="hover:text-pink-400 transition">
                Interactive Swipe Deck
              </Link>
            </li>
            <li>
              <Link href="/cities" className="hover:text-pink-400 transition">
                All Indian Cities Directory
              </Link>
            </li>
            <li>
              <Link href="/register-companion" className="hover:text-pink-400 transition">
                Register as Companion
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-pink-400 transition">
                Booking Workflow & 10% Fee
              </Link>
            </li>
            <li>
              <Link href="/dashboard/customer" className="hover:text-pink-400 transition">
                Customer Dashboard
              </Link>
            </li>
            <li>
              <Link href="/dashboard/companion" className="hover:text-pink-400 transition">
                Companion Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* City Landing Pages (SEO clean URLs) */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Popular Cities</h4>
          <ul className="space-y-2 text-xs">
            {servedCities.map((city) => (
              <li key={city.id}>
                <Link
                  href={`/cities/${city.stateSlug}/${city.slug}`}
                  className="hover:text-pink-400 transition flex items-center justify-between"
                >
                  <span>{city.name}</span>
                  <span className="text-[10px] text-slate-400">{city.stateName}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Trust, Legal & Safety */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Trust & Compliance</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/safety" className="hover:text-pink-400 transition">
                Verification Guidelines
              </Link>
            </li>
            <li>
              <Link href="/how-it-works#refund-policy" className="hover:text-pink-400 transition">
                Refund & Replacement Credit
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-pink-400 transition">
                Admin & Trust Queue
              </Link>
            </li>
            <li>
              <span className="text-slate-400 block pt-2">Helpline Support:</span>
              <span className="text-purple-300 font-mono text-xs">+91 1800-209-AURA</span>
            </li>
            <li>
              <span className="text-slate-400 block">Trust Inquiries:</span>
              <span className="text-purple-300 font-mono text-xs">trust@aura-india.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/60 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Aura India Companion Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-slate-400">
            <Link href="/safety" className="hover:text-slate-300 transition">
              Terms of Service
            </Link>
            <Link href="/safety" className="hover:text-slate-300 transition">
              Privacy Policy
            </Link>
            <Link href="/safety" className="hover:text-slate-300 transition">
              Anti-Exploitation Policy
            </Link>
            <Link href="/sitemap.xml" className="hover:text-slate-300 transition">
              Sitemap (XML)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
