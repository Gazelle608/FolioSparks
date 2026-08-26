export interface Book {
  id: string;
  author_id: string;
  title: string;
  description?: string;
  cover_url?: string;
  genre?: string[];
  tags?: string[];
  status: 'draft' | 'published' | 'complete';
  is_subscription_only: boolean;
  donation_enabled: boolean;
  total_chapters: number;
  total_reads: number;
  total_sparks: number;
  created_at: string;
  updated_at: string;
  authors?: {
    display_name: string;
    donation_platforms: Record<string, string>;
  };
}