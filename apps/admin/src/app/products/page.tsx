'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { Loader2 } from 'lucide-react';

type StatusFilter = 'draft' | 'active' | 'inactive' | 'archived' | undefined;

const statusColors: Record<string, string> = {
  active: 'badge-success',
  draft: 'badge-warning',
  inactive: 'badge-error',
  archived: 'badge-secondary',
};

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ProductsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(undefined);

  const products = useQuery(api.functions.admin.listAllProducts, {
    limit: 20,
    status: statusFilter,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage products listed on the marketplace
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={statusFilter ?? ''}
            onChange={(e) =>
              setStatusFilter((e.target.value as StatusFilter) || undefined)
            }
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
          <Link
            href="/products/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add Product
          </Link>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        {!products ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.items.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            No products found
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Seller</th>
                <th>Category</th>
                <th>Price</th>
                <th>Sales</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.items.map((product) => (
                <tr key={String(product.id)}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted" />
                      <div>
                        <span className="font-medium">{product.name}</span>
                        <p className="text-xs text-muted-foreground">
                          Added {formatDate(product.createdAt)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted-foreground">
                    {product.seller?.name ?? 'Unknown'}
                  </td>
                  <td className="text-muted-foreground">
                    {product.category?.name ?? '—'}
                  </td>
                  <td>${centsToDollars(product.price)}</td>
                  <td>{product.salesCount}</td>
                  <td>
                    <span
                      className={`badge ${statusColors[product.status] ?? ''}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/products/${String(product.id)}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {products && products.hasMore && (
        <p className="text-center text-sm text-muted-foreground">
          Showing first {products.items.length} products. More results available.
        </p>
      )}
    </div>
  );
}
