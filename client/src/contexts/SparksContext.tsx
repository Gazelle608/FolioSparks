import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { SparkLedgerEntry } from "../types/spark";

import { spendSparks as apiSpendSparks, getBalance, getLedger } from "../api/sparks";
import { supabase } from "../api/supabase";
import { useAuth } from "./authcontext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SpendResult {
  error: string | null;
  entry?: SparkLedgerEntry;
}

interface SparksContextValue {
  balance: number;
  /** Recent ledger entries (last 50) */
  ledger: SparkLedgerEntry[];
  loading: boolean;
  refreshing: boolean;

  /** Re-fetch balance + ledger */
  refresh: () => Promise<void>;
  /** Fetch more ledger entries (pagination) */
  loadMoreLedger: () => Promise<void>;
  /** Spend sparks on a chapter — returns { error } */
  spend: (
    chapterId: string,
    amount: number,
    note?: string
  ) => Promise<SpendResult>;
  /** Has more ledger history to fetch */
  hasMoreLedger: boolean;
}

const SparksContext = createContext<SparksContextValue | null>(null);

const LEDGER_PAGE_SIZE = 50;

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function SparksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [balance, setBalance] = useState(0);
  const [ledger, setLedger] = useState<SparkLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMoreLedger, setHasMoreLedger] = useState(true);

  // ---------------------------------------------------------------------------
  // Load balance + first page of ledger
  // ---------------------------------------------------------------------------
  const load = useCallback(async (silent = false) => {
    if (!silent)
      setLoading(true);
    else setRefreshing(true);

    if (!user) {
      setBalance(0);
      setLedger([]);
      setHasMoreLedger(false);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const [balanceRes, ledgerRes] = await Promise.all([
      getBalance(user.id),
      getLedger(user.id, { limit: LEDGER_PAGE_SIZE, offset: 0 }),
    ]);

    setBalance(balanceRes.data ?? 0);
    setLedger((ledgerRes.data ?? []) as unknown as SparkLedgerEntry[]);
    setHasMoreLedger((ledgerRes.data?.length ?? 0) === LEDGER_PAGE_SIZE);

    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // ---------------------------------------------------------------------------
  // Realtime: new ledger rows update balance immediately
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!user)
      return;

    const channel = supabase
      .channel(`spark_ledger:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "spark_ledger",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const entry = payload.new as SparkLedgerEntry;

          // Update balance in place
          setBalance(prev => prev + entry.delta);

          // Prepend to ledger
          setLedger(prev => [entry, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  const loadMoreLedger = useCallback(async () => {
    if (!user || !hasMoreLedger)
      return;

    const offset = ledger.length;
    const result = await getLedger(user.id, {
      limit: LEDGER_PAGE_SIZE,
      offset,
    });

    if (result.error)
      return;

    const next = (result.data ?? []) as unknown as SparkLedgerEntry[];
    setLedger(prev => [...prev, ...next]);
    setHasMoreLedger(next.length === LEDGER_PAGE_SIZE);
  }, [user, ledger.length, hasMoreLedger]);

  const spend = useCallback(
    async (
      chapterId: string,
      amount: number,
      note?: string,
    ): Promise<SpendResult> => {
      if (!user)
        return { error: "Not signed in" };

      // Optimistic update
      const previousBalance = balance;
      setBalance(prev => Math.max(0, prev - amount));

      const result = await apiSpendSparks({
        chapterId,
        amount,
        note,
      });

      if (result.error || !result.data) {
        // Roll back
        setBalance(previousBalance);
        return { error: result.error ?? "Could not send Sparks" };
      }

      // Realtime listener will also fire, but we already updated optimistically.
      // To avoid double counting, refresh the balance from server shortly after.
      setTimeout(() => {
        getBalance(user.id).then((res) => {
          if (res.data !== null)
            setBalance(res.data);
        });
      }, 500);

      return { error: null, entry: result.data as unknown as SparkLedgerEntry };
    },
    [user, balance],
  );

  // ---------------------------------------------------------------------------
  // Value
  // ---------------------------------------------------------------------------
  const value = useMemo<SparksContextValue>(
    () => ({
      balance,
      ledger,
      loading,
      refreshing,
      refresh,
      loadMoreLedger,
      spend,
      hasMoreLedger,
    }),
    [balance, ledger, loading, refreshing, refresh, loadMoreLedger, spend, hasMoreLedger],
  );

  return <SparksContext.Provider value={value}>{children}</SparksContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useSparks(): SparksContextValue {
  const ctx = useContext(SparksContext);
  if (!ctx)
    throw new Error("useSparks must be used inside <SparksProvider>");
  return ctx;
}
