"use client";

import { SellerLayout } from "@/components/layout/seller-layout";
import { SellerGuard } from "@/components/auth/seller-guard";
import { ImageUpload } from "@/components/products/image-upload";

interface ProductImagesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductImagesPage({ params }: ProductImagesPageProps) {
  const { id } = await params;
  
  // Mock images - in real app, fetch from Convex
  const images = [
    { id: "1", url: "/placeholder-product.jpg", alt: "Product image 1", isPrimary: true },
    { id: "2", url: "/placeholder-product.jpg", alt: "Product image 2", isPrimary: false },
    { id: "3", url: "/placeholder-product.jpg", alt: "Product image 3", isPrimary: false },
  ];

  return (
    <SellerGuard>
      <SellerLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Product Images</h1>
              <p className="text-[var(--muted-foreground)]">
                Manage images for your product
              </p>
            </div>
            <a
              href={`/products/${id}`}
              className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              ← Back to Product
            </a>
          </div>

          {/* Image Upload Component */}
          <div className="seller-card">
            <h2 className="text-lg font-semibold mb-4">Upload Images</h2>
            <ImageUpload productId={id} />
          </div>

          {/* Current Images */}
          <div className="seller-card">
            <h2 className="text-lg font-semibold mb-4">Current Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    image.isPrimary
                      ? "border-[var(--primary)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  {image.isPrimary && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs rounded">
                      Primary
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                    <div className="flex gap-2 justify-end">
                      {!image.isPrimary && (
                        <button className="p-1 bg-white/90 rounded text-xs hover:bg-white">
                          Set Primary
                        </button>
                      )}
                      <button className="p-1 bg-destructive text-white rounded text-xs hover:bg-destructive/90">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {images.length === 0 && (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                No images uploaded yet. Upload your first image above.
              </div>
            )}
          </div>

          {/* Image Guidelines */}
          <div className="seller-card bg-[var(--muted)]">
            <h3 className="font-semibold mb-2">Image Guidelines</h3>
            <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
              <li>• Use high-quality images (minimum 800x800 pixels)</li>
              <li>• Square images work best for consistent display</li>
              <li>• Show your product from multiple angles</li>
              <li>• Use a clean, neutral background</li>
              <li>• Maximum file size: 5MB per image</li>
              <li>• Supported formats: JPG, PNG, WebP</li>
            </ul>
          </div>
        </div>
      </SellerLayout>
    </SellerGuard>
  );
}
