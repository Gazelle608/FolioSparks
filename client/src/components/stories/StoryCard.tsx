import { Link } from "react-router-dom";

import type { StoryCardData } from "../../types/story";

import { getCoverUrl } from "../../api/supabase";
import {
  CoWrittenBadge,
  DeskIcon,
  PollIcon,
  SparkFilledIcon,
} from "../../assets/icons";
import { AudioAvailableBadge } from "../../assets/icons/audioavailablebadge";
import { GenrePill } from "./GenrePill";
import { StoryStats } from "./storystats";
import { StoryTags } from "./storytags";

interface StoryCardProps {
  story: StoryCardData;
  variant?: "grid" | "list";
  /** Optional badge over the cover, e.g. "New chapter" */
  badge?: string;
}

// ---------------------------------------------------------------------------
// Status chips — small visual cue for story state
// ---------------------------------------------------------------------------
const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  ongoing: { label: "Ongoing", className: "bg-primary-500 text-white" },
  completed: { label: "Complete", className: "bg-primary-800 text-primary-50" },
  hiatus: { label: "Hiatus", className: "bg-amber-500 text-white" },
  cancelled: { label: "Cancelled", className: "bg-slate-500 text-white" },
  draft: { label: "Draft", className: "bg-primary-200 text-primary-800" },
};

export function StoryCard({ story, variant = "grid", badge }: StoryCardProps) {
  if (variant === "list")
    return <StoryCardList story={story} badge={badge} />;
  return <StoryCardGrid story={story} badge={badge} />;
}

// ---------------------------------------------------------------------------
// GRID VARIANT — vertical, cover-first
// ---------------------------------------------------------------------------
function StoryCardGrid({ story, badge }: { story: StoryCardData; badge?: string }) {
  const coverUrl = getCoverUrl(story.cover_url);
  const status = STATUS_LABELS[story.status];

  return (
    <Link
      to={`/story/${story.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg"
    >
      <article className="flex flex-col h-full bg-white rounded-lg overflow-hidden border border-primary-100 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5">
        {/* Cover */}
        <div className="relative aspect-[2/3] bg-primary-100 overflow-hidden">
          {story.cover_url
            ? (
                <img
                  src={coverUrl}
                  alt={`Cover of ${story.title}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )
            : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary-700 to-primary-900 p-4">
                  <SparkFilledIcon size={32} className="text-spark opacity-80" />
                  <span className="font-display text-center text-primary-50 text-sm font-bold leading-snug line-clamp-3">
                    {story.title}
                  </span>
                </div>
              )}

          {/* Status chip */}
          {status && (
            <span
              className={[
                "absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                status.className,
              ].join(" ")}
            >
              {status.label}
            </span>
          )}

          {/* Custom badge */}
          {badge && (
            <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-spark text-primary-900">
              {badge}
            </span>
          )}

          {/* Feature icons */}
          <FeatureIcons story={story} />
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-3.5">
          <h3 className="font-display text-base font-bold text-primary-900 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
            {story.title}
          </h3>

          <p className="mt-1 text-xs text-primary-500 truncate">
            by
            {" "}
            {story.author.pen_name ?? "Unknown"}
            {story.author.is_verified && (
              <span className="ml-1 text-primary-700" title="Verified author">✓</span>
            )}
          </p>

          <p className="mt-2 text-xs text-primary-500 leading-relaxed line-clamp-2 flex-1">
            {story.synopsis ?? "No synopsis yet."}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <GenrePill genre={story.genre} size="sm" />
            <div className="inline-flex items-center gap-1 text-xs text-primary-700">
              <SparkFilledIcon size={12} className="text-spark" />
              <span className="font-semibold tabular-nums">
                {formatShort(story.spark_count)}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// LIST VARIANT — horizontal, cover-left
// ---------------------------------------------------------------------------
function StoryCardList({ story, badge }: { story: StoryCardData; badge?: string }) {
  const coverUrl = getCoverUrl(story.cover_url);
  const status = STATUS_LABELS[story.status];

  return (
    <Link
      to={`/story/${story.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg"
    >
      <article className="flex gap-4 p-3 bg-white rounded-lg border border-primary-100 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-primary-200">
        {/* Cover */}
        <div className="relative w-20 sm:w-24 shrink-0 aspect-[2/3] rounded-md overflow-hidden bg-primary-100">
          {story.cover_url
            ? (
                <img
                  src={coverUrl}
                  alt={`Cover of ${story.title}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )
            : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900">
                  <SparkFilledIcon size={20} className="text-spark opacity-80" />
                </div>
              )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display text-base font-bold text-primary-900 leading-snug truncate group-hover:text-primary-600 transition-colors">
                {story.title}
              </h3>
              <p className="text-xs text-primary-500 truncate">
                by
                {" "}
                {story.author.pen_name ?? "Unknown"}
              </p>
            </div>
            {status && (
              <span
                className={[
                  "shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                  status.className,
                ].join(" ")}
              >
                {status.label}
              </span>
            )}
          </div>

          <p className="mt-1.5 text-xs text-primary-500 leading-relaxed line-clamp-2">
            {story.synopsis ?? "No synopsis yet."}
          </p>

          <div className="mt-auto pt-2 flex items-center gap-3 flex-wrap">
            <GenrePill genre={story.genre} size="sm" />
            <StoryStats
              reads={story.read_count}
              sparks={story.spark_count}
              chapters={story.chapter_count}
              size="sm"
              show={["reads", "sparks"]}
            />
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-spark text-primary-900">
                {badge}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Feature badges (co-written, polls, audio, open desk)
// ---------------------------------------------------------------------------
function FeatureIcons({ story }: { story: StoryCardData }) {
  const hasAny
    = story.is_open_desk || story.allows_polls || story.is_donation_enabled;
  if (!hasAny)
    return null;

  return (
    <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
      {story.is_open_desk && (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/90 backdrop-blur text-primary-800 text-[10px] font-semibold"
          title="Open co-writing desk"
        >
          <DeskIcon size={11} />
          Co-written
        </span>
      )}
      {story.allows_polls && (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/90 backdrop-blur text-primary-800 text-[10px] font-semibold"
          title="Reader polls"
        >
          <PollIcon size={11} />
          Polls
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Number formatting
// ---------------------------------------------------------------------------
function formatShort(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000)
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toString();
}
