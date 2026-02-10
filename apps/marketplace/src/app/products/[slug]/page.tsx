import type { Metadata } from "next";
import { use } from "react";
import { convexClient, api } from "@/lib/convex";
import { ProductDetailContent } from "@/components/products/product-detail-content";
import { centsToDollars } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await convexClient.query(
      api.functions.products.getProductBySlug,
      { slug }
    );

    if (!product) {
      return {
        title: "Product Not Found",
      };
    }

    const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
    const imageUrls = product.images.map((img) => img.url);
    const priceDisplay = `$${centsToDollars(product.price).toFixed(2)}`;

    return {
      title: product.name,
      description: product.shortDescription ?? product.description.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.shortDescription ?? product.description.slice(0, 160),
        images: primaryImage ? [primaryImage.url] : imageUrls,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} — ${priceDisplay}`,
        description: product.shortDescription ?? product.description.slice(0, 160),
        images: primaryImage ? [primaryImage.url] : imageUrls,
      },
    };
  } catch {
    return {
      title: "Product",
    };
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);

  return <ProductDetailContent slug={slug} />;
}
