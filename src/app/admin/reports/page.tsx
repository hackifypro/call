'use client';

import React, { useState, useEffect } from 'react';
import { Flag, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, XCircle, Search } from 'lucide-react';
import { formatDateOnly } from '@/lib/utils';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports');
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to fetch dispute reports.');
        setLoading(false);
        return;
      }
      setReports(json.reports || []);
      setLoading(false);
    } catch {
      setError('Connection to dispute resolution service failed.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedReport) return;
    setUpdating(true);

    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedReport.id,
          status,
          resolutionNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedReport(null);
        setResolutionNotes('');
        setUpdating(false);
        fetchReports();
      }
    } catch {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading dispute reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Flag className="w-6 h-6 text-rose-400" />
            <span>Reports & Dispute Resolution</span>
          </h1>
          <p className="text-xs text-slate-400">
            Trust & Safety incident investigations, harassment complaints, and member violations.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="inline-flex items-center space-x-1.5 text-xs bg-slate-900 text-slate-200 border border-slate-800 px-3 py-2 rounded-xl"
        >
          <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="glass-card rounded-2xl p-5 border border-white/10 hover:border-pink-500/30 transition space-y-3 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-pink-400">{rep.id}</span>
                <span className="text-sm font-bold text-white">Reason: {rep.reason}</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase self-start sm:self-auto ${
                  rep.status === 'resolved'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : rep.status === 'investigated'
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {rep.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-slate-300">
              <div>
                <span className="text-slate-500 block">Reporter:</span>
                <strong className="text-white">{rep.reporterName}</strong> ({rep.reporterId})
              </div>
              <div>
                <span className="text-slate-500 block">Reported Member:</span>
                <strong className="text-pink-300">{rep.reportedDisplayName}</strong> ({rep.reportedProfileId})
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Incident Description:</strong> {rep.details}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-500 text-[11px]">{formatDateOnly(rep.createdAt)}</span>
              <button
                onClick={() => setSelectedReport(rep)}
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-semibold text-xs border border-purple-500/40 transition"
              >
                Resolve Dispute →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resolution Dialog */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-purple-500/40 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Dispute Resolution: {selectedReport.id}</h3>
            <p className="text-xs text-slate-300">
              Select action for report regarding <strong className="text-pink-400">{selectedReport.reportedDisplayName}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Investigation & Audit Notes</label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter actions taken (e.g. Warning issued, Refund processed, Account suspended)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus('dismissed')}
                disabled={updating}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs text-white font-semibold"
              >
                Dismiss Report
              </button>
              <button
                onClick={() => handleUpdateStatus('investigated')}
                disabled={updating}
                className="px-3 py-1.5 rounded-xl bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold"
              >
                Mark Investigated
              </button>
              <button
                onClick={() => handleUpdateStatus('resolved')}
                disabled={updating}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold shadow-md"
              >
                {updating ? 'Saving...' : 'Resolve & Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
