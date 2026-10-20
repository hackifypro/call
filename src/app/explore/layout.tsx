import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://call-boy-4ef22.web.app';

export const metadata: Metadata = {
  title: 'Explore Verified Adult Companions & Social Escorts',
  description:
    'Discover ID-verified adult companions across India with interactive discovery, filter by city, pricing, language, and interests. 100% verified genuine profiles.',
  keywords: [
    'explore companions',
    'find companions india',
    'verified call boy',
    'mumbai companions search',
    'delhi companion explore',
    'social event companion',
    'dinner date booking',
  ],
  alternates: {
    canonical: `${siteUrl}/explore`,
  },
  openGraph: {
    title: 'Explore Verified Adult Companions | Aura India',
    description:
      'Search and discover ID-verified adult companions and social escorts across major Indian cities.',
    url: `${siteUrl}/explore`,
    siteName: 'Aura India',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Verified Adult Companions | Aura India',
    description: 'Browse verified companions in major Indian cities with complete privacy.',
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
