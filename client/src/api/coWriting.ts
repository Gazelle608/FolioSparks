import { supabase, apiResponse } from './client';
import { CoWritingInvite, CoWritingContribution } from '../types/coWriting';

export const coWritingApi = {
  // Invite co-writer
  inviteCoWriter: async (inviteData: Omit<CoWritingInvite, 'id' | 'created_at' | 'status'>) => {
    return apiResponse(
      supabase
        .from('co_writing_invites')
        .insert([inviteData])
        .select()
        .single()
    );
  },

  // Get invites for a book
  getInvitesByBook: async (bookId: string) => {
    return apiResponse(
      supabase
        .from('co_writing_invites')
        .select(`
          *,
          inviter:inviter_id (
            display_name,
            email
          ),
          invitee:invitee_id (
            display_name,
            email
          )
        `)
        .eq('book_id', bookId)
        .order('created_at', { ascending: false })
    );
  },

  // Get invites for a user
  getInvitesByUser: async (userId: string) => {
    return apiResponse(
      supabase
        .from('co_writing_invites')
        .select(`
          *,
          inviter:inviter_id (
            display_name,
            email
          ),
          books:book_id (
            title,
            authors:author_id (display_name)
          )
        `)
        .eq('invitee_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
    );
  },

  // Accept invite
  acceptInvite: async (inviteId: string) => {
    return apiResponse(
      supabase
        .from('co_writing_invites')
        .update({ 
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', inviteId)
        .select()
        .single()
    );
  },

  // Reject invite
  rejectInvite: async (inviteId: string) => {
    return apiResponse(
      supabase
        .from('co_writing_invites')
        .update({ 
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', inviteId)
        .select()
        .single()
    );
  },

  // Submit co-writing contribution
  submitContribution: async (contribution: Omit<CoWritingContribution, 'id' | 'created_at'>) => {
    return apiResponse(
      supabase
        .from('co_writing_contributions')
        .insert([contribution])
        .select()
        .single()
    );
  },

  // Get contributions for a book
  getContributionsByBook: async (bookId: string) => {
    return apiResponse(
      supabase
        .from('co_writing_contributions')
        .select(`
          *,
          author:author_id (
            display_name,
            email
          )
        `)
        .eq('book_id', bookId)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false })
    );
  },

  // Accept contribution
  acceptContribution: async (contributionId: string) => {
    return apiResponse(
      supabase
        .from('co_writing_contributions')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', contributionId)
        .select()
        .single()
    );
  },

  // Reject contribution
  rejectContribution: async (contributionId: string) => {
    return apiResponse(
      supabase
        .from('co_writing_contributions')
        .update({ 
          status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', contributionId)
        .select()
        .single()
    );
  },
};