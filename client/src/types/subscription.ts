import { IconProps } from './icons';

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'spark' | 'spark_pro';
  is_active: boolean;
  start_date: string;
  end_date?: string;
  canceled_at?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: 'free' | 'spark' | 'spark_pro';
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  isAuthor?: boolean;
  sparksAllowance: number;
}

export interface SubscriptionBenefits {
  hasSparks: boolean;
  sparksAmount: number;
  hasAudio: boolean;
  hasOffline: boolean;
  hasEarlyAccess: boolean;
  hasAnalytics: boolean;
  hasPolls: boolean;
  hasCoWriting: boolean;
  hasFeatured: boolean;
  supporterBadge: boolean;
}

export const SUBSCRIPTION_BENEFITS: Record<string, SubscriptionBenefits> = {
  free: {
    hasSparks: true,
    sparksAmount: 100,
    hasAudio: false,
    hasOffline: false,
    hasEarlyAccess: false,
    hasAnalytics: false,
    hasPolls: true,
    hasCoWriting: false,
    hasFeatured: false,
    supporterBadge: false,
  },
  spark: {
    hasSparks: true,
    sparksAmount: 1200,
    hasAudio: true,
    hasOffline: true,
    hasEarlyAccess: true,
    hasAnalytics: false,
    hasPolls: true,
    hasCoWriting: false,
    hasFeatured: false,
    supporterBadge: true,
  },
  spark_pro: {
    hasSparks: true,
    sparksAmount: 3000,
    hasAudio: true,
    hasOffline: true,
    hasEarlyAccess: true,
    hasAnalytics: true,
    hasPolls: true,
    hasCoWriting: true,
    hasFeatured: true,
    supporterBadge: true,
  },
};