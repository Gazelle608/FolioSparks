import type { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal} from "react";

import { useEffect, useMemo, useState } from "react";

import type { Chapter } from "../../types/chapter";

import { ChapterNavigation } from "./ChapterNavigation";
import { ProgressBar } from "./ProgressBar";
import { ReaderControls, type ReaderPrefs, THEME_CLASSES } from "./ReaderControls";
import { SparkButton } from "./SparkButton";

interface ChapterReaderProps {
  storySlug: string;
  storyTitle: string;
  chapter: Chapter;
  previous?: Chapter | null;
  next?: Chapter | null;
  /** Sparks the reader has already sent to this chapter */
  sparksSent?: number;
  prefs: ReaderPrefs;
  /** Fired after the reader has been here for a few seconds (drives read count) */
  onRead?: () => void;
  /** Fired every ~10% scroll — for reading-progress save */
  onProgressChange?: (percent: number) => void;
  onSparkClick: () => void;
}

export function ChapterReader({
  storySlug,
  storyTitle,
  chapter,
  previous,
  next,
  sparksSent = 0,
  prefs,
  onRead,
  onProgressChange,
  onSparkClick,
}: ChapterReaderProps) {
  const theme = THEME_CLASSES[prefs.theme];

  // ---------------------------------------------------------------------------
  // Mark as read after 3 seconds (avoid accidental counts)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!onRead)
      return;
    const timer = setTimeout(onRead, 3000);
    return () => clearTimeout(timer);
  }, [chapter.id, onRead]);

  // ---------------------------------------------------------------------------
  // Emit progress changes for the parent to persist
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!onProgressChange)
      return;

    let lastReported = -1;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      const rounded = Math.round(pct / 10) * 10;

      if (rounded !== lastReported) {
        lastReported = rounded;
        onProgressChange(rounded);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [chapter.id, onProgressChange]);

  // ---------------------------------------------------------------------------
  // Reset scroll to top when chapter changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [chapter.id]);

  // ---------------------------------------------------------------------------
  // Render paragraphs (split on blank lines)
  // ---------------------------------------------------------------------------
  const paragraphs = useMemo(() => {
    return chapter.content
      .split(/\n\s*\n/)
      .map((p: string) => p.trim())
      .filter(Boolean);
  }, [chapter.content]);

  // ---------------------------------------------------------------------------
  // Keyboard navigation
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping
      = target.tagName === "INPUT"
        || target.tagName === "TEXTAREA"
        || target.isContentEditable;
      if (isTyping)
        return;

      if (e.key === "ArrowLeft" && previous) {
        window.location.href = `/read/${storySlug}/${previous.chapter_number}`;
      }
      else if (e.key === "ArrowRight" && next) {
        window.location.href = `/read/${storySlug}/${next.chapter_number}`;
      }
      else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        onSparkClick();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [previous, next, storySlug, onSparkClick]);

  // ---------------------------------------------------------------------------
  // Font family class
  // ---------------------------------------------------------------------------
  const fontClass = prefs.fontFamily === "serif" ? "font-display" : "font-sans";

  return (
    <div className={["min-h-screen transition-colors duration-200", theme.page].join(" ")}>
      <ProgressBar />

      <article className="mx-auto max-w-2xl px-4 sm:px-6 pt-4 pb-24">
        {/* Top nav */}
        <ChapterNavigation
          storySlug={storySlug}
          storyTitle={storyTitle}
          current={chapter}
          previous={previous}
          next={next}
          position="top"
        />

        {/* Chapter heading */}
        <header className="mt-10 mb-8 text-center">
          <p className={["text-xs uppercase tracking-widest mb-3", theme.muted].join(" ")}>
            Chapter
            {" "}
            {chapter.chapter_number}
          </p>
          <h1
            className={[
              "font-display text-3xl sm:text-4xl font-bold leading-tight",
              theme.text,
            ].join(" ")}
          >
            {chapter.title ?? `Chapter ${chapter.chapter_number}`}
          </h1>
          <p className={["mt-3 text-xs tabular-nums", theme.muted].join(" ")}>
            {chapter.word_count.toLocaleString()}
            words
            {chapter.published_at && (
              <>
                {" · "}
                {new Date(chapter.published_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </>
            )}
          </p>
        </header>

        {/* Content */}
        <div
          className={["reading-text", fontClass].join(" ")}
          style={{
            fontSize: `${prefs.fontSize}px`,
            lineHeight: prefs.lineHeight,
            color: "inherit",
          }}
        >
          {paragraphs.map((para: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined, i: Key | null | undefined) => (
            <p
              key={i}
              className="mb-5"
              style={{
                textIndent: "1.5em",
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Bottom nav */}
        <ChapterNavigation
          storySlug={storySlug}
          storyTitle={storyTitle}
          current={chapter}
          previous={previous}
          next={next}
          position="bottom"
        />
      </article>

      {/* Floating Spark button */}
      <SparkButton
        onClick={onSparkClick}
        sparksSent={sparksSent}
      />

      {/* Controls — rendered by the parent page in the top bar; here as fallback */}
      {/* (Parent should render <ReaderControls /> in its own header for a cleaner layout) */}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helper for parent pages that want a compact header with controls
// ---------------------------------------------------------------------------
export function ReaderTopBar({
  prefs,
  onPrefsChange,
  onBack,
}: {
  prefs: ReaderPrefs;
  onPrefsChange: (next: ReaderPrefs) => void;
  onBack: () => void;
}) {
  const theme = THEME_CLASSES[prefs.theme];

  return (
    <div
      className={[
        "sticky top-0 z-40 backdrop-blur-md",
        theme.panel,
        "border-b",
        theme.border,
      ].join(" ")}
    >
      <div className="mx-auto max-w-2xl px-4 sm:px-6 h-12 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className={["text-sm inline-flex items-center gap-1.5", theme.muted, "hover:opacity-70"].join(" ")}
        >
          ← Back to story
        </button>
        <ReaderControls prefs={prefs} onChange={onPrefsChange} />
      </div>
    </div>
  );
}
