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

export const metadata: Metadata = {
  title: 'Elite Companions India | Verified Adult Companion Marketplace',
  description:
    'India’s premier verified adult companion booking marketplace across Mumbai, Delhi NCR, Bengaluru, Pune, Hyderabad, and major metros. 100% ID-verified, transparent 10% platform fee, and instant secure bookings.',
  keywords: [
    'Companion booking marketplace',
    'India companion service',
    'Mumbai companions',
    'Delhi companions',
    'Bengaluru companions',
    'Verified adult companionship',
    'Social event companions',
    'Dinner date companion India',
  ],
  authors: [{ name: 'Companion Marketplace India' }],
  metadataBase: new URL('https://companion-marketplace.in'),
  openGraph: {
    title: 'Elite Companions India | 100% ID-Verified Adult Companionship',
    description:
      'India’s trusted marketplace for verified adult companionship, dining accompaniment, social galas, and cultural tours with 10% auditable commission.',
    url: 'https://companion-marketplace.in',
    siteName: 'Elite Companions India',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200',
        width: 1200,
        height: 630,
        alt: 'Elite Companions India',
      },
    ],
    locale: 'en_IN',
    type: 'website',
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
  return (
    <html lang="en" className="dark scroll-smooth">
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
