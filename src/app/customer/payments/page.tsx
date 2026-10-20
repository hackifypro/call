'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Download,
  Printer,
  FileText,
  Search,
  Shield,
  X,
  ExternalLink,
} from 'lucide-react';
import { formatINR, formatDateOnly } from '@/lib/utils';
import { BookingCredit } from '@/lib/types';

interface PaymentItem {
  id: string;
  bookingId: string;
  bookingRef: string;
  companionDisplayName: string;
  cityName: string;
  date: string;
  bookingDate: string;
  grossAmount: number;
  platformFee: number;
  totalPaid: number;
  paymentMethod: string;
  status: string;
  isRefunded: boolean;
  invoiceNumber: string;
}

export default function CustomerPaymentsPage() {
  const [transactions, setTransactions] = useState<PaymentItem[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [creditsList, setCreditsList] = useState<BookingCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'successful' | 'refunded'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentItem | null>(null);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await fetch('/api/customer/payments');
        if (res.ok) {
          const json = await res.json();
          setTransactions(json.transactions || []);
          setTotalPaid(json.totalPaid || 0);
          setAvailableCredits(json.availableCredits || 0);
          setCreditsList(json.creditsList || []);
        }
      } catch (err) {
        console.error('Failed to load payments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    if (filterStatus === 'successful' && t.status !== 'successful') return false;
    if (filterStatus === 'refunded' && !t.isRefunded) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.bookingRef.toLowerCase().includes(q) ||
        t.companionDisplayName.toLowerCase().includes(q) ||
        t.invoiceNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const successfulCount = transactions.filter((t) => t.status === 'successful').length;
  const refundedCount = transactions.filter((t) => t.isRefunded).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Payments & Receipts</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Escrow Secured
            </span>
          </h1>
          <p className="text-sm text-slate-400">
            Transparent transaction ledger, payment breakdown, downloadable tax receipts, and replacement credits.
          </p>
        </div>

        <Link
          href="/customer/refunds"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          <span>Credits & Refund Policy</span>
        </Link>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0e1024] border border-white/10 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Paid in Escrow
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{formatINR(totalPaid)}</p>
          <p className="text-xs text-slate-400 mt-1">{successfulCount} successful transactions</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1024] border border-white/10 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Section 11 Active Credits
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300">{formatINR(availableCredits)}</p>
          <p className="text-xs text-emerald-400/80 mt-1">Available for new bookings</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1024] border border-white/10 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Refunds & Cancellations
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-300">{refundedCount}</p>
          <p className="text-xs text-slate-400 mt-1">Processed under policy</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e1024] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking ref or invoice..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {(['all', 'successful', 'refunded'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterStatus === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="rounded-3xl bg-[#0e1024] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#12142e] text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Invoice / Ref</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Companion & Venue</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Gross Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-white block">{tx.invoiceNumber}</span>
                      <span className="text-[10px] text-purple-300 font-mono">{tx.bookingRef}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span>{formatDateOnly(tx.date)}</span>
                      <span className="text-[10px] text-slate-500 block">Date: {formatDateOnly(tx.bookingDate)}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{tx.companionDisplayName}</span>
                      <span className="text-[10px] text-slate-400">{tx.cityName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span>{tx.paymentMethod}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-white text-sm block">{formatINR(tx.totalPaid)}</span>
                      <span className="text-[10px] text-slate-500">Includes 10% Platform Escrow</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {tx.status === 'successful' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Paid & Secured</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold inline-flex items-center space-x-1">
                          <RotateCcw className="w-3 h-3" />
                          <span>Refunded / Credit</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(tx)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors inline-flex items-center space-x-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE RECEIPT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101226] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                  A
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">AURA INDIA</h3>
                  <p className="text-[10px] text-slate-400">Official Escrow Payment Receipt</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Invoice Number</span>
                  <span className="font-mono font-bold text-white text-sm">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase">Payment Date</span>
                  <span className="font-semibold text-white">{formatDateOnly(selectedInvoice.date)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">Appointment Particulars</span>
                <p className="font-bold text-white text-sm">Companion: {selectedInvoice.companionDisplayName}</p>
                <p className="text-slate-300">Booking Reference: <span className="font-mono text-purple-300">{selectedInvoice.bookingRef}</span></p>
                <p className="text-slate-400">Appointment Date: {formatDateOnly(selectedInvoice.bookingDate)} • {selectedInvoice.cityName}</p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Companion Base Remuneration:</span>
                  <span>{formatINR(selectedInvoice.grossAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform Commission & Escrow (10%):</span>
                  <span>{formatINR(selectedInvoice.platformFee)} (Included)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (18% on platform fee):</span>
                  <span>₹0 (Absorbed by platform)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 font-black text-white text-base">
                  <span>Total Escrow Paid:</span>
                  <span className="text-purple-300">{formatINR(selectedInvoice.totalPaid)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-slate-300 text-[11px] space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-purple-300">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Escrow Guarantee Notice</span>
                </div>
                <p>
                  Payments remain protected in platform escrow until appointment conclusion. In case of companion cancellation, replacement credits are issued instantly per Section 11 terms.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
