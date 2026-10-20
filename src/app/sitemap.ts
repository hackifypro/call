import { MetadataRoute } from 'next';
import { INDIAN_CITIES } from '@/lib/geoData';
import { INITIAL_COMPANIONS } from '@/lib/mockData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://call-boy-4ef22.web.app';

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/safety`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register-companion`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // Dynamic City Landing Pages (Only actively served or indexed cities)
  const cityRoutes: MetadataRoute.Sitemap = INDIAN_CITIES.filter((c) => c.isServed).map((city) => ({
    url: `${baseUrl}/cities/${city.stateSlug}/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // Dynamic Approved Companion Public Profile Pages
  const profileRoutes: MetadataRoute.Sitemap = INITIAL_COMPANIONS.filter(
    (c) => c.status === 'approved'
  ).map((companion) => ({
    url: `${baseUrl}/profiles/${companion.id}`,
    lastModified: new Date(companion.updatedAt || new Date()),
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  return [...staticRoutes, ...cityRoutes, ...profileRoutes];
}
