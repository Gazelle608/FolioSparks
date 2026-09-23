interface StoryTagsProps {
  tags: string[];
  /** Maximum shown before a "+N" badge */
  limit?: number;
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
};

export function StoryTags({
  tags,
  limit = 4,
  size = "sm",
  className = "",
}: StoryTagsProps) {
  if (!tags || tags.length === 0)
    return null;

  const shown = tags.slice(0, limit);
  const overflow = tags.length - shown.length;

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {shown.map(tag => (
        <span
          key={tag}
          className={[
            "inline-flex items-center rounded-full",
            "bg-primary-50 text-primary-600 border border-primary-100",
            sizeClasses[size],
          ].join(" ")}
        >
          {tag}
        </span>
      ))}

      {overflow > 0 && (
        <span
          className={[
            "inline-flex items-center rounded-full",
            "bg-primary-50 text-primary-400 border border-primary-100 font-medium",
            sizeClasses[size],
          ].join(" ")}
          title={tags.slice(limit).join(", ")}
        >
          +
          {overflow}
        </span>
      )}
    </div>
  );
}
