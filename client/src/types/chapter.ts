import { Book } from './book';
import { IconProps } from './icons';

export interface Chapter {
  id: string;
  book_id: string;
  title: string;
  content: string;
  chapter_number: number;
  word_count: number;
  is_published: boolean;
  published_at?: string;
  reads: number;
  sparks_received: number;
  created_at: string;
  updated_at: string;
  book?: Book;
  audio_url?: string;
  is_locked?: boolean;
  requires_subscription?: boolean;
}

export interface ChapterStats {
  totalReads: number;
  totalSparks: number;
  averageReadTime: number;
  completionRate: number;
  comments: number;
  retention: number;
}

export interface ChapterComment {
  id: string;
  chapter_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_avatar?: string;
  likes: number;
  replies: ChapterComment[];
}

export interface ReadingProgress {
  chapter_id: string;
  book_id: string;
  user_id: string;
  last_read_position: number;
  completed: boolean;
  read_at: string;
  percentage: number;
}