"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import { Loader2 } from "lucide-react";

export default function PoliciesSettingsPage() {
  const settings = useQuery(api.functions.users.getSellerSettings, {});
  const updateSettings = useMutation(api.functions.users.updateSellerSettings);

  const [returnPolicy, setReturnPolicy] = useState("");
  const [refundPolicy, setRefundPolicy] = useState("");
  const [shippingPolicy, setShippingPolicy] = useState("");
  const [returnWindow, setReturnWindow] = useState("30");
  const [acceptReturns, setAcceptReturns] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Populate form from saved settings
  useEffect(() => {
    if (settings) {
      setReturnPolicy((settings['returnPolicy'] as string) ?? "");
      setRefundPolicy((settings['refundPolicy'] as string) ?? "");
      setShippingPolicy((settings['shippingPolicy'] as string) ?? "");
      setReturnWindow((settings['returnWindow'] as string) ?? "30");
      setAcceptReturns(settings['acceptReturns'] !== false);
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
          returnPolicy,
          refundPolicy,
          shippingPolicy,
          returnWindow,
          acceptReturns,
        },
      });
      setSaveMessage("Policies saved successfully!");
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
        <h1 className="text-2xl font-bold">Store Policies</h1>
        <p className="text-[var(--muted-foreground)]">
          Define your return, refund, and shipping policies
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
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Policies"}
          </button>
        </div>
      </form>
    </div>
  );
}
