/**
 * Structured Data Components
 *
 * JSON-LD structured data components for SEO optimization.
 * Implements Schema.org vocabulary for rich search results.
 */

import type { ReactNode } from "react";

// ============================================================================
// Types
// ============================================================================

export interface ProductSchema {
  name: string;
  description: string;
  image: string | string[];
  sku?: string;
  brand?: {
    name: string;
  };
  offers: {
    price: number;
    priceCurrency: string;
    availability: "InStock" | "OutOfStock" | "PreOrder" | "Discontinued";
    url?: string;
    seller?: {
      name: string;
    };
    priceValidUntil?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  review?: ReviewSchema[];
  category?: string;
}

export interface ReviewSchema {
  author: {
    name: string;
  };
  datePublished: string;
  reviewBody: string;
  reviewRating: {
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: {
    telephone?: string;
    contactType: string;
    email?: string;
    areaServed?: string | string[];
    availableLanguage?: string | string[];
  };
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ArticleSchema {
  headline: string;
  description: string;
  image: string | string[];
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo?: string;
  };
}

export interface WebPageSchema {
  name: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}

export interface LocalBusinessSchema {
  name: string;
  description?: string;
  url: string;
  telephone?: string;
  email?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  priceRange?: string;
  image?: string | string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Render JSON-LD script tag
 */
function JsonLd({ data }: { data: object }): ReactNode {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Get availability URL from status
 */
function getAvailabilityUrl(
  availability: ProductSchema["offers"]["availability"]
): string {
  const urls: Record<string, string> = {
    InStock: "https://schema.org/InStock",
    OutOfStock: "https://schema.org/OutOfStock",
    PreOrder: "https://schema.org/PreOrder",
    Discontinued: "https://schema.org/Discontinued",
  };
  return urls[availability] ?? urls["InStock"] ?? "";
}

// ============================================================================
// Product Schema Component
// ============================================================================

export interface ProductStructuredDataProps {
  product: ProductSchema;
}

/**
 * Product Structured Data
 *
 * @example
 * ```tsx
 * <ProductStructuredData
 *   product={{
 *     name: "Premium Template",
 *     description: "A beautiful website template",
 *     image: ["https://example.com/image.jpg"],
 *     offers: {
 *       price: 49.99,
 *       priceCurrency: "USD",
 *       availability: "InStock",
 *     },
 *     aggregateRating: {
 *       ratingValue: 4.8,
 *       reviewCount: 125,
 *     },
 *   }}
 * />
 * ```
 */
export function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    ...(product.sku && { sku: product.sku }),
    ...(product.brand && {
      brand: {
        "@type": "Brand",
        name: product.brand.name,
      },
    }),
    ...(product.category && { category: product.category }),
    offers: {
      "@type": "Offer",
      price: product.offers.price,
      priceCurrency: product.offers.priceCurrency,
      availability: getAvailabilityUrl(product.offers.availability),
      ...(product.offers.url && { url: product.offers.url }),
      ...(product.offers.seller && {
        seller: {
          "@type": "Organization",
          name: product.offers.seller.name,
        },
      }),
      ...(product.offers.priceValidUntil && {
        priceValidUntil: product.offers.priceValidUntil,
      }),
    },
    ...(product.aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.aggregateRating.ratingValue,
        reviewCount: product.aggregateRating.reviewCount,
        bestRating: product.aggregateRating.bestRating || 5,
        worstRating: product.aggregateRating.worstRating || 1,
      },
    }),
    ...(product.review &&
      product.review.length > 0 && {
        review: product.review.map((review) => ({
          "@type": "Review",
          author: {
            "@type": "Person",
            name: review.author.name,
          },
          datePublished: review.datePublished,
          reviewBody: review.reviewBody,
          reviewRating: {
            "@type": "Rating",
            ratingValue: review.reviewRating.ratingValue,
            bestRating: review.reviewRating.bestRating || 5,
            worstRating: review.reviewRating.worstRating || 1,
          },
        })),
      }),
  };

  return <JsonLd data={data} />;
}

// ============================================================================
// Organization Schema Component
// ============================================================================

export interface OrganizationStructuredDataProps {
  organization: OrganizationSchema;
}

/**
 * Organization Structured Data
 *
 * @example
 * ```tsx
 * <OrganizationStructuredData
 *   organization={{
 *     name: "Createconomy",
 *     url: "https://createconomy.com",
 *     logo: "https://createconomy.com/logo.png",
 *     sameAs: [
 *       "https://twitter.com/createconomy",
 *       "https://github.com/createconomy",
 *     ],
 *   }}
 * />
 * ```
 */
export function OrganizationStructuredData({
  organization,
}: OrganizationStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: organization.name,
    url: organization.url,
    ...(organization.logo && { logo: organization.logo }),
    ...(organization.description && { description: organization.description }),
    ...(organization.sameAs && { sameAs: organization.sameAs }),
    ...(organization.contactPoint && {
      contactPoint: {
        "@type": "ContactPoint",
        ...organization.contactPoint,
      },
    }),
    ...(organization.address && {
      address: {
        "@type": "PostalAddress",
        ...organization.address,
      },
    }),
  };

  return <JsonLd data={data} />;
}

// ============================================================================
// Breadcrumb Schema Component
// ============================================================================

export interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb Structured Data
 *
 * @example
 * ```tsx
 * <BreadcrumbStructuredData
 *   items={[
 *     { name: "Home", url: "https://example.com" },
 *     { name: "Products", url: "https://example.com/products" },
 *     { name: "Templates", url: "https://example.com/products/templates" },
 *   ]}
 * />
 * ```
 */
