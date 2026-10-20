'use client';

import React from 'react';
import { usePlatformStore } from '@/lib/store';
import { Sliders, CheckCircle2, ShieldCheck, Sparkles, MessageSquare, AlertTriangle, CreditCard } from 'lucide-react';

export default function AdminFeaturesPage() {
  const { featureSettings, updateFeatureSettings } = usePlatformStore();

  const toggle = (key: keyof typeof featureSettings) => {
    updateFeatureSettings({ [key]: !featureSettings[key] });
  };

  const flags = [
    {
      key: 'enableSwipeDeck' as const,
      label: 'Tinder-Style Swipe Deck',
      desc: 'Enables gesture-based interactive companion browsing on customer discovery.',
      icon: Sparkles,
      active: featureSettings.enableSwipeDeck,
    },
    {
      key: 'enableInstantChat' as const,
      label: 'In-App Secure Messaging',
      desc: 'Permits authenticated clients and verified companions to chat before meetups.',
      icon: MessageSquare,
      active: featureSettings.enableInstantChat,
    },
    {
      key: 'enableRazorpayLive' as const,
      label: 'Live Payment Gateway (Razorpay/UPI)',
      desc: 'Routes booking payments through active banking rail escrow vs sandbox test mode.',
      icon: CreditCard,
      active: featureSettings.enableRazorpayLive,
    },
    {
      key: 'enableSosEmergency' as const,
      label: '24/7 Companion SOS Panic Button',
      desc: 'Equips companions with rapid-dispatch location alerts and safety check-ins.',
      icon: AlertTriangle,
      active: featureSettings.enableSosEmergency,
    },
    {
      key: 'enableReplacementCredits' as const,
      label: 'Section 11 Replacement Booking Credits',
      desc: 'Enables automatic credit issuance on eligible customer cancellations.',
      icon: ShieldCheck,
      active: featureSettings.enableReplacementCredits,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Sliders className="w-6 h-6 text-pink-400" />
          <span>Platform Feature Flags</span>
        </h1>
        <p className="text-xs text-slate-400">
          Control operational modules, safety switches, and payment mechanisms across India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {flags.map((flag) => {
          const Icon = flag.icon;
          return (
            <div
              key={flag.key}
              className="glass-card rounded-2xl p-5 border border-white/10 flex items-start justify-between gap-4 shadow-xl"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{flag.label}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{flag.desc}</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    flag.active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {flag.active ? 'ACTIVE & ENABLED' : 'DISABLED'}
                </span>
              </div>

              <button
                onClick={() => toggle(flag.key)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  flag.active ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    flag.active ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
