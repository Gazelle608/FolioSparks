import { Button } from "../ui";

export interface StoryFilterState {
  genre: string | null;
  status: string | null;
  sort: "recent" | "popular" | "sparks" | "alphabetical";
  tags: string[];
}

interface StoryFiltersProps {
  value: StoryFilterState;
  onChange: (next: StoryFilterState) => void;
  /** Optional genre list — defaults to a built-in set */
  genres?: string[];
  /** Show the reset button only when filters are active */
  showReset?: boolean;
  className?: string;
}

const DEFAULT_GENRES = [
  "epic-fantasy",
  "fantasy",
  "sci-fi",
  "mystery",
  "romance",
  "thriller",
  "horror",
  "literary",
  "historical",
  "contemporary",
  "adventure",
  "paranormal",
  "dystopian",
  "comedy",
  "drama",
  "poetry",
];

const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "hiatus", label: "On hiatus" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Recently updated" },
  { value: "popular", label: "Most read" },
  { value: "sparks", label: "Most sparked" },
  { value: "alphabetical", label: "A–Z" },
] as const;

export function StoryFilters({
  value,
  onChange,
  genres = DEFAULT_GENRES,
  showReset = true,
  className = "",
}: StoryFiltersProps) {
  const isFiltered
    = value.genre !== null
      || value.status !== null
      || value.tags.length > 0
      || value.sort !== "recent";

  const update = (patch: Partial<StoryFilterState>) =>
    onChange({ ...value, ...patch });

  const reset = () =>
    onChange({ genre: null, status: null, tags: [], sort: "recent" });

  const toggleTag = (tag: string) => {
    const has = value.tags.includes(tag);
    update({ tags: has ? value.tags.filter(t => t !== tag) : [...value.tags, tag] });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sort */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary-500">
          Sort by
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map(opt => (
            <Chip
              key={opt.value}
              active={value.sort === opt.value}
              onClick={() => update({ sort: opt.value })}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary-500">
          Status
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map(opt => (
            <Chip
              key={opt.value}
              active={(value.status ?? "") === opt.value}
              onClick={() => update({ status: opt.value || null })}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary-500">
          Genre
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {genres.map(g => (
            <Chip
              key={g}
              active={value.genre === g}
              onClick={() => update({ genre: value.genre === g ? null : g })}
            >
              {g
                .split("-")
                .map(w => w[0].toUpperCase() + w.slice(1))
                .join(" ")}
            </Chip>
          ))}
        </div>
      </div>

      {/* Active tags (if any were set from outside) */}
      {value.tags.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary-500">
            Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {value.tags.map(tag => (
              <Chip key={tag} active onClick={() => toggleTag(tag)}>
                {tag}
                ✕
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      {showReset && isFiltered && (
        <Button variant="ghost" size="sm" onClick={reset}>
          Clear all filters
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chip
// ---------------------------------------------------------------------------
function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full transition-colors",
        active
          ? "bg-primary-500 text-white"
          : "bg-white text-primary-700 border border-primary-200 hover:border-primary-400",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
