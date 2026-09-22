import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import type { StoryCardData } from "../types/story";

import { SearchIcon } from "../assets/icons";
import { PageWrapper } from "../components/layout";
import {
  StoryFilters,
  type StoryFilterState,
  StoryGrid,
} from "../components/stories";
import { Button, Input } from "../components/ui";
import { useStories } from "../hooks/usestories";

export function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [filters, setFilters] = useState<StoryFilterState>({
    genre: searchParams.get("genre"),
    status: searchParams.get("status") as StoryFilterState["status"] ?? null,
    tags: [],
    sort: (searchParams.get("sort") as StoryFilterState["sort"]) ?? "recent",
  });

  const { stories, loading, error, loadMore, hasMore } = useStories({
    genre: filters.genre ?? undefined,
    status: (filters.status as never) ?? undefined,
    search: search || undefined,
    orderBy:
      filters.sort === "popular"
        ? "read_count"
        : filters.sort === "sparks"
          ? "spark_count"
          : "published_at",
  });

  // Sync URL params on filter change
  const updateFilters = (next: StoryFilterState) => {
    setFilters(next);
    const params = new URLSearchParams(searchParams);
    next.genre ? params.set("genre", next.genre) : params.delete("genre");
    next.status ? params.set("status", next.status) : params.delete("status");
    next.sort !== "recent" ? params.set("sort", next.sort) : params.delete("sort");
    setSearchParams(params, { replace: true });
  };

  return (
    <PageWrapper
      title="The library"
      subtitle="Serials updated chapter by chapter. Every story page shows exactly where the author's donations go."
      size="xl"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters rail */}
        <aside className="lg:w-64 shrink-0">
          <div className="mb-6">
            <Input
              placeholder="Search titles"
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<SearchIcon size={16} />}
            />
          </div>

          <StoryFilters value={filters} onChange={updateFilters} />
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="mb-4 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
              {error}
            </div>
          )}

          <StoryGrid
            stories={stories as unknown as StoryCardData[]}
            loading={loading && stories.length === 0}
            columns={3}
            emptyTitle="No stories match those filters"
            emptyDescription="Try clearing a filter or two."
          />

          {hasMore && !loading && (
            <div className="mt-8 text-center">
              <Button variant="secondary" size="lg" onClick={loadMore}>
                Load more
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
