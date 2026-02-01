import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Seller Details',
  description: 'View and manage seller details',
};

// Mock data - in production this would come from Convex
const seller = {
  id: '1',
  name: 'Jane Smith',
  email: 'jane@example.com',
  storeName: 'Creative Designs',
  storeDescription:
    'Premium digital assets and creative templates for designers and developers.',
  status: 'active',
  products: 45,
  totalSales: 12500.0,
  totalOrders: 234,
  rating: 4.8,
  reviewCount: 189,
  joinedAt: '2024-01-01',
  verifiedAt: '2024-01-05',
  payoutMethod: 'Stripe',
  payoutEmail: 'jane.payments@example.com',
  commissionRate: 15,
  avatar: null,
  banner: null,
  socialLinks: {
    website: 'https://creativedesigns.com',
    twitter: '@creativedesigns',
    instagram: '@creativedesigns',
  },
};

const products = [
  {
    id: '1',
    name: 'Premium UI Kit',
    price: 49.99,
    sales: 89,
    status: 'active',
  },
  {
    id: '2',
    name: 'Icon Pack Pro',
    price: 29.99,
    sales: 156,
    status: 'active',
  },
  {
    id: '3',
    name: 'Landing Page Templates',
    price: 79.99,
    sales: 45,
    status: 'draft',
  },
];

const recentOrders = [
  {
    id: 'ORD-001',
    product: 'Premium UI Kit',
    customer: 'John Doe',
    amount: 49.99,
    date: '2024-01-25',
  },
  {
    id: 'ORD-002',
    product: 'Icon Pack Pro',
    customer: 'Alice Brown',
    amount: 29.99,
    date: '2024-01-24',
  },
  {
    id: 'ORD-003',
    product: 'Premium UI Kit',
    customer: 'Bob Wilson',
    amount: 49.99,
    date: '2024-01-23',
  },
];

const salesStats = [
  { month: 'Aug', sales: 1200 },
  { month: 'Sep', sales: 1800 },
  { month: 'Oct', sales: 2100 },
  { month: 'Nov', sales: 2800 },
  { month: 'Dec', sales: 3200 },
  { month: 'Jan', sales: 3500 },
];

const statusColors: Record<string, string> = {
  active: 'badge-success',
  suspended: 'badge-error',
  pending: 'badge-warning',
  draft: 'badge-secondary',
};

interface SellerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerDetailPage({
  params,
}: SellerDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/sellers"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Sellers
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-3xl font-bold tracking-tight">
            {seller.storeName}
          </h1>
          <span className={`badge ${statusColors[seller.status]}`}>
            {seller.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {seller.status === 'active' && (
            <button className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
              Suspend Seller
            </button>
          )}
          {seller.status === 'suspended' && (
            <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              Reactivate Seller
            </button>
          )}
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Message Seller
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Seller Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                {seller.name.charAt(0)}
              </div>
              <h2 className="mt-4 text-xl font-semibold">{seller.name}</h2>
              <p className="text-muted-foreground">{seller.email}</p>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">{seller.rating}</span>
                <span className="text-muted-foreground">
                  ({seller.reviewCount} reviews)
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined</span>
                <span>{seller.joinedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verified</span>
                <span>{seller.verifiedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commission Rate</span>
                <span>{seller.commissionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payout Method</span>
                <span>{seller.payoutMethod}</span>
              </div>
            </div>

            {seller.socialLinks && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium mb-3">Social Links</h3>
                <div className="space-y-2 text-sm">
                  {seller.socialLinks.website && (
                    <a
                      href={seller.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:underline"
                    >
                      🌐 {seller.socialLinks.website}
                    </a>
                  )}
                  {seller.socialLinks.twitter && (
                    <p className="text-muted-foreground">
                      𝕏 {seller.socialLinks.twitter}
                    </p>
                  )}
                  {seller.socialLinks.instagram && (
                    <p className="text-muted-foreground">
                      📷 {seller.socialLinks.instagram}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Store Description */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-3">Store Description</h3>
            <p className="text-muted-foreground text-sm">
              {seller.storeDescription}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">
                ${seller.totalSales.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{seller.totalOrders}</p>
            </div>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Products</p>
              <p className="text-2xl font-bold">{seller.products}</p>
            </div>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Avg. Rating</p>
              <p className="text-2xl font-bold">{seller.rating}</p>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Sales Overview</h3>
            <div className="h-48 flex items-end gap-2">
              {salesStats.map((stat) => (
                <div key={stat.month} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary rounded-t"
                    style={{ height: `${(stat.sales / 3500) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground mt-2">
                    {stat.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Products</h3>
              <Link
                href={`/products?seller=${id}`}
                className="text-sm text-primary hover:underline"
              >
                View All →
              </Link>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Sales</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="font-medium">{product.name}</td>
                    <td>${product.price}</td>
                    <td>{product.sales}</td>
                    <td>
                      <span className={`badge ${statusColors[product.status]}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/products/${product.id}`}
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

          {/* Recent Orders */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Recent Orders</h3>
              <Link
                href={`/orders?seller=${id}`}
                className="text-sm text-primary hover:underline"
              >
                View All →
              </Link>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-primary hover:underline"
                      >
                        {order.id}
                      </Link>
                    </td>
                    <td>{order.product}</td>
                    <td>{order.customer}</td>
                    <td className="font-medium">${order.amount}</td>
                    <td className="text-muted-foreground">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Admin Actions */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Admin Actions</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <button className="rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted text-left">
                <span className="block font-medium">Adjust Commission Rate</span>
                <span className="text-muted-foreground">
                  Current: {seller.commissionRate}%
                </span>
              </button>
              <button className="rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted text-left">
                <span className="block font-medium">View Payout History</span>
                <span className="text-muted-foreground">
                  Last payout: $2,450.00
                </span>
              </button>
              <button className="rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted text-left">
                <span className="block font-medium">Feature Seller</span>
                <span className="text-muted-foreground">
                  Promote on homepage
                </span>
              </button>
              <button className="rounded-md border border-red-200 px-4 py-3 text-sm font-medium hover:bg-red-50 text-left text-red-600">
                <span className="block font-medium">Delete Seller Account</span>
                <span className="text-red-400">
                  This action cannot be undone
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
