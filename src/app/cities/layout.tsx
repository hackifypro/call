import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://call-boy-4ef22.web.app';

export const metadata: Metadata = {
  title: 'All India Cities & Metros Directory — Verified Companions',
  description:
    'Browse verified adult companions, social escorts, and dinner date partners across Mumbai, Delhi NCR, Bangalore, Pune, Hyderabad, Kolkata, Chennai, Goa, and 50+ Indian cities.',
  keywords: [
    'cities directory companions',
    'mumbai companions',
    'delhi escorts',
    'bangalore companions',
    'pune companions',
    'hyderabad companions',
    'call boy india cities',
    'verified companions directory',
  ],
  alternates: {
    canonical: `${siteUrl}/cities`,
  },
  openGraph: {
    title: 'All India Cities & Metros Directory | Aura India',
    description:
      'Explore verified adult companions and escorts across 50+ Indian cities. 100% ID-verified profiles, transparent pricing, and instant bookings.',
    url: `${siteUrl}/cities`,
    siteName: 'Aura India',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All India Cities Directory — Verified Companions | Aura India',
    description: 'Find verified companions in your city across 50+ major Indian metros.',
  },
};

export default function CitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
