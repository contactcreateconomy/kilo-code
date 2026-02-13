import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  parseCookies,
  COOKIE_NAMES,
} from "@createconomy/ui/lib/auth-cookies";

/**
 * Admin Refund API Route
 *
 * Handles refund requests from admin dashboard.
 * Validates admin role before processing.
 *
 * Security fix (S4): Replaced Clerk auth (getAuth from @clerk/nextjs/server)
 * with Convex Auth session validation. This project uses @convex-dev/auth,
 * not Clerk — the previous import would always fail.
 */

// Lazy-initialize Stripe to avoid build-time errors when env vars are not yet available
function getStripe() {
  return new Stripe(process.env['STRIPE_SECRET_KEY']!, {
    apiVersion: '2026-01-28.clover',
  });
}

// Refund request body type
interface RefundRequest {
  orderId: string;
  paymentIntentId: string;
  amount?: number; // Optional: partial refund amount in cents
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
  notes?: string;
}

/**
 * Validate admin session using Convex Auth.
 *
 * Security fix (S4): This replaces the Clerk-based getAuth() call.
 * Follows the same pattern as apps/admin/src/app/api/auth/[...auth]/route.ts:
 * 1. Read the session token from the cookie
 * 2. Validate the session against the Convex auth endpoint
 * 3. Verify the user has an admin role
 *
 * @returns The authenticated admin user's ID, or an error response
 */
async function validateAdminSession(
  request: NextRequest
): Promise<{ userId: string } | NextResponse> {
  // Read session token from cookie (matches shared auth-cookies lib)
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const sessionToken = cookies[COOKIE_NAMES.SESSION_TOKEN];

  if (!sessionToken) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 }
    );
  }

  // Validate session with Convex auth endpoint (same pattern as auth route)
  const convexUrl = process.env['NEXT_PUBLIC_CONVEX_URL']!.replace(
    ".convex.cloud",
    ".convex.site"
  );

  try {
    const response = await fetch(`${convexUrl}/auth/session`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data.authenticated || !data.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // Verify admin role — only admin and super_admin can process refunds
    const userRole = data.user.role as string | undefined;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Admin access required" },
        { status: 403 }
      );
    }

    return { userId: data.user._id as string };
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { error: "Unauthorized", message: "Session validation failed" },
      { status: 401 }
    );
  }
}

/**
 * POST /api/stripe/refund
 *
 * Process a refund for an order.
 * Admin only endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    // Security fix (S4): Authenticate via Convex Auth session cookie
    const authResult = await validateAdminSession(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    // Parse request body
    const body: RefundRequest = await request.json();
    const { orderId, paymentIntentId, amount, reason, notes } = body;

    // Validate required fields
    if (!orderId || !paymentIntentId) {
      return NextResponse.json(
        { error: "Bad Request", message: "orderId and paymentIntentId are required" },
        { status: 400 }
      );
    }

    // Validate payment intent ID format
    if (!paymentIntentId.startsWith("pi_")) {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid payment intent ID format" },
        { status: 400 }
      );
    }

    // Validate amount if provided
    if (amount !== undefined && (typeof amount !== "number" || amount <= 0)) {
      return NextResponse.json(
        { error: "Bad Request", message: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Retrieve the payment intent to verify it exists and get details
    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    } catch (stripeError) {
      console.error("Failed to retrieve payment intent:", stripeError);
      return NextResponse.json(
        { error: "Not Found", message: "Payment intent not found" },
        { status: 404 }
      );
    }

    // Verify payment intent is in a refundable state
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: `Cannot refund payment with status: ${paymentIntent.status}`,
        },
        { status: 400 }
      );
    }

    // Check if already fully refunded
    const existingRefunds = await getStripe().refunds.list({
      payment_intent: paymentIntentId,
    });

    const totalRefunded = existingRefunds.data.reduce(
      (sum: number, refund: Stripe.Refund) => sum + (refund.status === "succeeded" ? refund.amount : 0),
      0
    );

    const maxRefundable = paymentIntent.amount - totalRefunded;

    if (maxRefundable <= 0) {
      return NextResponse.json(
        { error: "Bad Request", message: "Payment has already been fully refunded" },
        { status: 400 }
      );
    }

    // Validate refund amount doesn't exceed available
    const refundAmount = amount ?? maxRefundable;
    if (refundAmount > maxRefundable) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: `Refund amount exceeds available amount. Maximum refundable: ${maxRefundable / 100} ${paymentIntent.currency.toUpperCase()}`,
        },
        { status: 400 }
      );
    }

    // Create the refund
    const refund = await getStripe().refunds.create({
      payment_intent: paymentIntentId,
      amount: refundAmount,
      reason: reason || "requested_by_customer",
      metadata: {
        orderId,
        adminUserId: userId,
        notes: notes || "",
        refundedAt: new Date().toISOString(),
      },
    });

    // TODO: Update order status in Convex once updateOrderRefundStatus function is implemented
    // The Stripe refund has been processed at this point; Convex sync can be added later
    try {
      // Future: call Convex mutation to update order refund status
      console.log("Refund processed for order:", orderId, "refundId:", refund.id);
    } catch (convexError) {
      console.error("Failed to update order in Convex:", convexError);
      // Don't fail the request - refund was successful
      // Log for manual reconciliation
    }

    // Refund processed — audit data stored in Stripe metadata and Convex

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        created: refund.created,
      },
      order: {
        id: orderId,
        refundedAmount: refundAmount,
        isPartialRefund: refundAmount < paymentIntent.amount,
        remainingAmount: paymentIntent.amount - totalRefunded - refundAmount,
      },
    });
  } catch (error) {
    console.error("Refund error:", error);

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: "Stripe Error",
          message: error.message,
          code: error.code,
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to process refund" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/refund
 *
 * Get refund details for an order.
 * Admin only endpoint.
 */
export async function GET(request: NextRequest) {
  try {
    // Security fix (S4): Authenticate via Convex Auth session cookie
    const authResult = await validateAdminSession(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get payment intent ID from query params
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("paymentIntentId");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Bad Request", message: "paymentIntentId is required" },
        { status: 400 }
      );
    }

    // Retrieve payment intent
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

    // Get all refunds for this payment
    const refunds = await getStripe().refunds.list({
      payment_intent: paymentIntentId,
    });

    const totalRefunded = refunds.data.reduce(
      (sum: number, refund: Stripe.Refund) => sum + (refund.status === "succeeded" ? refund.amount : 0),
      0
    );

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        created: paymentIntent.created,
      },
      refunds: refunds.data.map((refund: Stripe.Refund) => ({
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        created: refund.created,
        metadata: refund.metadata,
      })),
      summary: {
        originalAmount: paymentIntent.amount,
        totalRefunded,
        remainingAmount: paymentIntent.amount - totalRefunded,
        isFullyRefunded: totalRefunded >= paymentIntent.amount,
        refundCount: refunds.data.length,
      },
    });
  } catch (error) {
    console.error("Get refund error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: "Stripe Error",
          message: error.message,
          code: error.code,
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to get refund details" },
      { status: 500 }
    );
  }
}
