import { Link } from "react-router-dom";

import type { MembershipTier } from "../../types/membership";

import { SparkFilledIcon } from "../../assets/icons";
import { MembershipBadge } from "./membershipbadge";

interface SparksAllowanceDisplayProps {
  balance: number;
  /** What they started the month with */
  allowance: number;
  tier: MembershipTier;
  /** Next grant date ISO */
  nextGrantAt?: string | null;
  variant?: "compact" | "expanded";
  className?: string;
}

export function SparksAllowanceDisplay({
  balance,
  allowance,
  tier,
  nextGrantAt,
  variant = "compact",
  className = "",
}: SparksAllowanceDisplayProps) {
  const used = Math.max(0, allowance - balance);
  const usedPct = allowance > 0 ? Math.min(100, (used / allowance) * 100) : 0;
  const isLow = balance < allowance * 0.2;

  // ---------------------------------------------------------------------------
  // COMPACT — for the navbar
  // ---------------------------------------------------------------------------
  if (variant === "compact") {
    return (
      <Link
        to="/membership"
        className={[
          "inline-flex items-center gap-1.5 h-9 px-3 rounded-full transition-colors",
          isLow
            ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
            : "bg-spark/15 text-primary-900 hover:bg-spark/25",
          className,
        ].join(" ")}
        title={`${balance.toLocaleString()} Sparks remaining`}
      >
        <SparkFilledIcon size={14} className="text-spark-dark" />
        <span className="text-sm font-semibold tabular-nums">
          {balance.toLocaleString()}
        </span>
      </Link>
    );
  }

  // ---------------------------------------------------------------------------
  // EXPANDED — for dashboards / membership page
  // ---------------------------------------------------------------------------
  return (
    <div
      className={[
        "rounded-lg border bg-white p-4",
        isLow ? "border-amber-200" : "border-primary-100",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-spark/15 flex items-center justify-center">
            <SparkFilledIcon size={16} className="text-spark-dark" />
          </div>
          <div>
            <p className="text-xs text-primary-500 uppercase tracking-wider font-semibold">
              Sparks
            </p>
            <p className="text-xs text-primary-400">
              This month"s allowance
            </p>
          </div>
        </div>
        <MembershipBadge tier={tier} size="sm" />
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-display text-3xl font-bold text-primary-900 tabular-nums">
          {balance.toLocaleString()}
        </span>
        <span className="text-sm text-primary-400 tabular-nums">
          /
          {allowance.toLocaleString()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 rounded-full bg-primary-100 overflow-hidden mt-2">
        <div
          className={[
            "absolute inset-y-0 left-0 rounded-full transition-all",
            isLow ? "bg-amber-500" : "bg-spark",
          ].join(" ")}
          style={{ width: `${usedPct}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-primary-500">
          {used.toLocaleString()}
          used
        </span>
        {nextGrantAt && (
          <span className="text-primary-400">
            Renews
            {formatShortDate(nextGrantAt)}
          </span>
        )}
      </div>

      {tier === "free" && (
        <Link
          to="/membership"
          className="mt-3 flex items-center justify-between p-2 -mx-2 rounded-md bg-primary-50 hover:bg-primary-100 transition-colors"
        >
          <span className="text-xs font-medium text-primary-700">
            Get 12× more Sparks with Spark
          </span>
          <span className="text-xs text-primary-500">→</span>
        </Link>
      )}

      {isLow && tier !== "free" && (
        <p className="mt-3 text-xs text-amber-800">
          Running low — your allowance renews on
          {" "}
          {nextGrantAt ? formatShortDate(nextGrantAt) : "the 1st"}
          .
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
