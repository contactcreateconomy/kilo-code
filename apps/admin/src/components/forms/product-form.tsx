'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@createconomy/convex';
import { useRouter } from 'next/navigation';
import type { Id } from '@createconomy/convex/dataModel';

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    slug?: string;
    description: string;
    price: number; // cents
    category: string;
    status: string;
  };
  onCancel?: () => void;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string; // dollars string for input
  category: string;
  status: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

function dollarsToCents(dollars: string): number {
  return Math.round(parseFloat(dollars) * 100);
}

export function ProductForm({ product, onCancel }: ProductFormProps) {
  const router = useRouter();
  const categories = useQuery(api.functions.categories.listCategories, {});
  const createProduct = useMutation(api.functions.products.createProduct);
  const updateProductMutation = useMutation(api.functions.products.updateProduct);

  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    slug: product?.slug || (product?.name ? generateSlug(product.name) : ''),
    description: product?.description || '',
    price: product?.price ? centsToDollars(product.price) : '0.00',
    category: product?.category || '',
    status: product?.status || 'draft',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    try {
      const priceInCents = dollarsToCents(formData.price);
      if (isNaN(priceInCents) || priceInCents < 0) {
        setErrorMessage('Please enter a valid price');
        setIsSaving(false);
        return;
      }

      if (product) {
        // Update existing product
        await updateProductMutation({
          productId: product.id as Id<'products'>,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          price: priceInCents,
          categoryId: formData.category ? formData.category as Id<'productCategories'> : undefined,
          status: formData.status as 'draft' | 'active' | 'inactive' | 'archived',
        });
      } else {
        // Create new product
        await createProduct({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          price: priceInCents,
          currency: 'USD',
          categoryId: formData.category ? formData.category as Id<'productCategories'> : undefined,
        });
      }
      router.push('/products');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Product Name</label>
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
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-1">Price ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select category</option>
            {categories?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
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
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel ?? (() => router.push('/products'))}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
