import Link from "next/link";

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  threshold: number;
}

interface LowStockAlertProps {
  products?: LowStockProduct[];
}

export function LowStockAlert({ products = [] }: LowStockAlertProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="seller-card border-[var(--warning)] bg-[var(--warning)]/5">
      <div className="flex items-center gap-3 mb-4">
        <svg
          className="w-6 h-6 text-[var(--warning)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-lg font-semibold">Low Stock Alert</h3>
      </div>
      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg"
          >
            <div>
              <Link
                href={`/products/${product.id}`}
                className="font-medium hover:text-[var(--primary)]"
              >
                {product.name}
              </Link>
              <p className="text-sm text-[var(--muted-foreground)]">
                {product.stock} remaining (threshold: {product.threshold})
              </p>
            </div>
            <Link
              href={`/products/${product.id}`}
              className="px-3 py-1 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              Restock
            </Link>
          </div>
        ))}
      </div>
      <Link
        href="/products?filter=low-stock"
        className="block text-center text-sm text-[var(--primary)] hover:underline mt-4"
      >
        View all low stock products
      </Link>
    </div>
  );
}
