import type { MembershipTier } from "../../types/membership";

import { SparkFilledIcon } from "../../assets/icons";

interface MembershipBadgeProps {
  tier: MembershipTier;
  size?: "sm" | "md";
  /** Hide the Free badge (default: only show on paid tiers) */
  hideFree?: boolean;
  className?: string;
}

const CONFIG: Record<MembershipTier, {
  label: string;
  className: string;
  icon?: boolean;
}> = {
  free: {
    label: "Free",
    className: "bg-primary-100 text-primary-600",
  },
  spark: {
    label: "Spark",
    className: "bg-spark/20 text-primary-900 border border-spark/40",
    icon: true,
  },
  spark_pro: {
    label: "Spark Pro",
    className: "bg-spark text-primary-900",
    icon: true,
  },
};

const SIZE_CLASSES = {
  sm: "text-[10px] px-1.5 py-0.5 gap-1 rounded-full font-bold uppercase tracking-wider",
  md: "text-xs px-2 py-1 gap-1.5 rounded-full font-bold uppercase tracking-wider",
};

const ICON_SIZES = { sm: 9, md: 11 };

export function MembershipBadge({
  tier,
  size = "sm",
  hideFree = true,
  className = "",
}: MembershipBadgeProps) {
  if (tier === "free" && hideFree)
    return null;

  const cfg = CONFIG[tier];
  const iconSize = ICON_SIZES[size];

  return (
    <span
      className={[
        "inline-flex items-center whitespace-nowrap",
        SIZE_CLASSES[size],
        cfg.className,
        className,
      ].join(" ")}
      title={
        tier === "free"
          ? "Free reader"
          : tier === "spark"
            ? "Spark member"
            : "Spark Pro member"
      }
    >
      {cfg.icon && (
        <SparkFilledIcon
          size={iconSize}
          className={tier === "spark_pro" ? "text-primary-900" : "text-spark-dark"}
        />
      )}
      {cfg.label}
    </span>
  );
}
