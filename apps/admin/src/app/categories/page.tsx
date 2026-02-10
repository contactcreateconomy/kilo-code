'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@createconomy/convex';
import { Loader2 } from 'lucide-react';
import type { Id } from '@createconomy/convex/dataModel';

export default function CategoriesPage() {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const categories = useQuery(api.functions.categories.listCategories, {
    includeInactive: true,
  });
  const deleteCategory = useMutation(api.functions.categories.deleteCategory);

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDelete = async (categoryId: Id<'productCategories'>) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory({ categoryId });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories. Drag to reorder.
          </p>
        </div>
        <Link
          href="/categories/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add Category
        </Link>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b bg-muted/50 p-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Actions</div>
          </div>
        </div>
        {!categories ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            No categories found. Create your first category.
          </div>
        ) : (
          <div>
            {categories.map((category, index) => (
              <div
                key={String(category._id)}
                draggable
                onDragStart={() => handleDragStart(String(category._id))}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                className={`grid grid-cols-12 items-center gap-4 border-b p-4 last:border-b-0 transition-colors cursor-move hover:bg-muted/50 ${
                  draggedItem === String(category._id)
                    ? 'opacity-50 bg-muted'
                    : ''
                }`}
              >
                <div className="col-span-1 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8h16M4 16h16"
                      />
                    </svg>
                    {category.sortOrder ?? index + 1}
                  </div>
                </div>
                <div className="col-span-3">
                  <div>
                    <span className="font-medium">{category.name}</span>
                    <p className="text-xs text-muted-foreground">
                      /{category.slug}
                    </p>
                  </div>
                </div>
                <div className="col-span-4 text-sm text-muted-foreground">
                  {category.description ?? '—'}
                </div>
                <div className="col-span-2">
                  <span
                    className={`badge ${category.isActive ? 'badge-success' : 'badge-error'}`}
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Link
                    href={`/categories/${String(category._id)}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="text-sm text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
