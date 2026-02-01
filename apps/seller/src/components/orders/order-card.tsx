import Link from "next/link";

interface OrderCardProps {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  total: number;
  itemCount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
}

export function OrderCard({
  id,
  orderNumber,
  customerName,
  date,
  total,
  itemCount,
  status,
}: OrderCardProps) {
  const statusConfig = {
    pending: { label: "Pending", class: "status-pending" },
    processing: { label: "Processing", class: "status-pending" },
    shipped: { label: "Shipped", class: "status-active" },
    delivered: { label: "Delivered", class: "status-active" },
    cancelled: { label: "Cancelled", class: "status-inactive" },
  };

  const statusInfo = statusConfig[status];

  return (
    <Link
      href={`/orders/${id}`}
      className="seller-card block hover:border-[var(--primary)] transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">#{orderNumber}</span>
            <span className={`status-badge ${statusInfo.class}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {customerName}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{date}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">${total.toFixed(2)}</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
        {status === "pending" && (
          <span className="text-sm text-[var(--warning)]">⏳ Awaiting action</span>
        )}
        {status === "processing" && (
          <span className="text-sm text-[var(--primary)]">📦 Ready to ship</span>
        )}
        {status === "shipped" && (
          <span className="text-sm text-[var(--success)]">🚚 In transit</span>
        )}
        {status === "delivered" && (
          <span className="text-sm text-[var(--success)]">✓ Completed</span>
        )}
        {status === "cancelled" && (
          <span className="text-sm text-[var(--muted-foreground)]">✕ Cancelled</span>
        )}
        <span className="ml-auto text-sm text-[var(--primary)]">View Details →</span>
      </div>
    </Link>
  );
}
