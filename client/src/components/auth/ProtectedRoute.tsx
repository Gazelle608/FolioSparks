import type { ReactNode } from "react";

import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useauth";
import { FullPageSpinner } from "../ui";

interface ProtectedRouteProps {
  children: ReactNode;
  /** If true, also requires the user to be an author */
  requireAuthor?: boolean;
  /** If true, requires onboarding to be complete */
  requireOnboarded?: boolean;
}

export function ProtectedRoute({
  children,
  requireAuthor = false,
  requireOnboarded = false,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { user, profile, isAuthor, loading } = useAuth();

  // 1. Still figuring out if we"re signed in
  if (loading) {
    return <FullPageSpinner label="Checking your session…" />;
  }

  // 2. Not signed in — bounce to /signin with a return-to
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/signin?next=${next}`} replace />;
  }

  // 3. Author-only route but user isn"t an author
  if (requireAuthor && !isAuthor) {
    return <Navigate to="/onboarding" replace />;
  }

  // 4. Onboarding gate
  if (requireOnboarded && !profile?.onboarded_at) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
