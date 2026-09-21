import { useCallback, useEffect, useRef, useState } from "react";

import { supabase } from "../api/supabase";
import { useAuth } from "./useauth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ReadingProgress {
  story_id: string;
  chapter_id: string;
  scroll_percent: number;
  last_read_at: string;
}

interface UseReadingProgressOptions {
  storyId: string | null;
  chapterId: string | null;
  /** Debounce window in ms — default 2000 */
  debounceMs?: number;
  /** Auto-restore scroll position on mount */
  restoreOnMount?: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useReadingProgress({
  storyId,
  chapterId,
  debounceMs = 2000,
  restoreOnMount = false,
}: UseReadingProgressOptions) {
  const { user } = useAuth();

  const [savedProgress, setSavedProgress] = useState<number | null>(null);
  const [restored, setRestored] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  // ---------------------------------------------------------------------------
  // Load saved progress on chapter change
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!user || !storyId || !chapterId) {
      setSavedProgress(null);
      setRestored(false);
      return;
    }

    let cancelled = false;

    supabase
      .from("reading_progress")
      .select("scroll_percent, chapter_id")
      .eq("user_id", user.id)
      .eq("story_id", storyId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error)
          return;

        const progress = data as unknown as Pick<ReadingProgress, "chapter_id" | "scroll_percent"> | null;

        if (progress && progress.chapter_id === chapterId) {
          setSavedProgress(progress.scroll_percent);
        }
        else {
          setSavedProgress(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, storyId, chapterId]);

  // ---------------------------------------------------------------------------
  // Restore scroll position (once)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!restoreOnMount || restored || savedProgress === null)
      return;
    if (typeof window === "undefined")
      return;

    // Wait a tick for content to render
    requestAnimationFrame(() => {
      const doc = document.documentElement;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const target = (savedProgress / 100) * scrollHeight;
      window.scrollTo({ top: target, behavior: "auto" });
      setRestored(true);
    });
  }, [restoreOnMount, restored, savedProgress]);

  // ---------------------------------------------------------------------------
  // Save progress (debounced)
  // ---------------------------------------------------------------------------
  const saveProgress = useCallback(
    async (percent: number) => {
      if (!user || !storyId || !chapterId)
        return;

      await supabase.from("reading_progress").upsert(
        [{
          user_id: user.id,
          story_id: storyId,
          chapter_id: chapterId,
          scroll_percent: Math.round(percent * 100) / 100,
          last_read_at: new Date().toISOString(),
        }] as unknown as never[],
        { onConflict: "user_id,story_id" },
      );
    },
    [user, storyId, chapterId],
  );

  const updateProgress = useCallback(
    (percent: number) => {
      pendingRef.current = percent;

      if (debounceRef.current)
        clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        if (pendingRef.current !== null) {
          saveProgress(pendingRef.current);
          pendingRef.current = null;
        }
      }, debounceMs);
    },
    [debounceMs, saveProgress],
  );

  // ---------------------------------------------------------------------------
  // Flush on unmount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;

      if (debounceRef.current)
        clearTimeout(debounceRef.current);

      // Fire-and-forget final save
      if (pendingRef.current !== null) {
        saveProgress(pendingRef.current);
      }
    };
  }, [saveProgress]);

  return {
    savedProgress,
    updateProgress,
    saveProgress,
  };
}
