import { Author } from './author';
import { IconProps } from './icons';

export interface Book {
  id: string;
  author_id: string;
  title: string;
  description: string;
  cover_url: string;
  genre: string[];
  tags: string[];
  status: 'draft' | 'published' | 'complete' | 'hiatus';
  is_subscription_only: boolean;
  donation_enabled: boolean;
  total_chapters: number;
  total_reads: number;
  total_sparks: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  completed_at?: string;
  authors?: Author;
  reading_progress?: number;
  is_in_library?: boolean;
}

export interface BookFilters {
  genre?: string;
  search?: string;
  authorId?: string;
  status?: Book['status'];
  sortBy?: 'popular' | 'recent' | 'sparks' | 'trending';
  tags?: string[];
}

export interface BookStats {
  totalReads: number;
  totalSparks: number;
  averageRating: number;
  chaptersCount: number;
  subscribersCount: number;
  completionRate: number;
  readerRetention: number;
}

export const GENRES = [
  'EPIC FANTASY',
  'ROMANCE',
  'SCI-FI',
  'MYSTERY',
  'LITERARY',
  'FANTASY',
  'HORROR',
  'THRILLER',
  'HISTORICAL',
  'YA',
  'NON-FICTION',
  'POETRY',
] as const;

export type Genre = typeof GENRES[number];