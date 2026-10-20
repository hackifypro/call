import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://call-boy-4ef22.web.app';

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
