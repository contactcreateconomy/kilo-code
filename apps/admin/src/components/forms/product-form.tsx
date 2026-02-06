'use client';

import { useState } from 'react';

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    status: string;
  };
  onSubmit?: (data: ProductFormData) => void;
  onCancel?: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  status: string;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || '',
    status: product?.status || 'draft',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              setFormData({ ...formData, price: parseFloat(e.target.value) })
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
            required
          >
            <option value="">Select category</option>
            <option value="ui-kits">UI Kits</option>
            <option value="templates">Templates</option>
            <option value="icons">Icons</option>
            <option value="photography">Photography</option>
            <option value="code">Code</option>
            <option value="fonts">Fonts</option>
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
          onClick={onCancel}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
