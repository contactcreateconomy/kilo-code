"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";

interface OfferCodeData {
  _id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  productName?: string | null;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  expiresAt?: number;
  createdAt: number;
}

export default function DiscountsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const offerCodesResult = useQuery(api.functions.offerCodes.getSellerOfferCodes, {});
  const createOfferCode = useMutation(api.functions.offerCodes.createOfferCode);
  const deleteOfferCode = useMutation(api.functions.offerCodes.deleteOfferCode);

  const offerCodes = (offerCodesResult?.items ?? []) as OfferCodeData[];
  const activeCount = offerCodes.filter((c) => c.isActive).length;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newCode.trim() || !discountValue) return;

    setIsSubmitting(true);
    try {
      await createOfferCode({
        code: newCode.trim(),
        discountType,
        discountValue: discountType === "percent"
          ? parseFloat(discountValue)
          : Math.round(parseFloat(discountValue) * 100), // Convert dollars to cents
        ...(maxUses ? { maxUses: parseInt(maxUses) } : {}),
      });
      setNewCode("");
      setDiscountValue("");
      setMaxUses("");
      setShowCreateForm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create offer code");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate(offerCodeId: string) {
    try {
      await deleteOfferCode({ offerCodeId: offerCodeId as Id<"offerCodes"> });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to deactivate");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discount Codes</h1>
          <p className="text-[var(--muted-foreground)]">
            Create and manage discount codes for your products
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity"
        >
          {showCreateForm ? "Cancel" : "+ Create Code"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Total Codes</p>
          <p className="text-3xl font-bold mt-1">{offerCodes.length}</p>
        </div>
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Active Codes</p>
          <p className="text-3xl font-bold mt-1">{activeCount}</p>
        </div>
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Total Redemptions</p>
          <p className="text-3xl font-bold mt-1">
            {offerCodes.reduce((sum, c) => sum + c.currentUses, 0)}
          </p>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="seller-card space-y-4">
          <h2 className="text-lg font-semibold">Create Discount Code</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="e.g., SUMMER25"
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="percent">Percentage Off</option>
                <option value="fixed">Fixed Amount Off</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {discountType === "percent" ? "Percentage (1-100)" : "Amount ($)"}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percent" ? "25" : "5.00"}
                min={discountType === "percent" ? "1" : "0.01"}
                max={discountType === "percent" ? "100" : undefined}
                step={discountType === "percent" ? "1" : "0.01"}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Max Uses (leave empty for unlimited)
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
                min="1"
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Code"}
          </button>
        </form>
      )}

      {/* Codes List */}
      <div className="space-y-3">
        {offerCodes.length === 0 ? (
          <div className="seller-card text-center py-12">
            <p className="text-[var(--muted-foreground)]">
              No discount codes yet. Create your first one above!
            </p>
          </div>
        ) : (
          offerCodes.map((code) => (
            <div key={code._id} className="seller-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-bold font-mono">{code.code}</code>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        code.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {code.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {code.discountType === "percent"
                      ? `${code.discountValue}% off`
                      : `$${(code.discountValue / 100).toFixed(2)} off`}
                    {code.productName && ` · ${code.productName}`}
                    {" · "}
                    {code.currentUses}
                    {code.maxUses ? `/${code.maxUses}` : ""} used
                  </p>
                </div>
                {code.isActive && (
                  <button
                    onClick={() => handleDeactivate(code._id)}
                    className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
