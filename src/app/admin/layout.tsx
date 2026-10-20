'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldAlert,
  BarChart3,
  Users,
  FileCheck,
  Calendar,
  CreditCard,
  Percent,
  RotateCcw,
  Banknote,
  Sparkles,
  Sliders,
  MapPin,
  Star,
  Flag,
  HelpCircle,
  Tag,
  Search,
  Bell,
  Lock,
  Settings,
  ShieldCheck,
  Menu,
  X,
  ArrowLeft,
  LogOut,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  category: string;
  roles: string[];
  badge?: string;
}

const ADMIN_NAVIGATION: NavItem[] = [
  // Analytics
  { href: '/admin/dashboard', label: '1. Analytics Dashboard', icon: BarChart3, category: 'Overview', roles: ['super_admin', 'finance', 'moderator', 'support'] },

  // People & Profiles
  { href: '/admin/users', label: '2. User Management', icon: Users, category: 'Identities & Members', roles: ['super_admin', 'moderator'] },
  { href: '/admin/profiles', label: '3. Companion Approval', icon: FileCheck, category: 'Identities & Members', roles: ['super_admin', 'moderator', 'support'], badge: 'Queue' },

  // Operations
  { href: '/admin/bookings', label: '4. Booking Management', icon: Calendar, category: 'Bookings & Ops', roles: ['super_admin', 'finance', 'support'] },

  // Finance & Commissions
  { href: '/admin/payments', label: '5. Finance & Payments', icon: CreditCard, category: 'Finance & Payouts', roles: ['super_admin', 'finance'] },
  { href: '/admin/commissions', label: '6. 10% Commission Ledger', icon: Percent, category: 'Finance & Payouts', roles: ['super_admin', 'finance'] },
  { href: '/admin/refunds', label: '7. Refunds & Credits', icon: RotateCcw, category: 'Finance & Payouts', roles: ['super_admin', 'finance'] },
  { href: '/admin/payouts', label: '8. Payout Reconciliation', icon: Banknote, category: 'Finance & Payouts', roles: ['super_admin', 'finance'] },
  { href: '/admin/subscriptions', label: '9. Fees & Subscriptions', icon: Sparkles, category: 'Finance & Payouts', roles: ['super_admin', 'finance'] },

  // Marketplace & Content
  { href: '/admin/features', label: '10. Feature Flags', icon: Sliders, category: 'Marketplace Config', roles: ['super_admin'] },
  { href: '/admin/cities', label: '11. State & City Coverage', icon: MapPin, category: 'Marketplace Config', roles: ['super_admin', 'moderator'] },
  { href: '/admin/reviews', label: '12. Review Moderation', icon: Star, category: 'Content & Safety', roles: ['super_admin', 'moderator', 'support'] },
  { href: '/admin/reports', label: '13. Reports & Disputes', icon: Flag, category: 'Content & Safety', roles: ['super_admin', 'moderator', 'support'], badge: 'Active' },
  { href: '/admin/support', label: '14. Support Tickets', icon: HelpCircle, category: 'Content & Safety', roles: ['super_admin', 'support'] },

  // Marketing & Growth
  { href: '/admin/coupons', label: '15. Coupons & Referrals', icon: Tag, category: 'Growth & SEO', roles: ['super_admin', 'finance'] },
  { href: '/admin/seo', label: '16. SEO & Sitemaps', icon: Search, category: 'Growth & SEO', roles: ['super_admin', 'moderator'] },
  { href: '/admin/notifications', label: '17. Notifications Broadcast', icon: Bell, category: 'Growth & SEO', roles: ['super_admin', 'moderator'] },

  // Governance & Security
  { href: '/admin/security', label: '18. Security & Audit Logs', icon: Lock, category: 'System Governance', roles: ['super_admin', 'finance'] },
  { href: '/admin/settings', label: '19. Website Settings', icon: Settings, category: 'System Governance', roles: ['super_admin'] },
  { href: '/admin/roles', label: '20. Roles & Permissions', icon: ShieldCheck, category: 'System Governance', roles: ['super_admin'] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { appUser, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';
  if (isLoginPage) {
    return <>{children}</>;
  }

  const role = appUser?.role || 'super_admin';

  // Group items by category
  const categories = Array.from(new Set(ADMIN_NAVIGATION.map((n) => n.category)));

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-purple-500/20 px-4 sm:px-6 py-3 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle navigation drawer"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin/dashboard" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                AURA INDIA <span className="text-pink-400 font-light text-xs">CONTROL CENTRE</span>
              </span>
              <span className="block text-[9px] text-slate-400 tracking-wider -mt-0.5 uppercase">
                Production Administration Suite
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Operator:</span>
            <strong className="text-white font-medium">{appUser?.fullName || 'Administrator'}</strong>
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {role}
            </span>
          </div>

          <Link
            href="/explore"
            className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden md:inline">Client App</span>
          </Link>

          <button
            onClick={logout}
            className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-xl transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-slate-800/80 bg-slate-950/40 p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-65px)] sticky top-[65px]">
          {categories.map((cat) => {
            const items = ADMIN_NAVIGATION.filter(
              (item) => item.category === cat && (item.roles.includes(role) || role === 'super_admin')
            );
            if (items.length === 0) return null;

            return (
              <div key={cat} className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5">
                  {cat}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-white border border-purple-500/40 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-pink-400' : 'text-slate-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </aside>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-80 max-w-full bg-[#090d16] border-r border-slate-800 p-4 space-y-6 overflow-y-auto z-10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-sm font-bold text-white">All 20 Admin Modules</span>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {categories.map((cat) => {
                    const items = ADMIN_NAVIGATION.filter(
                      (item) => item.category === cat && (item.roles.includes(role) || role === 'super_admin')
                    );
                    if (items.length === 0) return null;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
                          {cat}
                        </div>
                        {items.map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname === item.href;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileSidebarOpen(false)}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                                isActive
                                  ? 'bg-purple-600 text-white'
                                  : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <Icon className="w-4 h-4 text-pink-400 flex-shrink-0" />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold py-2 rounded-lg text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout Administrator</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
