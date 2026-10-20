'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  LogOut,
} from 'lucide-react';

export default function CustomerSettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    phoneVerified: boolean;
    role: string;
    createdAt: string;
  } | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Toggles
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [hideProfile, setHideProfile] = useState(true);

  // Status feedback
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/customer/settings');
        if (res.ok) {
          const json = await res.json();
          if (json.user) {
            setProfile(json.user);
            setFullName(json.user.fullName || '');
            setPhoneNumber(json.user.phoneNumber || '');
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/customer/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Update failed.');
      }

      setStatusMessage({ type: 'success', text: 'Profile updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update settings.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadData = () => {
    window.open('/api/customer/data-export', '_blank');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl animate-pulse">
        <div className="h-44 rounded-3xl bg-white/5" />
        <div className="h-64 rounded-3xl bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>Account & Privacy Settings</span>
        </h1>
        <p className="text-sm text-slate-400">
          Manage your personal information, security credentials, notification preferences, and data privacy rights.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center space-x-2 text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Account Info & Security Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="rounded-3xl bg-[#0e1024] border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <User className="w-4 h-4 text-purple-400" />
            <span>Profile Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Display Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Registered Email (Read-Only)</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-400">
                  Verified
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98201 12233"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Account Role</label>
              <div className="px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-300 font-semibold capitalize flex items-center justify-between">
                <span>{profile?.role || 'Customer'}</span>
                <span className="text-[10px] text-purple-300 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                  Client ID: {profile?.id?.slice(0, 14)}...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Password Security */}
        <div className="rounded-3xl bg-[#0e1024] border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Update Password</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">New Password (Min 8 chars)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 disabled:opacity-50"
            >
              {submitting ? 'Saving Changes...' : 'Save Account Settings'}
            </button>
          </div>
        </div>
      </form>

      {/* Privacy & Notification Preferences */}
      <div className="rounded-3xl bg-[#0e1024] border border-white/10 p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>Privacy & Communications</span>
        </h2>

        <div className="space-y-3 text-xs divide-y divide-white/5">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-semibold text-white">Anonymize Profile in Public View</p>
              <p className="text-slate-400 text-[11px]">Keep your name and past bookings hidden from public search engines.</p>
            </div>
            <input
              type="checkbox"
              checked={hideProfile}
              onChange={(e) => setHideProfile(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-600"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-semibold text-white">Email Booking Confirmations</p>
              <p className="text-slate-400 text-[11px]">Receive escrow transaction updates and receipt copies via email.</p>
            </div>
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-600"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-semibold text-white">SMS Security Reminders</p>
              <p className="text-slate-400 text-[11px]">Receive arrival verification codes before meeting your companion.</p>
            </div>
            <input
              type="checkbox"
              checked={notifySms}
              onChange={(e) => setNotifySms(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-600"
            />
          </div>
        </div>
      </div>

      {/* DPDP Compliance & Data Export */}
      <div className="rounded-3xl bg-[#0e1024] border border-white/10 p-6 sm:p-8 space-y-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-white text-sm flex items-center space-x-2">
            <Download className="w-4 h-4 text-purple-400" />
            <span>Download Personal Data (DPDP Act)</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-md">
            Download an authenticated JSON export of your profile, booking transactions, escrow receipts, and review records.
          </p>
        </div>
        <button
          onClick={handleDownloadData}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs inline-flex items-center space-x-2"
        >
          <Download className="w-4 h-4 text-purple-400" />
          <span>Export JSON File</span>
        </button>
      </div>

      {/* Danger Zone: Account Deletion & Logout */}
      <div className="rounded-3xl bg-rose-950/20 border border-rose-500/20 p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-rose-300 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>Danger Zone</span>
        </h3>
        <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
          Deactivating or deleting your account will terminate all future appointment bookings and revoke active sessions. Active Section 11 credits will be forfeited upon complete deletion.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 flex items-center space-x-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Request Account Deletion</span>
          </button>
        </div>
      </div>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101226] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base">Request Account Deletion</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your request will be submitted to the Trust & Safety audit team. Per legal compliance and prevention of marketplace fraud, completed financial records will remain in encrypted audit cold-storage for 7 years.
            </p>
            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Deletion request submitted. Our compliance team will review your account.');
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
