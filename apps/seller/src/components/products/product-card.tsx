import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  status: "active" | "draft" | "archived" | "out_of_stock" | string;
  sales?: number;
}

interface ProductCardProps {
  product?: Product;
  id?: string;
  name?: string;
  price?: number;
  image?: string;
  stock?: number;
  status?: "active" | "draft" | "archived";
  sales?: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function ProductCard({
  product,
  id: idProp,
  name: nameProp,
  price: priceProp,
  image: imageProp,
  stock: stockProp,
  status: statusProp,
  sales: salesProp = 0,
  isSelected,
  onSelect,
}: ProductCardProps) {
  // Support both object prop and individual props
  const id = product?.id ?? idProp ?? "";
  const name = product?.name ?? nameProp ?? "";
  const price = product?.price ?? priceProp ?? 0;
  const image = product?.image ?? imageProp;
  const stock = product?.stock ?? stockProp ?? 0;
  const status = (product?.status ?? statusProp ?? "draft") as "active" | "draft" | "archived";
  const sales = product?.sales ?? salesProp;
  
  const statusColors = {
    active: "status-active",
    draft: "status-pending",
    archived: "status-inactive",
  };

  return (
    <div className="seller-card hover:border-[var(--primary)] transition-colors">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 bg-[var(--muted)] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">📦</span>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/products/${id}`}
              className="font-medium hover:text-[var(--primary)] truncate"
            >
              {name}
            </Link>
            <span className={`status-badge ${statusColors[status]} flex-shrink-0`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <p className="text-lg font-bold mt-1">${price.toFixed(2)}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-[var(--muted-foreground)]">
            <span className={stock <= 5 ? "text-[var(--warning)]" : ""}>
              {stock} in stock
            </span>
            <span>{sales} sold</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
        <Link
          href={`/products/${id}`}
          className="flex-1 px-3 py-1.5 text-sm text-center border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
        >
          Edit
        </Link>
        <Link
          href={`/products/${id}/images`}
          className="flex-1 px-3 py-1.5 text-sm text-center border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
        >
          Images
        </Link>
        <button className="p-1.5 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
