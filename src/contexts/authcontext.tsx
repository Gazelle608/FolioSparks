import type { Session, User } from "@supabase/supabase-js";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
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
  /** True while the session (and its profile row) is still settling */
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

  // Tracks the user the current profile belongs to, so we can tell a fresh
  // sign-in (profile still loading → hold `loading`) from a token refresh.
  const lastUserId = useRef<string | null>(null);

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
      (_event, newSession) => {
        if (!mounted)
          return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (!newSession?.user) {
          lastUserId.current = null;
          setProfile(null);
          setLoading(false);
          return;
        }

        // A *new* sign-in: keep `loading` true until the profile row lands,
        // so route guards don't bounce an onboarded user to /onboarding.
        const isNewUser = lastUserId.current !== newSession.user.id;
        lastUserId.current = newSession.user.id;
        if (isNewUser)
          setLoading(true);

        // Deferred out of the callback on purpose: auth-js holds a lock while
        // emitting, so awaiting a Supabase query inline can deadlock.
        window.setTimeout(() => {
          if (!mounted)
            return;

          void loadProfile(newSession.user.id).finally(() => {
            if (mounted && isNewUser)
              setLoading(false);
          });
        }, 0);
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
