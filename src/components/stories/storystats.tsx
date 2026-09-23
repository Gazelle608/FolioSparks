import { SparkFilledIcon } from "../../assets/icons";

interface StoryStatsProps {
  reads?: number;
  sparks?: number;
  chapters?: number;
  words?: number;
  followers?: number;
  /** Which stats to display, in order */
  show?: Array<"reads" | "sparks" | "chapters" | "words" | "followers">;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  className?: string;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
function formatCount(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000)
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString();
}

function formatWords(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1)}M words`;
  if (n >= 1_000)
    return `${Math.round(n / 1_000)}k words`;
  return `${n} words`;
}

const sizeClasses = {
  sm: "text-xs gap-3",
  md: "text-sm gap-4",
  lg: "text-base gap-5",
};

const iconSizes = { sm: 12, md: 14, lg: 16 };

export function StoryStats({
  reads,
  sparks,
  chapters,
  words,
  followers,
  show = ["reads", "sparks", "chapters"],
  size = "sm",
  variant = "light",
  className = "",
}: StoryStatsProps) {
  const iconSize = iconSizes[size];

  const textColor = variant === "light" ? "text-primary-500" : "text-primary-200";
  const strongColor = variant === "light" ? "text-primary-800" : "text-primary-50";

  const items: React.ReactNode[] = [];

  if (show.includes("reads") && reads !== undefined) {
    items.push(
      <span key="reads" className="inline-flex items-center gap-1">
        <EyeGlyph size={iconSize} className={textColor} />
        <span className={strongColor}>{formatCount(reads)}</span>
        <span className={textColor}>reads</span>
      </span>,
    );
  }

  if (show.includes("sparks") && sparks !== undefined) {
    items.push(
      <span key="sparks" className="inline-flex items-center gap-1">
        <SparkFilledIcon size={iconSize} className="text-spark" />
        <span className={strongColor}>{formatCount(sparks)}</span>
        <span className={textColor}>sparks</span>
      </span>,
    );
  }

  if (show.includes("chapters") && chapters !== undefined) {
    items.push(
      <span key="chapters" className="inline-flex items-center gap-1">
        <BookGlyph size={iconSize} className={textColor} />
        <span className={strongColor}>{chapters}</span>
        <span className={textColor}>{chapters === 1 ? "chapter" : "chapters"}</span>
      </span>,
    );
  }

  if (show.includes("words") && words !== undefined) {
    items.push(
      <span key="words" className={textColor}>
        {formatWords(words)}
      </span>,
    );
  }

  if (show.includes("followers") && followers !== undefined) {
    items.push(
      <span key="followers" className="inline-flex items-center gap-1">
        <HeartGlyph size={iconSize} className={textColor} />
        <span className={strongColor}>{formatCount(followers)}</span>
        <span className={textColor}>followers</span>
      </span>,
    );
  }

  return (
    <div className={`flex flex-wrap items-center ${sizeClasses[size]} ${className}`}>
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center">
          {i > 0 && (
            <span className={`mr-3 ${textColor} opacity-40`} aria-hidden="true">
              ·
            </span>
          )}
          {item}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline glyphs
// ---------------------------------------------------------------------------
function EyeGlyph({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function BookGlyph({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 4h7v16H4z M13 4h7v16h-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function HeartGlyph({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 20.5s-7-4.5-7-10a4.5 4.5 0 018-2.8 4.5 4.5 0 018 2.8c0 5.5-7 10-7 10l-1-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
