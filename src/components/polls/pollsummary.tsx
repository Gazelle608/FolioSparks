import { Link } from "react-router-dom";

import type { Poll } from "../../types/poll";

import { PollIcon } from "../../assets/icons";

interface PollSummaryProps {
  poll: Poll;
  /** Where clicking the summary should navigate */
  editHref?: string;
}

export function PollSummary({ poll, editHref }: PollSummaryProps) {
  const isClosed = poll.status === "closed";

  const content = (
    <div className="flex items-center gap-3 px-3 py-2 rounded-md border border-primary-100 bg-white hover:border-primary-300 transition-colors">
      <PollIcon size={16} className="text-primary-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-primary-900 truncate">{poll.question}</p>
        <p className="text-[11px] text-primary-400 tabular-nums">
          {poll.total_votes.toLocaleString()}
          {" "}
          {poll.total_votes === 1 ? "vote" : "votes"}
          {isClosed && " · closed"}
        </p>
      </div>
      {isClosed
        ? (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary-400">
              Closed
            </span>
          )
        : (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary-600">
              Open
            </span>
          )}
    </div>
  );

  return editHref ? <Link to={editHref}>{content}</Link> : content;
}
