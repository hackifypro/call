'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { formatINR, formatDateOnly, getBookingStatusBadge } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/analytics');
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to fetch database metrics.');
        setLoading(false);
        return;
      }
      setData(json.analytics);
      setLoading(false);
    } catch {
      setError('Connection to analytics database failed.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
        <p className="text-xs text-slate-400">Aggregating real database records...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
        <div className="flex items-center space-x-2 font-bold">
          <AlertTriangle className="w-5 h-5" />
          <span>Error Loading Dashboard Metrics</span>
        </div>
        <p className="text-xs text-slate-300">{error || 'Unknown database error.'}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-2 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs font-semibold"
        >
          Retry Database Aggregation
        </button>
      </div>
    );
  }

  const { financials, counts, cityBreakdown, recentBookings, recentAuditLogs } = data;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <BarChart3 className="w-7 h-7 text-pink-400" />
            <span>Marketplace Control & Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time aggregates calculated directly from persistent booking, escrow, and identity records.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center space-x-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-2 rounded-xl transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Gross Marketplace Volume</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{formatINR(financials.grossVolume)}</div>
          <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>All India verified escrow volume</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-purple-500/30 space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-300 font-medium">Audited 10% Commission</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono">{formatINR(financials.platformCommission)}</div>
          <div className="text-[10px] text-purple-400">
            <span>Retained platform operational revenue</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Companion Net Payouts (90%)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{formatINR(financials.companionNetPayouts)}</div>
          <div className="text-[10px] text-emerald-400">
            <span>Direct contractor bank transfers</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Section 11 Active Credits</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">{formatINR(financials.activeReplacementCredits)}</div>
          <div className="text-[10px] text-slate-400">
            <span>Available for customer re-booking</span>
          </div>
        </div>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link href="/admin/profiles" className="glass-card rounded-xl p-3.5 border border-white/10 hover:border-pink-500/30 transition block space-y-1">
          <span className="text-[11px] text-slate-400 block truncate">Pending Approval</span>
          <div className="text-xl font-bold text-amber-400">{counts.pendingVerifications}</div>
          <span className="text-[10px] text-pink-400">Verification queue →</span>
        </Link>

        <Link href="/admin/profiles" className="glass-card rounded-xl p-3.5 border border-white/10 hover:border-pink-500/30 transition block space-y-1">
          <span className="text-[11px] text-slate-400 block truncate">Active Companions</span>
          <div className="text-xl font-bold text-emerald-400">{counts.approvedCompanions}</div>
          <span className="text-[10px] text-slate-500">100% ID Verified</span>
        </Link>

        <Link href="/admin/bookings" className="glass-card rounded-xl p-3.5 border border-white/10 hover:border-pink-500/30 transition block space-y-1">
          <span className="text-[11px] text-slate-400 block truncate">Total Bookings</span>
          <div className="text-xl font-bold text-white">{counts.totalBookings}</div>
          <span className="text-[10px] text-slate-500">{counts.completedBookings} Completed</span>
        </Link>

        <Link href="/admin/reports" className="glass-card rounded-xl p-3.5 border border-white/10 hover:border-pink-500/30 transition block space-y-1">
          <span className="text-[11px] text-slate-400 block truncate">Dispute Reports</span>
          <div className="text-xl font-bold text-rose-400">{counts.activeDisputes}</div>
          <span className="text-[10px] text-slate-500">Trust & Safety desk</span>
        </Link>

        <Link href="/admin/support" className="glass-card rounded-xl p-3.5 border border-white/10 hover:border-pink-500/30 transition block space-y-1">
          <span className="text-[11px] text-slate-400 block truncate">Open Tickets</span>
          <div className="text-xl font-bold text-purple-300">{counts.openTickets}</div>
          <span className="text-[10px] text-slate-500">Member inquiries</span>
        </Link>

        <Link href="/admin/cities" className="glass-card rounded-xl p-3.5 border border-white/10 hover:border-pink-500/30 transition block space-y-1">
          <span className="text-[11px] text-slate-400 block truncate">Active Metros</span>
          <div className="text-xl font-bold text-pink-400">{Object.keys(cityBreakdown).length}</div>
          <span className="text-[10px] text-slate-500">Service areas</span>
        </Link>
      </div>

      {/* Metro Distribution & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* City Breakdown */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Companion Geographic Distribution</span>
            </h2>
            <Link href="/admin/cities" className="text-[11px] text-pink-400 hover:underline">
              Manage →
            </Link>
          </div>

          <div className="space-y-2.5">
            {Object.entries(cityBreakdown).map(([cityName, count]: any) => (
              <div key={cityName} className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{cityName}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, count * 35)}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-white w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-pink-400" />
              <span>Recent Booking Transactions</span>
            </h2>
            <Link href="/admin/bookings" className="text-[11px] text-pink-400 hover:underline">
              View All ({counts.totalBookings}) →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Ref</th>
                  <th className="py-2.5 px-3 font-semibold">Client</th>
                  <th className="py-2.5 px-3 font-semibold">Companion</th>
                  <th className="py-2.5 px-3 font-semibold">City</th>
                  <th className="py-2.5 px-3 font-semibold">Amount (₹)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-pink-400">{b.bookingRef}</td>
                    <td className="py-2.5 px-3 text-white">{b.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-300">{b.companionDisplayName}</td>
                    <td className="py-2.5 px-3 text-slate-400">{b.cityName}</td>
                    <td className="py-2.5 px-3 font-bold font-mono text-white">{formatINR(b.priceBreakdown?.baseAmount || 0)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getBookingStatusBadge(b.status)}`}>
                        {b.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Operator Security Audit Logs */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Recent Administrative Audit Events</span>
          </h2>
          <Link href="/admin/security" className="text-[11px] text-pink-400 hover:underline">
            Audit Vault →
          </Link>
        </div>

        <div className="divide-y divide-slate-800 text-xs">
          {recentAuditLogs.map((log: any) => (
            <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  {log.action}
                </span>
                <span className="text-slate-300">{log.details}</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                <span className="font-mono">{log.adminEmail}</span>
                <span>•</span>
                <span>{formatDateOnly(log.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
