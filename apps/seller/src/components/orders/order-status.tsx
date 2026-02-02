"use client";

import { useState } from "react";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderStatusProps {
  status?: OrderStatus;
  currentStatus?: OrderStatus;
  onStatusChange?: (newStatus: OrderStatus) => void;
  isLoading?: boolean;
}

export function OrderStatus({
  status,
  currentStatus: currentStatusProp,
  onStatusChange,
  isLoading,
}: OrderStatusProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Support both 'status' and 'currentStatus' props for flexibility
  const currentStatus = currentStatusProp ?? status ?? "pending";

  const statusConfig: Record<
    OrderStatus,
    { label: string; class: string; icon: string }
  > = {
    pending: { label: "Pending", class: "status-pending", icon: "⏳" },
    processing: { label: "Processing", class: "status-pending", icon: "📦" },
    shipped: { label: "Shipped", class: "status-active", icon: "🚚" },
    delivered: { label: "Delivered", class: "status-active", icon: "✓" },
    cancelled: { label: "Cancelled", class: "status-inactive", icon: "✕" },
  };

  const statusFlow: OrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
  ];

  const currentIndex = statusFlow.indexOf(currentStatus);
  const canProgress =
    currentStatus !== "cancelled" &&
    currentStatus !== "delivered" &&
    currentIndex < statusFlow.length - 1;

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Current Status Display */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{statusConfig[currentStatus].icon}</span>
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">Current Status</p>
          <span className={`status-badge ${statusConfig[currentStatus].class}`}>
            {statusConfig[currentStatus].label}
          </span>
        </div>
      </div>

      {/* Status Progress Bar */}
      {currentStatus !== "cancelled" && (
        <div className="relative">
          <div className="flex justify-between mb-2">
            {statusFlow.map((status, index) => (
              <div
                key={status}
                className={`flex flex-col items-center ${
                  index <= currentIndex
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    index <= currentIndex
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--muted)]"
                  }`}
                >
                  {index < currentIndex ? "✓" : index + 1}
                </div>
                <span className="text-xs mt-1 hidden sm:block">
                  {statusConfig[status].label}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-[var(--muted)] -z-10">
            <div
              className="h-full bg-[var(--primary)] transition-all"
              style={{
                width: `${(currentIndex / (statusFlow.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Status Actions */}
      <div className="flex flex-wrap gap-2">
        {canProgress && currentIndex + 1 < statusFlow.length && (
          <button
            onClick={() => handleStatusChange(statusFlow[currentIndex + 1]!)}
            disabled={isLoading}
            className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? "Updating..." : `Mark as ${statusConfig[statusFlow[currentIndex + 1]!].label}`}
          </button>
        )}

        {currentStatus !== "cancelled" && currentStatus !== "delivered" && (
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              Change Status
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg z-10">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status as OrderStatus)}
                    disabled={status === currentStatus}
                    className={`w-full px-4 py-2 text-left hover:bg-[var(--muted)] transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center gap-2 ${
                      status === currentStatus ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status History Note */}
      <p className="text-xs text-[var(--muted-foreground)]">
        Status changes are logged and visible to the customer.
      </p>
    </div>
  );
}