export function BreadcrumbStructuredData({
  items,
}: BreadcrumbStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={data} />;
}

// ============================================================================
// FAQ Schema Component
// ============================================================================

export interface FaqStructuredDataProps {
  items: FaqItem[];
}

/**
 * FAQ Structured Data
 *
 * @example
 * ```tsx
 * <FaqStructuredData
 *   items={[
 *     {
 *       question: "What is Createconomy?",
 *       answer: "Createconomy is a digital marketplace for creators.",
 *     },
 *     {
 *       question: "How do I sell on Createconomy?",
 *       answer: "Sign up as a seller and list your digital products.",
 *     },
 *   ]}
 * />
 * ```
 */
export function FaqStructuredData({ items }: FaqStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}

// ============================================================================
// Review Schema Component
// ============================================================================

export interface ReviewStructuredDataProps {
  review: ReviewSchema;
  itemReviewed: {
    type: "Product" | "Organization" | "LocalBusiness";
    name: string;
  };
}

/**
 * Review Structured Data
 *
 * @example
 * ```tsx
 * <ReviewStructuredData
 *   review={{
 *     author: { name: "John Doe" },
 *     datePublished: "2024-01-15",
 *     reviewBody: "Great product!",
 *     reviewRating: { ratingValue: 5 },
 *   }}
 *   itemReviewed={{ type: "Product", name: "Premium Template" }}
 * />
 * ```
 */
export function ReviewStructuredData({
  review,
  itemReviewed,
}: ReviewStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.author.name,
    },
    datePublished: review.datePublished,
    reviewBody: review.reviewBody,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.reviewRating.ratingValue,
      bestRating: review.reviewRating.bestRating || 5,
      worstRating: review.reviewRating.worstRating || 1,
    },
    itemReviewed: {
      "@type": itemReviewed.type,
      name: itemReviewed.name,
    },
  };

  return <JsonLd data={data} />;
}

// ============================================================================
// Article Schema Component
// ============================================================================

export interface ArticleStructuredDataProps {
  article: ArticleSchema;
}

/**
 * Article Structured Data
 *
 * @example
 * ```tsx
 * <ArticleStructuredData
 *   article={{
 *     headline: "How to Build a Successful Digital Product",
 *     description: "Learn the secrets of creating digital products that sell.",
 *     image: "https://example.com/article-image.jpg",
 *     datePublished: "2024-01-15",
 *     author: { name: "Jane Smith" },
 *     publisher: { name: "Createconomy", logo: "https://example.com/logo.png" },
 *   }}
 * />
 * ```
 */
export function ArticleStructuredData({ article }: ArticleStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    ...(article.dateModified && { dateModified: article.dateModified }),
    author: {
      "@type": "Person",
      name: article.author.name,
      ...(article.author.url && { url: article.author.url }),
    },
    publisher: {
      "@type": "Organization",
      name: article.publisher.name,
      ...(article.publisher.logo && {
        logo: {
          "@type": "ImageObject",
          url: article.publisher.logo,
        },
      }),
    },
  };

  return <JsonLd data={data} />;
}

// ============================================================================
// WebPage Schema Component
// ============================================================================

export interface WebPageStructuredDataProps {
  page: WebPageSchema;
}

/**
 * WebPage Structured Data
 */
export function WebPageStructuredData({ page }: WebPageStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.name,
    description: page.description,
    url: page.url,
    ...(page.image && { image: page.image }),
    ...(page.datePublished && { datePublished: page.datePublished }),
    ...(page.dateModified && { dateModified: page.dateModified }),
  };

  return <JsonLd data={data} />;
}

// ============================================================================
// WebSite Schema Component
// ============================================================================

export interface WebSiteStructuredDataProps {
  name: string;
  url: string;
  description?: string;
  searchUrl?: string;
}

/**
 * WebSite Structured Data with Search Action
 *
 * @example
 * ```tsx
 * <WebSiteStructuredData
 *   name="Createconomy"
 *   url="https://createconomy.com"
 *   description="Digital marketplace for creators"
 *   searchUrl="https://createconomy.com/search?q={search_term_string}"
 * />
 * ```
 */
export function WebSiteStructuredData({
  name,
  url,
  description,
  searchUrl,
}: WebSiteStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    ...(description && { description }),
    ...(searchUrl && {
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: searchUrl,
        },
        "query-input": "required name=search_term_string",
      },
    }),
  };

  return <JsonLd data={data} />;
}

// ============================================================================
// Local Business Schema Component
// ============================================================================

export interface LocalBusinessStructuredDataProps {
  business: LocalBusinessSchema;
}

/**
 * Local Business Structured Data
 */
export function LocalBusinessStructuredData({
  business,
}: LocalBusinessStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    url: business.url,
    ...(business.description && { description: business.description }),
    ...(business.telephone && { telephone: business.telephone }),
    ...(business.email && { email: business.email }),
    address: {
      "@type": "PostalAddress",
      ...business.address,
    },
    ...(business.geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: business.geo.latitude,
        longitude: business.geo.longitude,
      },
    }),
    ...(business.openingHours && { openingHours: business.openingHours }),
    ...(business.priceRange && { priceRange: business.priceRange }),
    ...(business.image && { image: business.image }),
  };

  return <JsonLd data={data} />;
}

// ============================================================================
// Exports
// ============================================================================

export { JsonLd };
