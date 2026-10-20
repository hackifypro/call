'use client';

import React from 'react';
import CompanionDashboard from '@/app/companion/dashboard/page';

export default function CompanionLegacyDashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading companion portal...</span>
          </div>
        </div>
      }
    >
      <CompanionDashboard />
    </React.Suspense>
  );
}
