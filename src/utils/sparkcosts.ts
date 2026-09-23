// ============================================================
// FolioSparks — Spark Economy
// The single source of truth for what Sparks cost and are worth.
// Changing the economy = changing this file (plus DB triggers).
// ============================================================

import type { MembershipTier } from "../types/membership";

import { SPARK_ALLOWANCES } from "./constants";

// ---------------------------------------------------------------------------
// Suggested spend amounts — the presets shown in SparkModal
// ---------------------------------------------------------------------------
export const SPARK_PRESETS = [10, 25, 50, 100, 250, 500] as const;

// ---------------------------------------------------------------------------
// Spend limits
// ---------------------------------------------------------------------------
export const SPARK_LIMITS = {
  min: 1,
  max: 10_000, // per single transaction
  noteMaxLength: 500,
} as const;

// ---------------------------------------------------------------------------
// Engagement weight — how much a single Spark counts toward a chapter"s ranking
// Kept at 1 for now; can be adjusted if you want some Sparks to be worth more.
// ---------------------------------------------------------------------------
export const SPARK_WEIGHT = {
  standard: 1,
  /** Reward multiplier for readers on the Spark tier */
  sparkMemberBonus: 1.0,
  /** Reward multiplier for readers on the Spark Pro tier */
  sparkProBonus: 1.0,
} as const;

// ---------------------------------------------------------------------------
// Allowance lookup
// ---------------------------------------------------------------------------
export function allowanceForTier(tier: MembershipTier): number {
  return SPARK_ALLOWANCES[tier];
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
export function isValidSparkAmount(
  amount: number,
  balance: number,
): { valid: boolean; error?: string } {
  if (!Number.isFinite(amount)) {
    return { valid: false, error: "Enter a valid amount" };
  }
  if (amount < SPARK_LIMITS.min) {
    return {
      valid: false,
      error: `Minimum ${SPARK_LIMITS.min} Spark`,
    };
  }
  if (amount > SPARK_LIMITS.max) {
    return {
      valid: false,
      error: `Maximum ${SPARK_LIMITS.max.toLocaleString()} Sparks per send`,
    };
  }
  if (amount > balance) {
    return {
      valid: false,
      error: `You have ${balance.toLocaleString()} Sparks`,
    };
  }
  return { valid: true };
}

// ---------------------------------------------------------------------------
// Suggested amounts based on the reader"s current balance
// ---------------------------------------------------------------------------
export function suggestedAmounts(balance: number): number[] {
  if (balance <= 0)
    return [];

  // Filter presets that fit, then always show something
  const fitting = SPARK_PRESETS.filter(p => p <= balance);
  if (fitting.length === 0)
    return [balance];
  if (fitting.length >= 4)
    return [...fitting];

  // Top up with the full balance
  return [...fitting, balance].slice(0, 5);
}

// ---------------------------------------------------------------------------
// Cost calculator — for the SparkModal
// ---------------------------------------------------------------------------
export function calculateSpendPreview(
  amount: number,
  balance: number,
): {
    amount: number;
    remaining: number;
    percentOfBalance: number;
    isLarge: boolean;
  } {
  const remaining = Math.max(0, balance - amount);
  const percentOfBalance = balance > 0 ? (amount / balance) * 100 : 0;
  return {
    amount,
    remaining,
    percentOfBalance,
    isLarge: percentOfBalance >= 50,
  };
}

// ---------------------------------------------------------------------------
// Tier recommendation — nudge users toward upgrading when they run out
// ---------------------------------------------------------------------------
export function recommendTierForUsage(
  currentAllowance: number,
  averageMonthlySpend: number,
): MembershipTier | null {
  // Already enough — no nudge
  if (averageMonthlySpend <= currentAllowance)
    return null;

  // Suggest the cheapest tier that fits
  if (averageMonthlySpend <= SPARK_ALLOWANCES.spark)
    return "spark";
  return "spark_pro";
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------
export const SPARK_MILESTONES = [
  { at: 100, label: "First Spark" },
  { at: 500, label: "Kindled" },
  { at: 2_500, label: "Steady flame" },
  { at: 10_000, label: "Bonfire" },
  { at: 50_000, label: "Wildfire" },
] as const;

export function milestoneFor(count: number): string | null {
  let current: string | null = null;
  for (const m of SPARK_MILESTONES) {
    if (count >= m.at)
      current = m.label;
    else break;
  }
  return current;
}
