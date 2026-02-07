import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductForm } from '@/components/forms/product-form';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Product ${id}`,
    description: 'Edit product details',
  };
}

// Mock product data - in production this would come from Convex
const mockProduct = {
  id: '1',
  name: 'Digital Art Collection',
  description:
    'A stunning collection of digital artwork featuring abstract designs and modern aesthetics.',
  price: 49.99,
  status: 'active',
  category: 'digital-art',
  seller: {
    id: 'seller-1',
    name: 'John Doe',
  },
  images: ['/placeholder-1.jpg', '/placeholder-2.jpg'],
  tags: ['digital', 'art', 'abstract'],
  sales: 125,
  views: 1250,
  createdAt: '2024-01-15',
  updatedAt: '2024-01-20',
};

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = mockProduct; // In production: await fetchProduct(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Products
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`${process.env['NEXT_PUBLIC_MARKETPLACE_URL']}/products/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            View on Marketplace
          </a>
          <button className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
            Delete Product
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Product Stats */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Product Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Sales</span>
                <span className="font-medium">{product.sales}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Views</span>
                <span className="font-medium">{product.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conversion Rate</span>
                <span className="font-medium">
                  {((product.sales / product.views) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">
                  ${(product.sales * product.price).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Seller Info</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                {product.seller.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{product.seller.name}</p>
                <Link
                  href={`/sellers/${product.seller.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  View Seller Profile
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent text-left">
                Feature Product
              </button>
              <button className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent text-left">
                Send to Review
              </button>
              <button className="w-full rounded-md border border-destructive text-destructive px-4 py-2 text-sm hover:bg-destructive hover:text-destructive-foreground text-left">
                Suspend Product
              </button>
            </div>
          </div>
        </div>

        {/* Product Form */}
        <div className="md:col-span-2">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-6">Edit Product</h3>
            <ProductForm product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
