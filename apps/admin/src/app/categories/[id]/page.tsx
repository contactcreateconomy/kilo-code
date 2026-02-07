import type { Metadata } from 'next';
import Link from 'next/link';
import { CategoryForm } from '@/components/forms/category-form';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Category ${id}`,
    description: 'Edit category details',
  };
}

// Mock category data - in production this would come from Convex
const mockCategory = {
  id: '1',
  name: 'Digital Art',
  slug: 'digital-art',
  description: 'Digital artwork and illustrations',
  image: null,
  parentId: null as string | null,
  status: 'active',
  productCount: 125,
  order: 1,
  isActive: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15',
};

export default async function CategoryDetailPage({ params }: Props) {
  const { id } = await params;
  const category = mockCategory; // In production: await fetchCategory(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/categories"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Categories
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`${process.env['NEXT_PUBLIC_MARKETPLACE_URL']}/categories/${category.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            View on Marketplace
          </a>
          <button className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
            Delete Category
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Category Stats */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Category Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Products</span>
                <span className="font-medium">{category.productCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Display Order</span>
                <span className="font-medium">{category.order}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`badge ${category.isActive ? 'badge-success' : 'badge-error'}`}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{category.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium">{category.updatedAt}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent text-left">
                View Products
              </button>
              <button className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent text-left">
                {category.isActive ? 'Deactivate' : 'Activate'} Category
              </button>
              <button className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent text-left">
                Merge with Another
              </button>
            </div>
          </div>
        </div>

        {/* Category Form */}
        <div className="md:col-span-2">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-6">Edit Category</h3>
            <CategoryForm category={category} />
          </div>
        </div>
      </div>
    </div>
  );
}
