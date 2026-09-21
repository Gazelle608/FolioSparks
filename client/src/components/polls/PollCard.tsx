import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { Poll, PollOption } from "../../types/poll";

import { vote as castVote, getPollOptions, getUserVote } from "../../api/polls";
import { PollIcon } from "../../assets/icons";
import { useAuth } from "../../hooks/useauth";
import { PollResults } from "./PollResults";
import { PollVoteForm } from "./PollVoteForm";

interface PollCardProps {
  poll: Poll;
  /** Optional: override the empty state styling on a story page */
  variant?: "chapter-end" | "story-page";
}

export function PollCard({ poll, variant = "chapter-end" }: PollCardProps) {
  const { user } = useAuth();

  const [options, setOptions] = useState<PollOption[]>([]);
  const [myVoteOptionId, setMyVoteOptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [localPoll, setLocalPoll] = useState<Poll>(poll);

  // ---------------------------------------------------------------------------
  // Fetch options + user"s vote on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      const [optionsRes, voteRes] = await Promise.all([
        getPollOptions(poll.id),
        user ? getUserVote(poll.id, user.id) : Promise.resolve({ data: null, error: null }),
      ]);

      if (cancelled)
        return;

      if (optionsRes.data)
        setOptions(optionsRes.data);
      if (voteRes.data)
        setMyVoteOptionId(voteRes.data.option_id);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [poll.id, user]);

  // ---------------------------------------------------------------------------
  // Vote handler
  // ---------------------------------------------------------------------------
  const handleVote = async (optionId: string): Promise<{ error: string | null }> => {
    const result = await castVote(poll.id, optionId);

    if (result.error)
      return { error: result.error };

    // Optimistic update: bump count, mark as voted
    setMyVoteOptionId(optionId);
    setOptions(prev =>
      prev.map(o =>
        o.id === optionId ? { ...o, vote_count: o.vote_count + 1 } : o,
      ),
    );
    setLocalPoll((p: { total_votes: number }) => ({ ...p, total_votes: p.total_votes + 1 }));

    return { error: null };
  };

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div
        className={[
          "rounded-lg border border-primary-100 bg-white p-5",
          variant === "chapter-end" ? "mt-10" : "",
        ].join(" ")}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-primary-100 rounded w-3/4" />
          <div className="h-10 bg-primary-100 rounded" />
          <div className="h-10 bg-primary-100 rounded" />
          <div className="h-10 bg-primary-100 rounded" />
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Determine state
  // ---------------------------------------------------------------------------
  const hasVoted = myVoteOptionId !== null;
  const isClosed = localPoll.status === "closed";
  const showResults = hasVoted || isClosed;

  return (
    <section
      className={[
        "rounded-lg border border-primary-100 bg-white overflow-hidden",
        variant === "chapter-end" ? "mt-10" : "",
      ].join(" ")}
    >
      {/* Header strip */}
      <div className="px-5 py-3 bg-primary-50 border-b border-primary-100 flex items-center gap-2">
        <PollIcon size={16} className="text-primary-600" />
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
          Reader poll
        </span>
        {isClosed && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-primary-400">
            Closed
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {showResults
          ? (
              <PollResults
                poll={localPoll}
                options={options}
                votedOptionId={myVoteOptionId}
                highlightWinner={isClosed}
              />
            )
          : !user
              ? (
                  <SignInToVote poll={localPoll} options={options} />
                )
              : (
                  <PollVoteForm
                    poll={localPoll}
                    options={options}
                    onVote={handleVote}
                  />
                )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Sign-in-to-vote prompt (anonymous readers)
// ---------------------------------------------------------------------------
function SignInToVote({ poll, options }: { poll: Poll; options: PollOption[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold text-primary-900 leading-snug">
          {poll.question}
        </h3>
        {poll.description && (
          <p className="mt-1.5 text-sm text-primary-500 leading-relaxed">
            {poll.description}
          </p>
        )}
      </div>

      {/* Show the options — but locked */}
      <div className="space-y-2">
        {options.map(option => (
          <div
            key={option.id}
            className="flex items-center gap-3 p-3.5 rounded-lg border-2 border-primary-100 bg-white opacity-60"
          >
            <span className="shrink-0 w-5 h-5 rounded-full border-2 border-primary-200" />
            <span className="text-sm text-primary-700">
              {option.option_text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-md bg-primary-50 p-3 text-center">
        <p className="text-sm text-primary-700 mb-2">
          Sign in to help decide what happens next.
        </p>
        <Link
          to="/signin"
          className="inline-block text-sm font-semibold text-primary-700 underline hover:text-primary-900"
        >
          Sign in or create an account
        </Link>
      </div>
    </div>
  );
}
