// client/src/api/subscriptions.ts
import { supabase, handleApiError, ApiError } from './supabase';
import type {
  Subscription,
  SubscriptionTier,
  CheckoutSession,
  SubscriptionStatus,
} from '../types/subscription';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Get the current user's subscription
 */
export const getMySubscription = async (
  userId: string
): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as Subscription | null;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create a Stripe Checkout session for upgrading
 * This calls our Node.js backend which creates the Stripe session
 */
export const createCheckoutSession = async (
  tier: SubscriptionTier,
  userId: string
): Promise<CheckoutSession> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tier,
        userId,
        successUrl: `${window.location.origin}/membership/success`,
        cancelUrl: `${window.location.origin}/membership`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message || 'Failed to create checkout session');
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Redirect user to Stripe Checkout
 */
export const redirectToCheckout = async (
  tier: SubscriptionTier,
  userId: string
): Promise<void> => {
  try {
    const session = await createCheckoutSession(tier, userId);
    window.location.href = session.url;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Open the Stripe Customer Portal (for managing/canceling subscriptions)
 */
export const openCustomerPortal = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        returnUrl: `${window.location.origin}/settings`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message || 'Failed to open customer portal');
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Cancel a subscription at period end
 */
export const cancelSubscription = async (
  userId: string
): Promise<Subscription> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message || 'Failed to cancel subscription');
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Resume a canceled subscription
 */
export const resumeSubscription = async (
  userId: string
): Promise<Subscription> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message || 'Failed to resume subscription');
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get the current user's subscription tier
 */
export const getMyTier = async (
  userId: string
): Promise<SubscriptionTier> => {
  try {
    const subscription = await getMySubscription(userId);
    if (!subscription || subscription.status !== 'active') {
      return 'free';
    }
    return subscription.tier;
  } catch (error) {
    return 'free';
  }
};

/**
 * Check if the user has access to a premium feature
 */
export const hasFeatureAccess = async (
  userId: string,
  feature: 'audio' | 'early_access' | 'analytics' | 'featured_placement'
): Promise<boolean> => {
  try {
    const tier = await getMyTier(userId);

    const featureMatrix: Record<string, SubscriptionTier[]> = {
      audio: ['spark', 'spark_pro'],
      early_access: ['spark', 'spark_pro'],
      analytics: ['spark_pro'],
      featured_placement: ['spark_pro'],
    };

    return featureMatrix[feature]?.includes(tier) ?? false;
  } catch (error) {
    return false;
  }
};

/**
 * Get subscription tier details (for pricing page)
 */
export const getTierDetails = (): Array<{
  id: SubscriptionTier;
  name: string;
  price: number;
  period: string;
  features: string[];
  sparks: number;
  popular: boolean;
}> => {
  return [
    {
      id: 'free',
      name: 'Free Reader',
      price: 0,
      period: 'forever',
      sparks: 100,
      popular: false,
      features: [
        'Full library access',
        '100 Sparks a month',
        'Bookshelf and reading progress',
        'Vote in chapter polls',
      ],
    },
    {
      id: 'spark',
      name: 'Spark',
      price: 5,
      period: 'month',
      sparks: 1200,
      popular: true,
      features: [
        '1,200 Sparks a month',
        'Audio mode with offline chapters',
        'Early access chapters from your authors',
        'Supporter badge on comments and tips',
      ],
    },
    {
      id: 'spark_pro',
      name: 'Spark Pro',
      price: 12,
      period: 'month',
      sparks: 3000,
      popular: false,
      features: [
        '3,000 Sparks a month',
        'Chapter-level Sparks analytics',
        'Unlimited polls and co-writing desks',
        'Featured placement in the library',
      ],
    },
  ];
};