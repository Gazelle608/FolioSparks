// ============================================================
// Co-writing Desks
// Mirrors: public.desks, public.desk_members,
//          public.desk_invites, public.desk_submissions
// ============================================================

// Postgres enums
export type DeskRole = 'owner' | 'cowriter' | 'reader';
export type DeskStatus = 'open' | 'closed';
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'revoked';

// ---------------------------------------------------------------------------
// Desk row
// ---------------------------------------------------------------------------
export interface Desk {
  id: string;
  story_id: string;
  owner_id: string;
  title: string;
  brief: string | null;
  status: DeskStatus;
  max_cowriters: number;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Member row (with optional joined profile)
// ---------------------------------------------------------------------------
export interface DeskMember {
  id: string;
  desk_id: string;
  user_id: string;
  role: DeskRole;
  joined_at: string;

  // Joined from profiles
  profile?: {
    display_name: string;
    username: string;
    avatar_url: string | null;
  };
}

// ---------------------------------------------------------------------------
// Invite row (with optional joined invitee profile)
// ---------------------------------------------------------------------------
export interface DeskInvite {
  id: string;
  desk_id: string;
  invited_user_id: string;
  invited_by: string;
  status: InviteStatus;
  message: string | null;
  created_at: string;
  responded_at: string | null;

  // Joined from profiles
  invited_user?: {
    display_name: string;
    username: string;
    avatar_url: string | null;
  };
}

// ---------------------------------------------------------------------------
// Submission row (with optional joined submitter profile)
// ---------------------------------------------------------------------------
export interface DeskSubmission {
  id: string;
  desk_id: string;
  chapter_number: number;
  submitted_by: string;
  title: string | null;
  content: string;
  word_count: number;
  is_approved: boolean;
  approved_at: string | null;
  created_at: string;

  // Joined from profiles
  submitter?: {
    display_name: string;
    username: string;
    avatar_url: string | null;
  };
}

// ---------------------------------------------------------------------------
// Insert shapes
// ---------------------------------------------------------------------------
export interface DeskInsert {
  story_id: string;
  owner_id: string;
  title: string;
  brief?: string | null;
  max_cowriters?: number;
}

export interface DeskInviteInsert {
  desk_id: string;
  invited_user_id: string;
  invited_by: string;
  message?: string | null;
}

export interface DeskMemberInsert {
  desk_id: string;
  user_id: string;
  role?: DeskRole;
}

export interface DeskSubmissionInsert {
  desk_id: string;
  chapter_number: number;
  submitted_by: string;
  title?: string | null;
  content: string;
}

// ---------------------------------------------------------------------------
// Action payloads
// ---------------------------------------------------------------------------
export interface CreateDeskInput {
  story_id: string;
  owner_id: string;
  title: string;
  brief?: string;
  max_cowriters?: number;
}

export interface SubmitDraftInput {
  desk_id: string;
  chapter_number: number;
  title?: string;
  content: string;
}

// ---------------------------------------------------------------------------
// UI helper types
// ---------------------------------------------------------------------------
export interface DeskWithMembers extends Desk {
  members: DeskMember[];
}

export interface DeskFull extends Desk {
  members: DeskMember[];
  pendingInvites: DeskInvite[];
  submissions: DeskSubmission[];
}