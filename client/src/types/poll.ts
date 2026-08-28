import { IconProps } from './icons';

export interface Poll {
  id: string;
  book_id: string;
  chapter_id?: string;
  title: string;
  description: string;
  options: PollOption[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  ends_at?: string;
  total_votes: number;
  is_user_voted?: boolean;
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  votes: number;
  percentage: number;
  order: number;
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  voted_at: string;
}

export interface PollResult {
  poll_id: string;
  options: PollOption[];
  totalVotes: number;
  winningOption: PollOption;
  userVote?: PollOption;
}

export const POLL_TYPES = ['chapter_poll', 'series_poll', 'character_poll', 'plot_poll'] as const;
export type PollType = typeof POLL_TYPES[number];