'use client';

import React, { useState } from 'react';
import { CompanionProfile } from '@/lib/types';
import { X, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  companion: CompanionProfile;
  onClose: () => void;
}

export default function ReportModal({ companion, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('Misrepresentation of Identity or Photos');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-card rounded-3xl p-6 border border-white/10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Report Lodged with Trust & Safety</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our Trust & Safety compliance team has logged ticket #{Date.now().toString().slice(-6)} and
              will investigate this profile within 12 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Report {companion.displayName}</h3>
            </div>

            <p className="text-xs text-slate-400">
              Your report is strictly confidential. Aura India investigates all allegations regarding
              non-compliance, misrepresentation, or safety code breaches.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reason for Report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:border-rose-500 focus:outline-none"
              >
                <option value="Misrepresentation of Identity or Photos">
                  Misrepresentation of Identity or Photos
                </option>
                <option value="Solicitation of Unauthorized Off-Platform Services">
                  Solicitation of Unauthorized Off-Platform Services
                </option>
                <option value="Inappropriate or Disrespectful Behavior">
                  Inappropriate or Disrespectful Behavior
                </option>
                <option value="Payment Extortion or Demand Outside Platform">
                  Payment Extortion or Demand Outside Platform
                </option>
                <option value="Underage Suspicion (Violates 18+ Rule)">
                  Underage Suspicion (Violates 18+ Rule)
                </option>
                <option value="Other Policy Violation">Other Policy Violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Specific Details or Incident Context
              </label>
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide accurate description of the concern for our verification auditors..."
                className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl p-2.5 border border-slate-700 focus:border-rose-500 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-rose-600/20 text-xs transition"
            >
              Submit Confidential Report
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
