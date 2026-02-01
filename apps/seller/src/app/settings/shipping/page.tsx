"use client";

import { useState } from "react";

export default function ShippingSettingsPage() {
  const [processingTime, setProcessingTime] = useState("1-3");
  const [domesticShipping, setDomesticShipping] = useState(true);
  const [internationalShipping, setInternationalShipping] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("50");

  const shippingMethods = [
    { id: "standard", name: "Standard Shipping", price: "5.99", days: "5-7" },
    { id: "express", name: "Express Shipping", price: "12.99", days: "2-3" },
    { id: "overnight", name: "Overnight Shipping", price: "24.99", days: "1" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Shipping settings updated");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Shipping Settings</h1>
        <p className="text-[var(--muted-foreground)]">
          Configure your shipping options and rates
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Processing Time */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Processing Time</h2>
          <div>
            <label className="block text-sm font-medium mb-2">
              Order Processing Time
            </label>
            <select
              value={processingTime}
              onChange={(e) => setProcessingTime(e.target.value)}
              className="w-full max-w-xs px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="1">1 business day</option>
              <option value="1-3">1-3 business days</option>
              <option value="3-5">3-5 business days</option>
              <option value="5-7">5-7 business days</option>
            </select>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              Time needed to prepare an order for shipping
            </p>
          </div>
        </div>

        {/* Shipping Regions */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Shipping Regions</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={domesticShipping}
                onChange={(e) => setDomesticShipping(e.target.checked)}
                className="w-5 h-5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <div>
                <span className="font-medium">Domestic Shipping</span>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Ship within the United States
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={internationalShipping}
                onChange={(e) => setInternationalShipping(e.target.checked)}
                className="w-5 h-5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <div>
                <span className="font-medium">International Shipping</span>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Ship to other countries
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Shipping Methods */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Shipping Methods</h2>
          <div className="space-y-3">
            {shippingMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg"
              >
                <div>
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {method.days} business days
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${method.price}</p>
                  <button
                    type="button"
                    className="text-sm text-[var(--primary)] hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="w-full py-3 border-2 border-dashed border-[var(--border)] rounded-lg text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
            >
              + Add Shipping Method
            </button>
          </div>
        </div>

        {/* Free Shipping */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Free Shipping</h2>
          <div>
            <label className="block text-sm font-medium mb-2">
              Free Shipping Threshold
            </label>
            <div className="flex items-center gap-2 max-w-xs">
              <span className="text-[var(--muted-foreground)]">$</span>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                min="0"
              />
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              Orders above this amount qualify for free standard shipping. Set to 0 to disable.
            </p>
          </div>
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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
