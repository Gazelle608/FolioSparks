export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'spark' | 'spark-pro';
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
}