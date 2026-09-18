import type { Poll, PollOption } from "../../types/poll";

interface PollResultsProps {
  poll: Poll;
  options: PollOption[];
  /** Option the current reader voted for (if they voted) */
  votedOptionId?: string | null;
  /** Show the winner more prominently (used after poll closes) */
  highlightWinner?: boolean;
}

export function PollResults({
  poll,
  options,
  votedOptionId,
  highlightWinner = false,
}: PollResultsProps) {
  const total = options.reduce((sum, o) => sum + o.vote_count, 0);
  const isClosed = poll.status === "closed";
  const winnerId = poll.winning_option_id;

  // Sort options: winner first if highlighted, otherwise keep author"s order
  const sorted = [...options].sort((a, b) => {
    if (highlightWinner && winnerId) {
      if (a.id === winnerId)
        return -1;
      if (b.id === winnerId)
        return 1;
    }
    return a.display_order - b.display_order;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-primary-900 leading-snug">
            {poll.question}
          </h3>
          {isClosed && (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary-100 text-primary-700">
              Closed
            </span>
          )}
        </div>
        {poll.description && (
          <p className="mt-1.5 text-sm text-primary-500 leading-relaxed">
            {poll.description}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {sorted.map((option) => {
          const pct = total > 0 ? (option.vote_count / total) * 100 : 0;
          const isWinner = option.id === winnerId;
          const isMyVote = option.id === votedOptionId;

          return (
            <div key={option.id}>
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={[
                      "text-sm truncate",
                      isMyVote
                        ? "font-semibold text-primary-900"
                        : "text-primary-700",
                    ].join(" ")}
                  >
                    {option.option_text}
                  </span>
                  {isMyVote && (
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary-600">
                      Your vote
                    </span>
                  )}
                  {isWinner && isClosed && (
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-spark">
                      ✓ Winner
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-primary-500 tabular-nums">
                  {pct.toFixed(0)}
                  %
                </span>
              </div>

              {/* Bar */}
              <div className="relative h-2 rounded-full bg-primary-100 overflow-hidden">
                <div
                  className={[
                    "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                    isWinner && isClosed
                      ? "bg-spark"
                      : isMyVote
                        ? "bg-primary-500"
                        : "bg-primary-400",
                  ].join(" ")}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p className="mt-1 text-[11px] text-primary-400 tabular-nums">
                {option.vote_count.toLocaleString()}
                {" "}
                {option.vote_count === 1 ? "vote" : "votes"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-primary-100 flex items-center justify-between text-xs text-primary-500">
        <span>
          {total.toLocaleString()}
          {total === 1 ? "reader voted" : "readers voted"}
        </span>
        {poll.closes_at && !isClosed && (
          <span>
            Closes
            {formatRelative(poll.closes_at)}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatRelative(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0)
    return "soon";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) {
    const minutes = Math.max(1, Math.floor(diff / (1000 * 60)));
    return `in ${minutes}m`;
  }
  if (hours < 24)
    return `in ${hours}h`;
  const days = Math.floor(hours / 24);
  return `in ${days}d`;
}
