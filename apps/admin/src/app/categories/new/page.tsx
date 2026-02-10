'use client';

import Link from 'next/link';
import { CategoryForm } from '@/components/forms/category-form';

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/categories"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back to Categories
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Category</h1>
        <p className="text-muted-foreground">
          Add a new product category to the marketplace
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <CategoryForm />
        </div>
      </div>
    </div>
  );
}
