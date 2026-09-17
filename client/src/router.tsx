import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LibraryPage from '@/pages/LibraryPage';
import NotFoundPage from '@/pages/NotFoundPage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import OnboardingPage from '@/pages/OnboardingPage';
import StudioPage from '@/pages/StudioPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/library', element: <LibraryPage /> },
  { path: '/signin', element: <SignInPage /> },
  { path: '/signup', element: <SignUpPage /> },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/studio',
    element: (
      <ProtectedRoute requireAuthor>
        <StudioPage />
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
]);
