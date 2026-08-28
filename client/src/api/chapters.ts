import { supabase, apiResponse } from './client';
import { Chapter } from '../types/chapter';

export const chaptersApi = {
  // Create chapter
  createChapter: async (chapterData: Partial<Chapter>) => {
    return apiResponse(
      supabase
        .from('chapters')
        .insert([chapterData])
        .select()
        .single()
    );
  },

  // Get chapter by ID
  getChapterById: async (id: string) => {
    return apiResponse(
      supabase
        .from('chapters')
        .select(`
          *,
          books:book_id (
            title,
            author_id,
            authors:author_id (
              display_name,
              donation_platforms
            )
          )
        `)
        .eq('id', id)
        .single()
    );
  },

  // Get chapters by book ID
  getChaptersByBook: async (bookId: string) => {
    return apiResponse(
      supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('chapter_number', { ascending: true })
    );
  },

  // Get published chapters by book ID
  getPublishedChaptersByBook: async (bookId: string) => {
    return apiResponse(
      supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .eq('is_published', true)
        .order('chapter_number', { ascending: true })
    );
  },

  // Update chapter
  updateChapter: async (id: string, updates: Partial<Chapter>) => {
    return apiResponse(
      supabase
        .from('chapters')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  },

  // Delete chapter
  deleteChapter: async (id: string) => {
    return apiResponse(
      supabase
        .from('chapters')
        .delete()
        .eq('id', id)
    );
  },

  // Publish chapter
  publishChapter: async (id: string) => {
    return apiResponse(
      supabase
        .from('chapters')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
    );
  },

  // Get next chapter number for book
  getNextChapterNumber: async (bookId: string): Promise<number> => {
    const { data } = await supabase
      .from('chapters')
      .select('chapter_number')
      .eq('book_id', bookId)
      .order('chapter_number', { ascending: false })
      .limit(1);

    return (data?.[0]?.chapter_number || 0) + 1;
  },

  // Increment chapter reads
  incrementChapterReads: async (id: string) => {
    const { data: chapter } = await supabase
      .from('chapters')
      .select('reads')
      .eq('id', id)
      .single();

    const currentReads = chapter?.reads || 0;
    
    return apiResponse(
      supabase
        .from('chapters')
        .update({ reads: currentReads + 1 })
        .eq('id', id)
    );
  },
};