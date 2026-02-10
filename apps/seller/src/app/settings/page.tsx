"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import { Loader2 } from "lucide-react";

export default function StoreSettingsPage() {
  const sellerProfile = useQuery(api.functions.users.getMySellerProfile, {});
  const updateProfile = useMutation(api.functions.users.updateSellerProfile);

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeWebsite, setStoreWebsite] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Populate form when data loads
  useEffect(() => {
    if (sellerProfile) {
      setStoreName(sellerProfile.businessName ?? "");
      setStoreDescription(sellerProfile.description ?? "");
      setStoreEmail(sellerProfile.businessEmail ?? "");
      setStorePhone(sellerProfile.businessPhone ?? "");
      setStoreWebsite(sellerProfile.websiteUrl ?? "");
      setStoreLocation(
        sellerProfile.businessAddress
          ? [sellerProfile.businessAddress.city, sellerProfile.businessAddress.state]
              .filter(Boolean)
              .join(", ")
          : ""
      );
    }
  }, [sellerProfile]);

  if (sellerProfile === undefined) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  if (sellerProfile === null) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-[var(--muted-foreground)]">No seller profile found. Please apply to become a seller first.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    try {
      const parts = storeLocation.split(",").map((s) => s.trim());
      await updateProfile({
        businessName: storeName,
        description: storeDescription,
        businessEmail: storeEmail,
        businessPhone: storePhone,
        websiteUrl: storeWebsite,
        businessAddress: {
          city: parts[0] ?? "",
          state: parts[1] ?? "",
        },
      });
      setSaveMessage("Settings saved successfully!");
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
        <h1 className="text-2xl font-bold">Store Profile</h1>
        <p className="text-[var(--muted-foreground)]">
          Manage your store information and branding
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
        {/* Store Logo */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Store Logo</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-[var(--muted)] rounded-lg flex items-center justify-center text-4xl">
              {sellerProfile.logoUrl ? (
                <img
                  src={sellerProfile.logoUrl}
                  alt="Store logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                "🏪"
              )}
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Logo upload coming soon. Currently managed via Stripe Connect.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Store Description</label>
              <textarea
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              />
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {storeDescription.length}/500 characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={storeLocation}
                onChange={(e) => setStoreLocation(e.target.value)}
                placeholder="City, State"
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Website</label>
              <input
                type="url"
                value={storeWebsite}
                onChange={(e) => setStoreWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Account Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--muted-foreground)]">Approved:</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  sellerProfile.isApproved
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
              >
                {sellerProfile.isApproved ? "Yes" : "Pending"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--muted-foreground)]">Active:</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  sellerProfile.isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                }`}
              >
                {sellerProfile.isActive ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--muted-foreground)]">Stripe:</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  sellerProfile.stripeOnboarded
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
              >
                {sellerProfile.stripeOnboarded ? "Connected" : "Not Connected"}
              </span>
            </div>
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
