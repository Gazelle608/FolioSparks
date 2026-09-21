import { Link } from "react-router-dom";

import { SparkOutlineIcon } from "../../assets/icons";

interface DonationBannerProps {
  /** Where the banner appears */
  variant?: "chapter-end" | "compact" | "card";
  /** Optional author name — makes the copy warmer */
  authorName?: string;
  /** Optional CTA link to author"s donation section */
  ctaHref?: string;
  className?: string;
}

export function DonationBanner({
  variant = "chapter-end",
  authorName,
  ctaHref,
  className = "",
}: DonationBannerProps) {
  // ---------------------------------------------------------------------------
  // COMPACT — one-liner for the footer / navbar
  // ---------------------------------------------------------------------------
  if (variant === "compact") {
    return (
      <div
        className={[
          "inline-flex items-center gap-2 text-xs text-primary-500",
          className,
        ].join(" ")}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary-500" aria-hidden="true" />
        <span>
          <strong className="text-primary-700">0%</strong>
          platform cut on author
          donations
        </span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // CARD — boxed version for onboarding / membership pages
  // ---------------------------------------------------------------------------
  if (variant === "card") {
    return (
      <div
        className={[
          "rounded-lg border border-primary-100 bg-white p-5",
          className,
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
            <SparkOutlineIcon size={18} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-bold text-primary-900">
              Your donation link, not ours
            </h3>
            <p className="mt-1 text-sm text-primary-600 leading-relaxed">
              Authors pick Ko-fi, Patreon, Buy Me a Coffee, or any link.
              Readers pay the writer directly — FolioSparks never sits between
              them.
            </p>
            {ctaHref && (
              <Link
                to={ctaHref}
                className="mt-3 inline-block text-sm font-semibold text-primary-700 underline hover:text-primary-900"
              >
                Set up your donation links →
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // CHAPTER-END — the warm nudge after a chapter that hit hard
  // ---------------------------------------------------------------------------
  return (
    <div
      className={[
        "rounded-lg border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5",
        className,
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-spark/15 flex items-center justify-center">
          <SparkOutlineIcon size={18} className="text-spark-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-bold text-primary-900">
            {authorName
              ? `Did this chapter land? Tell ${authorName}.`
              : "Did this chapter land?"}
          </h3>
          <p className="mt-1 text-sm text-primary-600 leading-relaxed">
            Every author on FolioSparks has their own donation link —
            Ko-fi, Patreon, Buy Me a Coffee, or wherever they want.
            We take
            <strong className="text-primary-900">0%</strong>
            of it.
          </p>
          {ctaHref && (
            <Link
              to={ctaHref}
              className="mt-3 inline-block text-sm font-semibold text-primary-700 underline hover:text-primary-900"
            >
              Support the author →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
