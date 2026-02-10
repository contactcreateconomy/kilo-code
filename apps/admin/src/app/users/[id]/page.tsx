'use client';

import Link from 'next/link';
import { use, useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@createconomy/convex';
import { Loader2 } from 'lucide-react';
import type { Id } from '@createconomy/convex/dataModel';

type Props = {
  params: Promise<{ id: string }>;
};

const roleColors: Record<string, string> = {
  admin: 'badge-error',
  moderator: 'badge-warning',
  seller: 'badge-info',
  customer: 'badge-success',
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

export default function UserDetailPage({ params }: Props) {
  const { id } = use(params);
  const user = useQuery(api.functions.admin.getUserById, {
    userId: id as Id<'users'>,
  });
  const changeRole = useMutation(api.functions.admin.changeUserRole);
  const updateStatus = useMutation(api.functions.admin.updateUserStatus);

  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = useCallback(async () => {
    if (!selectedRole || !user) return;
    setIsUpdating(true);
    try {
      await changeRole({
        userId: id as Id<'users'>,
        role: selectedRole as 'customer' | 'seller' | 'admin' | 'moderator',
      });
    } finally {
      setIsUpdating(false);
    }
  }, [changeRole, id, selectedRole, user]);

  const handleToggleBan = useCallback(async () => {
    if (!user?.profile) return;
    setIsUpdating(true);
    try {
      await updateStatus({
        userId: id as Id<'users'>,
        isBanned: !user.profile.isBanned,
        reason: user.profile.isBanned ? undefined : 'Suspended by admin',
      });
    } finally {
      setIsUpdating(false);
    }
  }, [updateStatus, id, user]);

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="space-y-4">
        <Link
          href="/users"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back to Users
        </Link>
        <p className="text-center text-muted-foreground py-20">
          User not found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/users"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back to Users
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleBan}
            disabled={isUpdating}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              user.profile?.isBanned
                ? 'bg-success text-success-foreground hover:bg-success/90'
                : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            }`}
          >
            {user.profile?.isBanned ? 'Unsuspend User' : 'Suspend User'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Profile Card */}
        <div className="md:col-span-1">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name ?? ''}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold">
                  {(user.name ?? user.email ?? '?').charAt(0)}
                </div>
              )}
              <h2 className="mt-4 text-xl font-semibold">
                {user.name ?? user.profile?.displayName ?? 'Unknown'}
              </h2>
              <p className="text-muted-foreground">{user.email ?? '—'}</p>
              {user.profile && (
                <div className="mt-2 flex gap-2">
                  <span
                    className={`badge ${roleColors[user.profile.role] ?? ''}`}
                  >
                    {user.profile.role}
                  </span>
                  <span
                    className={`badge ${user.profile.isBanned ? 'badge-error' : 'badge-success'}`}
                  >
                    {user.profile.isBanned ? 'Suspended' : 'Active'}
                  </span>
                </div>
              )}
              {user.profile?.bio && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {user.profile.bio}
                </p>
              )}
              {user.profile && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Member since {formatDate(user.profile.createdAt)}
                </p>
              )}
            </div>
          </div>

          {/* Role Management */}
          <div className="mt-4 rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Role Management</h3>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedRole || user.profile?.role || 'customer'}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={handleRoleChange}
              disabled={
                isUpdating ||
                !selectedRole ||
                selectedRole === user.profile?.role
              }
              className="mt-3 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update Role'}
            </button>
          </div>

          {/* Seller info */}
          {user.seller && (
            <div className="mt-4 rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-semibold">Seller Info</h3>
              <p className="text-sm">
                <span className="text-muted-foreground">Business: </span>
                {user.seller.businessName}
              </p>
              <p className="mt-1 text-sm">
                <span className="text-muted-foreground">Approved: </span>
                {user.seller.isApproved ? 'Yes' : 'No'}
              </p>
              <p className="mt-1 text-sm">
                <span className="text-muted-foreground">Active: </span>
                {user.seller.isActive ? 'Yes' : 'No'}
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Order History */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b p-6">
              <h3 className="font-semibold">Order History</h3>
            </div>
            {user.orders.length === 0 ? (
              <p className="p-6 text-center text-muted-foreground">
                No orders yet
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {user.orders.map((order) => (
                    <tr key={String(order.id)}>
                      <td>
                        <Link
                          href={`/orders/${String(order.id)}`}
                          className="text-primary hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>${centsToDollars(order.total)}</td>
                      <td>
                        <span
                          className={`badge ${
                            order.status === 'delivered' ||
                            order.status === 'shipped'
                              ? 'badge-success'
                              : order.status === 'cancelled' ||
                                  order.status === 'refunded'
                                ? 'badge-error'
                                : 'badge-warning'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
