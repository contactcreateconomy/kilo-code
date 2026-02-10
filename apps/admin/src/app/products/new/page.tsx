'use client';

import Link from 'next/link';
import { ProductForm } from '@/components/forms/product-form';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/products"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back to Products
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Product</h1>
        <p className="text-muted-foreground">
          Add a new product to the marketplace
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <ProductForm />
        </div>
      </div>
    </div>
  );
}
