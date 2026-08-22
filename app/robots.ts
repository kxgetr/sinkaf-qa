import { MetadataRoute } from 'next';
import { seoConfig } from '../config/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/docs', '/karsilastir', '/alternatifler', '/blog'],
      disallow: ['/runs', '/api', '/admin', '/security', '/artifacts'],
    },
    sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
  };
}
