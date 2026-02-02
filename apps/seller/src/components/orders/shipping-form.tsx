"use client";

import { useState } from "react";

interface ShippingFormProps {
  orderId?: string;
  currentStatus?: string;
  initialData?: {
    carrier: string;
    trackingNumber: string;
    shippingDate: string;
    estimatedDelivery: string;
    notes: string;
  };
  onSubmit?: (data: ShippingFormData) => void;
  isLoading?: boolean;
}

export interface ShippingFormData {
  carrier: string;
  trackingNumber: string;
  shippingDate: string;
  estimatedDelivery: string;
  notes: string;
}

const carriers = [
  { value: "usps", label: "USPS" },
  { value: "ups", label: "UPS" },
  { value: "fedex", label: "FedEx" },
  { value: "dhl", label: "DHL" },
  { value: "other", label: "Other" },
];

export function ShippingForm({ orderId, currentStatus, initialData, onSubmit, isLoading }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingFormData>({
    carrier: initialData?.carrier || "",
    trackingNumber: initialData?.trackingNumber || "",
    shippingDate: initialData?.shippingDate || new Date().toISOString().split("T")[0] || "",
    estimatedDelivery: initialData?.estimatedDelivery || "",
    notes: initialData?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Carrier */}
        <div>
          <label className="block text-sm font-medium mb-2">Shipping Carrier</label>
          <select
            name="carrier"
            value={formData.carrier}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="">Select carrier</option>
            {carriers.map((carrier) => (
              <option key={carrier.value} value={carrier.value}>
                {carrier.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tracking Number */}
        <div>
          <label className="block text-sm font-medium mb-2">Tracking Number</label>
          <input
            type="text"
            name="trackingNumber"
            value={formData.trackingNumber}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Enter tracking number"
          />
        </div>

        {/* Shipping Date */}
        <div>
          <label className="block text-sm font-medium mb-2">Shipping Date</label>
          <input
            type="date"
            name="shippingDate"
            value={formData.shippingDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        {/* Estimated Delivery */}
        <div>
          <label className="block text-sm font-medium mb-2">Estimated Delivery</label>
          <input
            type="date"
            name="estimatedDelivery"
            value={formData.estimatedDelivery}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Shipping Notes (Optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
          placeholder="Any additional shipping information..."
        />
      </div>

      {/* Info Box */}
      <div className="p-4 bg-[var(--muted)] rounded-lg">
        <p className="text-sm text-[var(--muted-foreground)]">
          📧 The customer will be notified via email when you add shipping information.
          Make sure the tracking number is correct before submitting.
        </p>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          className="px-6 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Shipping Info"}
        </button>
      </div>
    </form>
  );
}
