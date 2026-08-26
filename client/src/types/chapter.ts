export interface Chapter {
  id: string;
  book_id: string;
  title: string;
  content?: string;
  chapter_number: number;
  word_count: number;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}