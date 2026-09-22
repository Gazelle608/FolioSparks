import { Navigate, useSearchParams } from "react-router-dom";

import { FullPageSpinner } from "../components/ui";
import { useAuth } from "../hooks/useauth";
import {
  resolveDashboardPath,
  safeNextPath,
  SIGN_IN_PATH,
} from "../utils/postauth";

/**
 * Post-auth landing — sends the user to the right home for their account.
 *
 *   not onboarded → /onboarding
 *   author        → /studio
 *   reader        → /me/library
 *
 * `?next=` (set by ProtectedRoute or by the auth pages) wins when it points
 * somewhere same-origin, so deep links survive the sign-in round trip.
 */
export function DashboardPage() {
  const [params] = useSearchParams();
  const { user, profile, loading } = useAuth();

  // AuthProvider keeps `loading` true until a fresh session *and* its
  // profile row have settled.
  if (loading)
    return <FullPageSpinner label="Signing you in…" />;

  if (!user)
    return <Navigate to={SIGN_IN_PATH} replace />;

  const next = safeNextPath(params.get("next")) ?? resolveDashboardPath(profile);
  return <Navigate to={next} replace />;
}
