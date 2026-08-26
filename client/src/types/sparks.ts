export interface SparksTransaction {
  id: string;
  from_user_id: string;
  to_author_id: string;
  chapter_id?: string;
  amount: number;
  type: 'tip' | 'subscription' | 'purchase';
  note?: string;
  created_at: string;
}