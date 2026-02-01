import type { Metadata } from 'next';
import Link from 'next/link';
import { UserForm } from '@/components/forms/user-form';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `User ${id}`,
    description: 'View and manage user details',
  };
}

// Mock user data - in production this would come from Convex
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'seller',
  status: 'active',
  createdAt: '2024-01-15',
  avatar: null,
  bio: 'A passionate creator and seller on the platform.',
  orders: [
    { id: 'ORD-001', date: '2024-01-20', total: 99.99, status: 'completed' },
    { id: 'ORD-002', date: '2024-01-18', total: 149.99, status: 'completed' },
    { id: 'ORD-003', date: '2024-01-15', total: 29.99, status: 'refunded' },
  ],
  activity: [
    { action: 'Logged in', date: '2024-01-25 10:30 AM' },
    { action: 'Updated profile', date: '2024-01-24 3:15 PM' },
    { action: 'Made a purchase', date: '2024-01-20 2:00 PM' },
    { action: 'Listed a product', date: '2024-01-18 11:00 AM' },
  ],
};

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

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const user = mockUser; // In production: await fetchUser(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/users"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Users
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
            Send Email
          </button>
          <button className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
            Suspend User
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Profile Card */}
        <div className="md:col-span-1">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex gap-2">
                <span className={`badge ${roleColors[user.role]}`}>
                  {user.role}
                </span>
                <span className={`badge ${statusColors[user.status]}`}>
                  {user.status}
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{user.bio}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Member since {user.createdAt}
              </p>
            </div>
          </div>

          {/* Role Management */}
          <div className="mt-4 rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Role Management</h3>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="user">User</option>
              <option value="seller" selected>
                Seller
              </option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
            <button className="mt-3 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Update Role
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Order History */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6 border-b">
              <h3 className="font-semibold">Order History</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {user.orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-primary hover:underline"
                      >
                        {order.id}
                      </Link>
                    </td>
                    <td>{order.date}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${
                          order.status === 'completed'
                            ? 'badge-success'
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
          </div>

          {/* Activity Log */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6 border-b">
              <h3 className="font-semibold">Activity Log</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {user.activity.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <span>{item.action}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
