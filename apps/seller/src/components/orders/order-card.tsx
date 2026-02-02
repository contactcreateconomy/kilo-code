import Link from "next/link";

interface Order {
  id: string;
  orderNumber?: string;
  customer?: string;
  customerName?: string;
  date: string;
  total: number;
  items?: number;
  itemCount?: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | string;
}

interface OrderCardProps {
  order?: Order;
  id?: string;
  orderNumber?: string;
  customerName?: string;
  date?: string;
  total?: number;
  itemCount?: number;
  status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
}

export function OrderCard({
  order,
  id: idProp,
  orderNumber: orderNumberProp,
  customerName: customerNameProp,
  date: dateProp,
  total: totalProp,
  itemCount: itemCountProp,
  status: statusProp,
}: OrderCardProps) {
  // Support both object prop and individual props
  const id = order?.id ?? idProp ?? "";
  const orderNumber = order?.orderNumber ?? order?.id ?? orderNumberProp ?? "";
  const customerName = order?.customerName ?? order?.customer ?? customerNameProp ?? "";
  const date = order?.date ?? dateProp ?? "";
  const total = order?.total ?? totalProp ?? 0;
  const itemCount = order?.itemCount ?? order?.items ?? itemCountProp ?? 0;
  const status = (order?.status ?? statusProp ?? "pending") as "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  
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
