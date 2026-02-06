import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { getCorsHeaders, ALLOWED_ORIGINS } from "./auth.config";
import { auth } from "./auth";
import Stripe from "stripe";

/**
 * HTTP Routes for Createconomy
 *
 * This file configures HTTP endpoints for:
 * - Convex Auth OAuth routes
 * - Cross-subdomain authentication
 * - Stripe webhook handling
 * - Health check endpoint
 *
 * ## API Versioning Strategy (A7)
 *
 * All current routes are implicitly **v1**. They are NOT prefixed with `/v1/`
 * to avoid a breaking rename of existing endpoints that clients already use.
 *
 * ### When to version
 *
 * If a **breaking change** is needed (e.g. changing a response shape, removing
 * a field, renaming a route, or altering authentication semantics):
 *
 * 1. **Create new routes** under a `/v2/` prefix (e.g. `/v2/auth/session`).
 * 2. **Keep the original routes** unchanged so existing clients continue to work.
 * 3. Add a `Deprecation` response header to the old routes:
 *    `Deprecation: true` and `Sunset: <ISO-8601 date 6 months from now>`.
 * 4. Document the migration path in the CHANGELOG.
 *
 * ### Deprecation & sunset policy
 *
 * - Deprecated versions are supported for **6 months** after the successor
 *   version is released.
 * - After the sunset date, deprecated routes may return `410 Gone`.
 * - Announce deprecations in release notes, API docs, and via the
 *   `Deprecation` / `Sunset` response headers.
 *
 * ### Non-breaking changes (no new version needed)
 *
 * - Adding a new route
 * - Adding an optional field to a response
 * - Adding an optional query parameter
 * - Bug fixes that don't change the contract
 */

const http = httpRouter();

// ============================================================================
// Convex Auth Routes
// ============================================================================

/**
 * Add Convex Auth HTTP routes for OAuth providers
 * This handles routes like /api/auth/signin/google, /api/auth/callback/google, etc.
 */
auth.addHttpRoutes(http);

// ============================================================================
// CORS Helper
// ============================================================================

/**
 * Create a CORS-enabled response
 */
function corsResponse(
  body: string | null,
  status: number,
  origin: string | null,
  additionalHeaders?: Record<string, string>
): Response {
  const headers: Record<string, string> = {
    ...getCorsHeaders(origin),
    ...(additionalHeaders || {}),
  };

  if (body !== null) {
    headers["Content-Type"] = "application/json";
  }

  return new Response(body, { status, headers });
}

/**
 * Handle CORS preflight request
 */
function handlePreflight(origin: string | null): Response {
  return corsResponse(null, 204, origin);
}

// ============================================================================
// Health Check
// ============================================================================

/**
 * Health check endpoint
 * GET /health
 *
 * Returns a simple health status for monitoring
 */
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "createconomy-convex",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }),
});

// ============================================================================
// Cross-Subdomain Auth Endpoints
// ============================================================================

/**
 * Get session info
 * GET /auth/session
 *
 * Returns the current session information based on the session token
 */
http.route({
  path: "/auth/session",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("Origin");

    // Get session token from Authorization header or cookie
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return corsResponse(
        JSON.stringify({ authenticated: false, error: "No session token provided" }),
        200,
        origin
      );
    }

    try {
      // Validate the session
      const session = await ctx.runQuery(api.functions.sessions.validateSession, { token });

      if (!session) {
        return corsResponse(
          JSON.stringify({ authenticated: false, error: "Invalid or expired session" }),
          200,
          origin
        );
      }

      return corsResponse(
        JSON.stringify({
          authenticated: true,
          session: {
            userId: session.userId,
            tenantId: session.tenantId,
            role: session.role,
            expiresAt: session.expiresAt,
            user: session.user,
            needsRefresh: session.needsRefresh,
          },
        }),
        200,
        origin,
        {
          "X-Session-Expires": String(session.expiresAt),
        }
      );
    } catch (error) {
      console.error("Session validation error:", error);
      return corsResponse(
        JSON.stringify({ authenticated: false, error: "Session validation failed" }),
        500,
        origin
      );
    }
  }),
});

/**
 * Create a new session
 * POST /auth/session
 *
 * Creates a new cross-subdomain session after authentication.
 *
 * SECURITY FIX (S3): No longer accepts userId from the request body.
 * Instead, requires a valid Convex Auth token in the Authorization header
 * and derives the userId from the authenticated identity. This prevents
 * attackers from creating sessions for arbitrary users.
 */
