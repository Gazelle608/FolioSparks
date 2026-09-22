import { createBrowserRouter } from "react-router-dom";

import App, { RootProviders } from "./app";
// Route guards
import { ProtectedRoute } from "./components/auth/protectedroute";
import { AnalyticsPage } from "./pages/analyticspage";
import { AuthCallbackPage } from "./pages/authcallbackpage";
import { AuthorProfilePage } from "./pages/authorprofilepage";
import { ChapterEditorPage } from "./pages/chaptereditorpage";
import { CheckoutSuccessPage } from "./pages/checkoutsuccesspage";
import { DashboardPage } from "./pages/dashboardpage";
import { DonationSettingsPage } from "./pages/donationsettingspage";
import { EditStoryPage } from "./pages/editstorypage";
// Shell pages
import { HomePage } from "./pages/homepage";
import { LibraryPage } from "./pages/librarypage";
import { MembershipPage } from "./pages/membershippage";
import { NewStoryPage } from "./pages/newstorypage";
import { NotFoundPage } from "./pages/notfoundpage";
import { OnboardingPage } from "./pages/onboardingpage";
import { PublishFlowPage } from "./pages/publishflowpage";
import { ReaderPage } from "./pages/readerpage";
import { ReaderProfilePage } from "./pages/readerprofilepage";
// Full-screen pages (no navbar/footer)
import { SignInPage } from "./pages/signinpage";
import { SignUpPage } from "./pages/signuppage";
import { StoryPage } from "./pages/storypage";
import { StudioPage } from "./pages/studiopage";
import { VerifyEmailPage } from "./pages/verifyemailpage";
import {
  AUTH_CALLBACK_PATH,
  ONBOARDING_PATH,
  POST_AUTH_PATH,
  VERIFY_EMAIL_PATH,
} from "./utils/postauth";

// ---------------------------------------------------------------------------
// Router
// Two nesting levels:
//   1. Root — providers for EVERY route, shell and full-screen alike
//      (the full-screen pages call useAuth/useSparks too)
//   2. Shell routes — inside <App /> (navbar + footer)
//      Full-screen routes are siblings of the shell: no chrome
// ---------------------------------------------------------------------------
export const router = createBrowserRouter([
  {
    element: <RootProviders />,
    children: [
      // ============================================================
      // SHELL
      // ============================================================
      {
        path: "/",
        element: <App />,
        children: [
          // Public
          { index: true, element: <HomePage /> },
          { path: "library", element: <LibraryPage /> },
          { path: "story/:slug", element: <StoryPage /> },
          { path: "membership", element: <MembershipPage /> },

          // Authenticated
          {
            path: "checkout/success",
            element: (
              <ProtectedRoute>
                <CheckoutSuccessPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "me/library",
            element: (
              <ProtectedRoute>
                <ReaderProfilePage />
              </ProtectedRoute>
            ),
          },

          // Studio (author only, onboarding complete)
          {
            path: "studio",
            element: (
              <ProtectedRoute requireOnboarded>
                <StudioPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "studio/new",
            element: (
              <ProtectedRoute requireOnboarded requireAuthor>
                <NewStoryPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "studio/story/:storyId",
            element: (
              <ProtectedRoute requireOnboarded requireAuthor>
                <EditStoryPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "studio/story/:storyId/publish",
            element: (
              <ProtectedRoute requireOnboarded requireAuthor>
                <PublishFlowPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "studio/story/:storyId/chapter/:chapterNumber",
            element: (
              <ProtectedRoute requireOnboarded requireAuthor>
                <ChapterEditorPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "studio/story/:storyId/analytics",
            element: (
              <ProtectedRoute requireOnboarded requireAuthor>
                <AnalyticsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "studio/settings/donations",
            element: (
              <ProtectedRoute requireOnboarded requireAuthor>
                <DonationSettingsPage />
              </ProtectedRoute>
            ),
          },

          // Author profile — must come AFTER known paths so it doesn't shadow them
          { path: "@:username", element: <AuthorProfilePage /> },
          { path: ":username", element: <AuthorProfilePage /> },

          // 404 — must be last inside the shell
          { path: "*", element: <NotFoundPage /> },
        ],
      },

      // ============================================================
      // FULL-SCREEN — no navbar/footer
      // ============================================================
      { path: "/signin", element: <SignInPage /> },
      { path: "/signup", element: <SignUpPage /> },
      // Post-signup: "check your inbox" (email confirmation required)
      { path: VERIFY_EMAIL_PATH, element: <VerifyEmailPage /> },
      // Supabase redirect target: email links + Google OAuth
      { path: AUTH_CALLBACK_PATH, element: <AuthCallbackPage /> },
      // Where every auth entry point lands — resolves to the right dashboard
      { path: POST_AUTH_PATH, element: <DashboardPage /> },
      { path: ONBOARDING_PATH, element: <OnboardingPage /> },
      { path: "/read/:slug/:chapterNumber", element: <ReaderPage /> },
    ],
  },
]);
