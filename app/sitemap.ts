import { MetadataRoute } from 'next';
import { seoConfig } from '../config/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${seoConfig.siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${seoConfig.siteUrl}/karsilastir/sinkaf-qa-vs-testinium`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${seoConfig.siteUrl}/karsilastir/sinkaf-qa-vs-rabbitqa`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${seoConfig.siteUrl}/alternatifler/testinium-alternatifi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${seoConfig.siteUrl}/alternatifler/rabbitqa-alternatifi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }
  ];
}
