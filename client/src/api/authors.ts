import { supabase, apiResponse } from './client';
import { Author, AuthorStats } from '../types/author';

export const authorsApi = {
  // Create author profile
  createAuthor: async (authorData: Partial<Author>) => {
    return apiResponse(
      supabase
        .from('authors')
        .insert([authorData])
        .select()
        .single()
    );
  },

  // Get author by ID
  getAuthorById: async (id: string) => {
    return apiResponse(
      supabase
        .from('authors')
        .select('*')
        .eq('id', id)
        .single()
    );
  },

  // Get author by user ID
  getAuthorByUserId: async (userId: string) => {
    return apiResponse(
      supabase
        .from('authors')
        .select('*')
        .eq('id', userId)
        .single()
    );
  },

  // Update author profile
  updateAuthor: async (id: string, updates: Partial<Author>) => {
    return apiResponse(
      supabase
        .from('authors')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  },

  // Get author stats
  getAuthorStats: async (authorId: string): Promise<AuthorStats> => {
    // Get total books
    const { data: books } = await supabase
      .from('books')
      .select('id')
      .eq('author_id', authorId);

    // Get total chapters
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id, book_id')
      .in('book_id', books?.map(b => b.id) || []);

    // Get total sparks received
    const { data: sparks } = await supabase
      .from('sparks_transactions')
      .select('amount')
      .eq('to_author_id', authorId);

    const totalSparks = sparks?.reduce((sum, s) => sum + s.amount, 0) || 0;

    return {
      totalBooks: books?.length || 0,
      totalChapters: chapters?.length || 0,
      totalSparks: totalSparks,
      totalReads: 0, // Would need to be calculated from book reads
    };
  },

  // Get top authors by Sparks
  getTopAuthors: async (limit: number = 10) => {
    return apiResponse(
      supabase
        .from('authors')
        .select(`
          *,
          books:books(total_sparks)
        `)
        .order('total_sparks', { ascending: false })
        .limit(limit)
    );
  },

  // Update donation platforms
  updateDonationPlatforms: async (authorId: string, platforms: Author['donation_platforms']) => {
    return apiResponse(
      supabase
        .from('authors')
        .update({ donation_platforms: platforms })
        .eq('id', authorId)
        .select()
        .single()
    );
  },
};