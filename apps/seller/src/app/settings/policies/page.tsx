"use client";

import { useState } from "react";

export default function PoliciesSettingsPage() {
  const [returnPolicy, setReturnPolicy] = useState(
    "We accept returns within 30 days of delivery. Items must be unused and in original packaging. Buyer is responsible for return shipping costs unless the item is defective or not as described."
  );
  const [refundPolicy, setRefundPolicy] = useState(
    "Refunds will be processed within 5-7 business days after we receive the returned item. Original shipping costs are non-refundable."
  );
  const [shippingPolicy, setShippingPolicy] = useState(
    "Orders are processed within 1-3 business days. Shipping times vary based on location and selected shipping method. Tracking information will be provided once your order ships."
  );
  const [returnWindow, setReturnWindow] = useState("30");
  const [acceptReturns, setAcceptReturns] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Policies updated");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Store Policies</h1>
        <p className="text-[var(--muted-foreground)]">
          Define your return, refund, and shipping policies
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Return Settings */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Return Settings</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptReturns}
                onChange={(e) => setAcceptReturns(e.target.checked)}
                className="w-5 h-5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="font-medium">Accept Returns</span>
            </label>
            {acceptReturns && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Return Window (days)
                </label>
                <select
                  value={returnWindow}
                  onChange={(e) => setReturnWindow(e.target.value)}
                  className="w-full max-w-xs px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Return Policy */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Return Policy</h2>
          <div>
            <textarea
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              placeholder="Describe your return policy..."
            />
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {returnPolicy.length}/1000 characters
            </p>
          </div>
        </div>

        {/* Refund Policy */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Refund Policy</h2>
          <div>
            <textarea
              value={refundPolicy}
              onChange={(e) => setRefundPolicy(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              placeholder="Describe your refund policy..."
            />
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {refundPolicy.length}/1000 characters
            </p>
          </div>
        </div>

        {/* Shipping Policy */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Shipping Policy</h2>
          <div>
            <textarea
              value={shippingPolicy}
              onChange={(e) => setShippingPolicy(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              placeholder="Describe your shipping policy..."
            />
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {shippingPolicy.length}/1000 characters
            </p>
          </div>
        </div>

        {/* Policy Tips */}
        <div className="seller-card bg-[var(--muted)]">
          <h3 className="font-semibold mb-3">Policy Tips</h3>
          <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">•</span>
              <span>Be clear and specific about conditions for returns</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">•</span>
              <span>Specify who pays for return shipping</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">•</span>
              <span>Include expected refund processing times</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">•</span>
              <span>Mention any items that cannot be returned</span>
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity"
          >
            Save Policies
          </button>
        </div>
      </form>
    </div>
  );
}
