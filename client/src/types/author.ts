// ============================================================
// Author
// Mirrors: public.authors
// ============================================================

export interface Author {
  id: string; // same as profiles.id
  pen_name: string | null;
  tagline: string | null;
  total_sparks_received: number;
  total_reads: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Insert / Update shapes
// ---------------------------------------------------------------------------
export interface AuthorInsert {
  id: string;
  pen_name?: string | null;
  tagline?: string | null;
}

export interface AuthorUpdate {
  pen_name?: string | null;
  tagline?: string | null;
}

// ---------------------------------------------------------------------------
// Composed view — an author with their public profile attached
// ---------------------------------------------------------------------------
export interface AuthorWithProfile extends Author {
  profile: {
    username: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
  };
}

// ---------------------------------------------------------------------------
// Onboarding payload used by AuthorOnboarding.tsx
// ---------------------------------------------------------------------------
export interface AuthorOnboardingInput {
  id: string;
  pen_name: string;
  tagline?: string;
}