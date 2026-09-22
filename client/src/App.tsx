import { Outlet } from "react-router-dom";

import { PendingInviteBanner } from "./components/desks/pendinginvitebanner";
import { Footer } from "./components/layout/footer";
import { Navbar } from "./components/layout/navbar";
import { ToastProvider } from "./components/ui";
import { AudioProvider } from "./contexts/audiocontext";
import { AuthProvider } from "./contexts/authcontext";
import { MembershipProvider } from "./contexts/membershipcontext";
import { SparksProvider } from "./contexts/sparkscontext";
import { ThemeProvider } from "./contexts/themecontext";

// ---------------------------------------------------------------------------
// Shell — everything inside the providers
// ---------------------------------------------------------------------------
function Shell() {
  return (
    <div className="min-h-screen flex flex-col bg-primary-50">
      <Navbar />
      <PendingInviteBanner />

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider composition
// Order matters:
//   Theme  → no deps
//   Auth   → needs Supabase session
//   Member → needs Auth.user
//   Sparks → needs Auth.user
//   Audio  → no deps (but respects Theme)
//   Toast  → no deps, but must wrap anything that fires toasts
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MembershipProvider>
          <SparksProvider>
            <AudioProvider>
              <ToastProvider>
                <Shell />
              </ToastProvider>
            </AudioProvider>
          </SparksProvider>
        </MembershipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
