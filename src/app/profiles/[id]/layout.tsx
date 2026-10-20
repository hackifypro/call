import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://call-boy-4ef22.web.app';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Verified Adult Companion Profile (${params.id})`,
    description: `View verified adult companion profile details, approved public gallery photos, verified reviews, and reservation rates on Aura India.`,
    alternates: {
      canonical: `${siteUrl}/profiles/${params.id}`,
    },
    openGraph: {
      title: `Verified Adult Companion Profile | Aura India`,
      description: `100% ID-verified companion profile on Aura India.`,
      url: `${siteUrl}/profiles/${params.id}`,
      siteName: 'Aura India',
      locale: 'en_IN',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Verified Adult Companion Profile | Aura India`,
      description: `View ID-verified adult companion profile on Aura India.`,
    },
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
