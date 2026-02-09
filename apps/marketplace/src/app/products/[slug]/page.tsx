import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductCard } from "@/components/products/product-card";
import { Button, Card, CardContent } from "@createconomy/ui";
import type { Product } from "@/types";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Mock function to get product - replace with Convex query
async function getProduct(slug: string): Promise<Product | null> {
  // This would be replaced with actual Convex query
  const products: Product[] = [
    {
      id: "1",
      slug: "premium-website-template",
      name: "Premium Website Template",
      description:
        "A beautiful, responsive website template built with modern technologies. Perfect for portfolios, agencies, and startups. Includes multiple page layouts, dark mode support, and comprehensive documentation.",
      price: 49.99,
      images: [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800",
      ],
      category: { id: "1", name: "Templates", slug: "templates" },
      seller: { id: "1", name: "Creative Studio", avatar: "" },
      rating: 4.9,
      reviewCount: 128,
      salesCount: 1250,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return products.find((p) => p.slug === slug) || null;
}

// Mock function to get related products
async function getRelatedProducts(
  categorySlug: string,
  excludeId: string
): Promise<Product[]> {
  return [
    {
      id: "2",
      slug: "landing-page-kit",
      name: "Landing Page Kit",
      description: "High-converting landing page templates",
      price: 39.99,
      images: [
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400",
      ],
      category: { id: "1", name: "Templates", slug: "templates" },
      seller: { id: "2", name: "Design Pro", avatar: "" },
      rating: 4.7,
      reviewCount: 89,
      salesCount: 890,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      slug: "dashboard-ui-kit",
      name: "Dashboard UI Kit",
      description: "Complete dashboard components",
      price: 59.99,
      images: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      ],
      category: { id: "1", name: "Templates", slug: "templates" },
      seller: { id: "3", name: "UI Masters", avatar: "" },
      rating: 4.8,
      reviewCount: 156,
      salesCount: 1100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: product.images,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.category.slug,
    product.id
  );

  return (
    <>
      <ProductJsonLd product={product} />
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              {product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1).map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Link
                href={`/categories/${product.category.slug}`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {product.category.name}
              </Link>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {product.name}
              </h1>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <StarIcon className="h-5 w-5 fill-warning text-warning" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {product.salesCount.toLocaleString()} sales
                </span>
              </div>
            </div>

            <div className="text-4xl font-bold">${product.price.toFixed(2)}</div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="flex items-center gap-4">
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                productPrice={product.price}
                productImage={product.images[0] ?? ""}
                productSlug={product.slug}
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <HeartIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* Seller Info */}
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div>
                  <p className="font-medium">{product.seller.name}</p>
                  <Link
                    href={`/sellers/${product.seller.id}`}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    View profile
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function ProductJsonLd({ product }: { product: Product }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
