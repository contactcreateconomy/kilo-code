"use client";

import { SellerLayout } from "@/components/layout/seller-layout";
import { SellerGuard } from "@/components/auth/seller-guard";
import { ProductForm } from "@/components/products/product-form";

interface ProductEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = await params;
  
  // Mock product data - in real app, fetch from Convex
  const product = {
    id,
    name: "Handcrafted Wooden Bowl",
    description: "Beautiful handcrafted wooden bowl made from sustainable oak.",
    price: 45.99,
    compareAtPrice: 59.99,
    stock: 12,
    sku: "WB-001",
    category: "home-decor",
    status: "active" as const,
    images: ["/placeholder-product.jpg"],
    tags: ["handmade", "wood", "sustainable"],
    weight: 0.5,
    dimensions: { length: 20, width: 20, height: 8 },
  };

  return (
    <SellerGuard>
      <SellerLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Edit Product</h1>
              <p className="text-[var(--muted-foreground)]">
                Update your product details
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href={`/products/${id}/images`}
                className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                Manage Images
              </a>
              <a
                href="/products"
                className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                Cancel
              </a>
            </div>
          </div>

          {/* Product Form */}
          <ProductForm product={product} mode="edit" />
        </div>
      </SellerLayout>
    </SellerGuard>
  );
}
