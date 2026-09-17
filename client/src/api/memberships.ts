import type { ApiResult } from "./supabase";

import { api } from "./backend";
import { err, ok, supabase } from "./supabase";

export type MembershipTier = "free" | "spark" | "spark_pro";

export interface Membership {
  user_id: string;
  tier: MembershipTier;
  cancel_at_period_end: boolean;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Tier definitions (client-side mirror of DB allowances)
// ---------------------------------------------------------------------------
export const TIER_ALLOWANCES: Record<MembershipTier, number> = {
  free: 100,
  spark: 1200,
  spark_pro: 3000,
};

export const TIER_PRICING: Record<MembershipTier, number> = {
  free: 0,
  spark: 5,
  spark_pro: 12,
};

// ---------------------------------------------------------------------------
// Get current user"s membership
// ---------------------------------------------------------------------------
export async function getMembership(
  userId: string,
): Promise<ApiResult<Membership>> {
  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    return err(error.message);
  }
  return ok(data);
}

// ---------------------------------------------------------------------------
// Check if user has at least tier X
// ---------------------------------------------------------------------------
export function hasTier(
  current: MembershipTier,
  required: MembershipTier,
): boolean {
  const rank: Record<MembershipTier, number> = {
    free: 0,
    spark: 1,
    spark_pro: 2,
  };
  return rank[current] >= rank[required];
}

// ---------------------------------------------------------------------------
// Create a Stripe Checkout session (backend creates the session)
// ---------------------------------------------------------------------------
export async function createCheckoutSession(
  tier: Exclude<MembershipTier, "free">,
): Promise<ApiResult<{ url: string }>> {
  return api.post("/memberships/checkout", { tier });
}

// ---------------------------------------------------------------------------
// Open Stripe billing portal (manage / cancel subscription)
// ---------------------------------------------------------------------------
export async function createBillingPortalSession(): Promise<
  ApiResult<{ url: string }>
> {
  return api.post("/memberships/portal");
}

// ---------------------------------------------------------------------------
// Cancel at period end
// ---------------------------------------------------------------------------
export async function cancelSubscription(): Promise<ApiResult<null>> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return err("Not authenticated");
  }

  const { error } = await supabase
    .from("memberships")
    .update({ cancel_at_period_end: true } as never)
    .eq("user_id", userData.user.id);

  if (error)
    return err(error.message);
  return ok(null);
}

// ---------------------------------------------------------------------------
// Resume a cancelled subscription
// ---------------------------------------------------------------------------
export async function resumeSubscription(): Promise<ApiResult<null>> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return err("Not authenticated");
  }

  const { error } = await supabase
    .from("memberships")
    .update({ cancel_at_period_end: false } as never)
    .eq("user_id", userData.user.id);

  if (error) {
    return err(error.message);
  }
  return ok(null);
}
