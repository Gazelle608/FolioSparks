import { useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { PendingInviteBanner } from "./components/desks/pendinginvitebanner";
import { Footer } from "./components/layout/footer";
import { Navbar } from "./components/layout/navbar";
import { ToastProvider } from "./components/ui";
import { AudioProvider } from "./contexts/audiocontext";
import { AuthProvider } from "./contexts/authcontext";
import { MembershipProvider } from "./contexts/membershipcontext";
import { SparksProvider } from "./contexts/sparkscontext";
import { ThemeProvider } from "./contexts/themecontext";
import { useAuth } from "./hooks/useauth";
import { useSparks } from "./hooks/usesparks";

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------
// Mounted once around the *whole* route tree (see router.tsx) — not just the
// shell. The full-screen routes (/signin, /signup, /onboarding, /read/…) call
// useAuth() and useSparks() too.
//
// Order matters:
//   Theme  → no deps
//   Auth   → needs Supabase session
//   Member → needs Auth.user
//   Sparks → needs Auth.user
//   Audio  → no deps (but respects Theme)
//   Toast  → no deps, but must wrap anything that fires toasts
// ---------------------------------------------------------------------------
export function RootProviders() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MembershipProvider>
          <SparksProvider>
            <AudioProvider>
              <ToastProvider>
                <Outlet />
              </ToastProvider>
            </AudioProvider>
          </SparksProvider>
        </MembershipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// ---------------------------------------------------------------------------
// Shell — site chrome (navbar + footer) around the page
// ---------------------------------------------------------------------------
function Shell() {
  const navigate = useNavigate();
  const { user, profile, isAuthor, signOut } = useAuth();
  const { balance } = useSparks();

  const navbarUser = user
    ? {
        id: user.id,
        displayName: profile?.display_name ?? user.email?.split("@")[0] ?? "Reader",
        username: profile?.username ?? "",
        avatarUrl: profile?.avatar_url ?? null,
        isAuthor,
      }
    : null;

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate("/", { replace: true });
  }, [signOut, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-primary-50">
      <Navbar
        user={navbarUser}
        sparksBalance={balance}
        onSignIn={() => navigate("/signin")}
        onSignOut={handleSignOut}
      />
      <PendingInviteBanner />

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return <Shell />;
}
