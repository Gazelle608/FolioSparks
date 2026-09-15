// client/src/api/audio.ts
import { supabase, handleApiError, ApiError } from './supabase';
import type {
  AudioStatus,
  AudioProgress,
  AudioVoice,
  AudioPlayerState,
} from '../types/audio';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Request TTS generation for a chapter
 */
export const requestAudioGeneration = async (
  chapterId: string,
  voice: AudioVoice = 'default'
): Promise<{ status: AudioStatus; jobId: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/audio/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterId, voice }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message || 'Failed to generate audio');
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Check the audio generation status of a chapter
 */
export const getAudioStatus = async (
  chapterId: string
): Promise<{ status: AudioStatus; audioUrl?: string }> => {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('audio_url, audio_status')
      .eq('id', chapterId)
      .single();

    if (error) throw error;

    return {
      status: data.audio_status as AudioStatus,
      audioUrl: data.audio_url || undefined,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Poll for audio generation completion
 */
export const pollAudioStatus = async (
  chapterId: string,
  maxAttempts = 30,
  intervalMs = 2000
): Promise<{ status: AudioStatus; audioUrl?: string }> => {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await getAudioStatus(chapterId);

    if (status.status === 'ready' || status.status === 'failed') {
      return status;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new ApiError('Audio generation timed out', 'AUDIO_TIMEOUT');
};

/**
 * Save reading/listening progress (syncs across devices)
 */
export const saveAudioProgress = async (
  bookId: string,
  chapterId: string,
  positionSeconds: number,
  userId: string
): Promise<AudioProgress> => {
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .upsert(
        {
          user_id: userId,
          book_id: bookId,
          chapter_id: chapterId,
          position_seconds: positionSeconds,
          mode: 'audio',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,book_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data as AudioProgress;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Save text reading progress
 */
export const saveTextProgress = async (
  bookId: string,
  chapterId: string,
  scrollPosition: number,
  userId: string
): Promise<AudioProgress> => {
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .upsert(
        {
          user_id: userId,
          book_id: bookId,
          chapter_id: chapterId,
          scroll_position: scrollPosition,
          mode: 'text',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,book_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data as AudioProgress;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get reading progress for a book
 */
export const getReadingProgress = async (
  bookId: string,
  userId: string
): Promise<AudioProgress | null> => {
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('book_id', bookId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as AudioProgress | null;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get all books in the user's bookshelf with progress
 */
export const getBookshelf = async (
  userId: string
): Promise<Array<AudioProgress & { book: unknown; chapter: unknown }>> => {
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select(`
        *,
        book:books(id, title, cover_url, author:authors(display_name)),
        chapter:chapters(id, title, chapter_number)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Array<AudioProgress & { book: unknown; chapter: unknown }>;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Download audio for offline playback (Spark tier only)
 */
export const downloadAudioForOffline = async (
  chapterId: string,
  userId: string
): Promise<Blob> => {
  try {
    // Check if user has access
    const { data: chapter, error } = await supabase
      .from('chapters')
      .select('audio_url, audio_status')
      .eq('id', chapterId)
      .single();

    if (error) throw error;
    if (chapter.audio_status !== 'ready' || !chapter.audio_url) {
      throw new ApiError('Audio not available', 'AUDIO_NOT_READY');
    }

    // Fetch the audio file
    const response = await fetch(chapter.audio_url);
    if (!response.ok) {
      throw new ApiError('Failed to download audio', 'DOWNLOAD_FAILED');
    }

    return await response.blob();
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Client-side TTS fallback using Web Speech API
 * (used when server-side TTS is not available)
 */
export const speakWithWebSpeech = (
  text: string,
  options: {
    rate?: number;
    pitch?: number;
    voice?: SpeechSynthesisVoice;
    onEnd?: () => void;
  } = {}
): SpeechSynthesisUtterance | null => {
  if (!('speechSynthesis' in window)) {
    console.warn('Web Speech API not supported');
    return null;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.0;
  if (options.voice) utterance.voice = options.voice;
  if (options.onEnd) utterance.onend = options.onEnd;

  window.speechSynthesis.speak(utterance);
  return utterance;
};

/**
 * Stop any active speech synthesis
 */
export const stopSpeaking = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Get available system voices for Web Speech API
 */
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
};