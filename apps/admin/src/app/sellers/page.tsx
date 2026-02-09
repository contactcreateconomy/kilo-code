import type { Metadata } from 'next';
import Link from 'next/link';
import { Pagination } from '@/components/tables/pagination';

export const metadata: Metadata = {
  title: 'Sellers',
  description: 'Manage sellers on the platform',
};

// Mock data - in production this would come from Convex
const sellers = [
  {
    id: '1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    storeName: 'Creative Designs',
    status: 'active',
    products: 45,
    totalSales: 12500.0,
    joinedAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    storeName: 'Digital Assets Pro',
    status: 'active',
    products: 89,
    totalSales: 45000.0,
    joinedAt: '2023-11-15',
  },
  {
    id: '3',
    name: 'Alice Brown',
    email: 'alice@example.com',
    storeName: 'Art Studio',
    status: 'suspended',
    products: 23,
    totalSales: 5600.0,
    joinedAt: '2024-01-10',
  },
  {
    id: '4',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    storeName: 'Photo Presets',
    status: 'pending',
    products: 0,
    totalSales: 0,
    joinedAt: '2024-01-25',
  },
];

const statusColors: Record<string, string> = {
  active: 'badge-success',
  suspended: 'badge-error',
  pending: 'badge-warning',
};

export default function SellersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sellers</h1>
          <p className="text-muted-foreground">
            Manage seller accounts and applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search sellers..."
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <Link
            href="/sellers/pending"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Pending Applications (3)
          </Link>
        </div>
      </div>

      {/* Seller Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Sellers</p>
          <p className="text-2xl font-bold">234</p>
          <p className="text-xs text-success">+8 this month</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Active Sellers</p>
          <p className="text-2xl font-bold">198</p>
          <p className="text-xs text-muted-foreground">84.6% of total</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Pending Applications</p>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-warning">Needs review</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">$1.2M</p>
          <p className="text-xs text-success">+15% from last month</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <table className="data-table">
          <thead>
            <tr>
              <th>Seller</th>
              <th>Store Name</th>
              <th>Products</th>
              <th>Total Sales</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr key={seller.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {seller.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-medium">{seller.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {seller.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td>{seller.storeName}</td>
                <td>{seller.products}</td>
                <td className="font-medium">
                  ${seller.totalSales.toLocaleString()}
                </td>
                <td>
                  <span className={`badge ${statusColors[seller.status]}`}>
                    {seller.status}
                  </span>
                </td>
                <td className="text-muted-foreground">{seller.joinedAt}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/sellers/${seller.id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={1}
        totalPages={24}
        totalItems={234}
        itemsPerPage={10}
      />
    </div>
  );
}
