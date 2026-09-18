import { Link } from "react-router-dom";

import type { Chapter } from "../../types/chapter";

interface ChapterNavigationProps {
  storySlug: string;
  storyTitle: string;
  current: Chapter;
  previous?: Chapter | null;
  next?: Chapter | null;
  position?: "top" | "bottom";
}

export function ChapterNavigation({
  storySlug,
  storyTitle,
  current,
  previous,
  next,
  position = "bottom",
}: ChapterNavigationProps) {
  const isTop = position === "top";

  return (
    <nav
      className={[
        "flex items-center justify-between gap-3",
        isTop
          ? "py-3 border-b border-primary-100"
          : "py-8 mt-12 border-t border-primary-100",
      ].join(" ")}
    >
      {/* Left: back to story or previous */}
      <div className="min-w-0 flex-1">
        {isTop
          ? (
              <Link
                to={`/story/${storySlug}`}
                className="inline-flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-900 transition-colors"
              >
                <ArrowLeft />
                <span className="truncate">{storyTitle}</span>
              </Link>
            )
          : previous
            ? (
                <Link
                  to={`/read/${storySlug}/${previous.chapter_number}`}
                  className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-900 transition-colors max-w-full"
                >
                  <ArrowLeft />
                  <span className="truncate">
                    {previous.title ?? `Chapter ${previous.chapter_number}`}
                  </span>
                </Link>
              )
            : (
                <span className="text-sm text-primary-300">Start of story</span>
              )}
      </div>

      {/* Center: chapter number */}
      {!isTop && (
        <span className="text-xs uppercase tracking-wider text-primary-400 tabular-nums whitespace-nowrap">
          Ch.
          {current.chapter_number}
        </span>
      )}

      {/* Right: next */}
      <div className="min-w-0 flex-1 flex justify-end">
        {next
          ? (
              <Link
                to={`/read/${storySlug}/${next.chapter_number}`}
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-900 transition-colors max-w-full"
              >
                <span className="truncate">
                  {next.title ?? `Chapter ${next.chapter_number}`}
                </span>
                <ArrowRight />
              </Link>
            )
          : !isTop
              ? (
                  <span className="text-sm text-primary-300 italic">
                    You"re up to date
                  </span>
                )
              : null}
      </div>
    </nav>
  );
}

function ArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
