'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Send, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatDateOnly } from '@/lib/utils';

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tickets');
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to fetch support tickets.');
        setLoading(false);
        return;
      }
      setTickets(json.tickets || []);
      setLoading(false);
    } catch {
      setError('Connection to support ticket service failed.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async () => {
    if (!activeTicket || !replyMessage.trim()) return;
    setSending(true);

    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: activeTicket.id,
          replyMessage: replyMessage.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReplyMessage('');
        setSending(false);
        setActiveTicket(null);
        fetchTickets();
      }
    } catch {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading support tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 text-purple-400" />
            <span>Customer Support Ticket Centre</span>
          </h1>
          <p className="text-xs text-slate-400">
            Handle inquiries from customers and verified companions regarding bookings, KYC, and technical assistance.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="inline-flex items-center space-x-1.5 text-xs bg-slate-900 text-slate-200 border border-slate-800 px-3 py-2 rounded-xl"
        >
          <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="glass-card rounded-2xl p-5 border border-white/10 hover:border-pink-500/30 transition flex flex-col justify-between space-y-3 shadow-xl"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-pink-400">#{t.ticketRef}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    t.status === 'resolved'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : t.status === 'in_progress'
                      ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {t.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{t.subject}</h3>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                {t.message}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>From: <strong className="text-white">{t.userName}</strong> ({t.userRole})</span>
                <span className="font-mono">{t.category}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">{formatDateOnly(t.createdAt)}</span>
              <button
                onClick={() => setActiveTicket(t)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-xs transition"
              >
                Respond ({t.replies?.length || 0}) →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Response Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-purple-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Ticket #{activeTicket.ticketRef}: {activeTicket.subject}</h3>
              <button onClick={() => setActiveTicket(null)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl text-xs space-y-1 border border-slate-800">
              <span className="text-slate-400 block font-semibold">{activeTicket.userName} ({activeTicket.userRole}):</span>
              <p className="text-white">{activeTicket.message}</p>
            </div>

            {/* Conversation Replies History */}
            {activeTicket.replies?.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {activeTicket.replies.map((r: any) => (
                  <div
                    key={r.id}
                    className={`p-2.5 rounded-xl text-xs ${
                      r.isStaff ? 'bg-purple-950/40 border border-purple-500/30 text-purple-200' : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    <span className="font-bold text-[10px] block text-pink-300">{r.senderName}</span>
                    <p className="mt-0.5">{r.message}</p>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reply to User</label>
              <textarea
                rows={3}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your official support response..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setActiveTicket(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={sending || !replyMessage.trim()}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold shadow-md disabled:opacity-50"
              >
                <span>{sending ? 'Sending...' : 'Send Reply'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
