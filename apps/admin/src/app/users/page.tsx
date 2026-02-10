'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { Loader2 } from 'lucide-react';

type RoleFilter = 'customer' | 'seller' | 'admin' | 'moderator' | undefined;

const roleColors: Record<string, string> = {
  admin: 'badge-error',
  moderator: 'badge-warning',
  seller: 'badge-info',
  customer: 'badge-success',
};

const statusColors: Record<string, string> = {
  active: 'badge-success',
  suspended: 'badge-error',
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(undefined);
  const [bannedFilter, setBannedFilter] = useState<boolean | undefined>(
    undefined
  );

  const users = useQuery(api.functions.admin.listAllUsers, {
    limit: 20,
    role: roleFilter,
    isBanned: bannedFilter,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={roleFilter ?? ''}
            onChange={(e) =>
              setRoleFilter(
                (e.target.value as RoleFilter) || undefined
              )
            }
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="seller">Seller</option>
            <option value="customer">Customer</option>
          </select>
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={
              bannedFilter === undefined
                ? ''
                : bannedFilter
                  ? 'suspended'
                  : 'active'
            }
            onChange={(e) => {
              const val = e.target.value;
              setBannedFilter(
                val === '' ? undefined : val === 'suspended'
              );
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        {!users ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : users.items.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            No users found
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.items.map((user) => (
                <tr key={String(user.id)}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        {(user.name ?? user.email ?? '?').charAt(0)}
                      </div>
                      <span className="font-medium">
                        {user.name ?? user.profile.displayName ?? 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">
                    {user.email ?? '—'}
                  </td>
                  <td>
                    <span
                      className={`badge ${roleColors[user.profile.role] ?? ''}`}
                    >
                      {user.profile.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${user.profile.isBanned ? statusColors['suspended'] : statusColors['active']}`}
                    >
                      {user.profile.isBanned ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="text-muted-foreground">
                    {formatDate(user.profile.createdAt)}
                  </td>
                  <td>
                    <Link
                      href={`/users/${String(user.id)}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {users && users.hasMore && (
        <p className="text-center text-sm text-muted-foreground">
          Showing first {users.items.length} users. More results available.
        </p>
      )}
    </div>
  );
}
