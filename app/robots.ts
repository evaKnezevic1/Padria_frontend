import { MetadataRoute } from 'next';

function getBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/$/, '');

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  return 'http://localhost:3000';
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/listings',
          '/listing/',
          '/about',
          '/contact',
          '/en',
          '/en/listings',
          '/en/listing/',
          '/en/about',
          '/en/contact',
        ],
        disallow: ['/admin/', '/test'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
