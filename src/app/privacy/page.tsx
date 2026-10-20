import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Privacy Policy & Confidentiality</h1>
        <p className="text-xs text-slate-400 mt-1">Data Protection and Confidentiality under Digital Personal Data Protection Act (DPDP Act, India)</p>
      </div>

      <div className="space-y-6 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-8 rounded-2xl border border-white/5">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Protection of Private Legal Names & ID Documents</h2>
          <p>
            Your legal name, masked Aadhaar/Passport numbers, and verification documents are stored securely in encrypted storage. They are never published on search engines, indexed by crawlers, or exposed to clients. Only your chosen public display name is visible.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Phone Number and Contact Confidentiality</h2>
          <p>
            Client and companion phone numbers remain private until a booking is accepted and confirmed by both parties. Direct contact details are shared exclusively for meetup logistics.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Right to Erasure & Account Deletion</h2>
          <p>
            You may request complete account deletion and profile purging at any time through your dashboard or by emailing privacy@companion-marketplace.in.
          </p>
        </section>
      </div>
    </div>
  );
}
