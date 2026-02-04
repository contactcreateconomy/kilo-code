import Stripe from "stripe";

/**
 * Stripe Client Initialization and Helper Functions
 *
 * This module provides the Stripe client instance and utility functions
 * for common Stripe operations in the Createconomy marketplace.
 */

// ============================================================================
// Stripe Client
// ============================================================================

/**
 * Initialize Stripe client with the secret key
 * Uses API version 2024-12-18.acacia as specified
 */
export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-01-28.clover",
    typescript: true,
  });
}

// ============================================================================
// Price Formatting Utilities
// ============================================================================

/**
 * Convert amount from cents to dollars
 * @param amountInCents - Amount in cents
 * @returns Amount in dollars
 */
export function centsToDollars(amountInCents: number): number {
  return amountInCents / 100;
}

/**
 * Convert amount from dollars to cents
 * @param amountInDollars - Amount in dollars
 * @returns Amount in cents (rounded to nearest integer)
 */
export function dollarsToCents(amountInDollars: number): number {
  return Math.round(amountInDollars * 100);
}

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

  return formatter.format(centsToDollars(amountInCents));
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
// Currency Handling
// ============================================================================

/**
 * Supported currencies for the marketplace
 */
export const SUPPORTED_CURRENCIES = ["usd", "eur", "gbp", "cad", "aud"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

/**
 * Check if a currency is supported
 * @param currency - Currency code to check
 * @returns True if currency is supported
 */
export function isSupportedCurrency(currency: string): currency is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(currency.toLowerCase() as SupportedCurrency);
}

/**
 * Get currency symbol
 * @param currency - Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    usd: "$",
    eur: "€",
    gbp: "£",
    cad: "C$",
    aud: "A$",
  };

  return symbols[currency.toLowerCase()] || currency.toUpperCase();
}

/**
 * Get minimum charge amount for a currency (in cents)
 * Stripe has minimum charge amounts per currency
 * @param currency - Currency code
 * @returns Minimum charge amount in cents
 */
export function getMinimumChargeAmount(currency: string): number {
  const minimums: Record<string, number> = {
    usd: 50, // $0.50
    eur: 50, // €0.50
    gbp: 30, // £0.30
    cad: 50, // C$0.50
    aud: 50, // A$0.50
  };

  return minimums[currency.toLowerCase()] || 50;
}

// ============================================================================
// Webhook Signature Verification
// ============================================================================

/**
 * Verify Stripe webhook signature
 * @param payload - Raw request body
 * @param signature - Stripe signature header
 * @param webhookSecret - Webhook endpoint secret
 * @returns Verified Stripe event
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  const stripe = getStripeClient();

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Webhook signature verification failed: ${message}`);
  }
}

// ============================================================================
// Checkout Session Helpers
// ============================================================================

/**
 * Line item for checkout session
 */
export interface CheckoutLineItem {
  name: string;
  description?: string;
  imageUrl?: string;
  priceInCents: number;
  quantity: number;
  productId?: string;
}

/**
 * Build Stripe line items from checkout items
 * @param items - Checkout line items
 * @param currency - Currency code
 * @returns Stripe line items
 */
export function buildStripeLineItems(
  items: CheckoutLineItem[],
  currency: string = "usd"
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return items.map((item) => ({
    price_data: {
      currency: currency.toLowerCase(),
      product_data: {
        name: item.name,
        description: item.description,
        images: item.imageUrl ? [item.imageUrl] : undefined,
        metadata: item.productId ? { productId: item.productId } : undefined,
      },
      unit_amount: item.priceInCents,
    },
    quantity: item.quantity,
  }));
}

/**
 * Calculate total amount from line items
 * @param items - Checkout line items
 * @returns Total amount in cents
 */
export function calculateTotalAmount(items: CheckoutLineItem[]): number {
  return items.reduce((total, item) => total + item.priceInCents * item.quantity, 0);
}

// ============================================================================
// Connect Account Helpers
// ============================================================================

/**
 * Stripe Connect account types
 */
