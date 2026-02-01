import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@createconomy/convex";

/**
 * Admin Refund API Route
 *
 * Handles refund requests from admin dashboard.
 * Validates admin role before processing.
 */

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Refund request body type
interface RefundRequest {
  orderId: string;
  paymentIntentId: string;
  amount?: number; // Optional: partial refund amount in cents
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
  notes?: string;
}

/**
 * POST /api/stripe/refund
 *
 * Process a refund for an order.
 * Admin only endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate and verify admin role
    const { userId, sessionClaims } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check admin role from session claims
    const userRole = sessionClaims?.metadata?.role as string | undefined;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Admin access required" },
        { status: 403 }
      );
    }

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
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
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
    const existingRefunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
    });

    const totalRefunded = existingRefunds.data.reduce(
      (sum, refund) => sum + (refund.status === "succeeded" ? refund.amount : 0),
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
    const refund = await stripe.refunds.create({
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

    // Update order status in Convex
    try {
      await convex.mutation(api.functions.stripe.updateOrderRefundStatus, {
        orderId,
        refundId: refund.id,
        refundAmount: refundAmount,
        refundStatus: refund.status,
        isPartialRefund: refundAmount < paymentIntent.amount,
        adminUserId: userId,
        notes: notes || undefined,
      });
    } catch (convexError) {
      console.error("Failed to update order in Convex:", convexError);
      // Don't fail the request - refund was successful
      // Log for manual reconciliation
    }

    // Log the refund action for audit
    console.log("Refund processed:", {
      refundId: refund.id,
      orderId,
      paymentIntentId,
      amount: refundAmount,
      adminUserId: userId,
      timestamp: new Date().toISOString(),
    });

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
    // Authenticate and verify admin role
    const { userId, sessionClaims } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check admin role
    const userRole = sessionClaims?.metadata?.role as string | undefined;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Admin access required" },
        { status: 403 }
      );
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
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Get all refunds for this payment
    const refunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
    });

    const totalRefunded = refunds.data.reduce(
      (sum, refund) => sum + (refund.status === "succeeded" ? refund.amount : 0),
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
      refunds: refunds.data.map((refund) => ({
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
