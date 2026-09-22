import type Stripe from "stripe";

import { env } from "../config/env.js";
import {
  getSubscriptionPeriod,
  mapStripeStatus,
  stripe,
  STRIPE_PRICES,
} from "../config/stripe.js";
import { supabaseAdmin } from "../config/supabase.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

// ============================================================
// Customers
// ============================================================

/**
 * Get or create a Stripe customer for a FolioSparks user.
 * Caches the customer id on the memberships row.
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
): Promise<string> {
  // Check if we already have one
  const { data: existing } = await supabaseAdmin
    .from("memberships")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  // Create the customer
  const customer = await stripe.customers.create({
    email,
    metadata: { user_id: userId },
  });

  // Persist
  await supabaseAdmin
    .from("memberships")
    .update({ stripe_customer_id: customer.id })
    .eq("user_id", userId);

  return customer.id;
}

// ============================================================
// Checkout sessions
// ============================================================

export async function createCheckoutSession(params: {
  userId: string;
  email: string;
  tier: "spark" | "spark_pro";
}): Promise<string> {
  const { userId, email, tier } = params;

  const customerId = await getOrCreateCustomer(userId, email);
  const priceId = STRIPE_PRICES[tier];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.CLIENT_URL}/membership?cancelled=1`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { user_id: userId, tier },
    },
    metadata: { user_id: userId, tier },
  });

  if (!session.url) {
    throw HttpError.internal("Stripe did not return a checkout URL");
  }
  return session.url;
}

// ============================================================
// Billing portal
// ============================================================

export async function createBillingPortalSession(
  userId: string,
): Promise<string> {
  const { data } = await supabaseAdmin
    .from("memberships")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    throw HttpError.badRequest("No billing account on file");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${env.CLIENT_URL}/membership`,
  });

  return session.url;
}

// ============================================================
// Subscription helpers
// ============================================================

export async function cancelAtPeriodEnd(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function resumeSubscription(
  subscriptionId: string,
): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

// ============================================================
// Webhook event handlers
// ============================================================

/**
 * Sync a Stripe subscription state to our memberships table.
 * Called from checkout.session.completed and subscription.* events.
 */
export async function syncSubscription(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  // Find the user via customer id
  const { data: membership } = await supabaseAdmin
    .from("memberships")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!membership) {
    logger.warn("Stripe sync: no user for customer", { customerId });
    return;
  }

  const userId = membership.user_id;
  const tier = detectTierFromSubscription(subscription);
  const status = mapStripeStatus(subscription.status);
  const period = getSubscriptionPeriod(subscription);

  const { error } = await supabaseAdmin
    .from("memberships")
    .update({
      tier,
      status,
      stripe_subscription_id: subscription.id,
      current_period_start: period.start.toISOString(),
      current_period_end: period.end.toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      sparks_allowance: allowanceForTier(tier),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    logger.error("Failed to sync subscription", {
      userId,
      error: error.message,
    });
  }
  else {
    logger.info("Subscription synced", { userId, tier, status });
  }
}

/**
 * Handle subscription deletion — drop the user back to free.
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  const { data: membership } = await supabaseAdmin
    .from("memberships")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!membership)
    return;

  await supabaseAdmin
    .from("memberships")
    .update({
      tier: "free",
      status: "cancelled",
      sparks_allowance: 100,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", membership.user_id);

  logger.info("Subscription cancelled", { userId: membership.user_id });
}

// ============================================================
// Internal helpers
// ============================================================

function detectTierFromSubscription(
  subscription: Stripe.Subscription,
): "spark" | "spark_pro" {
  const priceId = subscription.items.data[0]?.price.id;

  if (priceId === STRIPE_PRICES.spark)
    return "spark";
  if (priceId === STRIPE_PRICES.spark_pro)
    return "spark_pro";

  // Fallback from metadata
  const tier = subscription.metadata?.tier;
  if (tier === "spark" || tier === "spark_pro")
    return tier;

  return "spark";
}

function allowanceForTier(tier: "free" | "spark" | "spark_pro"): number {
  return { free: 100, spark: 1200, spark_pro: 3000 }[tier];
}
