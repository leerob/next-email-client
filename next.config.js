/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects() {
    return [
      {
        source: '/',
        destination: '/f/inbox',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
