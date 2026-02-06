import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Stripe Connect API Route
 *
 * Handles Stripe Connect account creation and onboarding for sellers.
 * POST /api/stripe/connect - Create Connect account and get onboarding URL
 */

// Initialize Stripe
const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"]!, {
  apiVersion: "2026-01-28.clover",
});

/**
 * Create Stripe Connect account and return onboarding URL
 */
export async function POST(request: NextRequest) {
  try {
    // In production, get seller info from session/auth
    const body = await request.json().catch(() => ({}));
    const { email, sellerId, businessType = "individual" } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Get base URL for return/refresh URLs
    const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || request.headers.get("origin") || "http://localhost:3003";

    // Create Express Connect account
    const account = await stripe.accounts.create({
      type: "express",
      email,
      business_type: businessType as Stripe.AccountCreateParams.BusinessType,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        sellerId: sellerId || "",
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${baseUrl}/payouts?refresh=true`,
      return_url: `${baseUrl}/payouts?success=true`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error("Stripe Connect error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create Connect account" },
      { status: 500 }
    );
  }
}

/**
 * Get Connect account status
 * GET /api/stripe/connect?accountId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const account = await stripe.accounts.retrieve(accountId);

    return NextResponse.json({
      hasAccount: true,
      accountId: account.id,
      isOnboarded: account.charges_enabled && account.payouts_enabled && account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
      },
    });
  } catch (error) {
    console.error("Get Connect status error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      if (error.code === "resource_missing") {
        return NextResponse.json({
          hasAccount: false,
          isOnboarded: false,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
        });
      }

      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to get account status" },
      { status: 500 }
    );
  }
}
