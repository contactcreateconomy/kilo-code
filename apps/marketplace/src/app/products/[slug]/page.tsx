import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@createconomy/ui";
import { Card, CardContent } from "@createconomy/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@createconomy/ui/components/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@createconomy/ui/components/breadcrumb";
import { Badge } from "@createconomy/ui/components/badge";
import { Avatar, AvatarFallback } from "@createconomy/ui/components/avatar";
import type { Product } from "@/types";
import { Star, Heart, ShoppingBag, FileText, MessageSquare, Info } from "lucide-react";

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
      tags: ["responsive", "dark-mode", "nextjs", "tailwind"],
      features: [
        "Fully responsive design",
        "Dark mode support",
        "SEO optimized",
        "Multiple page layouts",
        "Comprehensive documentation",
      ],
      specifications: {
        "File Format": "Next.js Project",
        "Compatible Browsers": "Chrome, Firefox, Safari, Edge",
        Framework: "Next.js 14, React 19",
        Styling: "Tailwind CSS 4",
        License: "Standard License",
      },
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

  const sellerInitials = product.seller.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <ProductJsonLd product={product} />
      <div className="container py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/products">Products</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
              {/* Category Badge */}
              <Badge variant="secondary" className="mb-3">
                <Link href={`/categories/${product.category.slug}`}>
                  {product.category.name}
                </Link>
              </Badge>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {product.name}
              </h1>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
                <span className="text-muted-foreground">
                  <ShoppingBag className="mr-1 inline h-4 w-4" />
                  {product.salesCount.toLocaleString()} sales
                </span>
              </div>
            </div>

            <div className="text-4xl font-bold">${product.price.toFixed(2)}</div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

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
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Seller Info */}
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm font-medium">
                    {sellerInitials}
                  </AvatarFallback>
                </Avatar>
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

        {/* Tabs Section */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description" className="gap-2">
                <FileText className="h-4 w-4" />
                Description
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Reviews ({product.reviewCount})
              </TabsTrigger>
              <TabsTrigger value="details" className="gap-2">
                <Info className="h-4 w-4" />
                Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>

                  {/* Features list */}
                  {product.features && product.features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="mb-3 text-lg font-semibold">Features</h3>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-muted-foreground"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{product.rating}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.reviewCount} reviews
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Reviews will be displayed here when available.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {product.specifications &&
                  Object.keys(product.specifications).length > 0 ? (
                    <dl className="space-y-4">
                      {Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-start justify-between border-b pb-3 last:border-0"
                          >
                            <dt className="font-medium">{key}</dt>
                            <dd className="text-muted-foreground">{value}</dd>
                          </div>
                        )
                      )}
                    </dl>
                  ) : (
                    <p className="text-muted-foreground">
                      No additional details available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
