import { Link } from "react-router-dom";

import { LockedAudioIcon, SparkFilledIcon } from "../../assets/icons";
import { Button } from "../ui";

interface LockedAudioCardProps {
  /** "Sign up free" vs "Upgrade to Spark Pro" */
  reason?: "anonymous" | "free" | "spark-tier";
}

export function LockedAudioCard({ reason = "free" }: LockedAudioCardProps) {
  const content = {
    "anonymous": {
      title: "Listen to this chapter",
      message:
        "Create a free account to unlock audio on every chapter — plus 100 Sparks a month to send to the writers you love.",
      cta: "Create free account",
      href: "/signup",
      showPro: false,
    },
    "free": {
      title: "Audio is a members-only feature",
      message:
        "Spark members unlock browser audio on every chapter. Spark Pro adds downloadable MP3s.",
      cta: "See membership tiers",
      href: "/membership",
      showPro: true,
    },
    "spark-tier": {
      title: "Download this chapter",
      message:
        "Spark Pro members can download MP3s to listen offline — perfect for commutes.",
      cta: "Upgrade to Spark Pro",
      href: "/membership",
      showPro: true,
    },
  }[reason];

  return (
    <div className="rounded-lg border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-11 h-11 rounded-full bg-spark/20 flex items-center justify-center">
          <LockedAudioIcon size={20} className="text-primary-700" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-bold text-primary-900">
            {content.title}
          </h3>
          <p className="mt-1 text-sm text-primary-500">{content.message}</p>

          <div className="mt-4">
            <Link to={content.href}>
              <Button variant="spark" size="sm" leftIcon={<SparkFilledIcon size={14} />}>
                {content.cta}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {content.showPro && (
        <div className="mt-4 pt-4 border-t border-primary-100 text-xs text-primary-500">
          <span className="font-semibold text-primary-700">Spark:</span>
          browser
          audio on every chapter, 1,200 Sparks a month.
          <br />
          <span className="font-semibold text-primary-700">Spark Pro:</span>
          all
          of Spark, plus downloadable MP3s and 3,000 Sparks a month.
        </div>
      )}
    </div>
  );
}
