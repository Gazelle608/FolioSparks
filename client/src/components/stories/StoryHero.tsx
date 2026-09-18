import { Link } from "react-router-dom";

import type { StoryCardData } from "../../types/story";

import { getAvatarUrl, getCoverUrl } from "../../api/supabase";
import {
  KofiIcon,
  PatreonIcon,
  SparkFilledIcon,
} from "../../assets/icons";
import { Button } from "../ui";
import { GenrePill } from "./GenrePill";
import { StoryStats } from "./StoryStats";
import { StoryTags } from "./StoryTags";

interface DonationLink {
  platform: string;
  url: string;
  label?: string | null;
}

interface StoryHeroProps {
  story: StoryCardData;
  /** Author"s active donation links (from donation_links table) */
  donationLinks?: DonationLink[];
  /** Called when reader clicks "Start reading" */
  onStartReading?: () => void;
  /** Called when reader clicks "Add to library" */
  onAddToLibrary?: () => void;
  /** Is this story already in the reader"s library? */
  isInLibrary?: boolean;
}

export function StoryHero({
  story,
  donationLinks = [],
  onStartReading,
  onAddToLibrary,
  isInLibrary = false,
}: StoryHeroProps) {
  const coverUrl = getCoverUrl(story.cover_url);
  const authorAvatar = getAvatarUrl(story.author.avatar_url ?? null);
  const hasDonations = story.is_donation_enabled && donationLinks.length > 0;
  const primaryDonation = donationLinks[0];

  return (
    <div className="bg-gradient-to-b from-primary-900 to-primary-800 text-primary-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Cover */}
          <div className="shrink-0 self-start mx-auto sm:mx-0">
            <div className="w-40 sm:w-48 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl ring-1 ring-primary-700 bg-primary-700">
              {story.cover_url
                ? (
                    <img
                      src={coverUrl}
                      alt={`Cover of ${story.title}`}
                      className="w-full h-full object-cover"
                    />
                  )
                : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 bg-gradient-to-br from-primary-700 to-primary-900">
                      <SparkFilledIcon size={32} className="text-spark opacity-80" />
                      <span className="font-display text-center text-primary-50 text-sm font-bold leading-snug">
                        {story.title}
                      </span>
                    </div>
                  )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Genre + status row */}
            <div className="flex flex-wrap items-center gap-2">
              <GenrePill genre={story.genre} size="md" />
              <StatusChip status={story.status} />
              {story.is_open_desk && (
                <span className="text-xs font-semibold uppercase tracking-wide text-spark">
                  ✦ Open co-writing desk
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-primary-50">
              {story.title}
            </h1>

            {/* Author */}
            <Link
              to={`/@${story.author.username ?? story.author.id}`}
              className="mt-3 inline-flex items-center gap-2 group"
            >
              <img
                src={authorAvatar}
                alt=""
                className="w-8 h-8 rounded-full object-cover ring-1 ring-primary-700"
              />
              <span className="text-sm text-primary-200 group-hover:text-primary-50 transition-colors">
                by
                {" "}
                <span className="font-medium">
                  {story.author.pen_name ?? "Unknown"}
                </span>
                {story.author.is_verified && (
                  <span className="ml-1 text-spark" title="Verified">✓</span>
                )}
              </span>
            </Link>

            {/* Synopsis */}
            {story.synopsis && (
              <p className="mt-4 text-primary-100 leading-relaxed max-w-2xl">
                {story.synopsis}
              </p>
            )}

            {/* Tags */}
            {story.tags.length > 0 && (
              <div className="mt-4">
                <StoryTags tags={story.tags} size="md" limit={6} />
              </div>
            )}

            {/* Stats */}
            <div className="mt-5">
              <StoryStats
                reads={story.read_count}
                sparks={story.spark_count}
                chapters={story.chapter_count}
                words={story.word_count}
                followers={story.follower_count}
                size="md"
                variant="dark"
                show={["reads", "sparks", "chapters", "words"]}
              />
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                variant="spark"
                size="lg"
                onClick={onStartReading}
              >
                Start reading
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={onAddToLibrary}
                className="bg-white/10 border-white/30 text-primary-50 hover:bg-white/20"
              >
                {isInLibrary ? "✓ In your library" : "Add to library"}
              </Button>
            </div>

            {/* Donation strip */}
            {hasDonations && primaryDonation && (
              <div className="mt-6 flex flex-wrap items-center gap-3 pt-5 border-t border-primary-700/60">
                <span className="text-xs uppercase tracking-wider text-primary-300 font-semibold">
                  Support this author
                </span>
                <DonationButton link={primaryDonation} />
                {donationLinks.length > 1 && (
                  <span className="text-xs text-primary-300">
                    +
                    {donationLinks.length - 1}
                    {" "}
                    more on their profile
                  </span>
                )}
                <span className="text-xs text-primary-400 ml-auto">
                  100% goes to the author
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status chip
// ---------------------------------------------------------------------------
function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ongoing: { label: "Ongoing", className: "bg-primary-500 text-white" },
    completed: { label: "Complete", className: "bg-primary-200 text-primary-900" },
    hiatus: { label: "On hiatus", className: "bg-amber-500 text-white" },
    cancelled: { label: "Cancelled", className: "bg-slate-500 text-white" },
    draft: { label: "Draft", className: "bg-primary-300 text-primary-900" },
  };
  const s = map[status];
  if (!s)
    return null;

  return (
    <span
      className={[
        "inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
        s.className,
      ].join(" ")}
    >
      {s.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Donation button — picks the right icon per platform
// ---------------------------------------------------------------------------
function DonationButton({ link }: { link: DonationLink }) {
  const labelMap: Record<string, string> = {
    patreon: "Support on Patreon",
    ko_fi: "Buy a Ko-fi",
    buymeacoffee: "Buy a Coffee",
    paypal: "Send via PayPal",
    stripe: "Support via Stripe",
  };

  const label = link.label ?? labelMap[link.platform] ?? "Donate";

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 h-9 px-3 rounded-full bg-spark text-primary-900 hover:bg-spark-dark transition-colors text-sm font-semibold"
    >
      {link.platform === "patreon" && <PatreonIcon size={16} />}
      {link.platform === "ko_fi" && <KofiIcon size={16} />}
      {link.platform !== "patreon" && link.platform !== "ko_fi" && (
        <SparkFilledIcon size={14} />
      )}
      {label}
    </a>
  );
}
