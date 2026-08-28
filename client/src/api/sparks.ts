import { supabase, apiResponse } from './client';
import { SparksTransaction, SparksBalance } from '../types/sparks';

export const sparksApi = {
  // Get user's Sparks balance
  getSparksBalance: async (userId: string): Promise<SparksBalance> => {
    // Get total spent
    const { data: spent } = await supabase
      .from('sparks_transactions')
      .select('amount')
      .eq('from_user_id', userId)
      .eq('type', 'tip');

    // Get total received from membership
    const { data: received } = await supabase
      .from('sparks_transactions')
      .select('amount')
      .eq('to_user_id', userId)
      .eq('type', 'membership_allotment');

    const totalSpent = spent?.reduce((sum, s) => sum + s.amount, 0) || 0;
    const totalReceived = received?.reduce((sum, s) => sum + s.amount, 0) || 0;

    return {
      userId,
      balance: totalReceived - totalSpent,
      totalSpent,
      totalReceived,
    };
  },

  // Send Sparks to author
  sendSparks: async (transaction: Omit<SparksTransaction, 'id' | 'created_at'>) => {
    return apiResponse(
      supabase
        .from('sparks_transactions')
        .insert([transaction])
        .select()
        .single()
    );
  },

  // Get transaction history for user
  getTransactionHistory: async (userId: string, limit: number = 50) => {
    return apiResponse(
      supabase
        .from('sparks_transactions')
        .select(`
          *,
          from_user:from_user_id (
            display_name,
            email
          ),
          to_author:to_author_id (
            display_name
          ),
          chapter:chapter_id (
            title,
            book_id,
            books:book_id (title)
          )
        `)
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(limit)
    );
  },

  // Get Sparks received by author
  getSparksReceivedByAuthor: async (authorId: string) => {
    return apiResponse(
      supabase
        .from('sparks_transactions')
        .select('*')
        .eq('to_author_id', authorId)
        .eq('type', 'tip')
        .order('created_at', { ascending: false })
    );
  },

  // Get top chapters by Sparks
  getTopChaptersBySparks: async (limit: number = 10) => {
    return apiResponse(
      supabase
        .from('sparks_transactions')
        .select('chapter_id, amount, chapters:chapter_id (title, book_id, books:book_id (title))')
        .eq('type', 'tip')
        .order('amount', { ascending: false })
        .limit(limit)
    );
  },

  // Add monthly Sparks allotment (called by cron job)
  addMonthlySparks: async (userId: string, membershipTier: 'free' | 'spark' | 'spark_pro') => {
    const allotments = {
      free: 100,
      spark: 1200,
      spark_pro: 3000,
    };

    const amount = allotments[membershipTier] || 0;

    return apiResponse(
      supabase
        .from('sparks_transactions')
        .insert([{
          to_user_id: userId,
          amount,
          type: 'membership_allotment',
          description: `Monthly ${membershipTier} Sparks allotment`,
        }])
        .select()
        .single()
    );
  },
};