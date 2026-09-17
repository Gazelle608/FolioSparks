import type { Session, User } from "@supabase/supabase-js";

import { type ApiResult, err, ok, supabase } from "./supabase";

type Profile = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Sign up with email + password
// ---------------------------------------------------------------------------
export interface SignUpInput {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

export async function signUp(
  input: SignUpInput,
): Promise<ApiResult<{ user: User | null; session: Session | null }>> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        username: input.username.toLowerCase(),
        display_name: input.displayName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error)
    return err(error.message);
  return ok({ user: data.user, session: data.session });
}

// ---------------------------------------------------------------------------
// Sign in with email + password
// ---------------------------------------------------------------------------
export async function signIn(
  email: string,
  password: string,
): Promise<ApiResult<{ session: Session | null }>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error)
    return err(error.message);
  return ok({ session: data.session });
}

// ---------------------------------------------------------------------------
// Google OAuth
// ---------------------------------------------------------------------------
export async function signInWithGoogle(): Promise<ApiResult<null>> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });

  if (error)
    return err(error.message);
  return ok(null);
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------
export async function signOut(): Promise<ApiResult<null>> {
  const { error } = await supabase.auth.signOut();
  if (error)
    return err(error.message);
  return ok(null);
}

// ---------------------------------------------------------------------------
// Get current session
// ---------------------------------------------------------------------------
export async function getSession(): Promise<ApiResult<Session | null>> {
  const { data, error } = await supabase.auth.getSession();
  if (error)
    return err(error.message);
  return ok(data.session);
}

// ---------------------------------------------------------------------------
// Get current user
// ---------------------------------------------------------------------------
export async function getCurrentUser(): Promise<ApiResult<User | null>> {
  const { data, error } = await supabase.auth.getUser();
  if (error)
    return err(error.message);
  return ok(data.user);
}

// ---------------------------------------------------------------------------
// Get the full profile row for a user
// ---------------------------------------------------------------------------
export async function getProfile(userId: string): Promise<ApiResult<Profile>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Update profile
// ---------------------------------------------------------------------------
export interface UpdateProfileInput {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  username?: string;
}

export async function updateProfile(
  userId: string,
  updates: UpdateProfileInput,
): Promise<ApiResult<Profile>> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates as never)
    .eq("id", userId)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Mark onboarding complete
// ---------------------------------------------------------------------------
export async function completeOnboarding(
  userId: string,
): Promise<ApiResult<null>> {
  const { error } = await supabase
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() } as never)
    .eq("id", userId);

  if (error)
    return err(error.message);
  return ok(null);
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------
export async function sendPasswordReset(
  email: string,
): Promise<ApiResult<null>> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset`,
  });
  if (error)
    return err(error.message);
  return ok(null);
}

// ---------------------------------------------------------------------------
// Auth state change listener (used in AuthContext)
// ---------------------------------------------------------------------------
export function onAuthStateChange(callback: (session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
}
