import { useCallback, useEffect, useRef, useState } from "react";

import type { Poll, PollOption } from "../types/poll";

import {
  vote as castVote,
  closePoll,
  createPoll,
  getPollForChapter,
  getPollOptions,
  getUserVote,
} from "../api/polls";
import { useAuth } from "./useauth";

// ---------------------------------------------------------------------------
// Reader-side: useChapterPoll
// ---------------------------------------------------------------------------
interface ChapterPollState {
  poll: Poll | null;
  options: PollOption[];
  myVoteOptionId: string | null;
  loading: boolean;
  error: string | null;
}

interface UseChapterPollResult extends ChapterPollState {
  refetch: () => Promise<void>;
  vote: (optionId: string) => Promise<{ error: string | null }>;
}

export function useChapterPoll(chapterId: string | null): UseChapterPollResult {
  const { user } = useAuth();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [myVoteOptionId, setMyVoteOptionId] = useState<string | null>(null);
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
    if (!chapterId) {
      setPoll(null);
      setOptions([]);
      setMyVoteOptionId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const pollResult = await getPollForChapter(chapterId);

    if (!mountedRef.current)
      return;

    if (pollResult.error) {
      setError(pollResult.error);
      setLoading(false);
      return;
    }

    if (!pollResult.data) {
      setPoll(null);
      setLoading(false);
      return;
    }

    const p = pollResult.data;
    setPoll(p);

    const [optionsResult, voteResult] = await Promise.all([
      getPollOptions(p.id),
      user ? getUserVote(p.id, user.id) : Promise.resolve({ data: null, error: null }),
    ]);

    if (!mountedRef.current)
      return;

    setOptions(optionsResult.data ?? []);
    setMyVoteOptionId(
      typeof voteResult.data?.option_id === "string"
        ? voteResult.data.option_id
        : null,
    );
    setLoading(false);
  }, [chapterId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const vote = useCallback(
    async (optionId: string): Promise<{ error: string | null }> => {
      if (!poll)
        return { error: "No poll to vote in" };

      const result = await castVote(poll.id, optionId);

      if (result.error)
        return { error: result.error };

      // Optimistic update
      setMyVoteOptionId(optionId);
      setOptions(prev =>
        prev.map(o =>
          o.id === optionId ? { ...o, vote_count: o.vote_count + 1 } : o,
        ),
      );
      setPoll((prev: { total_votes: number }) => (prev ? { ...prev, total_votes: prev.total_votes + 1 } : prev));

      return { error: null };
    },
    [poll],
  );

  return {
    poll,
    options,
    myVoteOptionId,
    loading,
    error,
    refetch: fetchData,
    vote,
  };
}

// ---------------------------------------------------------------------------
// Author-side: useStoryPolls — used by PollBuilder + chapter editor
// ---------------------------------------------------------------------------
export function useStoryPolls(storyId: string | null) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!storyId) {
      setPolls([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Note: you"ll need a listPollsForStory API — but getPollsForStory exists
    const { getPollsForStory } = await import("../api/polls");
    const result = await getPollsForStory(storyId);
    if (!mountedRef.current)
      return;
    if (result.data)
      setPolls(result.data);
    setLoading(false);
  }, [storyId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = useCallback(
    async (input: Parameters<typeof createPoll>[0]) => {
      const result = await createPoll(input);
      if (result.error || !result.data) {
        return { error: result.error ?? "Could not create poll", poll: null };
      }
      setPolls(prev => [result.data!, ...prev]);
      return { error: null, poll: result.data };
    },
    [],
  );

  const close = useCallback(async (pollId: string) => {
    const result = await closePoll(pollId);
    if (result.error)
      return { error: result.error };
    setPolls(prev =>
      prev.map(p =>
        p.id === pollId ? { ...p, status: "closed" as const } : p,
      ),
    );
    return { error: null };
  }, []);

  return { polls, loading, refetch, create, close };
}
