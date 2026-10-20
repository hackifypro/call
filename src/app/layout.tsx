import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { PlatformStoreProvider } from '@/lib/store';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://call-boy-4ef22.web.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Aura India — Verified Adult Companions & Social Escort Marketplace',
    template: '%s | Aura India',
  },
  description:
    'India’s premier 100% ID-verified adult companion booking platform across Mumbai, Delhi NCR, Bengaluru, Pune, Hyderabad, Goa, Kolkata, Chennai, and tier-1 metros. Legal 18+ adult companionship, private dinner dates, social event escorts with transparent 10% platform fee and guaranteed privacy.',
  keywords: [
    'call boy',
    'call boy india',
    'male companions india',
    'female companion service',
    'verified adult companions mumbai',
    'delhi escorts companions',
    'bengaluru companion booking',
    'pune companions',
    'hyderabad companions',
    'goa companion service',
    'kolkata companions',
    'verified adult companionship',
    'social event companion india',
    'dinner date companion',
    'vip companion booking',
    '100% verified escorts india',
    'safe companion marketplace',
    'aura india',
    'private companion booking app',
  ],
  authors: [{ name: 'Aura India Platform Governance' }],
  creator: 'Aura India',
  publisher: 'Aura India Trust & Safety',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Aura India — 100% ID-Verified Adult Companionship & Escort Platform',
    description:
      'India’s trusted marketplace for verified adult companionship, dining accompaniment, social galas, and private bookings across 50+ major cities with transparent 10% commission.',
    url: siteUrl,
    siteName: 'Aura India',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200&h=630',
        width: 1200,
        height: 630,
        alt: 'Aura India Verified Companionship Platform',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aura India — Verified Adult Companions & Social Escort Marketplace',
    description:
      'India’s premier 100% ID-verified adult companion booking platform across Mumbai, Delhi NCR, Bengaluru, Pune, and major metros.',
    images: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200&h=630'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Lifestyle',
};

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Aura India',
    url: siteUrl,
    description: 'India’s premier verified adult companion and social escort marketplace.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-1800-209-2872',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Aura India',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/explore?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white`}
      >
        <AuthProvider>
          <PlatformStoreProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </PlatformStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
