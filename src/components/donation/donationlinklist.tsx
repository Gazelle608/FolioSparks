import type { DonationLink } from "../../types/donation";

import { DonationButton } from "./donationbutton";

interface DonationLinkListProps {
  links: DonationLink[];
  /** Layout */
  layout?: "inline" | "stack" | "grid";
  /** Button size to pass through */
  size?: "sm" | "md" | "lg";
  /** Button variant to pass through */
  variant?: "solid" | "outline";
  /** Max shown (extra is collapsed into a "+N more" line) */
  max?: number;
  /** Called when a link is clicked (for analytics) */
  onTrack?: (platform: string) => void;
  className?: string;
}

export function DonationLinkList({
  links,
  layout = "stack",
  size = "md",
  variant = "solid",
  max,
  onTrack,
  className = "",
}: DonationLinkListProps) {
  // Only show active links, sorted by primary first then display_order
  const active = [...links]
    .filter(l => l.is_active)
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary)
        return -1;
      if (!a.is_primary && b.is_primary)
        return 1;
      return a.display_order - b.display_order;
    });

  if (active.length === 0)
    return null;

  const shown = max ? active.slice(0, max) : active;
  const hidden = max ? active.length - shown.length : 0;

  const layoutClasses
  = layout === "inline"
    ? "flex flex-wrap gap-2"
    : layout === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 gap-2"
      : "flex flex-col gap-2";

  return (
    <div className={className}>
      <div className={layoutClasses}>
        {shown.map(link => (
          <DonationButton
            key={link.id}
            link={link}
            size={size}
            variant={variant}
            fullWidth={layout !== "inline"}
            onTrack={onTrack}
          />
        ))}
      </div>

      {hidden > 0 && (
        <p className="mt-2 text-xs text-primary-400">
          +
          {hidden}
          more on their profile
        </p>
      )}
    </div>
  );
}
