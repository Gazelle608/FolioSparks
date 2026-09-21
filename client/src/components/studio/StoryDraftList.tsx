import { Link } from "react-router-dom";

import type { Story } from "../../types/story";

import { getCoverUrl } from "../../api/supabase";
import { SparkFilledIcon, SparkOutlineIcon } from "../../assets/icons";
import { Badge, Button, Dropdown, EmptyState } from "../ui";

interface StoryDraftListProps {
  stories: Story[];
  onDelete: (storyId: string) => void;
  onDuplicate?: (storyId: string) => void;
  /** Called when user clicks "Create draft" in the empty state */
  onCreateClick?: () => void;
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-primary-100 text-primary-700" },
  ongoing: { label: "Ongoing", className: "bg-primary-500 text-white" },
  hiatus: { label: "Hiatus", className: "bg-amber-500 text-white" },
  completed: { label: "Complete", className: "bg-primary-800 text-primary-50" },
  cancelled: { label: "Cancelled", className: "bg-slate-500 text-white" },
};

export function StoryDraftList({
  stories,
  onDelete,
  onDuplicate,
  onCreateClick,
}: StoryDraftListProps) {
  if (stories.length === 0) {
    return (
      <EmptyState
        icon={<SparkOutlineIcon size={48} />}
        title="No stories yet"
        description="Create your first draft to get started."
        action={
          onCreateClick && (
            <Button variant="primary" onClick={onCreateClick}>
              Create draft
            </Button>
          )
        }
      />
    );
  }

  return (
    <ul className="space-y-2">
      {stories.map((story) => {
        const status = STATUS_STYLES[story.status];
        const coverUrl = getCoverUrl(story.cover_url);

        return (
          <li
            key={story.id}
            className="flex items-center gap-4 p-3 rounded-lg border border-primary-100 bg-white hover:border-primary-300 transition-colors"
          >
            {/* Cover thumbnail */}
            <Link
              to={`/studio/story/${story.id}`}
              className="shrink-0 w-14 h-20 rounded-md overflow-hidden bg-primary-100"
            >
              {story.cover_url
                ? (
                    <img
                      src={coverUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )
                : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900">
                      <SparkFilledIcon size={16} className="text-spark opacity-70" />
                    </div>
                  )}
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={`/studio/story/${story.id}`}
                  className="font-display text-base font-bold text-primary-900 hover:text-primary-600 truncate"
                >
                  {story.title}
                </Link>
                {status && (
                  <Badge
                    size="sm"
                    className={status.className}
                  >
                    {status.label}
                  </Badge>
                )}
              </div>

              <p className="mt-0.5 text-xs text-primary-500">
                {story.chapter_count}
                {story.chapter_count === 1 ? "chapter" : "chapters"}
                {story.word_count > 0 && (
                  <>
                    {" · "}
                    {formatWords(story.word_count)}
                  </>
                )}
                {" · updated "}
                {formatRelative(story.updated_at)}
              </p>

              {story.status !== "draft" && (
                <div className="mt-1.5 flex items-center gap-3 text-xs text-primary-500">
                  <span className="inline-flex items-center gap-1">
                    <SparkFilledIcon size={11} className="text-spark" />
                    <span className="tabular-nums font-medium text-primary-700">
                      {formatShort(story.spark_count)}
                    </span>
                  </span>
                  <span className="tabular-nums">
                    {formatShort(story.read_count)}
                    reads
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="shrink-0 flex items-center gap-1">
              <Link to={`/studio/story/${story.id}`}>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </Link>

              <Dropdown
                align="right"
                trigger={(
                  <button
                    type="button"
                    aria-label="Story actions"
                    className="p-2 rounded-md text-primary-400 hover:text-primary-700 hover:bg-primary-50"
                  >
                    <DotsGlyph />
                  </button>
                )}
                items={[
                  {
                    id: "view",
                    label: "View on site",
                    onClick: () => window.open(`/story/${story.slug}`, "_blank"),
                  },
                  {
                    id: "analytics",
                    label: "Analytics",
                    onClick: () => {
                      window.location.href = `/studio/story/${story.id}/analytics`;
                    },
                  },
                  ...(onDuplicate
                    ? [{
                        id: "duplicate",
                        label: "Duplicate",
                        onClick: () => onDuplicate(story.id),
                      }]
                    : []),
                  { id: "div", label: "", divider: true },
                  {
                    id: "delete",
                    label: "Delete story",
                    danger: true,
                    onClick: () => {
                      // eslint-disable-next-line no-alert
                      if (confirm(`Delete "${story.title}"? This cannot be undone and all chapters will be lost.`)
                      ) {
                        onDelete(story.id);
                      }
                    },
                  },
                ]}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function formatShort(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000)
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toString();
}

function formatWords(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1)}M words`;
  if (n >= 1_000)
    return `${Math.round(n / 1_000)}k words`;
  return `${n} words`;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)
    return "just now";
  if (minutes < 60)
    return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30)
    return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function DotsGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}
