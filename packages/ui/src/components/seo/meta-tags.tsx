/**
 * Meta Tags Component
 *
 * Comprehensive meta tag management for SEO optimization.
 * Supports Open Graph, Twitter Cards, and standard meta tags.
 */

import type { Metadata } from "next";

// ============================================================================
// Types
// ============================================================================

export interface OpenGraphImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

export interface OpenGraphMeta {
  title?: string;
  description?: string;
  url?: string;
  siteName?: string;
  images?: OpenGraphImage[];
  locale?: string;
  type?: "website" | "article" | "product" | "profile";
}

export interface TwitterMeta {
  card?: "summary" | "summary_large_image" | "app" | "player";
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
}

export interface ArticleMeta {
  publishedTime?: string;
  modifiedTime?: string;
  expirationTime?: string;
  author?: string | string[];
  section?: string;
  tags?: string[];
}

export interface ProductMeta {
  price?: {
    amount: number;
    currency: string;
  };
  availability?: "in stock" | "out of stock" | "preorder";
  condition?: "new" | "refurbished" | "used";
  retailerItemId?: string;
}

export interface MetaTagsConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  robots?: {
    index?: boolean;
    follow?: boolean;
    noarchive?: boolean;
    nosnippet?: boolean;
    noimageindex?: boolean;
    nocache?: boolean;
  };
  openGraph?: OpenGraphMeta;
  twitter?: TwitterMeta;
  article?: ArticleMeta;
  product?: ProductMeta;
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
  };
  verification?: {
    google?: string;
    yandex?: string;
    bing?: string;
    yahoo?: string;
  };
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_SITE_NAME = "Createconomy";
const DEFAULT_LOCALE = "en_US";
const DEFAULT_TWITTER_CARD = "summary_large_image";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build robots meta content string
 */
function buildRobotsContent(
  robots: MetaTagsConfig["robots"]
): string | undefined {
  if (!robots) return undefined;

  const directives: string[] = [];

  if (robots.index === false) {
    directives.push("noindex");
  } else {
    directives.push("index");
  }

  if (robots.follow === false) {
    directives.push("nofollow");
  } else {
    directives.push("follow");
  }

  if (robots.noarchive) directives.push("noarchive");
  if (robots.nosnippet) directives.push("nosnippet");
  if (robots.noimageindex) directives.push("noimageindex");
  if (robots.nocache) directives.push("nocache");

  return directives.join(", ");
}

/**
 * Generate Next.js Metadata object from config
 */
export function generateMetadata(config: MetaTagsConfig): Metadata {
  const {
    title,
    description,
    keywords,
    canonical,
    robots,
    openGraph,
    twitter,
    article,
    alternates,
    verification,
  } = config;

  const metadata: Metadata = {
    title,
    description,
    ...(keywords && { keywords: keywords.join(", ") }),
  };

  // Robots
  if (robots) {
    metadata.robots = {
      index: robots.index !== false,
      follow: robots.follow !== false,
      ...(robots.noarchive && { noarchive: true }),
      ...(robots.nosnippet && { nosnippet: true }),
      ...(robots.noimageindex && { noimageindex: true }),
      ...(robots.nocache && { nocache: true }),
    };
  }

  // Open Graph
  if (openGraph) {
    const ogType = openGraph.type === "product" ? "website" : (openGraph.type || "website");
    metadata.openGraph = {
      title: openGraph.title || title,
      description: openGraph.description || description,
      url: openGraph.url || canonical,
      siteName: openGraph.siteName || DEFAULT_SITE_NAME,
      locale: openGraph.locale || DEFAULT_LOCALE,
      type: ogType,
      ...(openGraph.images && {
        images: openGraph.images.map((img) => ({
          url: img.url,
          width: img.width,
          height: img.height,
          alt: img.alt,
          type: img.type,
        })),
      }),
    };
  }

  // Twitter
  if (twitter) {
    metadata.twitter = {
      card: twitter.card || DEFAULT_TWITTER_CARD,
      title: twitter.title || title,
      description: twitter.description || description,
      ...(twitter.site && { site: twitter.site }),
      ...(twitter.creator && { creator: twitter.creator }),
      ...(twitter.image && {
        images: [
          {
            url: twitter.image,
            alt: twitter.imageAlt,
          },
        ],
      }),
    };
  }

  // Alternates
  if (alternates || canonical) {
    metadata.alternates = {
      ...(canonical && { canonical }),
      ...(alternates?.languages && { languages: alternates.languages }),
    };
  }

  // Verification
  if (verification) {
    metadata.verification = {
      ...(verification.google && { google: verification.google }),
      ...(verification.yandex && { yandex: verification.yandex }),
      ...((verification.bing || verification.yahoo) && {
        other: {
          ...(verification.bing && { "msvalidate.01": verification.bing }),
          ...(verification.yahoo && { "y_key": verification.yahoo }),
        },
      }),
    };
  }

  return metadata;
}

