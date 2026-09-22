import Stripe from "stripe";

import { env, isProduction } from "./env.js";

// ============================================================
// Client
// ============================================================
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
  appInfo: {
    name: "FolioSparks",
    version: "0.1.0",
    url: "https://foliosparks.com",
  },
});

// ============================================================
// Webhook secret
// ============================================================
export const STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;

// ============================================================
// Price IDs — one per paid tier
// ------------------------------------------------------------
// Create these in the Stripe Dashboard:
//   Products → Create product → Recurring → monthly
//   Copy the price_xxx ID into your .env
// ============================================================
export const STRIPE_PRICES = {
  spark: env.STRIPE_PRICE_SPARK,
  spark_pro: env.STRIPE_PRICE_SPARK_PRO,
} as const;

export type PaidTier = keyof typeof STRIPE_PRICES;

// ============================================================
// Reverse lookup — given a Stripe price ID, which tier is it?
// Used when processing webhooks.
// ============================================================
export function tierFromPriceId(priceId: string): PaidTier | null {
  for (const [tier, id] of Object.entries(STRIPE_PRICES)) {
    if (id === priceId)
      return tier as PaidTier;
  }
  return null;
}

// ============================================================
// Webhook event types we care about
// ============================================================
export const HANDLED_STRIPE_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
] as const;

export type HandledStripeEvent = (typeof HANDLED_STRIPE_EVENTS)[number];

// ============================================================
// Helpers
// ============================================================

// Map Stripe subscription status → our membership status enum
export function mapStripeStatus(
  status: Stripe.Subscription.Status,
): "active" | "past_due" | "cancelled" | "trialing" {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    case "incomplete":
    case "paused":
    default:
      return "active"; // treat transitional states as active until they resolve
  }
}

// Given a Stripe subscription, extract the current period boundaries.
// Stripe types changed across API versions — this handles both shapes.
export function getSubscriptionPeriod(subscription: Stripe.Subscription): {
  start: Date;
  end: Date;
} {
  const sub = subscription as unknown as {
    current_period_start?: number;
    current_period_end?: number;
    items?: {
      data: Array<{
        current_period_start?: number;
        current_period_end?: number;
      }>;
    };
  };

  // Newer API versions put the period on items
  const firstItem = sub.items?.data?.[0];
  const startSec = firstItem?.current_period_start ?? sub.current_period_start;
  const endSec = firstItem?.current_period_end ?? sub.current_period_end;

  if (!startSec || !endSec) {
    const now = Date.now();
    return {
      start: new Date(now),
      end: new Date(now + 30 * 24 * 60 * 60 * 1000), // fallback: 30 days
    };
  }

  return {
    start: new Date(startSec * 1000),
    end: new Date(endSec * 1000),
  };
}

// ============================================================
// Prod sanity checks
// ============================================================
if (isProduction) {
  if (env.STRIPE_SECRET_KEY.startsWith("sk_test_")) {
    console.warn(
      "⚠️  STRIPE_SECRET_KEY looks like a TEST key in production. Are you sure?",
    );
  }
}
