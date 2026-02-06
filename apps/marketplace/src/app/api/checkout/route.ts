import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Checkout API Route
 *
 * Creates a Stripe Checkout session for the provided cart items.
 * POST /api/checkout
 */

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

// Rate limiting map (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

interface CheckoutItem {
  productId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number; // in dollars
  quantity: number;
}

interface CheckoutRequestBody {
  items: CheckoutItem[];
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse request body
    const body: CheckoutRequestBody = await request.json();
    const { items, customerEmail, metadata } = body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided for checkout" },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.name || typeof item.price !== "number" || item.price <= 0) {
        return NextResponse.json(
          { error: "Invalid item data. Each item must have productId, name, and a positive price." },
          { status: 400 }
        );
      }

      if (!item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: "Invalid quantity. Each item must have a quantity of at least 1." },
          { status: 400 }
        );
      }
    }

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.description,
          images: item.imageUrl ? [item.imageUrl] : undefined,
          metadata: {
            productId: item.productId,
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert dollars to cents
      },
      quantity: item.quantity,
    }));

    // Get base URL for success/cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "http://localhost:3000";

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        productIds: items.map((i) => i.productId).join(","),
      },
      // Enable automatic tax calculation if configured
      // automatic_tax: { enabled: true },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Billing address collection
      billing_address_collection: "auto",
      // Shipping address collection (if needed)
      // shipping_address_collection: {
      //   allowed_countries: ["US", "CA", "GB"],
      // },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * Verify checkout session
 * GET /api/checkout?session_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    });

    return NextResponse.json({
      session: {
        id: session.id,
        paymentStatus: session.payment_status,
        status: session.status,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
        lineItems: session.line_items?.data.map((item) => ({
          name: item.description,
          quantity: item.quantity,
          amount: item.amount_total,
        })),
      },
    });
  } catch (error) {
    console.error("Session verification error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 }
    );
  }
}
