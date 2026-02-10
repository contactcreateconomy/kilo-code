'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@createconomy/convex';
import { useRouter } from 'next/navigation';
import type { Id } from '@createconomy/convex/dataModel';

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    parentId: string | null;
    status: string;
  };
  onCancel?: () => void;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  status: string;
}

export function CategoryForm({
  category,
  onCancel,
}: CategoryFormProps) {
  const router = useRouter();
  const categories = useQuery(api.functions.categories.listCategories, {});
  const createCategory = useMutation(api.functions.categories.createCategory);
  const updateCategoryMutation = useMutation(api.functions.categories.updateCategory);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    parentId: category?.parentId || null,
    status: category?.status || 'active',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    try {
      if (category) {
        // Update existing category
        await updateCategoryMutation({
          categoryId: category.id as Id<'productCategories'>,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          parentId: formData.parentId ? formData.parentId as Id<'productCategories'> : undefined,
          isActive: formData.status === 'active',
        });
      } else {
        // Create new category
        await createCategory({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          parentId: formData.parentId ? formData.parentId as Id<'productCategories'> : undefined,
        });
      }
      router.push('/categories');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const parentCategories = (categories ?? []).filter(
    (c) => c._id !== category?.id
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Category Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) =>
              setFormData({ ...formData, slug: e.target.value })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Parent Category
          </label>
          <select
            value={formData.parentId || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                parentId: e.target.value || null,
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">None (Top Level)</option>
            {parentCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel ?? (() => router.push('/categories'))}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}
