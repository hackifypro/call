import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Terms of Service & Marketplace Rules</h1>
        <p className="text-xs text-slate-400 mt-1">Last Updated: October 2026 • Governing Indian Law</p>
      </div>

      <div className="space-y-6 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-8 rounded-2xl border border-white/5">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Eligibility and 18+ Adult Status</h2>
          <p>
            You must be at least 18 years of age to access, register, or transact on this platform. Misrepresentation of age or using forged identity documents is a criminal violation under applicable Indian penal law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Marketplace Role & Scope of Services</h2>
          <p>
            Elite Companions India operates exclusively as a digital platform facilitating social accompaniment, fine dining companionship, event accompaniment, and cultural tour guides. The platform expressly prohibits illegal solicitations or non-consensual activities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Platform Commission & Payment Processing</h2>
          <p>
            The platform deducts a standard 10% platform commission from gross booking fees to cover server infrastructure, adult ID verification APIs, payment gateway fees, and safety moderation. All prices are displayed in Indian Rupees (INR ₹).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">4. Cancellation and Refund Policy (Section 10)</h2>
          <p>
            If a companion rejects an inquiry or an accepted booking cannot be completed due to unforeseen circumstances, the client is entitled to either a 100% refund to the original payment source or an instant replacement credit.
          </p>
        </section>
      </div>
    </div>
  );
}
