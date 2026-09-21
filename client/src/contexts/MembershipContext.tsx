import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Membership, MembershipTier } from "../types/membership";

import { getMembership } from "../api/memberships";
import { supabase } from "../api/supabase";
import { useAuth } from "./AuthContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface MembershipContextValue {
  membership: Membership | null;
  tier: MembershipTier;
  allowance: number;
  nextGrantAt: string | null;
  cancelAtPeriodEnd: boolean;
  /** True until first load resolves */
  loading: boolean;
  /** Re-fetch membership from server */
  refresh: () => Promise<void>;
  /** Convenience checks */
  isFree: boolean;
  isSpark: boolean;
  isSparkPro: boolean;
  /** True if current tier is at least the required one */
  hasTier: (required: MembershipTier) => boolean;
}

const MembershipContext = createContext<MembershipContextValue | null>(null);

// Fallback used when there"s no user or the fetch fails
const FREE_FALLBACK: Pick<
  Membership,
  "tier" | "sparks_allowance" | "next_grant_at" | "cancel_at_period_end"
> = {
  tier: "free",
  sparks_allowance: 100,
  next_grant_at: null,
  cancel_at_period_end: false,
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function MembershipProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // Load whenever user changes
  // ---------------------------------------------------------------------------
  const load = useCallback(async (silent = false) => {
    if (!silent)
      setLoading(true);

    if (!user) {
      setMembership(null);
      setLoading(false);
      return;
    }

    const result = await getMembership(user.id);

    if (result.error || !result.data) {
      console.error("Failed to load membership:", result.error);
      setMembership(null);
    }
    else {
      setMembership(result.data);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // ---------------------------------------------------------------------------
  // Realtime: membership row updates (Stripe webhook writes here)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!user)
      return;

    const channel = supabase
      .channel(`memberships:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "memberships",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setMembership(payload.new as Membership);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------
  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  const value = useMemo<MembershipContextValue>(() => {
    const tier: MembershipTier = membership?.tier ?? FREE_FALLBACK.tier;
    const allowance = membership?.sparks_allowance ?? FREE_FALLBACK.sparks_allowance;
    const nextGrantAt = membership?.next_grant_at ?? FREE_FALLBACK.next_grant_at;
    const cancelAtPeriodEnd = membership?.cancel_at_period_end ?? FREE_FALLBACK.cancel_at_period_end;

    const rank: Record<MembershipTier, number> = {
      free: 0,
      spark: 1,
      spark_pro: 2,
    };

    return {
      membership,
      tier,
      allowance,
      nextGrantAt,
      cancelAtPeriodEnd,
      loading,
      refresh,
      isFree: tier === "free",
      isSpark: tier === "spark",
      isSparkPro: tier === "spark_pro",
      hasTier: required => rank[tier] >= rank[required],
    };
  }, [membership, loading, refresh]);

  return (
    <MembershipContext.Provider value={value}>
      {children}
    </MembershipContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useMembership(): MembershipContextValue {
  const ctx = useContext(MembershipContext);
  if (!ctx)
    throw new Error("useMembership must be used inside <MembershipProvider>");
  return ctx;
}
