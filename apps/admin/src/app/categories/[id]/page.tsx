'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@createconomy/convex';
import { Loader2 } from 'lucide-react';
import type { Id } from '@createconomy/convex/dataModel';

type Props = {
  params: Promise<{ id: string }>;
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CategoryDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const category = useQuery(api.functions.categories.getCategory, {
    categoryId: id as Id<'productCategories'>,
  });
  const updateCategory = useMutation(api.functions.categories.updateCategory);
  const deleteCategory = useMutation(api.functions.categories.deleteCategory);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize form when data loads
  if (category && !initialized) {
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description ?? '');
    setIsActive(category.isActive);
    setInitialized(true);
  }

  if (category === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (category === null) {
    return (
      <div className="space-y-4">
        <Link
          href="/categories"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back to Categories
        </Link>
        <p className="py-20 text-center text-muted-foreground">
          Category not found
        </p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCategory({
        categoryId: id as Id<'productCategories'>,
        name,
        slug,
        description: description || undefined,
        isActive,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory({ categoryId: id as Id<'productCategories'> });
      router.push('/categories');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

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
          <button
            onClick={handleDelete}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Category
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Category Stats */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Category Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sort Order</span>
                <span className="font-medium">{category.sortOrder ?? '—'}</span>
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
                <span className="font-medium">
                  {formatDate(category.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium">
                  {formatDate(category.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Form */}
        <div className="md:col-span-2">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-6 font-semibold">Edit Category</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <Link
                  href="/categories"
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
