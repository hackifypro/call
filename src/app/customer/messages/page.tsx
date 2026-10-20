'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  Shield,
  MapPin,
  Calendar,
  AlertTriangle,
  Flag,
  Ban,
  CheckCircle2,
  Clock,
  Info,
} from 'lucide-react';
import { ChatConversation, ChatMessage } from '@/lib/types';
import { formatDateOnly } from '@/lib/utils';

export default function CustomerMessagesPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    try {
      const res = await fetch('/api/customer/messages');
      if (res.ok) {
        const json = await res.json();
        setConversations(json.conversations || []);
        setActiveBookings(json.activeBookings || []);
        if (json.conversations?.length > 0 && !activeConvId) {
          setActiveConvId(json.conversations[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);
    try {
      const res = await fetch('/api/customer/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeConversation.bookingId,
          message: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage('');
        await loadMessages();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>Booking Communications</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            End-to-End Private
          </span>
        </h1>
        <p className="text-sm text-slate-400">
          Direct messaging is permitted with companions for confirmed appointments to coordinate meeting points.
        </p>
      </div>

      {/* Safety Notice Box */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#0e1024] to-pink-950/30 border border-purple-500/20 flex items-start space-x-3 text-xs text-slate-300">
        <Shield className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Platform Communication & Safety Rules:</span> Never send off-platform payments (cash/direct transfers) or share sensitive financial details. All booking payments are protected under our platform escrow.
        </div>
      </div>

      {/* Chat Layout: Conversations Left, Thread Right */}
      <div className="rounded-3xl bg-[#0e1024] border border-white/10 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[560px]">
        {/* Left Conversations List */}
        <div className="border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-white text-sm">Active Conversations</h3>
            <span className="text-xs text-slate-400">{conversations.length} booking chat(s)</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {loading ? (
              <div className="p-4 text-xs text-slate-500">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No active messages.</p>
                <p className="text-[11px] text-slate-500">
                  Direct chats unlock once your booking is confirmed with an approved companion.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full p-4 text-left flex items-start space-x-3 transition-colors ${
                      isSelected ? 'bg-purple-600/10 border-l-4 border-purple-500' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-slate-900 shrink-0">
                      {conv.companionPhotoUrl ? (
                        <Image src={conv.companionPhotoUrl} alt={conv.companionDisplayName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-white bg-purple-900">
                          {conv.companionDisplayName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-white text-xs truncate">{conv.companionDisplayName}</p>
                        <span className="text-[10px] text-slate-500">
                          {conv.lastMessageAt ? formatDateOnly(conv.lastMessageAt) : ''}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-purple-300 block">{conv.bookingRef}</span>
                      <p className="text-xs text-slate-400 truncate">{conv.lastMessage || 'No messages yet'}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Message Thread */}
        <div className="md:col-span-2 flex flex-col justify-between bg-[#0a0b1c]/80">
          {activeConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0e1024]">
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-slate-900 shrink-0">
                    {activeConversation.companionPhotoUrl ? (
                      <Image
                        src={activeConversation.companionPhotoUrl}
                        alt={activeConversation.companionDisplayName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-white bg-purple-900">
                        {activeConversation.companionDisplayName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{activeConversation.companionDisplayName}</h3>
                    <div className="flex items-center space-x-2 text-[10px]">
                      <span className="font-mono text-purple-300">{activeConversation.bookingRef}</span>
                      <span className="text-emerald-400 font-semibold">• Escrow Active</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/customer/bookings?ref=${activeConversation.bookingRef}`}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10"
                  >
                    Itinerary
                  </Link>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3">
                {activeConversation.messages.map((msg) => {
                  const isMe = msg.senderRole === 'customer';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-1 px-1">
                        <span>{msg.senderName}</span>
                        <span>•</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-md px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-none shadow-md'
                            : 'bg-[#151730] border border-white/10 text-slate-200 rounded-tl-none shadow-md'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-[#0e1024] flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a respectful message to coordinate your arrival..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 text-white font-bold text-xs disabled:opacity-40 flex items-center space-x-1.5 shadow-md shadow-purple-900/30"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-600" />
              <h3 className="font-bold text-white text-base">Select a Conversation</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Pick a companion from the list to view your confirmed meeting coordinates and chat history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
