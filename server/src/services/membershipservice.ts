import { supabaseAdmin } from "../config/supabase.js";
import { HttpError } from "../utils/errors.js";
import {
  createBillingPortalSession,
  createCheckoutSession,
} from "./stripeService.js";

export async function get(userId: string) {
  const { data } = await supabaseAdmin
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function createCheckoutSessionForUser(
  userId: string,
  email: string,
  tier: "spark" | "spark_pro",
): Promise<string> {
  return createCheckoutSession({ userId, email, tier });
}

export async function createBillingPortalSessionForUser(
  userId: string,
): Promise<string> {
  return createBillingPortalSession(userId);
}

export async function cancelAtPeriodEnd(userId: string) {
  const { data: m } = await supabaseAdmin
    .from("memberships")
    .select("stripe_subscription_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!m?.stripe_subscription_id)
    throw HttpError.badRequest("No active subscription");

  await supabaseAdmin
    .from("memberships")
    .update({ cancel_at_period_end: true })
    .eq("user_id", userId);

  return get(userId);
}

export async function resume(userId: string) {
  await supabaseAdmin
    .from("memberships")
    .update({ cancel_at_period_end: false })
    .eq("user_id", userId);

  return get(userId);
}

// Re-export so the controller can call createCheckoutSession directly
export { createBillingPortalSession, createCheckoutSession };
