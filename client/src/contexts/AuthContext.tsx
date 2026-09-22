import type { Session, User } from "@supabase/supabase-js";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Profile } from "../types/user";

import { signOut as apiSignOut, getProfile } from "../api/auth";
import { supabase } from "../api/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AuthContextValue {
  // Session
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAuthor: boolean;
  /** True until the first session resolution completes */
  loading: boolean;
  /** True while refreshing profile data */
  refreshing: boolean;

  // Actions
  /** Re-fetch the profile row from Supabase */
  refreshProfile: () => Promise<void>;
  /** Sign out and clear state */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ---------------------------------------------------------------------------
  // Load profile whenever the user changes
  // ---------------------------------------------------------------------------
  const loadProfile = useCallback(async (userId: string, isRefresh = false) => {
    if (isRefresh)
      setRefreshing(true);

    const result = await getProfile(userId);

    if (result.error || !result.data) {
      console.error("Failed to load profile:", result.error);
      setProfile(null);
    }
    else {
      setProfile(result.data as unknown as Profile);
    }

    if (isRefresh)
      setRefreshing(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Initial session fetch + auth state subscription
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    // 1. Get initial session
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted)
        return;

      const s = data.session;
      setSession(s);
      setUser(s?.user ?? null);

      if (s?.user) {
        loadProfile(s.user.id).finally(() => {
          if (mounted)
            setLoading(false);
        });
      }
      else {
        setLoading(false);
      }
    });

    // 2. Subscribe to future changes
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted)
          return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await loadProfile(newSession.user.id);
        }
        else {
          setProfile(null);
        }
      },
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const refreshProfile = useCallback(async () => {
    if (!user)
      return;
    await loadProfile(user.id, true);
  }, [user, loadProfile]);

  const signOut = useCallback(async () => {
    await apiSignOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------
  const isAuthor = !!profile?.is_author;

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      isAuthor,
      loading,
      refreshing,
      refreshProfile,
      signOut,
    }),
    [session, user, profile, isAuthor, loading, refreshing, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
