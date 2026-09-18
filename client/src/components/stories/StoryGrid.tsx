import type { StoryCardData } from "../../types/story";

import { SparkOutlineIcon } from "../../assets/icons";
import { EmptyState, Spinner } from "../ui";
import { StoryCard } from "./StoryCard";

interface StoryGridProps {
  stories: StoryCardData[];
  loading?: boolean;
  /** Card layout — grid (default) or list */
  variant?: "grid" | "list";
  /** Columns at lg breakpoint for grid variant */
  columns?: 2 | 3 | 4;
  /** Empty state title */
  emptyTitle?: string;
  /** Empty state description */
  emptyDescription?: string;
  /** Empty state action (e.g. a button) */
  emptyAction?: React.ReactNode;
  /** Optional per-story badge function */
  badgeFor?: (story: StoryCardData) => string | undefined;
}

const columnClasses: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function StoryGrid({
  stories,
  loading = false,
  variant = "grid",
  columns = 4,
  emptyTitle = "No stories here yet",
  emptyDescription = "Check back soon — or be the first to publish.",
  emptyAction,
  badgeFor,
}: StoryGridProps) {
  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" label="Loading stories…" />
      </div>
    );
  }

  // Empty
  if (stories.length === 0) {
    return (
      <EmptyState
        icon={<SparkOutlineIcon size={48} />}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  // List variant — stacked rows
  if (variant === "list") {
    return (
      <div className="space-y-3">
        {stories.map(story => (
          <StoryCard
            key={story.id}
            story={story}
            variant="list"
            badge={badgeFor?.(story)}
          />
        ))}
      </div>
    );
  }

  // Grid variant
  return (
    <div className={`grid grid-cols-2 gap-4 ${columnClasses[columns] ?? columnClasses[4]}`}>
      {stories.map(story => (
        <StoryCard
          key={story.id}
          story={story}
          variant="grid"
          badge={badgeFor?.(story)}
        />
      ))}
    </div>
  );
}
