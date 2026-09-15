// client/src/api/chapters.ts
import { supabase, handleApiError, ApiError } from './supabase';
import type {
  Chapter,
  ChapterCreateInput,
  ChapterUpdateInput,
  ChapterWithPoll,
  PublishSchedule,
} from '../types/chapter';

/**
 * Get all chapters for a book (author view — includes drafts)
 */
export const getChaptersByBook = async (
  bookId: string,
  includeDrafts = false
): Promise<Chapter[]> => {
  try {
    let query = supabase
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('chapter_number', { ascending: true });

    if (!includeDrafts) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []) as Chapter[];
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get a single chapter with poll data
 */
export const getChapterById = async (
  chapterId: string
): Promise<ChapterWithPoll> => {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select(`
        *,
        poll:polls(*)
      `)
      .eq('id', chapterId)
      .single();

    if (error) throw error;
    if (!data) throw new ApiError('Chapter not found', 'NOT_FOUND');

    return data as ChapterWithPoll;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create a new chapter draft
 */
export const createChapter = async (
  input: ChapterCreateInput,
  authorId: string
): Promise<Chapter> => {
  try {
    // Get the next chapter number
    const { data: lastChapter } = await supabase
      .from('chapters')
      .select('chapter_number')
      .eq('book_id', input.bookId)
      .order('chapter_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextNumber = (lastChapter?.chapter_number || 0) + 1;

    const { data, error } = await supabase
      .from('chapters')
      .insert({
        book_id: input.bookId,
        author_id: authorId,
        title: input.title,
        content: input.content,
        chapter_number: nextNumber,
        word_count: countWords(input.content),
        is_published: false,
        is_early_access: input.isEarlyAccess ?? false,
        is_spark_locked: input.isSparkLocked ?? false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Chapter;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update a chapter
 */
export const updateChapter = async (
  chapterId: string,
  updates: ChapterUpdateInput
): Promise<Chapter> => {
  try {
    const payload: Record<string, unknown> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Recalculate word count if content changed
    if (updates.content) {
      payload.word_count = countWords(updates.content);
    }

    const { data, error } = await supabase
      .from('chapters')
      .update(payload)
      .eq('id', chapterId)
      .select()
      .single();

    if (error) throw error;
    return data as Chapter;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Publish a chapter immediately
 */
export const publishChapter = async (
  chapterId: string
): Promise<Chapter> => {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .eq('id', chapterId)
      .select()
      .single();

    if (error) throw error;

    // Update book's last_updated_at and chapter count
    await supabase.rpc('update_book_after_publish', {
      p_book_id: data.book_id,
    });

    return data as Chapter;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Schedule a chapter for future publishing
 */
export const scheduleChapter = async (
  chapterId: string,
  schedule: PublishSchedule
): Promise<Chapter> => {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .update({
        scheduled_for: schedule.publishAt,
        is_published: false,
      })
      .eq('id', chapterId)
      .select()
      .single();

    if (error) throw error;
    return data as Chapter;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Unpublish a chapter (revert to draft)
 */
export const unpublishChapter = async (
  chapterId: string
): Promise<Chapter> => {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .update({
        is_published: false,
        published_at: null,
      })
      .eq('id', chapterId)
      .select()
      .single();

    if (error) throw error;
    return data as Chapter;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete a chapter
 */
export const deleteChapter = async (chapterId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId);

    if (error) throw error;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Increment read count for a chapter (called on chapter open)
 */
export const trackChapterRead = async (chapterId: string): Promise<void> => {
  try {
    await supabase.rpc('increment_chapter_reads', {
      p_chapter_id: chapterId,
    });
  } catch (error) {
    // Silent fail — analytics shouldn't break the reader
    console.error('Failed to track chapter read:', error);
  }
};

/**
 * Get the next/previous chapter for navigation
 */
export const getAdjacentChapters = async (
  bookId: string,
  currentChapterNumber: number
): Promise<{ prev: Chapter | null; next: Chapter | null }> => {
  try {
    const [prevResult, nextResult] = await Promise.all([
      supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .eq('is_published', true)
        .lt('chapter_number', currentChapterNumber)
        .order('chapter_number', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .eq('is_published', true)
        .gt('chapter_number', currentChapterNumber)
        .order('chapter_number', { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      prev: prevResult.data as Chapter | null,
      next: nextResult.data as Chapter | null,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Utility: count words in content
 */
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};