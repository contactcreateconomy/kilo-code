import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@createconomy/ui', '@createconomy/convex'],
  // Typed routes (moved from experimental in Next.js 16)
  typedRoutes: true,
  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
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