http.route({
  path: "/auth/session",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("Origin");

    try {
      // SECURITY: Derive userId from authenticated identity instead of request body
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return corsResponse(
          JSON.stringify({ success: false, error: "Authentication required. Provide a valid Convex Auth token in the Authorization header." }),
          401,
          origin
        );
      }

      // Parse optional fields from request body (userId is no longer accepted)
      const body = await request.json().catch(() => ({}));
      const { tenantId } = body;

      // Derive userId from the authenticated identity's subject claim
      // The subject maps to the Convex user ID in @convex-dev/auth
      const userId = identity.subject;

      // Create the session using the internal mutation (server-side only, no public args for userId)
      const session = await ctx.runMutation(internal.functions.sessions.internalCreateSession, {
        userId: userId as never,
        tenantId,
        userAgent: request.headers.get("User-Agent") || undefined,
        ipAddress: request.headers.get("X-Forwarded-For") || undefined,
      });

      return corsResponse(
        JSON.stringify({
          success: true,
          session: {
            token: session.token,
            expiresAt: session.expiresAt,
          },
        }),
        201,
        origin,
        {
          "X-Session-Token": session.token,
          "X-Session-Expires": String(session.expiresAt),
        }
      );
    } catch (error) {
      console.error("Session creation error:", error);
      return corsResponse(
        JSON.stringify({ success: false, error: "Failed to create session" }),
        500,
        origin
      );
    }
  }),
});

/**
 * Refresh session
 * POST /auth/refresh
 *
 * Refreshes an existing session before it expires
 */
http.route({
  path: "/auth/refresh",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("Origin");

    // Get session token from Authorization header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return corsResponse(
        JSON.stringify({ success: false, error: "No session token provided" }),
        401,
        origin
      );
    }

    try {
      const body = await request.json().catch(() => ({}));
      const rotateToken = body.rotateToken ?? true;

      // Refresh the session
      const result = await ctx.runMutation(api.functions.sessions.refreshSession, {
        token,
        rotateToken,
      });

      if (!result.success || !result.session) {
        return corsResponse(
          JSON.stringify({ success: false, error: "Session refresh failed" }),
          401,
          origin
        );
      }

      return corsResponse(
        JSON.stringify({
          success: true,
          session: {
            token: result.session.token,
            userId: result.session.userId,
            tenantId: result.session.tenantId,
            role: result.session.role,
            expiresAt: result.session.expiresAt,
          },
        }),
        200,
        origin,
        {
          "X-Session-Token": result.session.token,
          "X-Session-Expires": String(result.session.expiresAt),
        }
      );
    } catch (error) {
      console.error("Session refresh error:", error);
      return corsResponse(
        JSON.stringify({ success: false, error: "Session refresh failed" }),
        500,
        origin
      );
    }
  }),
});

/**
 * Logout (revoke session)
 * POST /auth/logout
 *
 * Revokes the current session
 */
http.route({
  path: "/auth/logout",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("Origin");

    // Get session token from Authorization header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return corsResponse(
        JSON.stringify({ success: true, message: "No session to revoke" }),
        200,
        origin
      );
    }

    try {
      const body = await request.json().catch(() => ({}));
      const revokeAll = body.revokeAll ?? false;

      if (revokeAll) {
        // First validate the session to get the userId
        const session = await ctx.runQuery(api.functions.sessions.validateSession, { token });
        if (session) {
          await ctx.runMutation(api.functions.sessions.revokeAllSessions, {
            userId: session.userId,
          });
        }
      } else {
        // Revoke just this session
        await ctx.runMutation(api.functions.sessions.revokeSession, { token });
      }

      return corsResponse(
        JSON.stringify({ success: true, message: "Session revoked" }),
        200,
        origin
      );
    } catch (error) {
      console.error("Logout error:", error);
      return corsResponse(
        JSON.stringify({ success: false, error: "Logout failed" }),
        500,
        origin
      );
    }
  }),
});

/**
 * Get active sessions
 * GET /auth/sessions
 *
 * Returns all active sessions for the authenticated user
 */
