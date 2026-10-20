'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  PhoneCall,
  Shield,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SupportTicket } from '@/lib/types';
import { formatDateOnly } from '@/lib/utils';

export default function CustomerSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // New Ticket Modal State
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('booking');
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
  const [message, setMessage] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const loadSupportData = async () => {
    try {
      const res = await fetch('/api/customer/support');
      if (res.ok) {
        const json = await res.json();
        setTickets(json.tickets || []);
        setBookings(json.bookings || []);
        if (selectedTicket) {
          const updated = (json.tickets || []).find((t: SupportTicket) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load support data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupportData();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTicket(true);
    setTicketError(null);
    setTicketSuccess(null);

    try {
      const res = await fetch('/api/customer/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          category,
          priority,
          message,
          bookingRef: bookingRef || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit ticket.');
      }

      setTicketSuccess(json.message);
      setSubject('');
      setMessage('');
      setBookingRef('');
      await loadSupportData();
      setTimeout(() => setShowNewTicketModal(false), 1500);
    } catch (err: any) {
      setTicketError(err.message || 'Failed to submit ticket.');
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setReplySubmitting(true);
    try {
      const res = await fetch(`/api/customer/support/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage.trim() }),
      });

      if (res.ok) {
        setReplyMessage('');
        await loadSupportData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplySubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How does the 10% Platform Escrow guarantee protect my funds?',
      a: 'When you confirm a booking, 100% of your funds are held in secure platform escrow. The companion receives their 90% payout only after the date concludes successfully without unresolved disputes.',
    },
    {
      q: 'How does the Section 11 Cancellation Policy work?',
      a: 'If you cancel with more than 24 hours notice, you receive 100% replacement booking credit. If cancelling 12-24 hours prior, 50% replacement credit is issued. Within 12 hours, appointments are non-refundable to protect the companion from lost calendar time.',
    },
    {
      q: 'Is my personal identity or phone number revealed to companions?',
      a: 'No. Your legal identity documents and personal contact numbers are strictly guarded under the Digital Personal Data Protection Act. Companions only see your chosen public display name.',
    },
    {
      q: 'Can I request an appointment at a hotel or fine dining venue?',
      a: 'Yes. All adult companion dates must take place in public, reputable, or hotel lounge dining venues. Private residential addresses without prior authorization are strictly disallowed for mutual safety.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Help, Safety & Support</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              24/7 Operations Desk
            </span>
          </h1>
          <p className="text-sm text-slate-400">
            Submit customer support tickets, escalate safety disputes, and browse platform terms.
          </p>
        </div>

        <button
          onClick={() => {
            setShowNewTicketModal(true);
            setTicketSuccess(null);
            setTicketError(null);
          }}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* 24/7 Urgent Safety Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/50 via-[#101228] to-purple-950/40 border border-amber-500/30 p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Immediate Emergency / Safety Helpline</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you experience any harassment, safety violations, or boundary concerns during an ongoing date, contact our 24/7 emergency priority dispatch.
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <span className="font-mono text-lg font-black text-amber-300 block">+91 1800-AURA-SAFE</span>
          <span className="text-[10px] text-slate-400">Toll-Free • 24 Hours • Confidential</span>
        </div>
      </div>

      {/* Two Column Layout: Support Tickets Left, FAQs Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Support Tickets */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>My Support Tickets</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
              {tickets.length}
            </span>
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#0e1024] border border-white/10 text-center text-xs text-slate-400 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-bold text-white text-sm">No Active Tickets</p>
              <p>You have no open disputes or pending support queries on file.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-[#0e1024] border border-white/10 hover:border-purple-500/30 transition-all shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-purple-300">{t.ticketRef}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'open'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : t.status === 'in_progress'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {t.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-0.5 bg-white/5 rounded">
                        {t.category}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500">{formatDateOnly(t.createdAt)}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm">{t.subject}</h4>
                    {t.bookingRef && (
                      <p className="text-[11px] text-purple-400 font-mono mt-0.5">Booking Ref: {t.bookingRef}</p>
                    )}
                  </div>

                  {/* Conversation snippet */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                    {t.replies?.slice(-2).map((r) => (
                      <div key={r.id} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className={`font-bold ${r.authorRole === 'support' ? 'text-purple-400' : 'text-slate-300'}`}>
                            {r.authorRole === 'support' ? '🛡️ AURA Support Staff' : r.authorName}
                          </span>
                          <span>{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-200">{r.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10"
                    >
                      View Thread & Reply ({t.replies?.length || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: FAQs */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0e1024] border border-white/10 p-4 transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left font-bold text-xs text-white flex items-center justify-between space-x-2"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-purple-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-300 mt-2.5 pt-2 border-t border-white/5 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* NEW TICKET MODAL */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101226] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Open Customer Support Ticket</h3>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ticketSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <p className="font-bold text-white text-sm">Ticket Submitted Successfully</p>
                <p className="text-xs text-slate-400">{ticketSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                {ticketError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {ticketError}
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of your inquiry or issue..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#14162e] border border-white/10 text-white"
                    >
                      <option value="booking">Booking Issue</option>
                      <option value="payment">Payment / Escrow</option>
                      <option value="safety">Safety & Conduct</option>
                      <option value="account">Account & Privacy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e: any) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#14162e] border border-white/10 text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {bookings.length > 0 && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Related Booking (Optional)</label>
                    <select
                      value={bookingRef}
                      onChange={(e) => setBookingRef(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#14162e] border border-white/10 text-white"
                    >
                      <option value="">None / General Inquiry</option>
                      {bookings.map((b) => (
                        <option key={b.id} value={b.bookingRef}>
                          {b.bookingRef} - {b.companionDisplayName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide detailed description..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNewTicketModal(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingTicket}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50"
                  >
                    {creatingTicket ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* VIEW TICKET DETAIL & REPLY MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101226] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div>
                <span className="font-mono text-xs font-bold text-purple-300">{selectedTicket.ticketRef}</span>
                <h3 className="font-bold text-white text-base">{selectedTicket.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-1 custom-scrollbar text-xs">
              {selectedTicket.replies?.map((r) => {
                const isStaff = r.authorRole === 'support' || r.authorRole === 'admin';
                return (
                  <div
                    key={r.id}
                    className={`p-3.5 rounded-2xl ${
                      isStaff
                        ? 'bg-purple-950/40 border border-purple-500/30'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400">
                      <span className={`font-bold ${isStaff ? 'text-purple-300' : 'text-slate-200'}`}>
                        {isStaff ? '🛡️ AURA Support Specialist' : r.authorName}
                      </span>
                      <span>{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{r.message}</p>
                  </div>
                );
              })}
            </div>

            {/* Reply Input */}
            <form onSubmit={handleReplyTicket} className="pt-2 border-t border-white/10 flex items-center space-x-2 shrink-0">
              <input
                type="text"
                required
                placeholder="Type your reply to staff..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={replySubmitting || !replyMessage.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-50 flex items-center space-x-1"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
