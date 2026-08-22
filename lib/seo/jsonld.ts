import { seoConfig } from "../../config/seo";

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": seoConfig.siteName,
    "url": seoConfig.siteUrl,
    "inLanguage": "tr-TR"
  };
}

export function generateSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": seoConfig.siteName,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "url": seoConfig.siteUrl,
    "description": seoConfig.defaultDescription,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };
}
