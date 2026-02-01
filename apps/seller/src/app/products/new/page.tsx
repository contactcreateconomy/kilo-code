import { SellerLayout } from "@/components/layout/seller-layout";
import { SellerGuard } from "@/components/auth/seller-guard";
import { ProductForm } from "@/components/products/product-form";

export const metadata = {
  title: "Add New Product",
  description: "Create a new product listing",
};

export default function NewProductPage() {
  return (
    <SellerGuard>
      <SellerLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Add New Product</h1>
              <p className="text-[var(--muted-foreground)]">
                Create a new product listing for your store
              </p>
            </div>
            <a
              href="/products"
              className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              Cancel
            </a>
          </div>

          {/* Product Form */}
          <ProductForm mode="create" />
        </div>
      </SellerLayout>
    </SellerGuard>
  );
}
