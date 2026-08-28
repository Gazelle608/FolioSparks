import { supabase, apiResponse } from './client';
import { Poll, PollVote } from '../types/poll';

export const pollsApi = {
  // Create poll
  createPoll: async (pollData: Partial<Poll>) => {
    return apiResponse(
      supabase
        .from('polls')
        .insert([pollData])
        .select()
        .single()
    );
  },

  // Get poll by ID
  getPollById: async (id: string) => {
    return apiResponse(
      supabase
        .from('polls')
        .select(`
          *,
          options:poll_options (*),
          votes:poll_votes (count)
        `)
        .eq('id', id)
        .single()
    );
  },

  // Get polls by book ID
  getPollsByBook: async (bookId: string) => {
    return apiResponse(
      supabase
        .from('polls')
        .select(`
          *,
          options:poll_options (*)
        `)
        .eq('book_id', bookId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
    );
  },

  // Vote on poll
  votePoll: async (voteData: Omit<PollVote, 'id' | 'voted_at'>) => {
    // Check if user already voted
    const { data: existing } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', voteData.poll_id)
      .eq('user_id', voteData.user_id)
      .single();

    if (existing) {
      return { data: null, error: 'You have already voted on this poll' };
    }

    return apiResponse(
      supabase
        .from('poll_votes')
        .insert([voteData])
        .select()
        .single()
    );
  },

  // Get poll results
  getPollResults: async (pollId: string) => {
    return apiResponse(
      supabase
        .from('poll_options')
        .select(`
          *,
          votes:poll_votes (count)
        `)
        .eq('poll_id', pollId)
    );
  },

  // Close poll
  closePoll: async (id: string) => {
    return apiResponse(
      supabase
        .from('polls')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single()
    );
  },
};