// ============================================================================
// Page-Specific Metadata Generators
// ============================================================================

/**
 * Generate metadata for product pages
 */
export function generateProductMetadata(
  product: {
    name: string;
    description: string;
    price: number;
    currency: string;
    image?: string;
    category?: string;
    seller?: string;
    slug: string;
  },
  baseUrl: string
): Metadata {
  const url = `${baseUrl}/products/${product.slug}`;

  return generateMetadata({
    title: `${product.name} | ${DEFAULT_SITE_NAME}`,
    description: product.description,
    canonical: url,
    keywords: [
      product.name,
      product.category || "digital product",
      "marketplace",
      "download",
    ].filter(Boolean) as string[],
    openGraph: {
      title: product.name,
      description: product.description,
      url,
      type: "product",
      images: product.image
        ? [
            {
              url: product.image,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      image: product.image,
    },
    product: {
      price: {
        amount: product.price,
        currency: product.currency,
      },
      availability: "in stock",
      condition: "new",
    },
  });
}

/**
 * Generate metadata for category pages
 */
export function generateCategoryMetadata(
  category: {
    name: string;
    description?: string;
    slug: string;
    productCount?: number;
  },
  baseUrl: string
): Metadata {
  const url = `${baseUrl}/categories/${category.slug}`;
  const description =
    category.description ||
    `Browse ${category.productCount || ""} ${category.name} products on ${DEFAULT_SITE_NAME}`;

  return generateMetadata({
    title: `${category.name} | ${DEFAULT_SITE_NAME}`,
    description,
    canonical: url,
    keywords: [category.name, "digital products", "marketplace"],
    openGraph: {
      title: category.name,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: category.name,
      description,
    },
  });
}

/**
 * Generate metadata for user profile pages
 */
export function generateProfileMetadata(
  user: {
    name: string;
    username: string;
    bio?: string;
    avatar?: string;
    productCount?: number;
  },
  baseUrl: string
): Metadata {
  const url = `${baseUrl}/sellers/${user.username}`;
  const description =
    user.bio ||
    `${user.name} on ${DEFAULT_SITE_NAME}. ${user.productCount || 0} products available.`;

  return generateMetadata({
    title: `${user.name} (@${user.username}) | ${DEFAULT_SITE_NAME}`,
    description,
    canonical: url,
    openGraph: {
      title: user.name,
      description,
      url,
      type: "profile",
      images: user.avatar
        ? [
            {
              url: user.avatar,
              width: 400,
              height: 400,
              alt: user.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary",
      title: user.name,
      description,
      image: user.avatar,
    },
  });
}

/**
 * Generate metadata for article/blog pages
 */
export function generateArticleMetadata(
  article: {
    title: string;
    description: string;
    slug: string;
    image?: string;
    author: string;
    publishedAt: string;
    updatedAt?: string;
    tags?: string[];
    section?: string;
  },
  baseUrl: string
): Metadata {
  const url = `${baseUrl}/blog/${article.slug}`;

  return generateMetadata({
    title: `${article.title} | ${DEFAULT_SITE_NAME} Blog`,
    description: article.description,
    canonical: url,
    keywords: article.tags,
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: "article",
      images: article.image
        ? [
            {
              url: article.image,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      image: article.image,
    },
    article: {
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      author: article.author,
      section: article.section,
      tags: article.tags,
    },
  });
}

/**
 * Generate metadata for forum thread pages
 */
export function generateThreadMetadata(
  thread: {
    title: string;
    content: string;
    slug: string;
    author: string;
    category: string;
    createdAt: string;
    replyCount?: number;
  },
  baseUrl: string
): Metadata {
  const url = `${baseUrl}/t/${thread.slug}`;
  const description =
    thread.content.slice(0, 160) + (thread.content.length > 160 ? "..." : "");

  return generateMetadata({
    title: `${thread.title} | ${DEFAULT_SITE_NAME} Forum`,
    description,
    canonical: url,
    keywords: [thread.category, "forum", "discussion"],
    openGraph: {
      title: thread.title,
      description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: thread.title,
      description,
    },
    article: {
      publishedTime: thread.createdAt,
      author: thread.author,
      section: thread.category,
    },
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate canonical URL
 */
export function getCanonicalUrl(path: string, baseUrl: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, "")}${cleanPath}`;
}

/**
 * Generate alternate language URLs
 */
export function getAlternateLanguages(
  path: string,
  baseUrl: string,
  languages: string[]
): Record<string, string> {
  return languages.reduce(
    (acc, lang) => {
      acc[lang] = `${baseUrl}/${lang}${path}`;
      return acc;
    },
    {} as Record<string, string>
  );
}

/**
 * Truncate description to optimal length
 */
export function truncateDescription(
  text: string,
  maxLength: number = 160
): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(" ");

  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

/**
 * Generate image dimensions for Open Graph
 */
export function getOgImageDimensions(
  type: "landscape" | "square" | "portrait" = "landscape"
): { width: number; height: number } {
  const dimensions = {
    landscape: { width: 1200, height: 630 },
    square: { width: 1200, height: 1200 },
    portrait: { width: 630, height: 1200 },
  };

  return dimensions[type];
}

// ============================================================================
// Default Metadata Templates
// ============================================================================

/**
 * Default metadata for the marketplace app
 */
export const marketplaceDefaultMetadata: Metadata = {
  title: {
    default: "Createconomy - Digital Marketplace for Creators",
    template: "%s | Createconomy",
  },
  description:
    "Discover and sell digital products, templates, and creative assets on Createconomy - the marketplace built for creators.",
  keywords: [
    "digital marketplace",
    "templates",
    "digital products",
    "creative assets",
    "creators",
  ],
  authors: [{ name: "Createconomy" }],
  creator: "Createconomy",
  publisher: "Createconomy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env["NEXT_PUBLIC_APP_URL"] || "https://createconomy.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Createconomy",
  },
  twitter: {
    card: "summary_large_image",
    site: "@createconomy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/**
 * Default metadata for the forum app
 */
export const forumDefaultMetadata: Metadata = {
  title: {
    default: "Createconomy Forum - Community Discussions",
    template: "%s | Createconomy Forum",
  },
  description:
    "Join the Createconomy community. Discuss digital products, share tips, and connect with fellow creators.",
  keywords: ["forum", "community", "creators", "discussions", "digital products"],
  authors: [{ name: "Createconomy" }],
  creator: "Createconomy",
  publisher: "Createconomy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Createconomy Forum",
  },
  twitter: {
    card: "summary",
    site: "@createconomy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Default metadata for the admin app (noindex)
 */
export const adminDefaultMetadata: Metadata = {
  title: {
    default: "Admin Dashboard | Createconomy",
    template: "%s | Admin - Createconomy",
  },
  description: "Createconomy administration dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Default metadata for the seller app
 */
export const sellerDefaultMetadata: Metadata = {
  title: {
    default: "Seller Dashboard | Createconomy",
    template: "%s | Seller - Createconomy",
  },
  description:
    "Manage your digital products, track sales, and grow your business on Createconomy.",
  robots: {
    index: false,
    follow: false,
  },
};
