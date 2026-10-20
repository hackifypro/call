'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/lib/store';
import { Calendar, Search, MapPin, Clock, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatINR, formatDateOnly, getBookingStatusBadge } from '@/lib/utils';

export default function AdminBookingsPage() {
  const { bookings, companions } = usePlatformStore();
  const [search, setSearch] = useState('');

  const filtered = bookings.filter(
    (b) =>
      b.bookingRef.toLowerCase().includes(search.toLowerCase()) ||
      b.cityName.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-pink-400" />
            <span>Marketplace Bookings</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time audit of all companion reservations, financial totals, and fulfillment statuses.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking ref, city, client..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Booking Ref</th>
                <th className="py-3 px-4 font-semibold">Client</th>
                <th className="py-3 px-4 font-semibold">City & Date</th>
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold">Total / 10% Fee</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-pink-400">{b.bookingRef}</span>
                    <div className="text-[10px] text-slate-500">{formatDateOnly(b.createdAt)}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{b.customerName}</div>
                    <div className="text-[11px] text-slate-400">{b.occasionType}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white font-medium">{b.cityName}</div>
                    <div className="text-[11px] text-slate-400">{b.bookingDate} at {b.startTime}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {b.durationHours} Hours
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-white font-mono">{formatINR(b.priceBreakdown?.baseAmount || b.totalAmount || 0)}</div>
                    <div className="text-[10px] text-purple-300 font-mono">Platform (10%): {formatINR(b.priceBreakdown?.platformCommissionAmount || b.platformCommission || 0)}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getBookingStatusBadge(
                        b.status
                      ).color}`}
                    >
                      {getBookingStatusBadge(b.status).label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
