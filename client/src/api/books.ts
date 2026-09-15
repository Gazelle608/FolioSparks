// client/src/api/books.ts
import { supabase, handleApiError, ApiError } from './supabase';
import type {
  Book,
  BookCreateInput,
  BookUpdateInput,
  BookWithAuthor,
  BookFilters,
  PaginatedResponse,
  BookStats,
} from '../types/book';

const BOOK_SELECT = `
  *,
  author:authors(
    id,
    display_name,
    avatar_url,
    donation_platforms
  )
`;

/**
 * Fetch books with filters and pagination
 */
export const getBooks = async (
  filters: BookFilters = {},
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<BookWithAuthor>> => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('books')
      .select(BOOK_SELECT, { count: 'exact' })
      .eq('status', 'ongoing') // Only show published/ongoing by default
      .range(from, to)
      .order('last_updated_at', { ascending: false });

    // Genre filter
    if (filters.genre) {
      query = query.eq('genre', filters.genre);
    }

    // Tags filter (array overlap)
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    // Co-written filter
    if (filters.isCoWritten !== undefined) {
      query = query.eq('is_co_written', filters.isCoWritten);
    }

    // Open desk filter
    if (filters.isOpenDesk !== undefined) {
      query = query.eq('is_open_desk', filters.isOpenDesk);
    }

    // Has polls filter
    if (filters.hasPolls !== undefined) {
      query = query.eq('has_polls', filters.hasPolls);
    }

    // Search by title
    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data || []) as BookWithAuthor[],
      total: count || 0,
      page,
      pageSize,
      hasMore: (count || 0) > to + 1,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Fetch a single book by ID (with author info)
 */
export const getBookById = async (bookId: string): Promise<BookWithAuthor> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select(BOOK_SELECT)
      .eq('id', bookId)
      .single();

    if (error) throw error;
    if (!data) throw new ApiError('Book not found', 'NOT_FOUND');

    return data as BookWithAuthor;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Fetch books by a specific author
 */
export const getBooksByAuthor = async (
  authorId: string,
  includeDrafts = false
): Promise<Book[]> => {
  try {
    let query = supabase
      .from('books')
      .select('*')
      .eq('author_id', authorId)
      .order('updated_at', { ascending: false });

    if (!includeDrafts) {
      query = query.neq('status', 'draft');
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []) as Book[];
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create a new book draft
 */
export const createBook = async (
  input: BookCreateInput,
  authorId: string
): Promise<Book> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .insert({
        author_id: authorId,
        title: input.title,
        synopsis: input.synopsis,
        cover_url: input.coverUrl,
        genre: input.genre,
        tags: input.tags || [],
        status: 'draft',
        audio_enabled: input.audioEnabled ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Book;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update a book
 */
export const updateBook = async (
  bookId: string,
  updates: BookUpdateInput
): Promise<Book> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookId)
      .select()
      .single();

    if (error) throw error;
    return data as Book;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Publish a book (change status from draft to ongoing)
 */
export const publishBook = async (bookId: string): Promise<Book> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .update({
        status: 'ongoing',
        last_updated_at: new Date().toISOString(),
      })
      .eq('id', bookId)
      .select()
      .single();

    if (error) throw error;
    return data as Book;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete a book (soft delete recommended in production)
 */
export const deleteBook = async (bookId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);

    if (error) throw error;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get detailed stats for a book (author dashboard)
 */
export const getBookStats = async (bookId: string): Promise<BookStats> => {
  try {
    // Get book base stats
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('total_reads, total_sparks, total_chapters')
      .eq('id', bookId)
      .single();

    if (bookError) throw bookError;

    // Get chapter-by-chapter stats
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, title, chapter_number, reads, sparks_received')
      .eq('book_id', bookId)
      .order('chapter_number', { ascending: true });

    if (chaptersError) throw chaptersError;

    // Get recent sparks transactions
    const { data: recentSparks, error: sparksError } = await supabase
      .from('spark_transactions')
      .select('id, amount, note, created_at, chapter_id')
      .eq('author_id', book.author_id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (sparksError) throw sparksError;

    return {
      totalReads: book.total_reads,
      totalSparks: book.total_sparks,
      totalChapters: book.total_chapters,
      chapterBreakdown: chapters || [],
      recentSparks: recentSparks || [],
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Upload a book cover to Supabase Storage
 */
export const uploadBookCover = async (
  bookId: string,
  file: File
): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${bookId}-${Date.now()}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('book-covers')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('book-covers')
      .getPublicUrl(filePath);

    // Update book with new cover URL
    await updateBook(bookId, { coverUrl: publicUrl });

    return publicUrl;
  } catch (error) {
    throw handleApiError(error);
  }
};