http.route({
  path: "/auth/sessions",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("Origin");

    // Get session token from Authorization header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return corsResponse(
        JSON.stringify({ success: false, error: "Authentication required" }),
        401,
        origin
      );
    }

    try {
      // Validate the session to get the userId
      const session = await ctx.runQuery(api.functions.sessions.validateSession, { token });

      if (!session) {
        return corsResponse(
          JSON.stringify({ success: false, error: "Invalid session" }),
          401,
          origin
        );
      }

      // Get all active sessions
      const sessions = await ctx.runQuery(api.functions.sessions.getActiveSessions, {
        userId: session.userId,
      });

      return corsResponse(
        JSON.stringify({
          success: true,
          sessions,
          currentSessionId: session.sessionId,
        }),
        200,
        origin
      );
    } catch (error) {
      console.error("Get sessions error:", error);
      return corsResponse(
        JSON.stringify({ success: false, error: "Failed to get sessions" }),
        500,
        origin
      );
    }
  }),
});

// ============================================================================
// CORS Preflight Handlers for Auth Endpoints
// ============================================================================

http.route({
  path: "/auth/session",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    return handlePreflight(request.headers.get("Origin"));
  }),
});

http.route({
  path: "/auth/refresh",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    return handlePreflight(request.headers.get("Origin"));
  }),
});

http.route({
  path: "/auth/logout",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    return handlePreflight(request.headers.get("Origin"));
  }),
});

http.route({
  path: "/auth/sessions",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    return handlePreflight(request.headers.get("Origin"));
  }),
});

// ============================================================================
// Stripe Webhooks
// ============================================================================

/**
 * Verify Stripe webhook signature
 */
function verifyStripeSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): Stripe.Event | null {
  try {
    const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"]!, {
      apiVersion: "2026-01-28.clover",
    });
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe signature verification failed:", err);
    return null;
  }
}

/**
 * Stripe webhook endpoint
 * POST /webhooks/stripe
 *
 * Handles incoming Stripe webhook events with signature verification
 */
