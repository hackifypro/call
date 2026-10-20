'use client';

import React from 'react';
import { usePlatformStore } from '@/lib/store';
import { Lock, ShieldCheck, Key, AlertTriangle, FileText } from 'lucide-react';
import { formatDateOnly } from '@/lib/utils';

export default function AdminSecurityPage() {
  const { auditLogs } = usePlatformStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Lock className="w-6 h-6 text-pink-400" />
          <span>Security & Operator Audit Trail</span>
        </h1>
        <p className="text-xs text-slate-400">
          Cryptographically audited records of every administrator action, approval, and financial override.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-slate-400">Authentication Protocol</span>
          <div className="text-base font-bold text-white">Bcrypt + Edge JWT (HS256)</div>
          <span className="text-[10px] text-emerald-400 font-mono">10 Salt Rounds • 7-Day Revocable</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-slate-400">Cookie Security Policy</span>
          <div className="text-base font-bold text-white">HTTP-Only • Secure • SameSite=Lax</div>
          <span className="text-[10px] text-purple-300 font-mono">No JavaScript exposure</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-slate-400">Middleware Protection</span>
          <div className="text-base font-bold text-white">Server-Enforced RBAC</div>
          <span className="text-[10px] text-emerald-400 font-mono">Zero unauthenticated data leakage</span>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl p-5 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <FileText className="w-4 h-4 text-pink-400" />
          <span>Operator Action Logs ({auditLogs.length} Events)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Staff Operator</th>
                <th className="py-2.5 px-3 font-semibold">Action</th>
                <th className="py-2.5 px-3 font-semibold">Target Entity</th>
                <th className="py-2.5 px-3 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-2.5 px-3 text-slate-400 font-mono">
                    {formatDateOnly(log.timestamp)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {log.adminName || log.adminEmail}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-mono">
                    {log.targetType}: {log.targetId}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
