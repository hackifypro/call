'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/lib/store';
import { SupportTicket } from '@/lib/types';
import { formatDateOnly } from '@/lib/utils';
import {
  HelpCircle,
  ShieldAlert,
  PlusCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  ChevronDown,
  ChevronUp,
  FileText,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

export default function SupportCenterPage() {
  const {
    currentUser,
    currentRole,
    supportTickets,
    createSupportTicket,
    addTicketReply,
    bookings,
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<'my_tickets' | 'new_ticket'>('my_tickets');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // New ticket form states
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('booking');
  const [bookingRef, setBookingRef] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  // Reply state
  const [replyText, setReplyText] = useState('');

  // Filter user's tickets (or all tickets if admin)
  const visibleTickets =
    currentRole === 'admin'
      ? supportTickets
      : supportTickets.filter((t) => t.userId === currentUser.id);

  const selectedTicket = supportTickets.find((t) => t.id === selectedTicketId);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const fullMessage = bookingRef
        ? `[Linked Booking: ${bookingRef}]\n\n${message}`
        : message;

      const result = createSupportTicket({
        subject: subject.trim(),
        category,
        message: fullMessage,
      });

      setIsSubmitting(false);
      if (result.success && result.ticketRef) {
        setSuccessRef(result.ticketRef);
        setSubject('');
        setMessage('');
        setBookingRef('');
        setActiveTab('my_tickets');
      }
    }, 600);
  };

  const handleSendReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    addTicketReply(ticketId, replyText.trim(), currentRole === 'admin');
    setReplyText('');
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return { label: 'Open', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'waiting_user':
        return { label: 'Waiting for User', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'resolved':
        return { label: 'Resolved', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'closed':
        return { label: 'Closed', color: 'bg-slate-700/40 text-slate-400 border-slate-600/40' };
      default:
        return { label: status, color: 'bg-slate-800 text-slate-300' };
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
              <HelpCircle className="w-4 h-4" />
              <span>Section 15 • Trust, Safety & Mediation</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Customer Support & Dispute Centre
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              File booking disputes, request refund assistance, verify credentials, or report safety concerns.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setActiveTab('new_ticket');
                setSuccessRef(null);
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-pink-500/20 flex items-center space-x-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Ticket</span>
            </button>
          </div>
        </div>

        {/* Emergency Safety Alert (Mandatory for Indian Marketplace Safety) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">
                Emergency & Immediate Safety Escalation Protocol
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed mt-0.5">
                If you ever feel unsafe or require emergency physical assistance during any public companionship meetup, immediately dial India Emergency Helpline <strong className="text-white">112</strong> or call our 24/7 dedicated Safety Trust Desk.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <a
              href="tel:112"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-md shadow-rose-900/40 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Dial 112 (Emergency)</span>
            </a>
          </div>
        </div>

        {/* Success notification */}
        {successRef && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>
                Ticket <strong>{successRef}</strong> created successfully! A member of our Trust & Safety mediation team has been assigned.
              </span>
            </div>
            <button
              onClick={() => setSuccessRef(null)}
              className="text-xs text-emerald-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tabs: My Tickets vs Create Ticket */}
        <div className="flex border-b border-slate-800 space-x-4">
          <button
            onClick={() => setActiveTab('my_tickets')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center space-x-2 ${
              activeTab === 'my_tickets'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>
              {currentRole === 'admin' ? 'All Active Support Tickets' : 'My Support Tickets'} (
              {visibleTickets.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('new_ticket')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center space-x-2 ${
              activeTab === 'new_ticket'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open New Dispute / Ticket</span>
          </button>
        </div>

        {/* TAB 1: MY TICKETS */}
        {activeTab === 'my_tickets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-1 space-y-3">
              {visibleTickets.length === 0 ? (
                <div className="glass-card p-8 rounded-2xl text-center space-y-2 border border-white/5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-60" />
                  <div className="text-sm font-bold text-white">No Open Tickets</div>
                  <p className="text-xs text-slate-400">
                    You have no active dispute or support tickets.
                  </p>
                </div>
              ) : (
                visibleTickets.map((ticket) => {
                  const badge = getStatusBadge(ticket.status);
                  const isSelected = selectedTicketId === ticket.id;

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer text-xs space-y-2 ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/30'
                          : 'bg-slate-900/60 hover:bg-slate-900 border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-pink-400 font-bold">
                          {ticket.ticketRef}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div className="font-semibold text-white truncate text-sm">
                        {ticket.subject}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="capitalize">{ticket.category}</span>
                        <span>{formatDateOnly(ticket.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Ticket Conversation View */}
            <div className="lg:col-span-2">
              {selectedTicket ? (
                <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
                  {/* Ticket Header */}
                  <div className="border-b border-white/10 pb-4 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-mono text-xs text-pink-400 font-bold">
                        {selectedTicket.ticketRef}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            getStatusBadge(selectedTicket.status).color
                          }`}
                        >
                          {getStatusBadge(selectedTicket.status).label}
                        </span>
                        <span className="text-xs text-slate-400">
                          Category: <strong className="text-white capitalize">{selectedTicket.category}</strong>
                        </span>
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
                    <div className="text-xs text-slate-400">
                      Logged by <strong className="text-slate-200">{selectedTicket.userName}</strong> on{' '}
                      {formatDateOnly(selectedTicket.createdAt)}
                    </div>
                  </div>

                  {/* Initial Query */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Initial Request / Incident Description
                    </div>
                    <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                      {selectedTicket.message}
                    </p>
                  </div>

                  {/* Replies Thread */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Investigation & Staff Replies ({selectedTicket.replies.length})
                    </div>

                    {selectedTicket.replies.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-900/40 text-center text-xs text-slate-400 border border-dashed border-slate-800">
                        A support specialist has been assigned and is reviewing your documentation. Expect a reply within 2-4 hours.
                      </div>
                    ) : (
                      selectedTicket.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`p-4 rounded-xl text-xs space-y-1.5 border ${
                            reply.isStaff
                              ? 'bg-purple-950/30 border-purple-500/30 text-purple-100 ml-4'
                              : 'bg-slate-900/60 border-slate-800 text-slate-200 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-white flex items-center gap-1.5">
                              {reply.isStaff && (
                                <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded text-[10px] font-bold border border-purple-400/30">
                                  STAFF
                                </span>
                              )}
                              <span>{reply.senderName}</span>
                            </span>
                            <span className="text-slate-400">{formatDateOnly(reply.createdAt)}</span>
                          </div>
                          <p className="leading-relaxed">{reply.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reply Input Form */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Add Reply or Additional Evidence:
                    </label>
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply, provide transaction UTR, or update the dispute notes..."
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSendReply(selectedTicket.id)}
                        disabled={!replyText.trim()}
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Response</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center text-slate-400 border border-white/5 space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-slate-600" />
                  <div className="text-sm font-semibold text-white">Select a Ticket to View Details</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Choose any support request from the left list to review responses, dispute status, or add additional evidence.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: OPEN NEW TICKET */}
        {activeTab === 'new_ticket' && (
          <div className="max-w-2xl mx-auto glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <form onSubmit={handleCreateTicket} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Submit a Support Request or Dispute</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Our Indian compliance team inspects all reports under strict privacy standards.
                </p>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Issue Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="booking">Booking Dispute or Companion Cancellation</option>
                  <option value="payment">Payment Failure / UTR / Commission Question</option>
                  <option value="refund">Section 10 Refund or Replacement Credit Request</option>
                  <option value="verification">Adult Age & Government ID Verification Issue</option>
                  <option value="safety">Safety, Code of Conduct & Harassment Complaint</option>
                  <option value="technical">Website Navigation or Account Access Issue</option>
                </select>
              </div>

              {/* Linked Booking Optional */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Related Booking Reference (Optional)
                </label>
                <select
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="">-- No specific booking reference --</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.bookingRef}>
                      {b.bookingRef} • {b.companionDisplayName} ({b.cityName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Subject / Summary *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Companion did not arrive at venue / Need refund to UPI"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Detailed Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Detailed Explanation & Evidence *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe what happened, times, venue location, or transaction details..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('my_tickets')}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-pink-500/20 disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Logging Ticket...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
