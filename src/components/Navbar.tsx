'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlatformStore } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { INDIAN_CITIES } from '@/lib/geoData';
import {
  ShieldCheck,
  Compass,
  MapPin,
  User,
  Heart,
  Calendar,
  Settings,
  Sparkles,
  Menu,
  X,
  CreditCard,
  LogOut,
  ChevronDown,
  Bell,
  MessageSquare,
  HelpCircle,
  Globe,
  Clock,
  DollarSign,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

export default function Navbar() {
  const pathname = usePathname();
  const { lang, toggleLanguage } = useLanguage();
  const { appUser, logout } = useAuth();
  const {
    favorites,
    bookingCredits,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    conversations,
  } = usePlatformStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Isolate Admin pages: AdminLayout manages all administrative headers and navigation
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const isAuthenticated = Boolean(appUser);
  const currentRole = appUser?.role || 'guest';

  // Unread counts
  const userNotifs = notifications.filter((n) => n.userId === appUser?.id);
  const unreadNotifsCount = userNotifs.filter((n) => !n.isRead).length;
  const unreadMessagesCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const activeCredits = appUser
    ? bookingCredits
        .filter((c) => c.userId === appUser.id && c.status === 'available')
        .reduce((sum, c) => sum + c.creditAmount, 0)
    : 0;

  const servedCities = INDIAN_CITIES.filter((c) => c.isServed);

  // Logo home target depends on authenticated role
  const logoHref = !isAuthenticated
    ? '/login'
    : currentRole === 'companion'
    ? '/companion/dashboard'
    : '/explore';

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-md">
      {/* 18+ Compliance Safety Banner */}
      <div className="bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/90 border-b border-purple-500/20 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-purple-200">
            <span className="bg-purple-600/40 text-purple-200 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wider border border-purple-400/30">
              18+ ONLY
            </span>
            <span>Strict Adult Age & Government ID Verification Mandate • 10% Transparent Commission</span>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-slate-300">
            <Link href="/safety" className="hover:text-purple-300 transition">
              Trust & Safety Code
            </Link>
            <span>•</span>
            <Link href="/security" className="hover:text-purple-300 transition">
              Security & Privacy
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Cities Quick Selector */}
          <div className="flex items-center space-x-3">
            <Link href={logoHref} className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-pink-400 group-hover:scale-110 transition duration-300" />
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  AURA <span className="text-pink-400 font-light text-sm">INDIA</span>
                </span>
                <span className="block text-[10px] text-slate-400 tracking-wider -mt-1 uppercase">
                  Adult Companionship
                </span>
              </div>
            </Link>

            {/* City Selector Dropdown (Authenticated Customer Only) */}
            {isAuthenticated && currentRole === 'customer' && (
              <div className="relative hidden lg:block ml-4">
                <button
                  onClick={() => setCitySelectorOpen(!citySelectorOpen)}
                  className="flex items-center space-x-1.5 text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700/60 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-pink-400" />
                  <span>Search Cities</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {citySelectorOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 glass-card rounded-xl shadow-2xl p-2 z-50 border border-slate-700/80">
                    <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                      Actively Served Cities
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {servedCities.map((city) => (
                        <Link
                          key={city.id}
                          href={`/cities/${city.stateSlug}/${city.slug}`}
                          onClick={() => setCitySelectorOpen(false)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-pink-500/20 hover:text-pink-300 transition"
                        >
                          <span>{city.name}</span>
                          <span className="text-[10px] text-slate-400">{city.stateName}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* CASE A: UNAUTHENTICATED NAVBAR (Strict Login-First)        */}
          {/* ========================================================= */}
          {!isAuthenticated && (
            <div className="flex items-center space-x-3">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-xs transition font-medium"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-pink-400" />
                <span className="uppercase">{lang}</span>
              </button>

              <Link
                href="/safety"
                className="hidden sm:inline-flex items-center space-x-1 text-xs text-slate-300 hover:text-white transition px-3 py-2 rounded-lg"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Safety Code</span>
              </Link>

              <Link
                href="/login"
                className="text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-700 transition"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="text-xs font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-4 py-2 rounded-lg shadow-md shadow-pink-500/20 transition"
              >
                Create Account (18+)
              </Link>
            </div>
          )}

          {/* ========================================================= */}
          {/* CASE B: AUTHENTICATED NAVBAR                              */}
          {/* ========================================================= */}
          {isAuthenticated && (
            <>
              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
                {/* 1. CUSTOMER NAVIGATION */}
                {currentRole === 'customer' && (
                  <>
                    <Link
                      href="/explore"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        pathname === '/explore'
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Compass className="w-4 h-4 text-pink-400" />
                      <span>Discover</span>
                    </Link>

                    <Link
                      href="/cities"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        pathname.startsWith('/cities')
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>Search Cities</span>
                    </Link>

                    <Link
                      href="/dashboard/customer?tab=favorites"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        pathname === '/dashboard/customer' && pathname.includes('tab=favorites')
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-rose-400" />
                      <span>Favorites</span>
                      {favorites.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                          {favorites.length}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/dashboard/customer?tab=bookings"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        pathname === '/dashboard/customer' && !pathname.includes('tab=favorites')
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>My Bookings</span>
                    </Link>
                  </>
                )}

                {/* 2. COMPANION NAVIGATION */}
                {currentRole === 'companion' && (
                  <>
                    <Link
                      href="/companion/dashboard"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        pathname === '/companion/dashboard'
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/companion/dashboard?tab=profile"
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/companion/dashboard?tab=requests"
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                    >
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>Booking Requests</span>
                    </Link>

                    <Link
                      href="/companion/dashboard?tab=availability"
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                    >
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Availability</span>
                    </Link>

                    <Link
                      href="/companion/dashboard?tab=pricing"
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                    >
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      <span>Pricing</span>
                    </Link>

                    <Link
                      href="/companion/dashboard?tab=earnings"
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                    >
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span>Earnings</span>
                    </Link>

                    <Link
                      href="/companion/dashboard?tab=payouts"
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                    >
                      <CreditCard className="w-4 h-4 text-cyan-400" />
                      <span>Payout History</span>
                    </Link>
                  </>
                )}

                {/* Shared: Messages & Help/Support */}
                <Link
                  href="/messages"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition relative ${
                    pathname === '/messages'
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-pink-400" />
                  <span>Messages</span>
                  {unreadMessagesCount > 0 && (
                    <span className="w-4 h-4 bg-pink-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                      {unreadMessagesCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/support"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    pathname === '/support'
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Support</span>
                </Link>
              </nav>

              {/* Right Side: Notifications, Credits, Account & Logout */}
              <div className="hidden sm:flex items-center space-x-2.5">
                {/* Language Switcher */}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center space-x-1 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-xs transition font-medium"
                  title="Toggle Language"
                >
                  <Globe className="w-3.5 h-3.5 text-pink-400" />
                  <span className="uppercase">{lang}</span>
                </button>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                    className="relative p-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition"
                    aria-label="View notifications"
                  >
                    <Bell className="w-4 h-4 text-slate-300" />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse">
                        {unreadNotifsCount}
                      </span>
                    )}
                  </button>

                  {notifMenuOpen && (
                    <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-2xl p-3 z-50 border border-slate-700/80">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Notifications ({userNotifs.length})
                        </span>
                        {unreadNotifsCount > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-[11px] text-pink-400 hover:text-pink-300 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-2 py-2">
                        {userNotifs.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-500">
                            No notifications yet.
                          </div>
                        ) : (
                          userNotifs.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markNotificationAsRead(n.id)}
                              className={`p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                                !n.isRead
                                  ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                                  : 'bg-slate-900/40 border-slate-800 text-slate-400'
                              }`}
                            >
                              <div className="font-semibold text-white flex items-center justify-between">
                                <span>{n.title}</span>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] mt-0.5 text-slate-300 leading-snug">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Replacement Credits Badge */}
                {currentRole === 'customer' && activeCredits > 0 && (
                  <Link
                    href="/dashboard/customer"
                    className="flex items-center space-x-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs px-2.5 py-1.5 rounded-full hover:bg-emerald-900/50 transition"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{formatINR(activeCredits)} Credit</span>
                  </Link>
                )}

                {/* User Account Settings Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
                      {appUser?.fullName?.charAt(0) || 'U'}
                    </div>
                    <span className="max-w-[100px] truncate">{appUser?.fullName || 'User'}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 glass-card rounded-xl shadow-2xl p-2 z-50 border border-slate-700">
                      <div className="px-2 py-1.5 border-b border-slate-800">
                        <p className="text-xs font-bold text-white truncate">{appUser?.fullName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{appUser?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href={currentRole === 'companion' ? '/companion/dashboard?tab=settings' : '/dashboard/customer?tab=settings'}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 transition"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-400" />
                          <span>Account Settings</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Drawer Toggle */}
              <div className="flex md:hidden items-center space-x-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  aria-label="Open navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-slate-800 px-4 pt-3 pb-6 space-y-3">
          {isAuthenticated ? (
            <>
              {currentRole === 'customer' && (
                <>
                  <Link
                    href="/explore"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-200 hover:text-pink-400 py-2"
                  >
                    <Compass className="w-4 h-4 text-pink-400" />
                    <span className="font-medium text-xs">Discover</span>
                  </Link>
                  <Link
                    href="/cities"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-200 hover:text-emerald-400 py-2"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium text-xs">Search Cities</span>
                  </Link>
                  <Link
                    href="/dashboard/customer?tab=favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-200 hover:text-pink-400 py-2"
                  >
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span className="font-medium text-xs">Favorites ({favorites.length})</span>
                  </Link>
                  <Link
                    href="/dashboard/customer?tab=bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-200 hover:text-pink-400 py-2"
                  >
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="font-medium text-xs">My Bookings</span>
                  </Link>
                </>
              )}

              {currentRole === 'companion' && (
                <>
                  <Link
                    href="/companion/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-200 hover:text-pink-400 py-2"
                  >
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span className="font-medium text-xs">Dashboard</span>
                  </Link>
                  <Link
                    href="/companion/dashboard?tab=profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-200 hover:text-purple-400 py-2"
                  >
                    <User className="w-4 h-4 text-purple-400" />
                    <span className="font-medium text-xs">My Profile</span>
                  </Link>
                  <Link
                    href="/companion/dashboard?tab=requests"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-200 hover:text-indigo-400 py-2"
                  >
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="font-medium text-xs">Booking Requests</span>
                  </Link>
                  <Link
                    href="/companion/dashboard?tab=availability"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-200 hover:text-emerald-400 py-2"
                  >
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium text-xs">Availability</span>
                  </Link>
                  <Link
                    href="/companion/dashboard?tab=pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-200 hover:text-amber-400 py-2"
                  >
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span className="font-medium text-xs">Pricing</span>
                  </Link>
                  <Link
                    href="/companion/dashboard?tab=earnings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-200 hover:text-green-400 py-2"
                  >
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="font-medium text-xs">Earnings</span>
                  </Link>
                  <Link
                    href="/companion/dashboard?tab=payouts"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-200 hover:text-cyan-400 py-2"
                  >
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium text-xs">Payout History</span>
                  </Link>
                </>
              )}

              <Link
                href="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 text-slate-200 hover:text-pink-400 py-2"
              >
                <MessageSquare className="w-4 h-4 text-pink-400" />
                <span className="font-medium text-xs">Messages</span>
              </Link>

              <Link
                href="/support"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 text-slate-200 hover:text-pink-400 py-2"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-xs">Help & Support</span>
              </Link>

              <Link
                href={currentRole === 'companion' ? '/dashboard/companion?tab=settings' : '/dashboard/customer?tab=settings'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 text-slate-200 hover:text-pink-400 py-2"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-xs">Account Settings</span>
              </Link>

              <div className="border-t border-slate-800 pt-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold py-2.5 rounded-lg text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center bg-slate-800 text-white font-medium py-2.5 rounded-lg text-xs"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-2.5 rounded-lg text-xs"
              >
                Register (18+)
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
