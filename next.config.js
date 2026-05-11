/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://padria-backend.onrender.com/api';
const apiHostname = new URL(apiUrl).hostname;
const apiProtocol = new URL(apiUrl).protocol.replace(':', '');
const apiPort = new URL(apiUrl).port;

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: apiProtocol,
        hostname: apiHostname,
        ...(apiPort ? { port: apiPort } : {}),
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://padriarealestate.hr/:path*',
        permanent: true,
      },
      {
        source: '/public/about',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/public/contact',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/public/listings',
        destination: '/listings',
        permanent: true,
      },
      {
        source: '/public/listing/:id',
        destination: '/listing/:id',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
