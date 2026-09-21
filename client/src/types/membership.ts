// ============================================================
// Memberships / Subscriptions
// Mirrors: public.memberships
// ============================================================

// Postgres enums
export type MembershipTier = 'free' | 'spark' | 'spark_pro';

export type MembershipStatus =
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'trialing';

// ---------------------------------------------------------------------------
// Membership row
// ---------------------------------------------------------------------------
export interface Membership {
  user_id: string;
  tier: MembershipTier;
  status: MembershipStatus;

  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;

  sparks_allowance: number;
  last_grant_at: string | null;
  next_grant_at: string | null;

  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Insert / Update
// ---------------------------------------------------------------------------
export interface MembershipInsert {
  user_id: string;
  tier?: MembershipTier;
  status?: MembershipStatus;
  sparks_allowance?: number;
}

export interface MembershipUpdate {
  tier?: MembershipTier;
  status?: MembershipStatus;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  sparks_allowance?: number;
  last_grant_at?: string | null;
  next_grant_at?: string | null;
}

// ---------------------------------------------------------------------------
// Tier config — client-side mirror of the DB allowances/pricing
// ---------------------------------------------------------------------------
export interface MembershipTierConfig {
  id: MembershipTier;
  name: string;
  price: number;         // USD/month
  period: string;        // "forever" | "per month"
  tagline: string;
  sparks: number;        // monthly allowance
  features: string[];
  highlight?: boolean;
  cta: string;
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------
export interface CheckoutSessionResponse {
  url: string;
}

export interface BillingPortalResponse {
  url: string;
}

// ---------------------------------------------------------------------------
// Stripe webhook events the client cares about
// ---------------------------------------------------------------------------
export type MembershipEventType =
  | 'checkout.session.completed'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_failed';