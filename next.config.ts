import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    dynamicIO: true,
    serverSourceMaps: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/f/inbox',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
