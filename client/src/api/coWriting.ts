// client/src/api/coWriting.ts
import { supabase, handleApiError, ApiError } from './supabase';
import type {
  CoWriter,
  CoWriterInviteInput,
  CoWriterRole,
  CoWriterWithAuthor,
} from '../types/coWriter';

/**
 * Invite a co-writer to a book
 */
export const inviteCoWriter = async (
  input: CoWriterInviteInput,
  authorId: string
): Promise<CoWriter> => {
  try {
    // Check if already invited
    const { data: existing } = await supabase
      .from('co_writers')
      .select('id, status')
      .eq('book_id', input.bookId)
      .eq('co_writer_id', input.coWriterId)
      .maybeSingle();

    if (existing) {
      throw new ApiError('This author is already invited', 'ALREADY_INVITED');
    }

    const { data, error } = await supabase
      .from('co_writers')
      .insert({
        book_id: input.bookId,
        author_id: authorId,
        co_writer_id: input.coWriterId,
        role: input.role || 'draft_only',
        status: 'invited',
      })
      .select()
      .single();

    if (error) throw error;

    // Mark book as co-written
    await supabase
      .from('books')
      .update({ is_co_written: true })
      .eq('id', input.bookId);

    return data as CoWriter;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Accept a co-writing invitation
 */
export const acceptCoWriterInvite = async (
  inviteId: string,
  coWriterId: string
): Promise<CoWriter> => {
  try {
    const { data, error } = await supabase
      .from('co_writers')
      .update({
        status: 'active',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', inviteId)
      .eq('co_writer_id', coWriterId)
      .select()
      .single();

    if (error) throw error;
    return data as CoWriter;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Decline a co-writing invitation
 */
export const declineCoWriterInvite = async (
  inviteId: string,
  coWriterId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('co_writers')
      .update({ status: 'removed' })
      .eq('id', inviteId)
      .eq('co_writer_id', coWriterId);

    if (error) throw error;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Remove a co-writer from a book
 */
export const removeCoWriter = async (
  coWriterId: string,
  bookId: string,
  authorId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('co_writers')
      .update({ status: 'removed' })
      .eq('book_id', bookId)
      .eq('co_writer_id', coWriterId)
      .eq('author_id', authorId);

    if (error) throw error;

    // Check if any active co-writers remain
    const { data: remaining } = await supabase
      .from('co_writers')
      .select('id')
      .eq('book_id', bookId)
      .eq('status', 'active');

    if (!remaining || remaining.length === 0) {
      await supabase
        .from('books')
        .update({ is_co_written: false })
        .eq('id', bookId);
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update a co-writer's role
 */
export const updateCoWriterRole = async (
  coWriterId: string,
  bookId: string,
  newRole: CoWriterRole
): Promise<CoWriter> => {
  try {
    const { data, error } = await supabase
      .from('co_writers')
      .update({ role: newRole })
      .eq('book_id', bookId)
      .eq('co_writer_id', coWriterId)
      .select()
      .single();

    if (error) throw error;
    return data as CoWriter;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get all co-writers for a book
 */
export const getCoWritersByBook = async (
  bookId: string
): Promise<CoWriterWithAuthor[]> => {
  try {
    const { data, error } = await supabase
      .from('co_writers')
      .select(`
        *,
        co_writer:authors!co_writer_id(
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('book_id', bookId)
      .neq('status', 'removed');

    if (error) throw error;
    return (data || []) as CoWriterWithAuthor[];
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get all invitations received by a co-writer
 */
export const getMyInvitations = async (
  coWriterId: string
): Promise<CoWriter[]> => {
  try {
    const { data, error } = await supabase
      .from('co_writers')
      .select(`
        *,
        book:books(id, title, cover_url),
        author:authors!author_id(id, display_name, avatar_url)
      `)
      .eq('co_writer_id', coWriterId)
      .eq('status', 'invited')
      .order('invited_at', { ascending: false });

    if (error) throw error;
    return (data || []) as CoWriter[];
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Toggle a book's open desk status (allows anyone to request co-writing)
 */
export const toggleOpenDesk = async (
  bookId: string,
  authorId: string,
  isOpen: boolean
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('books')
      .update({ is_open_desk: isOpen })
      .eq('id', bookId)
      .eq('author_id', authorId);

    if (error) throw error;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Check if a user has co-writing permission on a book
 */
export const canUserEditBook = async (
  bookId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data: book } = await supabase
      .from('books')
      .select('author_id')
      .eq('id', bookId)
      .single();

    if (book?.author_id === userId) return true;

    const { data: coWriter } = await supabase
      .from('co_writers')
      .select('role, status')
      .eq('book_id', bookId)
      .eq('co_writer_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    return !!coWriter;
  } catch (error) {
    return false;
  }
};