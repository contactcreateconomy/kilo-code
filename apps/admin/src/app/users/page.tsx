import type { Metadata } from 'next';
import Link from 'next/link';
import { DataTable } from '@/components/tables/data-table';
import { Pagination } from '@/components/tables/pagination';

export const metadata: Metadata = {
  title: 'Users',
  description: 'Manage users on the platform',
};

// Mock data - in production this would come from Convex
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'seller',
    status: 'active',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-05',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'moderator',
    status: 'suspended',
    createdAt: '2024-01-01',
  },
];

const roleColors: Record<string, string> = {
  admin: 'badge-error',
  moderator: 'badge-warning',
  seller: 'badge-info',
  user: 'badge-success',
};

const statusColors: Record<string, string> = {
  active: 'badge-success',
  suspended: 'badge-error',
  pending: 'badge-warning',
};

export default function UsersPage() {
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
          <input
            type="search"
            placeholder="Search users..."
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="seller">Seller</option>
            <option value="user">User</option>
          </select>
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
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
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="text-muted-foreground">{user.email}</td>
                <td>
                  <span className={`badge ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${statusColors[user.status]}`}>
                    {user.status}
                  </span>
                </td>
                <td className="text-muted-foreground">{user.createdAt}</td>
                <td>
                  <Link
                    href={`/users/${user.id}`}
                    className="text-primary hover:underline text-sm"
                  >
                    View
                  </Link>
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