export type ConnectAccountType = "standard" | "express" | "custom";

/**
 * Get Connect account capabilities based on type
 * @param accountType - Connect account type
 * @returns Capabilities object
 */
export function getConnectCapabilities(
  accountType: ConnectAccountType
): Stripe.AccountCreateParams.Capabilities {
  // For marketplace, we typically use express accounts with card payments and transfers
  return {
    card_payments: { requested: true },
    transfers: { requested: true },
  };
}

/**
 * Check if Connect account is fully onboarded
 * @param account - Stripe Connect account
 * @returns True if account is fully onboarded
 */
export function isAccountOnboarded(account: Stripe.Account): boolean {
  return (
    account.charges_enabled === true &&
    account.payouts_enabled === true &&
    account.details_submitted === true
  );
}

/**
 * Get account onboarding status
 * @param account - Stripe Connect account
 * @returns Status object with details
 */
export function getAccountOnboardingStatus(account: Stripe.Account): {
  isComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: string[];
} {
  return {
    isComplete: isAccountOnboarded(account),
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
    requirements: [
      ...(account.requirements?.currently_due ?? []),
      ...(account.requirements?.eventually_due ?? []),
    ],
  };
}

// ============================================================================
// Payment Intent Helpers
// ============================================================================

/**
 * Calculate platform fee for a payment
 * @param amountInCents - Payment amount in cents
 * @param feePercentage - Platform fee percentage (e.g., 10 for 10%)
 * @returns Platform fee in cents
 */
export function calculatePlatformFee(
  amountInCents: number,
  feePercentage: number = 10
): number {
  return Math.round(amountInCents * (feePercentage / 100));
}

/**
 * Build payment intent metadata
 * @param data - Metadata fields
 * @returns Stripe metadata object
 */
export function buildPaymentMetadata(data: {
  orderId?: string;
  userId?: string;
  sellerId?: string;
  productIds?: string[];
  tenantId?: string;
}): Stripe.MetadataParam {
  const metadata: Stripe.MetadataParam = {};

  if (data.orderId) metadata.orderId = data.orderId;
  if (data.userId) metadata.userId = data.userId;
  if (data.sellerId) metadata.sellerId = data.sellerId;
  if (data.productIds) metadata.productIds = data.productIds.join(",");
  if (data.tenantId) metadata.tenantId = data.tenantId;

  return metadata;
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Stripe error types
 */
export type StripeErrorType =
  | "card_error"
  | "validation_error"
  | "api_error"
  | "authentication_error"
  | "rate_limit_error"
  | "idempotency_error"
  | "invalid_request_error";

/**
 * Parse Stripe error into user-friendly message
 * @param error - Stripe error
 * @returns User-friendly error message
 */
export function parseStripeError(error: unknown): {
  type: StripeErrorType | "unknown";
  message: string;
  code?: string;
} {
  if (error instanceof Stripe.errors.StripeError) {
    return {
      type: error.type as StripeErrorType,
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      type: "unknown",
      message: error.message,
    };
  }

  return {
    type: "unknown",
    message: "An unexpected error occurred",
  };
}

/**
 * Get user-friendly error message for card errors
 * @param code - Stripe error code
 * @returns User-friendly message
 */
export function getCardErrorMessage(code?: string): string {
  const messages: Record<string, string> = {
    card_declined: "Your card was declined. Please try a different card.",
    expired_card: "Your card has expired. Please use a different card.",
    incorrect_cvc: "The CVC code is incorrect. Please check and try again.",
    incorrect_number: "The card number is incorrect. Please check and try again.",
    insufficient_funds: "Your card has insufficient funds.",
    invalid_cvc: "The CVC code is invalid. Please check and try again.",
    invalid_expiry_month: "The expiration month is invalid.",
    invalid_expiry_year: "The expiration year is invalid.",
    invalid_number: "The card number is invalid.",
    processing_error: "An error occurred while processing your card. Please try again.",
  };

  return messages[code ?? ""] || "Your card could not be processed. Please try again.";
}
