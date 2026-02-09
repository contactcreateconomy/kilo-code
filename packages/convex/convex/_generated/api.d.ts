/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as functions_admin from "../functions/admin.js";
import type * as functions_cart from "../functions/cart.js";
import type * as functions_categories from "../functions/categories.js";
import type * as functions_comments from "../functions/comments.js";
import type * as functions_flairs from "../functions/flairs.js";
import type * as functions_forum from "../functions/forum.js";
import type * as functions_moderation from "../functions/moderation.js";
import type * as functions_notifications from "../functions/notifications.js";
import type * as functions_orders from "../functions/orders.js";
import type * as functions_polls from "../functions/polls.js";
import type * as functions_products from "../functions/products.js";
import type * as functions_reviews from "../functions/reviews.js";
import type * as functions_sessions from "../functions/sessions.js";
import type * as functions_social from "../functions/social.js";
import type * as functions_stripe from "../functions/stripe.js";
import type * as functions_tags from "../functions/tags.js";
import type * as functions_users from "../functions/users.js";
import type * as functions_webhooks from "../functions/webhooks.js";
import type * as helpers_multitenancy from "../helpers/multitenancy.js";
import type * as helpers_validation from "../helpers/validation.js";
import type * as http from "../http.js";
import type * as lib_cleanup from "../lib/cleanup.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_middleware from "../lib/middleware.js";
import type * as lib_orderUtils from "../lib/orderUtils.js";
import type * as lib_security from "../lib/security.js";
import type * as lib_stripe from "../lib/stripe.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  "functions/admin": typeof functions_admin;
  "functions/cart": typeof functions_cart;
  "functions/categories": typeof functions_categories;
  "functions/comments": typeof functions_comments;
  "functions/flairs": typeof functions_flairs;
  "functions/forum": typeof functions_forum;
  "functions/moderation": typeof functions_moderation;
  "functions/notifications": typeof functions_notifications;
  "functions/orders": typeof functions_orders;
  "functions/polls": typeof functions_polls;
  "functions/products": typeof functions_products;
  "functions/reviews": typeof functions_reviews;
  "functions/sessions": typeof functions_sessions;
  "functions/social": typeof functions_social;
  "functions/stripe": typeof functions_stripe;
  "functions/tags": typeof functions_tags;
  "functions/users": typeof functions_users;
  "functions/webhooks": typeof functions_webhooks;
  "helpers/multitenancy": typeof helpers_multitenancy;
  "helpers/validation": typeof helpers_validation;
  http: typeof http;
  "lib/cleanup": typeof lib_cleanup;
  "lib/constants": typeof lib_constants;
  "lib/errors": typeof lib_errors;
  "lib/middleware": typeof lib_middleware;
  "lib/orderUtils": typeof lib_orderUtils;
  "lib/security": typeof lib_security;
  "lib/stripe": typeof lib_stripe;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
