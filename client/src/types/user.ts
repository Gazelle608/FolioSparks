// ============================================================
// User / Profile
// Mirrors: public.profiles
// ============================================================

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_author: boolean;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Insert / Update shapes
// ---------------------------------------------------------------------------
export interface ProfileInsert {
  id: string; // matches auth.users.id
  username: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  is_author?: boolean;
  onboarded_at?: string | null;
}

export interface ProfileUpdate {
  username?: string;
  display_name?: string;
  avatar_url?: string | null;
  bio?: string | null;
  is_author?: boolean;
  onboarded_at?: string | null;
}

// ---------------------------------------------------------------------------
// Signup form payload (before hitting auth)
// ---------------------------------------------------------------------------
export interface SignUpInput {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

// ---------------------------------------------------------------------------
// Public-facing profile view — what you show on cards/comments
// ---------------------------------------------------------------------------
export interface UserSummary {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}