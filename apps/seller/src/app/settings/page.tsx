"use client";

import { useState } from "react";

export default function StoreSettingsPage() {
  const [storeName, setStoreName] = useState("Artisan Crafts Co.");
  const [storeDescription, setStoreDescription] = useState(
    "Handcrafted goods made with love and care. We specialize in unique, artisanal products that bring warmth to your home."
  );
  const [storeEmail, setStoreEmail] = useState("contact@artisancrafts.com");
  const [storePhone, setStorePhone] = useState("+1 (555) 123-4567");
  const [storeWebsite, setStoreWebsite] = useState("https://artisancrafts.com");
  const [storeLocation, setStoreLocation] = useState("Portland, Oregon");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Store settings updated");
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Logo */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Store Logo</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-[var(--muted)] rounded-lg flex items-center justify-center text-4xl">
              🏪
            </div>
            <div>
              <button
                type="button"
                className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity"
              >
                Upload Logo
              </button>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Recommended: 400x400px, PNG or JPG
              </p>
            </div>
          </div>
        </div>

        {/* Store Banner */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Store Banner</h2>
          <div className="w-full h-32 bg-[var(--muted)] rounded-lg flex items-center justify-center">
            <button
              type="button"
              className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--background)] transition-colors"
            >
              Upload Banner Image
            </button>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Recommended: 1200x300px, PNG or JPG
          </p>
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
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
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
