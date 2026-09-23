import { Link } from "react-router-dom";

import type { Chapter } from "../../types/chapter";

interface ChapterListProps {
  storyId: string;
  storySlug: string;
  chapters: Chapter[];
  currentChapterNumber?: number;
  /** Locked chapters (gate) rendered with a lock icon */
  lockedFrom?: number;
  variant?: "sidebar" | "drawer";
  onClose?: () => void;
}

export function ChapterList({
  storySlug,
  chapters,
  currentChapterNumber,
  lockedFrom,
  variant = "sidebar",
  onClose,
}: ChapterListProps) {
  return (
    <aside
      className={[
        "flex flex-col bg-white border border-primary-100 rounded-lg overflow-hidden",
        variant === "sidebar" ? "h-[calc(100vh-7rem)] sticky top-20" : "h-full",
      ].join(" ")}
    >
      <header className="px-4 py-3 border-b border-primary-100 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold text-primary-900">
          Chapters
          <span className="ml-2 text-xs font-normal text-primary-400">
            {chapters.length}
          </span>
        </h2>
        {variant === "drawer" && onClose && (
          <button
            onClick={onClose}
            aria-label="Close chapter list"
            className="text-primary-400 hover:text-primary-700"
          >
            ✕
          </button>
        )}
      </header>

      <nav className="flex-1 overflow-y-auto py-1">
        {chapters.map((ch) => {
          const isCurrent = ch.chapter_number === currentChapterNumber;
          const isLocked = lockedFrom !== undefined && ch.chapter_number >= lockedFrom;

          return (
            <Link
              key={ch.id}
              to={
                isLocked
                  ? `/signup?next=/read/${storySlug}/${ch.chapter_number}`
                  : `/read/${storySlug}/${ch.chapter_number}`
              }
              onClick={onClose}
              className={[
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                "border-l-2",
                isCurrent
                  ? "border-primary-500 bg-primary-50 text-primary-900 font-medium"
                  : "border-transparent text-primary-600 hover:bg-primary-50 hover:text-primary-900",
              ].join(" ")}
            >
              <span className="text-xs text-primary-400 tabular-nums w-6 shrink-0">
                {ch.chapter_number}
              </span>
              <span className="flex-1 truncate">
                {ch.title ?? `Chapter ${ch.chapter_number}`}
              </span>
              {isLocked && (
                <LockGlyph className="w-3.5 h-3.5 text-primary-300 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function LockGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
