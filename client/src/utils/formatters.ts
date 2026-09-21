// ============================================================
// FolioSparks — Formatters
// All display-formatting logic. Pure functions.
// ============================================================

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

/**
 * Compact a number with K/M suffix.
 * 1234 → "1.2K"
 * 12345 → "12.3K"
 * 1234567 → "1.2M"
 */
export function formatCompact(n: number): string {
  if (!Number.isFinite(n))
    return "0";
  const abs = Math.abs(n);

  if (abs >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (abs >= 1_000) {
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return n.toString();
}

/** "1,234,567" — grouped with locale separators */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

/** "75%" */
export function formatPercent(n: number, fractionDigits = 0): string {
  return `${n.toFixed(fractionDigits)}%`;
}

/** "3.4k words" */
export function formatWordCount(n: number): string {
  if (n < 1_000)
    return `${n} words`;
  if (n < 1_000_000)
    return `${Math.round(n / 1000)}k words`;
  return `${(n / 1_000_000).toFixed(1)}M words`;
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/** "Jan 3, 2026" */
export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** "Jan 3" (year omitted if current year) */
export function formatShortDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const now = new Date();
  const includeYear = d.getFullYear() !== now.getFullYear();
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
  });
}

/** "3m ago", "2h ago", "4d ago", "Jan 3" */
export function formatRelative(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const diff = Date.now() - d.getTime();

  if (diff < 0) {
    // Future — "in 3m"
    return formatRelativeFuture(d);
  }

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60)
    return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30)
    return `${days}d ago`;

  return formatShortDate(d);
}

/** "in 3m", "in 2d" */
export function formatRelativeFuture(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const diff = d.getTime() - Date.now();
  if (diff <= 0)
    return "soon";

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60)
    return "in a moment";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return `in ${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `in ${hours}h`;

  const days = Math.floor(hours / 24);
  return `in ${days}d`;
}

// ---------------------------------------------------------------------------
// Time durations — for audio, chapter length
// ---------------------------------------------------------------------------

/** 225 → "3:45" */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/** 3600 → "1h" */
export function formatHours(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0)
    return `${m}m`;
  if (m === 0)
    return `${h}h`;
  return `${h}h ${m}m`;
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

/** Truncate without splitting words */
export function truncate(text: string, max: number): string {
  if (text.length <= max)
    return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/** Initials from a name */
export function getInitials(name?: string | null): string {
  if (!name)
    return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() ?? "").join("");
}

/** Title-case a slug: "epic-fantasy" → "Epic Fantasy" */
export function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Slugify a title for URLs: "The Lantern Between Us" → "the-lantern-between-us" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036F]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

/** Replace newlines with paragraph breaks */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Pluralization
// ---------------------------------------------------------------------------

/** pluralize(1, "chapter") → "1 chapter"; pluralize(2, "chapter") → "2 chapters" */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  const word = count === 1 ? singular : plural ?? `${singular}s`;
  return `${count} ${word}`;
}

/** Same but just the word: plural(2, "chapter") → "chapters" */
export function plural(
  count: number,
  singular: string,
  plural?: string,
): string {
  return count === 1 ? singular : plural ?? `${singular}s`;
}

// ---------------------------------------------------------------------------
// Error / messages
// ---------------------------------------------------------------------------

/** Turn an unknown error into a user-readable string */
export function formatError(error: unknown): string {
  if (typeof error === "string")
    return error;
  if (error instanceof Error)
    return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong";
}

// ---------------------------------------------------------------------------
// Sparks specific
// ---------------------------------------------------------------------------

/** "1,234 Sparks" — singular/plural aware */
export function formatSparks(n: number): string {
  return `${n.toLocaleString()} ${n === 1 ? "Spark" : "Sparks"}`;
}

/** "1.2K Sparks" */
export function formatSparksCompact(n: number): string {
  return `${formatCompact(n)} ${n === 1 ? "Spark" : "Sparks"}`;
}
