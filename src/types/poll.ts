// ============================================================
// Polls
// Mirrors: public.polls, public.poll_options, public.poll_votes
// ============================================================

// Postgres enum
export type PollStatus = 'open' | 'closed' | 'cancelled';

// ---------------------------------------------------------------------------
// Poll row
// ---------------------------------------------------------------------------
export interface Poll {
  id: string;
  story_id: string;
  author_id: string;
  chapter_id: string | null;
  question: string;
  description: string | null;
  status: PollStatus;
  closes_at: string | null;
  winning_option_id: string | null;
  total_votes: number;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Option row
// ---------------------------------------------------------------------------
export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  display_order: number;
  vote_count: number;
}

// ---------------------------------------------------------------------------
// Vote row
// ---------------------------------------------------------------------------
export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Insert shapes
// ---------------------------------------------------------------------------
export interface PollInsert {
  story_id: string;
  author_id: string;
  chapter_id?: string | null;
  question: string;
  description?: string | null;
  closes_at?: string | null;
}

export interface PollOptionInsert {
  poll_id: string;
  option_text: string;
  display_order?: number;
}

export interface PollVoteInsert {
  poll_id: string;
  option_id: string;
  user_id: string;
}

// ---------------------------------------------------------------------------
// UI payload — what the author submits from PollBuilder
// ---------------------------------------------------------------------------
export interface CreatePollInput {
  story_id: string;
  author_id: string;
  chapter_id: string;
  question: string;
  description?: string;
  closes_at?: string;
  options: string[]; // 2–6 option texts
}

// ---------------------------------------------------------------------------
// Composed reader view — poll + options + my vote + totals
// ---------------------------------------------------------------------------
export interface PollWithOptions extends Poll {
  options: PollOption[];
  myVoteOptionId: string | null;
}