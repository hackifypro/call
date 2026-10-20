'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { usePlatformStore } from '@/lib/store';
import { FileCheck, ShieldCheck, CheckCircle2, XCircle, AlertCircle, Eye, Star, MapPin } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function AdminProfilesQueuePage() {
  const { companions, approveCompanion, rejectCompanionProfile } = usePlatformStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [rejectReason, setRejectReason] = useState('Blurry ID document or incomplete legal verification.');
  const [activeCompanionId, setActiveCompanionId] = useState<string | null>(null);

  const filtered = companions.filter((c) => {
    if (filter === 'pending') return c.status === 'pending_approval';
    if (filter === 'approved') return c.status === 'approved';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FileCheck className="w-6 h-6 text-pink-400" />
            <span>Companion Verification Queue</span>
          </h1>
          <p className="text-xs text-slate-400">
            Audit private government identity proofs, age certification, and profile photographs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {(['all', 'pending', 'approved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filter === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((comp) => (
          <div
            key={comp.id}
            className="glass-card rounded-2xl p-5 border border-white/10 hover:border-pink-500/30 transition space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-slate-700">
                  <Image
                    src={comp.primaryPhotoUrl}
                    alt={comp.displayName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span>{comp.displayName}</span>
                    <span className="text-xs text-slate-400">({comp.age}y)</span>
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-pink-400" />
                    <span>{comp.cityName}, {comp.stateName}</span>
                  </div>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      comp.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : comp.status === 'pending_approval'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {comp.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Private Verification Box */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Legal Name (Private):</span>
                  <strong className="text-white font-mono">{comp.legalNamePrivate || comp.displayName}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ID Document:</span>
                  <span className="text-purple-300 font-mono">Aadhaar (Masked)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Hourly Rate:</span>
                  <span className="text-emerald-400 font-mono font-bold">{formatINR(comp.hourlyRate)}/hr</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {comp.bio}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
              {comp.status !== 'approved' && (
                <button
                  onClick={() => approveCompanion(comp.id)}
                  className="flex-1 flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-3 rounded-xl text-xs shadow-md shadow-emerald-500/20 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve</span>
                </button>
              )}

              {comp.status !== 'rejected' && (
                <button
                  onClick={() => rejectCompanionProfile(comp.id, rejectReason)}
                  className="flex-1 flex items-center justify-center space-x-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold py-2 px-3 rounded-xl text-xs border border-rose-500/30 transition"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
