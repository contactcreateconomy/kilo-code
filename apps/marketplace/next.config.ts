import type { NextConfig } from "next";
import { getMarketplaceCsp } from "@createconomy/config/csp/marketplace";
import { buildCsp, baseSecurityHeaders } from "@createconomy/config/security-headers";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Transpile monorepo packages
  transpilePackages: ["@createconomy/ui", "@createconomy/convex", "@createconomy/config"],

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.stripe.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compression
  compress: true,

  // Power by header removal for security
  poweredByHeader: false,

  // Generate ETags for caching
  generateEtags: true,

  // Security headers
  async headers() {
    const cspDirectives = getMarketplaceCsp(isDev);
    const cspHeader = buildCsp(cspDirectives);

    return [
      {
        source: "/:path*",
        headers: [
          ...baseSecurityHeaders,
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
      // Cache static assets
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache images
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      // Cache fonts
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Createconomy",
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || "https://createconomy.com",
  },

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Optimize package imports
    optimizePackageImports: [
      "@createconomy/ui",
      "lucide-react",
      "@radix-ui/react-icons",
    ],
  },

  // Webpack configuration for bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Enable tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
      };
    }

    return config;
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Rewrites for API proxying if needed
  async rewrites() {
    return [];
  },
};

export default nextConfig;
