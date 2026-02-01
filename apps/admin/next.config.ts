import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@createconomy/ui', '@createconomy/convex'],
  experimental: {
    typedRoutes: true,
  },
  // Admin dashboard should not be indexed by search engines
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
