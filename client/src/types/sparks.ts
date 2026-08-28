import { IconProps } from './icons';

export interface SparksTransaction {
  id: string;
  from_user_id?: string;
  to_user_id?: string;
  to_author_id?: string;
  chapter_id?: string;
  amount: number;
  type: 'tip' | 'membership_allotment' | 'purchase' | 'refund';
  description?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface SparksBalance {
  userId: string;
  balance: number;
  totalSpent: number;
  totalReceived: number;
  monthlyAllowance?: number;
  nextAllotment?: string;
}

export interface SparksAllotment {
  tier: 'free' | 'spark' | 'spark_pro';
  monthlyAmount: number;
  features: string[];
}

export const SPARKS_ALLOTMENTS: Record<string, SparksAllotment> = {
  free: {
    tier: 'free',
    monthlyAmount: 100,
    features: ['Full library access', '100 Sparks a month', 'Bookshelf and reading progress', 'Vote in chapter polls'],
  },
  spark: {
    tier: 'spark',
    monthlyAmount: 1200,
    features: [
      '1,200 Sparks a month',
      'Audio mode with offline chapters',
      'Early access chapters from your authors',
      'Supporter badge on comments and tips',
    ],
  },
  spark_pro: {
    tier: 'spark_pro',
    monthlyAmount: 3000,
    features: [
      '3,000 Sparks a month',
      'Chapter-level Sparks analytics',
      'Unlimited polls and co-writing desks',
      'Featured placement in the library',
    ],
  },
};