/**
 * Seller-side Stripe Utilities
 *
 * This module provides utilities for Stripe Connect integration
 * for sellers in the Createconomy marketplace.
 */

// ============================================================================
// Stripe Connect Helpers
// ============================================================================

export interface ConnectAccountStatus {
  hasAccount: boolean;
  accountId?: string;
  isOnboarded: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

/**
 * Initiate Stripe Connect onboarding
 * @returns Onboarding URL to redirect the seller
 */
export async function initiateStripeConnect(): Promise<{
  success: boolean;
  onboardingUrl?: string;
  error?: string;
}> {
  try {
    const response = await fetch("/api/stripe/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to create Connect account" };
    }

    const data = await response.json();
    return { success: true, onboardingUrl: data.onboardingUrl };
  } catch (error) {
    console.error("Stripe Connect error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to initiate Stripe Connect",
    };
  }
}

/**
 * Get Stripe Connect account status
 * @returns Account status information
 */
export async function getConnectAccountStatus(): Promise<ConnectAccountStatus> {
  try {
    const response = await fetch("/api/stripe/connect/status");

    if (!response.ok) {
      return {
        hasAccount: false,
        isOnboarded: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to get Connect status:", error);
    return {
      hasAccount: false,
      isOnboarded: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    };
  }
}

/**
 * Get Stripe dashboard link for the seller
 * @returns Dashboard URL
 */
export async function getStripeDashboardLink(): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const response = await fetch("/api/stripe/connect/dashboard");

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to get dashboard link" };
    }

    const data = await response.json();
    return { success: true, url: data.url };
  } catch (error) {
    console.error("Dashboard link error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get dashboard link",
    };
  }
}

// ============================================================================
// Payout Status Helpers
// ============================================================================

export type PayoutStatus = "pending" | "in_transit" | "paid" | "failed" | "canceled";

export interface PayoutInfo {
  id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  arrivalDate: number;
  method: string;
  description?: string;
}

/**
 * Get payout history
 * @param limit - Number of payouts to fetch
 * @returns List of payouts
 */
export async function getPayoutHistory(limit: number = 10): Promise<{
  success: boolean;
  payouts?: PayoutInfo[];
  error?: string;
}> {
  try {
    const response = await fetch(`/api/stripe/payouts?limit=${limit}`);

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to fetch payouts" };
    }

    const data = await response.json();
    return { success: true, payouts: data.payouts };
  } catch (error) {
    console.error("Payout history error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch payouts",
    };
  }
}

/**
 * Get account balance
 * @returns Balance information
 */
export async function getAccountBalance(): Promise<{
  success: boolean;
  balance?: {
    available: number;
    pending: number;
    currency: string;
  };
  error?: string;
}> {
  try {
    const response = await fetch("/api/stripe/balance");

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to fetch balance" };
    }

    const data = await response.json();
    return { success: true, balance: data.balance };
  } catch (error) {
    console.error("Balance error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch balance",
    };
  }
}

// ============================================================================
// Price Formatting
// ============================================================================

/**
 * Format price for display
 * @param amountInCents - Amount in cents
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string
 */
export function formatPrice(
  amountInCents: number,
  currency: string = "usd"
): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  });

  return formatter.format(amountInCents / 100);
}

/**
 * Format price from dollars
 * @param amountInDollars - Amount in dollars
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string
 */
export function formatPriceFromDollars(
  amountInDollars: number,
  currency: string = "usd"
): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  });

  return formatter.format(amountInDollars);
}

// ============================================================================
// Status Helpers
// ============================================================================

/**
 * Get human-readable status label
 * @param status - Payout status
 * @returns Human-readable label
 */
export function getPayoutStatusLabel(status: PayoutStatus): string {
  const labels: Record<PayoutStatus, string> = {
    pending: "Pending",
    in_transit: "In Transit",
    paid: "Paid",
    failed: "Failed",
    canceled: "Canceled",
  };

  return labels[status] || status;
}

/**
 * Get status color class
 * @param status - Payout status
 * @returns Tailwind color class
 */
export function getPayoutStatusColor(status: PayoutStatus): string {
  const colors: Record<PayoutStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    in_transit: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    canceled: "bg-gray-100 text-gray-800",
  };

  return colors[status] || "bg-gray-100 text-gray-800";
}

/**
 * Get Connect account status label
 * @param status - Account status
 * @returns Human-readable label and color
 */
export function getConnectStatusInfo(status: ConnectAccountStatus): {
  label: string;
  color: string;
  description: string;
} {
  if (!status.hasAccount) {
    return {
      label: "Not Connected",
      color: "bg-gray-100 text-gray-800",
      description: "Connect your Stripe account to receive payouts",
    };
  }

  if (!status.detailsSubmitted) {
    return {
      label: "Incomplete",
      color: "bg-yellow-100 text-yellow-800",
      description: "Complete your Stripe account setup to receive payouts",
    };
  }

  if (!status.chargesEnabled || !status.payoutsEnabled) {
    return {
      label: "Pending Verification",
      color: "bg-blue-100 text-blue-800",
      description: "Your account is being verified by Stripe",
    };
  }

  return {
    label: "Active",
    color: "bg-green-100 text-green-800",
    description: "Your account is ready to receive payouts",
  };
}
