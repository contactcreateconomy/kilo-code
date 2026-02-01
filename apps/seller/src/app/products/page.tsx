"use client";

import { useState } from "react";
import Link from "next/link";
import { SellerLayout } from "@/components/layout/seller-layout";
import { SellerGuard } from "@/components/auth/seller-guard";
import { ProductCard } from "@/components/products/product-card";

const mockProducts = [
  {
    id: "1",
    name: "Handcrafted Wooden Bowl",
    price: 45.99,
    stock: 12,
    status: "active",
    image: "/placeholder-product.jpg",
    sales: 156,
  },
  {
    id: "2",
    name: "Ceramic Vase Set",
    price: 89.99,
    stock: 5,
    status: "active",
    image: "/placeholder-product.jpg",
    sales: 89,
  },
  {
    id: "3",
    name: "Woven Wall Hanging",
    price: 125.0,
    stock: 0,
    status: "out_of_stock",
    image: "/placeholder-product.jpg",
    sales: 234,
  },
  {
    id: "4",
    name: "Leather Journal",
    price: 35.0,
    stock: 28,
    status: "draft",
    image: "/placeholder-product.jpg",
    sales: 0,
  },
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  return (
    <SellerGuard>
      <SellerLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Products</h1>
              <p className="text-[var(--muted-foreground)]">
                Manage your product listings
              </p>
            </div>
            <Link
              href="/products/new"
              className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
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
              Add Product
            </Link>
          </div>

          {/* Filters and Search */}
          <div className="seller-card">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                {["all", "active", "draft", "out_of_stock"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
                    }`}
                  >
                    {status === "all"
                      ? "All"
                      : status === "out_of_stock"
                        ? "Out of Stock"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-4">
                <span className="text-sm text-[var(--muted-foreground)]">
                  {selectedProducts.length} selected
                </span>
                <button className="text-sm text-[var(--primary)] hover:underline">
                  Bulk Edit
                </button>
                <button className="text-sm text-[var(--destructive)] hover:underline">
                  Delete Selected
                </button>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Select All Checkbox */}
            <div className="col-span-full flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={
                  selectedProducts.length === filteredProducts.length &&
                  filteredProducts.length > 0
                }
                onChange={toggleAllProducts}
                className="w-4 h-4 rounded border-[var(--border)]"
              />
              <span className="text-sm text-[var(--muted-foreground)]">
                Select all ({filteredProducts.length} products)
              </span>
            </div>

            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedProducts.includes(product.id)}
                onSelect={() => toggleProductSelection(product.id)}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[var(--muted-foreground)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-[var(--muted-foreground)] mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start by adding your first product"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Link
                  href="/products/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity"
                >
                  <svg
                    className="w-5 h-5"
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
                  Add Your First Product
                </Link>
              )}
            </div>
          )}
        </div>
      </SellerLayout>
    </SellerGuard>
  );
}
