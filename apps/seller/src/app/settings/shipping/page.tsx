"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import { Loader2 } from "lucide-react";

export default function ShippingSettingsPage() {
  const settings = useQuery(api.functions.users.getSellerSettings, {});
  const updateSettings = useMutation(api.functions.users.updateSellerSettings);

  const [processingTime, setProcessingTime] = useState("1-3");
  const [domesticShipping, setDomesticShipping] = useState(true);
  const [internationalShipping, setInternationalShipping] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("50");
  const [standardPrice, setStandardPrice] = useState("5.99");
  const [standardDays, setStandardDays] = useState("5-7");
  const [expressPrice, setExpressPrice] = useState("12.99");
  const [expressDays, setExpressDays] = useState("2-3");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Populate form from saved settings
  useEffect(() => {
    if (settings) {
      setProcessingTime((settings['processingTime'] as string) ?? "1-3");
      setDomesticShipping(settings['domesticShipping'] !== false);
      setInternationalShipping(settings['internationalShipping'] === true);
      setFreeShippingThreshold((settings['freeShippingThreshold'] as string) ?? "50");
      setStandardPrice((settings['standardShippingPrice'] as string) ?? "5.99");
      setStandardDays((settings['standardShippingDays'] as string) ?? "5-7");
      setExpressPrice((settings['expressShippingPrice'] as string) ?? "12.99");
      setExpressDays((settings['expressShippingDays'] as string) ?? "2-3");
    }
  }, [settings]);

  if (settings === undefined) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  if (settings === null) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-[var(--muted-foreground)]">No seller profile found.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    try {
      await updateSettings({
        settings: {
          processingTime,
          domesticShipping,
          internationalShipping,
          freeShippingThreshold,
          standardShippingPrice: standardPrice,
          standardShippingDays: standardDays,
          expressShippingPrice: expressPrice,
          expressShippingDays: expressDays,
        },
      });
      setSaveMessage("Shipping settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
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

      {saveMessage && (
        <div
          className={`rounded-lg p-3 text-sm ${
            saveMessage.includes("success")
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {saveMessage}
        </div>
      )}

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
            <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
              <div className="flex-1">
                <p className="font-medium">Standard Shipping</p>
                <div className="flex gap-4 mt-2">
                  <div>
                    <label className="text-xs text-[var(--muted-foreground)]">Days</label>
                    <input
                      type="text"
                      value={standardDays}
                      onChange={(e) => setStandardDays(e.target.value)}
                      className="w-20 px-2 py-1 border border-[var(--border)] rounded bg-[var(--background)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted-foreground)]">Price ($)</label>
                    <input
                      type="text"
                      value={standardPrice}
                      onChange={(e) => setStandardPrice(e.target.value)}
                      className="w-20 px-2 py-1 border border-[var(--border)] rounded bg-[var(--background)] text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
              <div className="flex-1">
                <p className="font-medium">Express Shipping</p>
                <div className="flex gap-4 mt-2">
                  <div>
                    <label className="text-xs text-[var(--muted-foreground)]">Days</label>
                    <input
                      type="text"
                      value={expressDays}
                      onChange={(e) => setExpressDays(e.target.value)}
                      className="w-20 px-2 py-1 border border-[var(--border)] rounded bg-[var(--background)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted-foreground)]">Price ($)</label>
                    <input
                      type="text"
                      value={expressPrice}
                      onChange={(e) => setExpressPrice(e.target.value)}
                      className="w-20 px-2 py-1 border border-[var(--border)] rounded bg-[var(--background)] text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
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
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
