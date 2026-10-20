'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  MapPin,
  Calendar,
  Heart,
  MessageSquare,
  CreditCard,
  RotateCcw,
  Star,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Sparkles,
  PhoneCall,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface CustomerNavRoute {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [customer, setCustomer] = useState<{
    id: string;
    fullName: string;
    email: string;
    role: string;
  } | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeCreditBalance, setActiveCreditBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomerOverview() {
      try {
        const res = await fetch('/api/customer/dashboard');
        if (res.status === 401) {
          router.push('/login?redirect=/customer/dashboard');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCustomer(data.user);
            setUnreadNotifications(data.metrics?.unreadNotificationsCount || 0);
            setActiveCreditBalance(data.metrics?.totalCreditBalance || 0);
          }
        }
      } catch (err) {
        console.error('Failed to load customer profile in layout:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomerOverview();
  }, [pathname, router]);

  const navRoutes: CustomerNavRoute[] = [
    { label: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'Explore & Swipe', href: '/customer/explore', icon: Sparkles },
    { label: 'City Search', href: '/customer/cities', icon: MapPin },
    { label: 'My Bookings', href: '/customer/bookings', icon: Calendar },
    { label: 'Favorites', href: '/customer/favorites', icon: Heart },
    { label: 'Messages', href: '/customer/messages', icon: MessageSquare },
    { label: 'Payments & Receipts', href: '/customer/payments', icon: CreditCard },
    {
      label: 'Refunds & Credits',
      href: '/customer/refunds',
      icon: RotateCcw,
      badge: activeCreditBalance > 0 ? formatINR(activeCreditBalance) : undefined,
    },
    { label: 'Ratings & Reviews', href: '/customer/reviews', icon: Star },
    {
      label: 'Notifications',
      href: '/customer/notifications',
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
    { label: 'Help & Support', href: '/customer/support', icon: HelpCircle },
    { label: 'Account Settings', href: '/customer/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore error
    }
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#070814] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-purple-600 selection:text-white">
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0d0f22]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link href="/customer/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-md">
            A
          </div>
          <div>
            <span className="font-extrabold tracking-wider bg-gradient-to-r from-white via-purple-200 to-pink-400 bg-clip-text text-transparent text-lg">
              AURA
            </span>
            <span className="ml-1 text-[10px] uppercase tracking-widest text-purple-400 font-semibold px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">
              Customer
            </span>
          </div>
        </Link>
        <div className="flex items-center space-x-2">
          {activeCreditBalance > 0 && (
            <Link
              href="/customer/refunds"
              className="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full"
            >
              {formatINR(activeCreditBalance)}
            </Link>
          )}
          <Link
            href="/customer/notifications"
            className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation (Desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0b1c] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:w-72 lg:min-h-screen shrink-0`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Link href="/customer/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-[1.5px] shadow-lg shadow-purple-900/30">
                <div className="w-full h-full bg-[#0a0b1c] rounded-[14px] flex items-center justify-center">
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-purple-400 to-pink-300 text-xl">
                    A
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-xl tracking-wider text-white">AURA</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                    INDIA
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Verified Companion Club</p>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Quick Banner */}
          <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white shadow-md ring-2 ring-purple-500/30">
                {customer?.fullName?.charAt(0) || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{customer?.fullName || 'Valued Customer'}</p>
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Verified 18+ Member</span>
                </div>
              </div>
            </div>
            {activeCreditBalance > 0 && (
              <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-300">Section 11 Credit:</span>
                </div>
                <span className="text-xs font-bold text-emerald-300">{formatINR(activeCreditBalance)}</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
            {navRoutes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-white border border-purple-500/40 shadow-lg shadow-purple-950/50'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-300'
                      }`}
                    />
                    <span>{route.label}</span>
                  </div>
                  {route.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        typeof route.badge === 'number'
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {route.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Safety & Logout Bar */}
          <div className="p-4 border-t border-white/10 space-y-2 bg-[#080918]">
            <Link
              href="/customer/support"
              className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-amber-300/90 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <PhoneCall className="w-4 h-4 shrink-0 text-amber-400" />
              <div className="truncate">
                <span className="font-bold">24/7 Safety Helpline</span>
                <p className="text-[10px] text-amber-400/80">Discreet & Immediate Assistance</p>
              </div>
            </Link>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-[#070814]/80 backdrop-blur-md border-b border-white/10 px-8 py-3.5 items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs uppercase tracking-widest font-bold text-purple-400 bg-purple-950/50 px-2.5 py-1 rounded-md border border-purple-800/40">
              India Exclusive Escrow Protected
            </span>
            <span className="text-xs text-slate-400">Strict Adult Age Verified Platform</span>
          </div>

          <div className="flex items-center space-x-4">
            {activeCreditBalance > 0 && (
              <Link
                href="/customer/refunds"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replacement Credit: {formatINR(activeCreditBalance)}</span>
              </Link>
            )}

            <Link
              href="/customer/notifications"
              className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            <Link
              href="/customer/settings"
              className="flex items-center space-x-2.5 pl-3 border-l border-white/10 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
                {customer?.fullName?.charAt(0) || 'C'}
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-white truncate max-w-[120px]">{customer?.fullName || 'Customer'}</p>
                <p className="text-slate-400 text-[10px]">Client Account</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101226] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sign out of AURA INDIA?</h3>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Your active session will be revoked. You will need to enter your credentials to access your companion bookings and messages again.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-sm shadow-lg shadow-rose-900/30 transition-all"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
