interface AudioBadgeProps {
  /** "browser" = Spark tier available; "pro" = MP3 available */
  tier: "browser" | "pro";
  size?: "sm" | "md";
}

export function AudioBadge({ tier, size = "sm" }: AudioBadgeProps) {
  const sizes = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-1 gap-1.5",
  };
  const iconSizes = { sm: 10, md: 12 };

  const label = tier === "pro" ? "Audio + MP3" : "Audio";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full font-semibold",
        "bg-primary-50 text-primary-700 border border-primary-100",
        sizes[size],
      ].join(" ")}
      title={tier === "pro" ? "Browser audio and MP3 download" : "Browser audio"}
    >
      <HeadphonesGlyph size={iconSizes[size]} />
      {label}
    </span>
  );
}

function HeadphonesGlyph({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 14v-2a8 8 0 0116 0v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="3" y="14" width="4" height="6" rx="1.5" fill="currentColor" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" fill="currentColor" />
    </svg>
  );
}
