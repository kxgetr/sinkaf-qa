import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

import { generateWebSiteSchema, generateSoftwareApplicationSchema } from '../lib/seo/jsonld';
import { seoConfig } from '../config/seo';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: seoConfig.defaultTitle,
  description: seoConfig.defaultDescription,
  metadataBase: new URL(seoConfig.siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    url: seoConfig.siteUrl,
    siteName: seoConfig.siteName,
    images: [
      {
        url: seoConfig.defaultOgImage,
        width: 1200,
        height: 630,
      }
    ],
    locale: 'tr_TR',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.className} bg-[#050505] text-gray-200 min-h-screen`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebSiteSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSoftwareApplicationSchema()) }}
        />
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
