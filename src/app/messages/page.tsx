'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePlatformStore } from '@/lib/store';
import { ChatConversation, ChatMessage } from '@/lib/types';
import { formatDateOnly, formatDateTime } from '@/lib/utils';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  ShieldAlert,
  Lock,
  User,
  Info,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export default function MessagesPage() {
  const {
    currentUser,
    currentRole,
    conversations,
    messages,
    sendChatMessage,
    bookings,
  } = usePlatformStore();

  const [activeConvId, setActiveConvId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blockConfirmed, setBlockConfirmed] = useState(false);

  // Visible conversations for the current user (customer or companion)
  const visibleConversations = conversations.filter(
    (c) =>
      currentRole === 'admin' ||
      c.customerId === currentUser.id ||
      c.companionId === (currentRole === 'companion' ? 'comp-101' : '')
  );

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Messages in current thread
  const threadMessages = messages.filter((m) => m.conversationId === activeConvId);

  // Linked booking info
  const linkedBooking = bookings.find((b) => b.id === activeConv?.bookingId || b.bookingRef === activeConv?.bookingRef);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;
    sendChatMessage(activeConvId, inputText.trim());
    setInputText('');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-pink-400 uppercase tracking-wider mb-0.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Section 6 • End-to-End Private In-App Messaging</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Discreet In-App Conversations
            </h1>
            <p className="text-xs text-slate-400">
              Encrypted messaging strictly between authorized booking parties. Personal contact numbers remain masked until booking confirmation.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/safety"
              className="text-xs text-purple-300 hover:text-purple-200 border border-purple-500/30 px-3 py-1.5 rounded-lg bg-purple-950/30 flex items-center space-x-1.5 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Safety Rules</span>
            </Link>
          </div>
        </div>

        {/* Messaging Layout: Left Sidebar + Right Thread */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[640px] glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* LEFT: Conversation List */}
          <div className="md:col-span-1 border-r border-white/10 flex flex-col bg-slate-950/60">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-pink-400" />
                <span>Conversations ({visibleConversations.length})</span>
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2 space-y-1">
              {visibleConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No active conversations yet. Messages appear automatically when a booking inquiry is initiated.
                </div>
              ) : (
                visibleConversations.map((conv) => {
                  const isSelected = conv.id === activeConvId;
                  const otherPartyName =
                    currentRole === 'companion' ? conv.customerName : conv.companionName;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={`p-3 rounded-2xl cursor-pointer transition flex items-center space-x-3 ${
                        isSelected
                          ? 'bg-purple-950/50 border border-purple-500/40 shadow-md'
                          : 'hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border border-white/10 bg-slate-800">
                        {conv.companionPhoto ? (
                          <Image
                            src={conv.companionPhoto}
                            alt={otherPartyName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                            {otherPartyName[0]}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white truncate">
                            {otherPartyName}
                          </h4>
                          {conv.unreadCount > 0 && !isSelected && (
                            <span className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {conv.lastMessage || 'Booking inquiry initiated'}
                        </p>

                        {conv.bookingRef && (
                          <span className="inline-block text-[10px] text-purple-300 font-mono mt-1">
                            Ref: {conv.bookingRef}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Active Thread View */}
          <div className="md:col-span-2 flex flex-col bg-slate-900/40">
            {activeConv ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-purple-500/30">
                      {activeConv.companionPhoto ? (
                        <Image
                          src={activeConv.companionPhoto}
                          alt={activeConv.companionName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <User className="w-full h-full p-2 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>
                          {currentRole === 'companion'
                            ? activeConv.customerName
                            : activeConv.companionName}
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full">
                          Verified User
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Linked Booking:{' '}
                        <span className="text-pink-300 font-mono">{activeConv.bookingRef}</span>
                        {linkedBooking && (
                          <span className="ml-2 font-semibold text-emerald-400">
                            • Status: {linkedBooking.status.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Safety / Report Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setReportModalOpen(true)}
                      className="text-[11px] text-rose-400 hover:text-rose-300 border border-rose-500/30 bg-rose-950/30 px-2.5 py-1 rounded-lg transition"
                      title="Report message or abuse"
                    >
                      Report / Block
                    </button>
                  </div>
                </div>

                {/* Privacy Warning Banner */}
                <div className="px-4 py-2 bg-purple-950/30 border-b border-purple-500/20 text-[11px] text-purple-200 flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span>
                    Privacy Protected: Do not exchange raw bank details or unverified external links. All bookings must be completed within the escrow marketplace.
                  </span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {threadMessages.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <Sparkles className="w-8 h-8 text-pink-400 mx-auto opacity-50" />
                      <div className="text-xs font-semibold text-slate-300">
                        Say Hello to discuss dining details or gala schedule!
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Keep conversations respectful and compliant with platform safety guidelines.
                      </p>
                    </div>
                  ) : (
                    threadMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="text-[10px] text-slate-400 mb-1 px-1">
                            {msg.senderName} • {formatDateTime(msg.createdAt)}
                          </div>
                          <div
                            className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-tr-none'
                                : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'
                            }`}
                          >
                            {msg.messageText}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input Box */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-white/10 bg-slate-950/80 flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a secure message (e.g., confirming fine dining dress code, meetup venue)..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white p-2.5 rounded-xl disabled:opacity-40 transition shadow-md shadow-pink-500/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 space-y-2">
                <MessageSquare className="w-12 h-12 text-slate-700" />
                <div className="text-sm font-semibold text-white">Select a conversation</div>
                <p className="text-xs text-slate-500">
                  Select any active companion thread from the sidebar to start chatting.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Report / Block Modal */}
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-rose-500/40 space-y-4">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Report Inappropriate Conduct / Block User</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our moderation team reviews reported chat transcripts immediately. Blocking will prevent this user from messaging you or submitting new booking requests.
              </p>

              {blockConfirmed ? (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs text-center font-bold">
                  User conversation flagged and reported to Trust & Safety.
                </div>
              ) : (
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setBlockConfirmed(true);
                      setTimeout(() => {
                        setReportModalOpen(false);
                        setBlockConfirmed(false);
                      }, 1200);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                  >
                    Confirm Report & Block
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
