import type { DonationLink } from "../../types/donation";

import { getPlatformMeta } from "./platforms";

interface DonationButtonProps {
  link: DonationLink;
  /** Visual density */
  size?: "sm" | "md" | "lg";
  /** "solid" = gold fill (hero CTAs), "outline" = quiet (inline) */
  variant?: "solid" | "outline";
  /** Force a specific label instead of the platform default */
  label?: string;
  /** Full-width button */
  fullWidth?: boolean;
  /** Called when the link is clicked — use for click tracking */
  onTrack?: (platform: string) => void;
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2.5",
};

const ICON_SIZES = { sm: 14, md: 16, lg: 18 };

export function DonationButton({
  link,
  size = "md",
  variant = "solid",
  label,
  fullWidth = false,
  onTrack,
  className = "",
}: DonationButtonProps) {
  const meta = getPlatformMeta(link.platform);
  const text = label ?? link.label ?? meta.actionLabel;
  const iconSize = ICON_SIZES[size];

  const variantClasses
  = variant === "solid"
    ? "bg-spark text-primary-900 hover:bg-spark-dark focus-visible:ring-spark"
    : "bg-white text-primary-800 border border-primary-200 hover:border-primary-400 hover:bg-primary-50 focus-visible:ring-primary-400";

  const handleClick = () => {
    onTrack?.(link.platform);
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={[
        "inline-flex items-center justify-center font-semibold rounded-full",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        SIZE_CLASSES[size],
        variantClasses,
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      title={`${meta.name} — opens in a new tab`}
    >
      <meta.Icon size={iconSize} />
      <span className="whitespace-nowrap">{text}</span>
      <ExternalArrowGlyph size={iconSize - 4} />
    </a>
  );
}

function ExternalArrowGlyph({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="opacity-70"
      aria-hidden="true"
    >
      <path
        d="M7 17L17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
