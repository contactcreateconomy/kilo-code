'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';

const statusColors: Record<string, string> = {
  active: 'badge-success',
  suspended: 'badge-error',
  pending: 'badge-warning',
  inactive: 'badge-warning',
};

function centsToDollars(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function SellersPage() {
  const sellers = useQuery(api.functions.admin.listAllSellers, { limit: 50 });
  const pendingSellers = useQuery(api.functions.admin.listPendingSellers, { limit: 100 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredSellers = useMemo(() => {
    if (!sellers?.items) return [];
    return sellers.items.filter((seller) => {
      // Determine status
      const status = !seller.isApproved
        ? 'pending'
        : seller.isActive
          ? 'active'
          : 'inactive';

      // Status filter
      if (statusFilter && status !== statusFilter) return false;

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchesName = seller.user?.name?.toLowerCase().includes(q);
        const matchesEmail = seller.user?.email?.toLowerCase().includes(q);
        const matchesBusiness = seller.businessName?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesBusiness) return false;
      }

      return true;
    });
  }, [sellers, search, statusFilter]);

  if (sellers === undefined || pendingSellers === undefined) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalSellers = sellers.items.length;
  const activeSellers = sellers.items.filter((s) => s.isApproved && s.isActive).length;
  const pendingCount = pendingSellers.length;
  const totalRevenue = sellers.items.reduce((sum, s) => sum + (s.totalRevenue ?? 0), 0);

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          {pendingCount > 0 && (
            <Link
              href="/sellers/pending"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Pending Applications ({pendingCount})
            </Link>
          )}
        </div>
      </div>

      {/* Seller Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Sellers</p>
          <p className="text-2xl font-bold">{totalSellers}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Active Sellers</p>
          <p className="text-2xl font-bold">{activeSellers}</p>
          <p className="text-xs text-muted-foreground">
            {totalSellers > 0
              ? `${((activeSellers / totalSellers) * 100).toFixed(1)}% of total`
              : '—'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Pending Applications</p>
          <p className="text-2xl font-bold">{pendingCount}</p>
          {pendingCount > 0 && (
            <p className="text-xs text-warning">Needs review</p>
          )}
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">${centsToDollars(totalRevenue)}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        {filteredSellers.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            {search || statusFilter ? 'No sellers match your filters' : 'No sellers found'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Store Name</th>
                <th>Products</th>
                <th>Total Revenue</th>
                <th>Status</th>
                <th>Stripe</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.map((seller) => {
                const status = !seller.isApproved
                  ? 'pending'
                  : seller.isActive
                    ? 'active'
                    : 'inactive';

                return (
                  <tr key={seller.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {(seller.user?.name ?? seller.businessName ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium">
                            {seller.user?.name ?? 'Unknown'}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {seller.user?.email ?? '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{seller.businessName ?? '—'}</td>
                    <td>{seller.productCount}</td>
                    <td className="font-medium">
                      ${centsToDollars(seller.totalRevenue ?? 0)}
                    </td>
                    <td>
                      <span className={`badge ${statusColors[status] ?? ''}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${seller.stripeOnboarded ? 'badge-success' : 'badge-warning'}`}
                      >
                        {seller.stripeOnboarded ? 'Connected' : 'Not Connected'}
                      </span>
                    </td>
                    <td className="text-muted-foreground">
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/sellers/${seller.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {sellers.hasMore && (
        <p className="text-center text-sm text-muted-foreground">
          Showing first {sellers.items.length} sellers. More sellers available.
        </p>
      )}
    </div>
  );
}
