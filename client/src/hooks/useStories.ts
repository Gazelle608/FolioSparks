import { useCallback, useEffect, useRef, useState } from "react";

import type { Story } from "../types/story";

import {
  getBurningNow,
  getStoriesByAuthor,
  listStories,
  type ListStoriesOptions,
} from "../api/stories";

// ---------------------------------------------------------------------------
// Shared hook result shape
// ---------------------------------------------------------------------------
interface StoriesResult {
  stories: Story[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// 1. listStories — the library page"s main hook
// ---------------------------------------------------------------------------
export function useStories(
  options: ListStoriesOptions = {},
): StoriesResult & { loadMore: () => Promise<void>; hasMore: boolean } {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Track options in a ref so refetch doesn"t change identity
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Cancel tracking
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchPage = useCallback(
    async (offset: number, append: boolean) => {
      if (!append)
        setLoading(true);
      setError(null);

      const opts = optionsRef.current;
      const result = await listStories({
        ...opts,
        limit: opts.limit ?? 24,
        offset,
      });

      if (!mountedRef.current)
        return;

      if (result.error || !result.data) {
        setError(result.error ?? "Could not load stories");
        setLoading(false);
        return;
      }

      const next = result.data;
      setStories(prev => (append ? [...prev, ...next] : next));
      setHasMore(next.length === (opts.limit ?? 24));
      setLoading(false);
    },
    [],
  );

  // Refetch whenever filters change
  useEffect(() => {
    fetchPage(0, false);
  }, [
    options.genre,
    options.status,
    options.tag,
    options.search,
    options.orderBy,
    fetchPage,
  ]);

  const refetch = useCallback(async () => {
    await fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore)
      return;
    await fetchPage(stories.length, true);
  }, [fetchPage, loading, hasMore, stories.length]);

  return { stories, loading, error, refetch, loadMore, hasMore };
}

// ---------------------------------------------------------------------------
// 2. useBurningNow — homepage carousel
// ---------------------------------------------------------------------------
export function useBurningNow(limit = 6): StoriesResult {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getBurningNow(limit);
    if (!mountedRef.current)
      return;

    if (result.error || !result.data) {
      setError(result.error ?? "Could not load stories");
    }
    else {
      setStories(result.data);
    }
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stories, loading, error, refetch: fetchData };
}

// ---------------------------------------------------------------------------
// 3. useAuthorStories — profile page
// ---------------------------------------------------------------------------
export function useAuthorStories(
  authorId: string | null,
  includeDrafts = false,
): StoriesResult {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!authorId) {
      setStories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getStoriesByAuthor(authorId, includeDrafts);
    if (!mountedRef.current)
      return;

    if (result.error || !result.data) {
      setError(result.error ?? "Could not load stories");
    }
    else {
      setStories(result.data);
    }
    setLoading(false);
  }, [authorId, includeDrafts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stories, loading, error, refetch: fetchData };
}
