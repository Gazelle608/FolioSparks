// client/src/api/sparks.ts
import { supabase, handleApiError, ApiError } from './supabase';
import type {
  SparkBalance,
  SparkTransaction,
  SparkSpendInput,
  SparkNote,
  MonthlySparkGrant,
} from '../types/spark';

/**
 * Get the current user's Sparks balance
 */
export const getSparkBalance = async (
  userId: string
): Promise<SparkBalance> => {
  try {
    const { data, error } = await supabase
      .from('spark_balances')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    // If no balance record exists, create one with free tier grant
    if (!data) {
      return await initializeSparkBalance(userId, 100);
    }

    return data as SparkBalance;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Initialize a Sparks balance for a new user
 */
export const initializeSparkBalance = async (
  userId: string,
  initialAmount: number
): Promise<SparkBalance> => {
  try {
    const { data, error } = await supabase
      .from('spark_balances')
      .insert({
        user_id: userId,
        balance: initialAmount,
        lifetime_earned: initialAmount,
        lifetime_spent: 0,
        last_reset_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as SparkBalance;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Spend Sparks on a chapter
 */
export const spendSparks = async (
  input: SparkSpendInput,
  userId: string
): Promise<SparkTransaction> => {
  try {
    // Check balance first
    const balance = await getSparkBalance(userId);
    if (balance.balance < input.amount) {
      throw new ApiError('Insufficient Sparks balance', 'INSUFFICIENT_SPARKS');
    }

    // Get author_id from chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('author_id, book_id')
      .eq('id', input.chapterId)
      .single();

    if (chapterError) throw chapterError;

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('spark_transactions')
      .insert({
        user_id: userId,
        chapter_id: input.chapterId,
        author_id: chapter.author_id,
        amount: input.amount,
        note: input.note,
        type: 'spend',
      })
      .select()
      .single();

    if (txError) throw txError;

    // Update balance
    await supabase
      .from('spark_balances')
      .update({
        balance: balance.balance - input.amount,
        lifetime_spent: balance.lifetime_spent + input.amount,
      })
      .eq('user_id', userId);

    // Update chapter sparks count
    await supabase.rpc('increment_chapter_sparks', {
      p_chapter_id: input.chapterId,
      p_amount: input.amount,
    });

    // Update author total
    await supabase.rpc('increment_author_sparks', {
      p_author_id: chapter.author_id,
      p_amount: input.amount,
    });

    return transaction as SparkTransaction;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get Sparks transaction history for a user
 */
export const getSparkHistory = async (
  userId: string,
  limit = 50
): Promise<SparkTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('spark_transactions')
      .select(`
        *,
        chapter:chapters(id, title, chapter_number, book:books(id, title))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as SparkTransaction[];
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get Sparks received by an author
 */
export const getAuthorSparkHistory = async (
  authorId: string,
  limit = 50
): Promise<SparkTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('spark_transactions')
      .select(`
        *,
        chapter:chapters(id, title, chapter_number, book:books(id, title)),
        sender:auth.users!user_id(id, email)
      `)
      .eq('author_id', authorId)
      .eq('type', 'spend')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as SparkTransaction[];
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get all notes a reader has left on chapters (for the author to read)
 */
export const getSparkNotes = async (
  authorId: string,
  limit = 50
): Promise<SparkNote[]> => {
  try {
    const { data, error } = await supabase
      .from('spark_transactions')
      .select(`
        id,
        note,
        amount,
        created_at,
        chapter:chapters(id, title, chapter_number, book:books(id, title))
      `)
      .eq('author_id', authorId)
      .eq('type', 'spend')
      .not('note', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      note: row.note,
      amount: row.amount,
      createdAt: row.created_at,
      chapter: row.chapter,
    })) as SparkNote[];
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Apply the monthly Sparks reset for a user (called by cron or on login)
 */
export const applyMonthlySparkGrant = async (
  userId: string,
  tier: 'free' | 'spark' | 'spark_pro'
): Promise<SparkBalance> => {
  try {
    const grants: Record<string, number> = {
      free: 100,
      spark: 1200,
      spark_pro: 3000,
    };

    const grantAmount = grants[tier] || 100;

    const { data: balance, error: balanceError } = await supabase
      .from('spark_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (balanceError) throw balanceError;

    // Check if a month has passed since last reset
    const lastReset = new Date(balance.last_reset_at);
    const now = new Date();
    const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceReset < 30) {
      return balance as SparkBalance; // Not time yet
    }

    // Apply grant (unused Sparks expire)
    const { data, error } = await supabase
      .from('spark_balances')
      .update({
        balance: grantAmount,
        lifetime_earned: balance.lifetime_earned + grantAmount,
        last_reset_at: now.toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log the grant transaction
    await supabase
      .from('spark_transactions')
      .insert({
        user_id: userId,
        amount: grantAmount,
        type: 'monthly_reset',
      });

    return data as SparkBalance;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Check if a chapter is spark-locked and whether the user has unlocked it
 */
export const isChapterUnlocked = async (
  chapterId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('is_spark_locked')
      .eq('id', chapterId)
      .single();

    if (chapterError) throw chapterError;
    if (!chapter.is_spark_locked) return true;

    // Check if user has spent Sparks on this chapter
    const { data: unlock, error: unlockError } = await supabase
      .from('spark_transactions')
      .select('id')
      .eq('chapter_id', chapterId)
      .eq('user_id', userId)
      .eq('type', 'spend')
      .maybeSingle();

    if (unlockError) throw unlockError;
    return !!unlock;
  } catch (error) {
    throw handleApiError(error);
  }
};