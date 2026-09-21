import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { HomePage } from './pages/HomePage';
import { LibraryPage } from './pages/LibraryPage';
import { StoryPage } from './pages/StoryPage';
import { ReaderPage } from './pages/ReaderPage';
import { StudioPage } from './pages/StudioPage';
import { NewStoryPage } from './pages/NewStoryPage';
import { EditStoryPage } from './pages/EditStoryPage';
import { ChapterEditorPage } from './pages/ChapterEditorPage';
import { PublishFlowPage } from './pages/PublishFlowPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DonationSettingsPage } from './pages/DonationSettingsPage';
import { MembershipPage } from './pages/MembershipPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { AuthorProfilePage } from './pages/AuthorProfilePage';
import { ReaderProfilePage } from './pages/ReaderProfilePage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/auth/protectedroute';

export const router = createBrowserRouter([
  // ----------------------------------------------------------
  // SHELL ROUTES — navbar + footer
  // ----------------------------------------------------------
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'story/:slug', element: <StoryPage /> },
      { path: 'membership', element: <MembershipPage /> },
      { path: 'checkout/success', element: <CheckoutSuccessPage /> },

      // Author profiles & reader profiles
      { path: ':username', element: <AuthorProfilePage /> },
      { path: 'me/library', element: <ReaderProfilePage /> },

      // Studio (protected)
      {
        path: 'studio',
        element: (
          <ProtectedRoute requireOnboarded>
            <StudioPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'studio/new',
        element: (
          <ProtectedRoute requireOnboarded requireAuthor>
            <NewStoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'studio/story/:storyId',
        element: (
          <ProtectedRoute requireOnboarded requireAuthor>
            <EditStoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'studio/story/:storyId/publish',
        element: (
          <ProtectedRoute requireOnboarded requireAuthor>
            <PublishFlowPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'studio/story/:storyId/chapter/:chapterNumber',
        element: (
          <ProtectedRoute requireOnboarded requireAuthor>
            <ChapterEditorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'studio/story/:storyId/analytics',
        element: (
          <ProtectedRoute requireOnboarded requireAuthor>
            <AnalyticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'studio/settings/donations',
        element: (
          <ProtectedRoute requireOnboarded requireAuthor>
            <DonationSettingsPage />
          </ProtectedRoute>
        ),
      },

      // Fallback
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // ----------------------------------------------------------
  // FULL-SCREEN ROUTES — no navbar/footer
  // ----------------------------------------------------------
  { path: '/signin', element: <SignInPage /> },
  { path: '/signup', element: <SignUpPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  { path: '/read/:slug/:chapterNumber', element: <ReaderPage /> },
]);
