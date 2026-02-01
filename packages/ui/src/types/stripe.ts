/**
 * Shared Stripe TypeScript Types
 *
 * These types are used across all apps (marketplace, seller, admin)
 * for consistent Stripe integration.
 */

// ============================================================================
// Checkout Session Types
// ============================================================================

/**
 * Checkout session status
 */
export type CheckoutSessionStatus =
  | "open"
  | "complete"
  | "expired";

/**
 * Payment status for checkout sessions
 */
export type CheckoutPaymentStatus =
  | "paid"
  | "unpaid"
  | "no_payment_required";

/**
 * Checkout session data returned from API
 */
export interface CheckoutSession {
  id: string;
  url: string | null;
  status: CheckoutSessionStatus;
  paymentStatus: CheckoutPaymentStatus;
  amountTotal: number | null;
  currency: string | null;
  customerEmail: string | null;
  metadata: Record<string, string>;
  createdAt: number;
  expiresAt: number;
}

/**
 * Line item for checkout session
 */
export interface CheckoutLineItem {
  productId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  priceInCents: number;
  quantity: number;
  sellerId?: string;
}

/**
 * Request to create a checkout session
 */
export interface CreateCheckoutSessionRequest {
  items: CheckoutLineItem[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

/**
 * Response from creating a checkout session
 */
export interface CreateCheckoutSessionResponse {
  success: boolean;
  sessionId?: string;
  sessionUrl?: string;
  error?: string;
}

/**
 * Checkout verification result
 */
export interface CheckoutVerificationResult {
  success: boolean;
  session?: CheckoutSession;
  orderId?: string;
  error?: string;
}

// ============================================================================
// Payment Intent Types
// ============================================================================

/**
 * Payment intent status
 */
export type PaymentIntentStatus =
  | "requires_payment_method"
  | "requires_confirmation"
  | "requires_action"
  | "processing"
  | "requires_capture"
  | "canceled"
  | "succeeded";

/**
 * Payment intent data
 */
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  clientSecret: string | null;
  customerId: string | null;
  metadata: Record<string, string>;
  createdAt: number;
}

/**
 * Payment method types
 */
export type PaymentMethodType =
  | "card"
  | "bank_transfer"
  | "us_bank_account"
  | "sepa_debit"
  | "ideal"
  | "sofort"
  | "giropay"
  | "eps"
  | "p24"
  | "bancontact"
  | "alipay"
  | "wechat_pay";

// ============================================================================
// Customer Types
// ============================================================================

/**
 * Stripe customer data
 */
export interface StripeCustomer {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  metadata: Record<string, string>;
  createdAt: number;
  defaultPaymentMethodId: string | null;
}

/**
 * Customer creation request
 */
export interface CreateCustomerRequest {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

// ============================================================================
// Connect Account Types
// ============================================================================

/**
 * Connect account type
 */
export type ConnectAccountType = "express" | "standard" | "custom";

/**
 * Connect account status
 */
export interface ConnectAccountStatus {
  hasAccount: boolean;
  accountId?: string;
  isOnboarded: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requiresAction: boolean;
  requirements?: ConnectAccountRequirements;
}

/**
 * Connect account requirements
 */
export interface ConnectAccountRequirements {
  currentlyDue: string[];
  eventuallyDue: string[];
  pastDue: string[];
  pendingVerification: string[];
  disabledReason: string | null;
}

/**
 * Full Connect account data
 */
export interface ConnectAccount {
  id: string;
  type: ConnectAccountType;
  email: string | null;
  businessProfile: {
    name: string | null;
    url: string | null;
    supportEmail: string | null;
    supportPhone: string | null;
  };
  capabilities: {
    cardPayments: "active" | "inactive" | "pending";
    transfers: "active" | "inactive" | "pending";
  };
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  metadata: Record<string, string>;
  createdAt: number;
}

/**
 * Connect onboarding link response
 */
export interface ConnectOnboardingLink {
  url: string;
  expiresAt: number;
}

/**
 * Connect dashboard link response
 */
export interface ConnectDashboardLink {
  url: string;
}

// ============================================================================
// Payout Types
// ============================================================================

/**
 * Payout status
 */
export type PayoutStatus =
  | "paid"
  | "pending"
  | "in_transit"
  | "canceled"
  | "failed";

/**
 * Payout method
 */
export type PayoutMethod = "standard" | "instant";

/**
 * Payout data
 */
export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  method: PayoutMethod;
  arrivalDate: number;
  createdAt: number;
  description: string | null;
  metadata: Record<string, string>;
}

/**
 * Account balance
 */
export interface AccountBalance {
  available: BalanceAmount[];
  pending: BalanceAmount[];
  connectReserved?: BalanceAmount[];
}

/**
 * Balance amount by currency
 */
export interface BalanceAmount {
  amount: number;
  currency: string;
  sourceTypes?: {
    card?: number;
    bankAccount?: number;
  };
}

// ============================================================================
// Refund Types
// ============================================================================

/**
 * Refund status
 */
export type RefundStatus =
  | "pending"
  | "requires_action"
  | "succeeded"
  | "failed"
  | "canceled";

/**
 * Refund reason
 */
export type RefundReason =
  | "duplicate"
  | "fraudulent"
  | "requested_by_customer";

/**
 * Refund data
 */
export interface Refund {
  id: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason: RefundReason | null;
  paymentIntentId: string;
  createdAt: number;
  metadata: Record<string, string>;
}

/**
 * Refund request
 */
export interface RefundRequest {
  paymentIntentId: string;
  amount?: number; // Partial refund amount in cents
  reason?: RefundReason;
  metadata?: Record<string, string>;
}

/**
 * Refund response
 */
export interface RefundResponse {
  success: boolean;
  refund?: Refund;
  error?: string;
}

// ============================================================================
// Dispute Types
// ============================================================================

/**
 * Dispute status
 */
export type DisputeStatus =
  | "warning_needs_response"
  | "warning_under_review"
  | "warning_closed"
  | "needs_response"
  | "under_review"
  | "charge_refunded"
  | "won"
  | "lost";

/**
 * Dispute reason
 */
export type DisputeReason =
  | "bank_cannot_process"
  | "check_returned"
  | "credit_not_processed"
  | "customer_initiated"
  | "debit_not_authorized"
  | "duplicate"
  | "fraudulent"
  | "general"
  | "incorrect_account_details"
  | "insufficient_funds"
  | "product_not_received"
  | "product_unacceptable"
  | "subscription_canceled"
  | "unrecognized";

/**
 * Dispute data
 */
export interface Dispute {
  id: string;
  amount: number;
  currency: string;
  status: DisputeStatus;
  reason: DisputeReason;
  paymentIntentId: string | null;
  chargeId: string;
  createdAt: number;
  evidenceDueBy: number | null;
  isChargeRefundable: boolean;
  metadata: Record<string, string>;
}

// ============================================================================
// Webhook Event Types
// ============================================================================

/**
 * Webhook event types we handle
 */
export type WebhookEventType =
  // Checkout events
  | "checkout.session.completed"
  | "checkout.session.expired"
  | "checkout.session.async_payment_succeeded"
  | "checkout.session.async_payment_failed"
  // Payment intent events
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"
  | "payment_intent.canceled"
  | "payment_intent.requires_action"
  // Refund events
  | "charge.refunded"
  | "charge.refund.updated"
  // Connect events
  | "account.updated"
  | "account.application.authorized"
  | "account.application.deauthorized"
  // Payout events
  | "payout.created"
  | "payout.paid"
  | "payout.failed"
  | "payout.canceled"
  // Dispute events
  | "charge.dispute.created"
  | "charge.dispute.updated"
  | "charge.dispute.closed"
  // Customer events
  | "customer.created"
  | "customer.updated"
  | "customer.deleted";

/**
 * Webhook event data
 */
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: {
    object: Record<string, unknown>;
    previousAttributes?: Record<string, unknown>;
  };
  createdAt: number;
  livemode: boolean;
  apiVersion: string;
}

