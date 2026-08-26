export interface Poll {
  id: string;
  book_id: string;
  question: string;
  description?: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  total_votes: number;
  is_active: boolean;
  created_at: string;
  ends_at?: string;
}