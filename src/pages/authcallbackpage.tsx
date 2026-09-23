import { Navigate, useSearchParams } from "react-router-dom";

import { FullPageSpinner } from "../components/ui";
import { useAuth } from "../hooks/useauth";
import {
  POST_AUTH_PATH,
  SIGN_IN_PATH,
  safeNextPath,
} from "../utils/postauth";

/**
 * Supabase redirect target for email confirmation, magic links and Google
 * OAuth — `${origin}/auth/callback?code=…` (or `#access_token=…`).
 *
 * The Supabase client parses those params itself (`detectSessionInUrl`), so
 * this page only has to wait for the session to land and then hand the user
 * to their dashboard.
 */
export function AuthCallbackPage() {
  const [params] = useSearchParams();
  const { user, loading } = useAuth();

  // Supabase appends `error_description` when a link is expired/denied
  const linkError = params.get("error_description") ?? params.get("error");
  if (linkError)
    return <Navigate to={`${SIGN_IN_PATH}?error=link_expired`} replace />;

  if (loading)
    return <FullPageSpinner label="Completing sign-in…" />;

  if (!user)
    return <Navigate to={SIGN_IN_PATH} replace />;

  const next = safeNextPath(params.get("next")) ?? POST_AUTH_PATH;
  return <Navigate to={next} replace />;
}
