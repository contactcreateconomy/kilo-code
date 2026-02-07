"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactSupportPage() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [priority, setPriority] = useState("normal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit support ticket via Convex mutation
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/support" className="hover:text-[var(--foreground)]">
          Help Center
        </Link>
        <span>/</span>
        <span>Contact Support</span>
      </nav>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Contact Support</h1>
        <p className="text-[var(--muted-foreground)]">
          Submit a support ticket and we'll get back to you within 24 hours
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="seller-card space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Select a category</option>
                <option value="orders">Orders & Shipping</option>
                <option value="products">Products & Inventory</option>
                <option value="payments">Payments & Payouts</option>
                <option value="account">Account & Settings</option>
                <option value="technical">Technical Issues</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="Brief description of your issue"
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Related Order ID (optional)
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., ORD-12345"
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <div className="flex gap-4">
                {["low", "normal", "high", "urgent"].map((p) => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={priority === p}
                      onChange={(e) => setPriority(e.target.value)}
                      className="text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span className="capitalize">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                placeholder="Please describe your issue in detail..."
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              />
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {message.length}/2000 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Attachments (optional)
              </label>
              <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center">
                <svg
                  className="w-8 h-8 mx-auto text-[var(--muted-foreground)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Max 5 files, 10MB each (PNG, JPG, PDF)
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link
                href="/support"
                className="px-6 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact Info */}
          <div className="seller-card">
            <h3 className="font-semibold mb-4">Other Ways to Reach Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">📧</span>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Email</p>
                  <p className="font-medium">seller-support@createconomy.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">💬</span>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Live Chat</p>
                  <p className="font-medium">Available 9am - 6pm EST</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">📞</span>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Phone</p>
                  <p className="font-medium">1-800-CREATE (Premium)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Response Times */}
          <div className="seller-card">
            <h3 className="font-semibold mb-4">Expected Response Times</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Low Priority</span>
                <span>48-72 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Normal Priority</span>
                <span>24-48 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">High Priority</span>
                <span>12-24 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Urgent</span>
                <span>4-8 hours</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="seller-card bg-[var(--muted)]">
            <h3 className="font-semibold mb-3">Tips for Faster Resolution</h3>
            <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <li>• Include relevant order or product IDs</li>
              <li>• Attach screenshots if applicable</li>
              <li>• Describe steps to reproduce the issue</li>
              <li>• Check our FAQ before submitting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
