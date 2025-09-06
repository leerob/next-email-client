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
        destination: '/auth/signin',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
