import { supabase, apiResponse } from './client';
import { Book, BookFilters } from '../types/book';

export const booksApi = {
  // Create book
  createBook: async (bookData: Partial<Book>) => {
    return apiResponse(
      supabase
        .from('books')
        .insert([bookData])
        .select()
        .single()
    );
  },

  // Get book by ID
  getBookById: async (id: string) => {
    return apiResponse(
      supabase
        .from('books')
        .select(`
          *,
          authors:author_id (
            id,
            display_name,
            bio,
            donation_platforms
          )
        `)
        .eq('id', id)
        .single()
    );
  },

  // Get all books with filters
  getBooks: async (filters?: BookFilters) => {
    let query = supabase
      .from('books')
      .select(`
        *,
        authors:author_id (
          display_name,
          donation_platforms
        )
      `)
      .eq('status', 'published');

    if (filters?.genre) {
      query = query.contains('genre', [filters.genre]);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.authorId) {
      query = query.eq('author_id', filters.authorId);
    }

    if (filters?.sortBy === 'popular') {
      query = query.order('total_reads', { ascending: false });
    } else if (filters?.sortBy === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (filters?.sortBy === 'sparks') {
      query = query.order('total_sparks', { ascending: false });
    }

    return apiResponse(query);
  },

  // Get books by author
  getBooksByAuthor: async (authorId: string) => {
    return apiResponse(
      supabase
        .from('books')
        .select('*')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false })
    );
  },

  // Update book
  updateBook: async (id: string, updates: Partial<Book>) => {
    return apiResponse(
      supabase
        .from('books')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  },

  // Delete book
  deleteBook: async (id: string) => {
    return apiResponse(
      supabase
        .from('books')
        .delete()
        .eq('id', id)
    );
  },

  // Increment book reads
  incrementReads: async (id: string) => {
    const { data: book } = await supabase
      .from('books')
      .select('total_reads')
      .eq('id', id)
      .single();

    const currentReads = book?.total_reads || 0;
    
    return apiResponse(
      supabase
        .from('books')
        .update({ total_reads: currentReads + 1 })
        .eq('id', id)
    );
  },

  // Get burning/trending books
  getBurningBooks: async (limit: number = 5) => {
    return apiResponse(
      supabase
        .from('books')
        .select(`
          *,
          authors:author_id (
            display_name,
            donation_platforms
          )
        `)
        .eq('status', 'published')
        .order('total_reads', { ascending: false })
        .limit(limit)
    );
  },
};