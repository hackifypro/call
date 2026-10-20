import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://aura-india.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/explore', '/cities/*', '/profiles/*', '/how-it-works', '/safety', '/register-companion'],
        disallow: [
          '/dashboard/*',
          '/admin/*',
          '/messages/*',
          '/support/*',
          '/api/*',
          '/_next/*',
          '/private/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
