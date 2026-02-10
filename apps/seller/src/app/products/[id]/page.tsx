"use client";

import { use } from "react";
import Link from "next/link";
import { SellerLayout } from "@/components/layout/seller-layout";
import { SellerGuard } from "@/components/auth/seller-guard";
import { ProductForm, type ProductFormData } from "@/components/products/product-form";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

function centsToDollars(cents: number): number {
  return cents / 100;
}

function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

interface ProductEditPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const product = useQuery(api.functions.products.getProduct, {
    productId: id as Id<"products">,
  });
  const updateProduct = useMutation(api.functions.products.updateProduct);

  if (product === undefined) {
    return (
      <SellerGuard>
        <SellerLayout>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </SellerLayout>
      </SellerGuard>
    );
  }

  if (product === null) {
    return (
      <SellerGuard>
        <SellerLayout>
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold">Product not found</h2>
            <p className="text-muted-foreground mt-2">
              This product may have been deleted.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block text-primary hover:underline"
            >
              ← Back to products
            </Link>
          </div>
        </SellerLayout>
      </SellerGuard>
    );
  }

  const handleSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      await updateProduct({
        productId: id as Id<"products">,
        name: data.name,
        description: data.description,
        price: dollarsToCents(parseFloat(data.price) || 0),
        compareAtPrice: data.comparePrice
          ? dollarsToCents(parseFloat(data.comparePrice))
          : undefined,
        sku: data.sku || undefined,
        inventory: data.stock,
        status: data.status as "draft" | "active" | "archived",
      });
      router.push("/products");
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setSaving(false);
    }
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
              <Link
                href={`/products/${id}/images`}
                className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                Manage Images
              </Link>
              <Link
                href="/products"
                className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>

          {/* Product Form */}
          <ProductForm
            mode="edit"
            product={{
              id: product._id,
              name: product.name,
              description: product.description,
              price: centsToDollars(product.price),
              compareAtPrice: product.compareAtPrice
                ? centsToDollars(product.compareAtPrice)
                : undefined,
              stock: product.inventory ?? 0,
              sku: product.sku ?? "",
              category: product.category?.slug ?? "",
              status: product.status,
              images: product.images?.map((img) => img.url),
              tags: product.tags,
            }}
            onSubmit={handleSubmit}
            isLoading={saving}
          />
        </div>
      </SellerLayout>
    </SellerGuard>
  );
}
