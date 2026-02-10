"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductCard } from "@/components/products/product-card";
import { Button, Skeleton } from "@createconomy/ui";
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
import { Star, Heart, ShoppingBag, FileText, MessageSquare, Info } from "lucide-react";
import { ReviewStats, ReviewForm, ReviewList } from "@/components/reviews";
import { mapConvexProductDetail, mapConvexProductListItem } from "@/lib/convex-mappers";
import { formatPrice } from "@/lib/utils";
import type { Id } from "@createconomy/convex/dataModel";

interface ProductDetailContentProps {
  slug: string;
}

function ProductDetailSkeleton() {
  return (
    <div className="container py-8">
      <Skeleton className="mb-6 h-5 w-64" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="aspect-[4/3] rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="aspect-square rounded-lg" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailContent({ slug }: ProductDetailContentProps) {
  // Step 1: Get product by slug (returns product + images)
  const productBySlug = useQuery(api.functions.products.getProductBySlug, { slug });

  // Step 2: Get full product details (seller, category) using the product ID
  const productDetail = useQuery(
    api.functions.products.getProduct,
    productBySlug?._id
      ? { productId: productBySlug._id as Id<"products"> }
      : "skip"
  );

  // Step 3: Get related products from same category
  const relatedResult = useQuery(
    api.functions.products.listProducts,
    productDetail?.category?.id
      ? {
          categoryId: productDetail.category.id as Id<"productCategories">,
          status: "active" as const,
          limit: 4,
          includeDetails: true,
        }
      : "skip"
  );

  // Step 4: Increment view count on mount
  const incrementView = useMutation(api.functions.products.incrementViewCount);
  useEffect(() => {
    if (productBySlug?._id) {
      incrementView({ productId: productBySlug._id as Id<"products"> });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productBySlug?._id]);

  // Loading state
  if (productBySlug === undefined || (productBySlug && productDetail === undefined)) {
    return <ProductDetailSkeleton />;
  }

  // Not found
  if (productBySlug === null) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  // Map to our Product type
  const product = productDetail
    ? mapConvexProductDetail(productDetail)
    : null;

  if (!product) {
    return <ProductDetailSkeleton />;
  }

  // Related products (exclude current product)
  const relatedProducts = (relatedResult?.items ?? [])
    .filter((p) => p._id !== productBySlug._id)
    .slice(0, 4)
    .map(mapConvexProductListItem);

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
              {product.category.slug && (
                <Badge variant="secondary" className="mb-3">
                  <Link href={`/categories/${product.category.slug}`}>
                    {product.category.name}
                  </Link>
                </Badge>
              )}

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

            <div className="text-4xl font-bold">
              {formatPrice(product.price)}
            </div>

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
                <CardContent className="space-y-8 p-6">
                  <ReviewStats productId={product.id} />
                  <ReviewForm productId={product.id} />
                  <ReviewList productId={product.id} />
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

function ProductJsonLd({
  product,
}: {
  product: {
    name: string;
    description: string;
    images: string[];
    price: number;
    rating: number;
    reviewCount: number;
  };
}) {
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
    aggregateRating: product.reviewCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
