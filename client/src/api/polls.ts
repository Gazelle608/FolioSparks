// client/src/api/polls.ts
import { supabase, handleApiError, ApiError } from './supabase';
import type {
  Poll,
  PollCreateInput,
  PollWithVotes,
  PollVote,
  PollVoteInput,
} from '../types/poll';

/**
 * Get a poll by chapter ID
 */
export const getPollByChapter = async (
  chapterId: string
): Promise<PollWithVotes | null> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        votes:poll_votes(
          id,
          option_id,
          spark_weight,
          user_id
        )
      `)
      .eq('chapter_id', chapterId)
      .maybeSingle();

    if (error) throw error;
    return data as PollWithVotes | null;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create a poll attached to a chapter
 */
export const createPoll = async (
  input: PollCreateInput,
  authorId: string
): Promise<Poll> => {
  try {
    // Validate: 2-4 options
    if (input.options.length < 2 || input.options.length > 4) {
      throw new ApiError('Polls must have 2-4 options', 'INVALID_POLL');
    }

    const { data, error } = await supabase
      .from('polls')
      .insert({
        chapter_id: input.chapterId,
        book_id: input.bookId,
        author_id: authorId,
        question: input.question,
        options: input.options, // [{ id: 'a', text: '...' }, ...]
        closes_at: input.closesAt,
        is_closed: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Link poll to chapter
    await supabase
      .from('chapters')
      .update({ poll_id: data.id })
      .eq('id', input.chapterId);

    // Mark book as having polls
    await supabase
      .from('books')
      .update({ has_polls: true })
      .eq('id', input.bookId);

    return data as Poll;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Vote on a poll
 */
export const voteOnPoll = async (
  input: PollVoteInput,
  userId: string
): Promise<PollVote> => {
  try {
    // Check if poll is still open
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('is_closed, closes_at, options')
      .eq('id', input.pollId)
      .single();

    if (pollError) throw pollError;
    if (poll.is_closed) {
      throw new ApiError('This poll is closed', 'POLL_CLOSED');
    }
    if (poll.closes_at && new Date(poll.closes_at) < new Date()) {
      throw new ApiError('This poll has expired', 'POLL_EXPIRED');
    }

    // Validate option exists
    const validOption = (poll.options as Array<{ id: string }>).find(
      (o) => o.id === input.optionId
    );
    if (!validOption) {
      throw new ApiError('Invalid poll option', 'INVALID_OPTION');
    }

    // Upsert vote (allows changing vote)
    const { data, error } = await supabase
      .from('poll_votes')
      .upsert(
        {
          poll_id: input.pollId,
          user_id: userId,
          option_id: input.optionId,
          spark_weight: input.sparkWeight || 1,
        },
        { onConflict: 'poll_id,user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data as PollVote;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Close a poll and set the winning option
 */
export const closePoll = async (
  pollId: string,
  authorId: string
): Promise<Poll> => {
  try {
    // Get all votes to determine winner
    const { data: votes, error: votesError } = await supabase
      .from('poll_votes')
      .select('option_id, spark_weight')
      .eq('poll_id', pollId);

    if (votesError) throw votesError;

    // Tally votes
    const tally: Record<string, number> = {};
    (votes || []).forEach((v) => {
      tally[v.option_id] = (tally[v.option_id] || 0) + v.spark_weight;
    });

    const winningOption = Object.entries(tally).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    if (!winningOption) {
      throw new ApiError('No votes cast', 'NO_VOTES');
    }

    const { data, error } = await supabase
      .from('polls')
      .update({
        is_closed: true,
        winning_option_id: winningOption,
      })
      .eq('id', pollId)
      .eq('author_id', authorId)
      .select()
      .single();

    if (error) throw error;
    return data as Poll;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Mark a winning poll result as applied to a chapter
 */
export const applyPollToChapter = async (
  pollId: string,
  chapterId: string
): Promise<Poll> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .update({ applied_to_chapter_id: chapterId })
      .eq('id', pollId)
      .select()
      .single();

    if (error) throw error;
    return data as Poll;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get poll results (aggregated)
 */
export const getPollResults = async (
  pollId: string
): Promise<{
  totalVotes: number;
  results: Array<{ optionId: string; votes: number; percentage: number }>;
}> => {
  try {
    const { data: votes, error } = await supabase
      .from('poll_votes')
      .select('option_id, spark_weight')
      .eq('poll_id', pollId);

    if (error) throw error;

    const tally: Record<string, number> = {};
    let total = 0;

    (votes || []).forEach((v) => {
      tally[v.option_id] = (tally[v.option_id] || 0) + v.spark_weight;
      total += v.spark_weight;
    });

    const results = Object.entries(tally).map(([optionId, votes]) => ({
      optionId,
      votes,
      percentage: total > 0 ? Math.round((votes / total) * 100) : 0,
    }));

    return { totalVotes: total, results };
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get all polls for a book
 */
export const getPollsByBook = async (bookId: string): Promise<Poll[]> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Poll[];
  } catch (error) {
    throw handleApiError(error);
  }
};