http.route({
  path: "/webhooks/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get webhook secret from environment
    const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify signature and parse event
    const event = verifyStripeSignature(body, signature, webhookSecret);

    if (!event) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      // Record the webhook event for idempotency
      const { alreadyProcessed, eventId } = await ctx.runMutation(
        internal.functions.stripe.recordWebhookEvent,
        {
          stripeEventId: event.id,
          type: event.type,
          // Security fix (S5): payload is now v.string() — serialize the Stripe event
          payload: JSON.stringify(event),
        }
      );

      if (alreadyProcessed) {
        return new Response(
          JSON.stringify({ received: true, message: "Event already processed" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Process the event based on type
      let error: string | undefined;

      try {
        switch (event.type) {
          // Checkout Session Events
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await ctx.runMutation(internal.functions.webhooks.handleCheckoutCompleted, {
              sessionId: session.id,
              paymentIntentId: session.payment_intent as string | undefined,
              customerId: session.customer as string | undefined,
              customerEmail: session.customer_email ?? undefined,
              amountTotal: session.amount_total ?? 0,
              currency: session.currency ?? "usd",
              paymentStatus: session.payment_status,
              metadata: session.metadata ?? undefined,
            });
            break;
          }

          case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            await ctx.runMutation(internal.functions.webhooks.handleCheckoutExpired, {
              sessionId: session.id,
            });
            break;
          }

          // Payment Intent Events
          case "payment_intent.succeeded": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const charge = paymentIntent.latest_charge as Stripe.Charge | null;
            await ctx.runMutation(internal.functions.webhooks.handlePaymentSucceeded, {
              paymentIntentId: paymentIntent.id,
              chargeId: charge?.id,
              receiptUrl: charge?.receipt_url ?? undefined,
              paymentMethod: paymentIntent.payment_method_types?.[0],
            });
            break;
          }

          case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            await ctx.runMutation(internal.functions.webhooks.handlePaymentFailed, {
              paymentIntentId: paymentIntent.id,
              failureCode: paymentIntent.last_payment_error?.code,
              failureMessage: paymentIntent.last_payment_error?.message,
            });
            break;
          }

          case "payment_intent.canceled": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            await ctx.runMutation(internal.functions.webhooks.handlePaymentCanceled, {
              paymentIntentId: paymentIntent.id,
            });
            break;
          }

          // Refund Events
          case "charge.refunded": {
            const charge = event.data.object as Stripe.Charge;
            const refund = charge.refunds?.data?.[0];
            if (refund && charge.payment_intent) {
              await ctx.runMutation(internal.functions.webhooks.handleRefundCreated, {
                paymentIntentId: charge.payment_intent as string,
                refundId: refund.id,
                amount: refund.amount,
                status: refund.status ?? "succeeded",
                reason: refund.reason ?? undefined,
              });
            }
            break;
          }

          // Connect Account Events
          case "account.updated": {
            const account = event.data.object as Stripe.Account;
            await ctx.runMutation(internal.functions.webhooks.handleConnectAccountUpdated, {
              accountId: account.id,
              chargesEnabled: account.charges_enabled ?? false,
              payoutsEnabled: account.payouts_enabled ?? false,
              detailsSubmitted: account.details_submitted ?? false,
            });
            break;
          }

          case "account.application.deauthorized": {
            const account = event.data.object as unknown as Stripe.Account;
            await ctx.runMutation(internal.functions.webhooks.handleConnectAccountDeauthorized, {
              accountId: account.id,
            });
            break;
          }

          // Dispute Events
          case "charge.dispute.created": {
            const dispute = event.data.object as Stripe.Dispute;
            await ctx.runMutation(internal.functions.webhooks.handleDisputeCreated, {
              disputeId: dispute.id,
              chargeId: dispute.charge as string,
              paymentIntentId: dispute.payment_intent as string | undefined,
              amount: dispute.amount,
              reason: dispute.reason,
              status: dispute.status,
            });
            break;
          }

          case "charge.dispute.updated": {
            const dispute = event.data.object as Stripe.Dispute;
            await ctx.runMutation(internal.functions.webhooks.handleDisputeUpdated, {
              disputeId: dispute.id,
              status: dispute.status,
            });
            break;
          }

          case "charge.dispute.closed": {
            const dispute = event.data.object as Stripe.Dispute;
            await ctx.runMutation(internal.functions.webhooks.handleDisputeClosed, {
              disputeId: dispute.id,
              status: dispute.status,
            });
            break;
          }

          // Customer Events
          case "customer.created": {
            const customer = event.data.object as Stripe.Customer;
            await ctx.runMutation(internal.functions.webhooks.handleCustomerCreated, {
              customerId: customer.id,
              email: customer.email ?? undefined,
              metadata: customer.metadata ?? undefined,
            });
            break;
          }

          case "customer.updated": {
            const customer = event.data.object as Stripe.Customer;
            await ctx.runMutation(internal.functions.webhooks.handleCustomerUpdated, {
              customerId: customer.id,
              email: customer.email ?? undefined,
              defaultPaymentMethodId: customer.invoice_settings?.default_payment_method as string | undefined,
            });
            break;
          }

          default:
            // Log unhandled event types but don't fail
            console.warn(`Unhandled Stripe event type: ${event.type}`);
        }
      } catch (e) {
        error = e instanceof Error ? e.message : "Unknown error";
        console.error(`Error processing Stripe webhook: ${error}`);
      }

      // Mark the event as processed
      await ctx.runMutation(internal.functions.stripe.markWebhookProcessed, {
        eventId,
        error,
      });

      return new Response(
        JSON.stringify({ received: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (e) {
      console.error("Stripe webhook error:", e);
      return new Response(
        JSON.stringify({ error: "Webhook processing failed" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Legacy webhook path for backwards compatibility
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Redirect to new path
    const newUrl = new URL(request.url);
    newUrl.pathname = "/webhooks/stripe";
    return Response.redirect(newUrl.toString(), 308);
  }),
});

// BUG FIX B3: Removed the custom /auth/callback route. It contained only
// placeholder code that redirected to a success page without completing the
// OAuth flow (no state verification, no token exchange, no session creation).
// Convex Auth's auth.addHttpRoutes(http) (line 28) already registers proper
// OAuth callback handlers at /api/auth/callback/* that handle the full flow.
// Keeping this custom route would confuse clients and bypass the real auth flow.

// ============================================================================
// CORS Preflight for Other Endpoints
// ============================================================================

http.route({
  path: "/webhooks/stripe",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

http.route({
  path: "/stripe/webhook",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// BUG FIX B3: Also removed the /auth/callback OPTIONS handler since the
// GET route was removed above. No custom callback route = no preflight needed.

export default http;
