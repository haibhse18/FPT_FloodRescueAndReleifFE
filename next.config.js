/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: '/api/openmap/:path*',
        destination: 'https://mapapis.openmap.vn/v1/:path*'
      }
    ];
  }
};

module.exports = nextConfig
