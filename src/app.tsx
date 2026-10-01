import { useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { isSupabaseConfigured } from "./api/supabase";
import { PendingInviteBanner } from "./components/desks/pendinginvitebanner";
import { Footer } from "./components/layout/footer";
import { Navbar } from "./components/layout/navbar";
import { ToastProvider } from "./components/ui";
import { AudioProvider } from "./contexts/audiocontext";
import { AuthProvider } from "./contexts/authcontext";
import { MembershipProvider } from "./contexts/membershipcontext";
import { SparksProvider } from "./contexts/sparkscontext";
import { ThemeProvider } from "./contexts/themecontext";
import { CursorProvider } from "./contexts/cursorcontext";
import { useAuth } from "./hooks/useauth";
import { useSparks } from "./hooks/usesparks";

function MissingSupabaseConfigScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Configuration required
        </p>
        <h1 className="mt-4 text-3xl font-bold">FolioSparks needs Supabase to start</h1>
        <p className="mt-3 text-slate-600">
          Add your project URL and anon key to a local .env file, then restart the dev server.
        </p>
        <pre className="mt-5 overflow-x-auto rounded-lg bg-slate-100 p-4 text-sm text-slate-800">
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
        </pre>
        <p className="mt-4 text-sm text-slate-600">
          Copy .env.example to .env and fill in the real values before running the app again.
        </p>
      </div>
    </div>
  );
}

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
  if (!isSupabaseConfigured) {
    return <MissingSupabaseConfigScreen />;
  }

  return (
    <ThemeProvider>
      <CursorProvider>
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
      </CursorProvider>
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
