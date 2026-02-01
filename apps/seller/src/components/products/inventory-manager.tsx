"use client";

import { useState } from "react";

interface InventoryItem {
  sku: string;
  name: string;
  stock: number;
  lowStockThreshold: number;
}

interface InventoryManagerProps {
  items: InventoryItem[];
  onUpdateStock: (sku: string, newStock: number) => void;
  onUpdateThreshold: (sku: string, threshold: number) => void;
}

export function InventoryManager({
  items,
  onUpdateStock,
  onUpdateThreshold,
}: InventoryManagerProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const handleStockEdit = (sku: string, currentStock: number) => {
    setEditingItem(sku);
    setEditValue(currentStock);
  };

  const handleStockSave = (sku: string) => {
    onUpdateStock(sku, editValue);
    setEditingItem(null);
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) return { label: "Out of Stock", class: "status-inactive" };
    if (stock <= threshold) return { label: "Low Stock", class: "status-pending" };
    return { label: "In Stock", class: "status-active" };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Inventory Management</h2>
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            In Stock
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            Low Stock
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Out of Stock
          </span>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="seller-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 font-medium">Product</th>
              <th className="text-left py-3 px-4 font-medium">SKU</th>
              <th className="text-center py-3 px-4 font-medium">Stock</th>
              <th className="text-center py-3 px-4 font-medium">Low Stock Alert</th>
              <th className="text-center py-3 px-4 font-medium">Status</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const status = getStockStatus(item.stock, item.lowStockThreshold);
              const isEditing = editingItem === item.sku;

              return (
                <tr
                  key={item.sku}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50"
                >
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4 text-[var(--muted-foreground)]">
                    {item.sku}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-20 px-2 py-1 text-center border border-[var(--border)] rounded bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={
                          item.stock <= item.lowStockThreshold
                            ? "font-bold text-[var(--warning)]"
                            : ""
                        }
                      >
                        {item.stock}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="number"
                      value={item.lowStockThreshold}
                      onChange={(e) =>
                        onUpdateThreshold(item.sku, parseInt(e.target.value) || 0)
                      }
                      min="0"
                      className="w-20 px-2 py-1 text-center border border-[var(--border)] rounded bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`status-badge ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStockSave(item.sku)}
                          className="px-3 py-1 text-sm bg-[var(--primary)] text-[var(--primary-foreground)] rounded hover:opacity-90 transition-opacity"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="px-3 py-1 text-sm border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStockEdit(item.sku, item.stock)}
                          className="px-3 py-1 text-sm border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors"
                        >
                          Edit Stock
                        </button>
                        <button
                          onClick={() => onUpdateStock(item.sku, item.stock + 1)}
                          className="p-1 border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors"
                          title="Add 1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            onUpdateStock(item.sku, Math.max(0, item.stock - 1))
                          }
                          className="p-1 border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors"
                          title="Remove 1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted-foreground)]">
          {items.filter((i) => i.stock <= i.lowStockThreshold).length} items need
          attention
        </p>
        <button className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors">
          Export Inventory Report
        </button>
      </div>
    </div>
  );
}
