import { supabase, apiResponse } from './client';
import { Subscription, SubscriptionPlan } from '../types/subscription';

export const subscriptionsApi = {
  // Get available plans
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    return [
      {
        id: 'free',
        name: 'Free',
        price: 0,
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
        features: [
          '1,200 Sparks a month',
          'Audio mode with offline chapters',
          'Early access chapters from your authors',
          'Supporter badge on comments and tips',
        ],
        popular: true,
      },
      {
        id: 'spark_pro',
        name: 'Spark Pro',
        price: 12,
        features: [
          '3,000 Sparks a month',
          'Chapter-level Sparks analytics',
          'Unlimited polls and co-writing desks',
          'Featured placement in the library',
        ],
        isAuthor: true,
      },
    ];
  },

  // Get user's current subscription
  getUserSubscription: async (userId: string) => {
    return apiResponse(
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()
    );
  },

  // Create subscription
  createSubscription: async (subscriptionData: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => {
    return apiResponse(
      supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
        .single()
    );
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string) => {
    return apiResponse(
      supabase
        .from('subscriptions')
        .update({
          is_active: false,
          canceled_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
        .select()
        .single()
    );
  },

  // Update subscription tier
  updateSubscriptionTier: async (subscriptionId: string, tier: string) => {
    return apiResponse(
      supabase
        .from('subscriptions')
        .update({
          tier,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
        .select()
        .single()
    );
  },

  // Get subscription analytics
  getSubscriptionAnalytics: async (userId: string) => {
    // Get total sparks received from subscriptions
    const { data: sparks } = await supabase
      .from('sparks_transactions')
      .select('amount')
      .eq('to_user_id', userId)
      .eq('type', 'membership_allotment');

    const totalAllotted = sparks?.reduce((sum, s) => sum + s.amount, 0) || 0;

    // Get active subscribers count
    const { data: subscribers } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('is_active', true);

    return {
      totalSparksAllotted: totalAllotted,
      activeSubscribers: subscribers?.length || 0,
    };
  },
};