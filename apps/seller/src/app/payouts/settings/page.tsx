"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { Loader2, ExternalLink } from "lucide-react";

export default function PayoutSettingsPage() {
  const sellerProfile = useQuery(api.functions.users.getMySellerProfile, {});

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
        <p className="text-[var(--muted-foreground)]">No seller profile found.</p>
      </div>
    );
  }

  const isConnected = sellerProfile.stripeOnboarded;
  const stripeAccountId = sellerProfile.stripeAccountId;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Payout Settings</h1>
        <p className="text-[var(--muted-foreground)]">
          Manage your payout method and preferences through Stripe Connect
        </p>
      </div>

      {/* Stripe Connect Status */}
      <div className="seller-card">
        <h2 className="text-lg font-semibold mb-4">Stripe Connect Account</h2>
        <div className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-lg">
          <div>
            <p className="font-medium">Account Status</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {isConnected
                ? "Your Stripe Connect account is active and receiving payouts."
                : "Complete Stripe onboarding to receive payouts."}
            </p>
            {stripeAccountId && (
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Account ID: {stripeAccountId}
              </p>
            )}
          </div>
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              isConnected
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}
          >
            {isConnected ? "Connected" : "Not Connected"}
          </span>
        </div>
      </div>

      {/* Payout Information */}
      <div className="seller-card">
        <h2 className="text-lg font-semibold mb-4">Payout Details</h2>
        {isConnected ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              Bank account details, payout schedule, and tax information are managed directly
              through your Stripe Dashboard. Click below to access your full payout settings.
            </p>
            <a
              href="https://dashboard.stripe.com/settings/payouts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity"
            >
              Open Stripe Dashboard
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              You need to complete Stripe Connect onboarding before you can receive payouts.
              This will set up your bank account, identity verification, and tax information.
            </p>
            <a
              href="/payouts"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity"
            >
              Start Stripe Onboarding
            </a>
          </div>
        )}
      </div>

      {/* Payout Schedule Info */}
      <div className="seller-card">
        <h2 className="text-lg font-semibold mb-4">Payout Schedule</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-[var(--muted-foreground)]">Schedule</span>
            <span>{isConnected ? "Managed by Stripe" : "—"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-[var(--muted-foreground)]">Currency</span>
            <span>USD</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[var(--muted-foreground)]">Platform Fee</span>
            <span>Applied per transaction</span>
          </div>
        </div>
        <p className="text-xs text-[var(--muted-foreground)] mt-4">
          Payout schedule and minimum thresholds are configured in your Stripe Dashboard.
        </p>
      </div>

      {/* Tax Information */}
      <div className="seller-card">
        <h2 className="text-lg font-semibold mb-4">Tax Information</h2>
        <div className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-lg">
          <div>
            <p className="font-medium">Tax Forms</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {isConnected
                ? "Tax forms (W-9/W-8) are managed through Stripe."
                : "Complete onboarding to submit tax information."}
            </p>
          </div>
          {isConnected && (
            <a
              href="https://dashboard.stripe.com/settings/tax"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              Manage <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
