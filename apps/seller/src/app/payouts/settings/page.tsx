"use client";

import { useState } from "react";

export default function PayoutSettingsPage() {
  const [bankName, setBankName] = useState("Chase Bank");
  const [accountNumber, setAccountNumber] = useState("****4567");
  const [routingNumber, setRoutingNumber] = useState("****8901");
  const [accountHolder, setAccountHolder] = useState("John Doe");
  const [payoutSchedule, setPayoutSchedule] = useState("weekly");
  const [minimumPayout, setMinimumPayout] = useState("50");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Payout settings updated");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Payout Settings</h1>
        <p className="text-[var(--muted-foreground)]">
          Configure how and when you receive your earnings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bank Account Information */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Bank Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Account Holder Name</label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Enter account number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Routing Number</label>
              <input
                type="text"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Enter routing number"
              />
            </div>
          </div>
        </div>

        {/* Payout Preferences */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Payout Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Payout Schedule</label>
              <select
                value={payoutSchedule}
                onChange={(e) => setPayoutSchedule(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Minimum Payout Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">$</span>
                <input
                  type="number"
                  value={minimumPayout}
                  onChange={(e) => setMinimumPayout(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  min="10"
                />
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Minimum $10.00 required
              </p>
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Tax Information</h2>
          <div className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-lg">
            <div>
              <p className="font-medium">W-9 Form</p>
              <p className="text-sm text-[var(--muted-foreground)]">Required for US sellers</p>
            </div>
            <span className="status-badge status-active">Verified</span>
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
