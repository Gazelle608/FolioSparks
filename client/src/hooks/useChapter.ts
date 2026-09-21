import { useCallback, useEffect, useRef, useState } from "react";

import type { Chapter } from "../types/chapter";

import {
  getAdjacentChapters,
  getChapterByNumber,
  recordRead,
} from "../api/chapters";

// ---------------------------------------------------------------------------
// Full chapter view — chapter + prev + next
// ---------------------------------------------------------------------------
interface ChapterView {
  chapter: Chapter | null;
  previous: Chapter | null;
  next: Chapter | null;
}

interface UseChapterResult extends ChapterView {
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useChapter(
  storyId: string | null,
  chapterNumber: number | null,
  options: { recordReadOnLoad?: boolean } = {},
): UseChapterResult {
  const { recordReadOnLoad = true } = options;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [previous, setPrevious] = useState<Chapter | null>(null);
  const [next, setNext] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  // Track which chapter we"ve already recorded a read for
  const recordedRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    if (!storyId || !chapterNumber) {
      setChapter(null);
      setPrevious(null);
      setNext(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const chapterResult = await getChapterByNumber(storyId, chapterNumber);

    if (!mountedRef.current)
      return;

    if (chapterResult.error || !chapterResult.data) {
      setError(chapterResult.error ?? "Chapter not found");
      setChapter(null);
      setLoading(false);
      return;
    }

    const ch = chapterResult.data;
    setChapter(ch);

    // Fetch adjacent chapters in parallel
    const adjacentResult = await getAdjacentChapters(storyId, chapterNumber);

    if (!mountedRef.current)
      return;

    if (adjacentResult.data) {
      setPrevious(adjacentResult.data.previous);
      setNext(adjacentResult.data.next);
    }

    setLoading(false);

    // Record read once per chapter view
    if (recordReadOnLoad && recordedRef.current !== ch.id) {
      recordedRef.current = ch.id;
      // Fire and forget
      recordRead(ch.id).catch(() => {
        /* ignore */
      });
    }
  }, [storyId, chapterNumber, recordReadOnLoad]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { chapter, previous, next, loading, error, refetch: fetchData };
}
