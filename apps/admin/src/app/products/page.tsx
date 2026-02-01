import type { Metadata } from 'next';
import Link from 'next/link';
import { Pagination } from '@/components/tables/pagination';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Manage products on the platform',
};

// Mock data - in production this would come from Convex
const products = [
  {
    id: '1',
    name: 'Digital Art Collection',
    seller: 'John Doe',
    price: 49.99,
    status: 'active',
    category: 'Digital Art',
    sales: 125,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'UI Kit Pro',
    seller: 'Jane Smith',
    price: 79.99,
    status: 'active',
    category: 'Design',
    sales: 89,
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Photography Presets',
    seller: 'Bob Wilson',
    price: 29.99,
    status: 'pending',
    category: 'Photography',
    sales: 0,
    createdAt: '2024-01-20',
  },
  {
    id: '4',
    name: 'Icon Pack Bundle',
    seller: 'Alice Brown',
    price: 19.99,
    status: 'inactive',
    category: 'Design',
    sales: 234,
    createdAt: '2024-01-05',
  },
];

const statusColors: Record<string, string> = {
  active: 'badge-success',
  pending: 'badge-warning',
  inactive: 'badge-error',
};

export default function ProductsPage() {
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
          <input
            type="search"
            placeholder="Search products..."
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All Categories</option>
            <option value="digital-art">Digital Art</option>
            <option value="design">Design</option>
            <option value="photography">Photography</option>
          </select>
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
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

      {/* Bulk Actions */}
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
        <input type="checkbox" className="rounded border-input" />
        <span className="text-sm text-muted-foreground">Select all</span>
        <div className="ml-auto flex items-center gap-2">
          <button className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent">
            Activate
          </button>
          <button className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent">
            Deactivate
          </button>
          <button className="rounded-md border border-destructive text-destructive px-3 py-1.5 text-sm hover:bg-destructive hover:text-destructive-foreground">
            Delete
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">
                <input type="checkbox" className="rounded border-input" />
              </th>
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
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <input type="checkbox" className="rounded border-input" />
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted" />
                    <div>
                      <span className="font-medium">{product.name}</span>
                      <p className="text-xs text-muted-foreground">
                        Added {product.createdAt}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-muted-foreground">{product.seller}</td>
                <td className="text-muted-foreground">{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.sales}</td>
                <td>
                  <span className={`badge ${statusColors[product.status]}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    <button className="text-destructive hover:underline text-sm">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={1}
        totalPages={10}
        totalItems={100}
        itemsPerPage={10}
      />
    </div>
  );
}