/**
 * Webhook handler result
 */
export interface WebhookHandlerResult {
  success: boolean;
  message?: string;
  error?: string;
}

// ============================================================================
// Price & Currency Types
// ============================================================================

/**
 * Supported currencies
 */
export type SupportedCurrency =
  | "usd"
  | "eur"
  | "gbp"
  | "cad"
  | "aud"
  | "jpy"
  | "inr";

/**
 * Currency configuration
 */
export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  decimalPlaces: number;
  minAmount: number; // Minimum charge amount in cents
}

/**
 * Price display options
 */
export interface PriceDisplayOptions {
  currency?: SupportedCurrency;
  locale?: string;
  showCurrencyCode?: boolean;
}

/**
 * Formatted price
 */
export interface FormattedPrice {
  amount: number;
  currency: SupportedCurrency;
  formatted: string;
  symbol: string;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Stripe error codes
 */
export type StripeErrorCode =
  | "card_declined"
  | "expired_card"
  | "incorrect_cvc"
  | "incorrect_number"
  | "insufficient_funds"
  | "invalid_expiry_month"
  | "invalid_expiry_year"
  | "processing_error"
  | "rate_limit"
  | "authentication_required";

/**
 * Stripe error
 */
export interface StripeError {
  type: "api_error" | "card_error" | "idempotency_error" | "invalid_request_error";
  code?: StripeErrorCode;
  message: string;
  param?: string;
  declineCode?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Pagination params for list endpoints
 */
export interface StripePaginationParams {
  limit?: number;
  startingAfter?: string;
  endingBefore?: string;
}

/**
 * Paginated list response
 */
export interface StripePaginatedList<T> {
  data: T[];
  hasMore: boolean;
  totalCount?: number;
}

/**
 * Metadata type (string key-value pairs)
 */
export type StripeMetadata = Record<string, string>;

/**
 * Timestamp (Unix timestamp in seconds)
 */
export type StripeTimestamp = number;

// ============================================================================
// Re-exports for convenience
// ============================================================================

export type {
  CheckoutSession as StripeCheckoutSession,
  PaymentIntent as StripePaymentIntent,
  ConnectAccount as StripeConnectAccount,
  Payout as StripePayout,
  Refund as StripeRefund,
  Dispute as StripeDispute,
};
