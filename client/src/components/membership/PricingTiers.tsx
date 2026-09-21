import { useState } from "react";

import type { MembershipTier } from "../../types/membership";

import { SparkFilledIcon } from "../../assets/icons";
import { Button, Card } from "../ui";
import { UpgradeModal } from "./UpgradeModal";

interface PricingTiersProps {
  /** Current user"s tier (or null if anonymous) */
  currentTier?: MembershipTier | null;
  /** Whether the user is signed in */
  isSignedIn?: boolean;
  /** Called when user chooses a tier (for anonymous → signup flow) */
  onTierSelected?: (tier: MembershipTier) => void;
}

// ---------------------------------------------------------------------------
// Tier definitions — the single source of truth for pricing
// ---------------------------------------------------------------------------
interface Tier {
  id: MembershipTier;
  name: string;
  price: number;
  period: string;
  tagline: string;
  sparks: number;
  highlight?: boolean;
  features: string[];
  cta: string;
}

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Reader",
    price: 0,
    period: "forever",
    tagline: "Everything you need to read",
    sparks: 100,
    features: [
      "Full library access",
      "100 Sparks a month",
      "Bookshelf and reading progress",
      "Vote in chapter polls",
      "Send Sparks to any chapter",
    ],
    cta: "Create free account",
  },
  {
    id: "spark",
    name: "Spark",
    price: 5,
    period: "per month",
    tagline: "The sweet spot",
    sparks: 1200,
    highlight: true,
    features: [
      "1,200 Sparks a month",
      "Audio mode with offline chapters",
      "Early access chapters from authors you follow",
      "Supporter badge on comments and tips",
      "Priority in poll display",
    ],
    cta: "Choose Spark",
  },
  {
    id: "spark_pro",
    name: "Spark Pro",
    price: 12,
    period: "per month",
    tagline: "For serious fans",
    sparks: 3000,
    features: [
      "3,000 Sparks a month",
      "Everything in Spark",
      "Downloadable chapter MP3s",
      "Chapter-level analytics for your own serials",
      "Unlimited polls and co-writing desks",
      "Featured placement in the library",
    ],
    cta: "Choose Spark Pro",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PricingTiers({
  currentTier = null,
  isSignedIn = false,
  onTierSelected,
}: PricingTiersProps) {
  const [openTier, setOpenTier] = useState<Tier | null>(null);

  const handleSelect = (tier: Tier) => {
    // Free tier + anonymous = go to signup
    if (tier.id === "free" && !isSignedIn) {
      onTierSelected?.(tier.id);
      return;
    }
    // Free tier + signed in = no-op (already free)
    if (tier.id === "free" && currentTier === "free")
      return;
    // Otherwise open the upgrade modal
    setOpenTier(tier);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TIERS.map(tier => (
          <TierCard
            key={tier.id}
            tier={tier}
            current={currentTier === tier.id}
            isSignedIn={isSignedIn}
            onSelect={() => handleSelect(tier)}
          />
        ))}
      </div>

      <FAQ />

      <UpgradeModal
        isOpen={!!openTier}
        onClose={() => setOpenTier(null)}
        tier={openTier}
        currentTier={currentTier}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Tier card
// ---------------------------------------------------------------------------
function TierCard({
  tier,
  current,
  onSelect,
}: {
  tier: Tier;
  current: boolean;
  isSignedIn: boolean;
  onSelect: () => void;
}) {
  const isFree = tier.id === "free";
  const ctaDisabled = current;

  return (
    <Card
      className={[
        "relative p-6 flex flex-col",
        tier.highlight ? "border-2 border-primary-500 shadow-lg" : "",
        current ? "ring-2 ring-primary-300" : "",
      ].join(" ")}
    >
      {tier.highlight && !current && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Most popular
          </span>
        </div>
      )}

      {current && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Your plan
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h3 className="font-display text-lg font-bold text-primary-900">
          {tier.name}
        </h3>
        <p className="text-sm text-primary-500 mt-0.5">{tier.tagline}</p>
      </div>

      {/* Price */}
      <div className="mb-5">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-4xl font-bold text-primary-900">
            $
            {tier.price}
          </span>
          <span className="text-sm text-primary-500">{tier.period}</span>
        </div>
      </div>

      {/* Sparks highlight */}
      <div className="mb-5 p-3 rounded-md bg-spark/10 border border-spark/30 flex items-center gap-2">
        <SparkFilledIcon size={16} className="text-spark-dark" />
        <span className="text-sm font-semibold text-primary-900">
          {tier.sparks.toLocaleString()}
          Sparks / month
        </span>
      </div>

      {/* Features */}
      <ul className="space-y-2.5 mb-6 flex-1">
        {tier.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-primary-700">
            <span className="text-primary-500 mt-0.5 shrink-0" aria-hidden="true">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        variant={tier.highlight ? "primary" : isFree ? "secondary" : "secondary"}
        size="lg"
        fullWidth
        disabled={ctaDisabled}
        onClick={onSelect}
      >
        {current ? "Current plan" : tier.cta}
      </Button>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------
const FAQS = [
  {
    q: "How do Sparks work?",
    a: "Sparks are our engagement currency. Each month you get an allowance based on your tier. You spend Sparks on the specific chapters that hit hardest — the author sees every one, along with any note you leave.",
  },
  {
    q: "Do Sparks turn into real money for authors?",
    a: "No. Sparks are for engagement — a signal of what's working. If you want to send actual money, every author has a direct donation link (Ko-fi, Patreon, etc.) on their chapter pages. FolioSparks takes 0% of those donations.",
  },
  {
    q: "What happens to unused Sparks?",
    a: "Your allowance refreshes on the 1st of every month. Unused Sparks roll over up to 3× your monthly allowance, so nothing is wasted.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your settings in one click. You keep access until the end of your billing period, then drop back to Free.",
  },
  {
    q: "What audio do I get on each tier?",
    a: "Free readers get no audio. Spark members unlock in-browser audio on every chapter (text-to-speech). Spark Pro adds downloadable MP3s for offline listening.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mt-12">
      <h2 className="font-display text-xl font-bold text-primary-900 mb-4">
        Questions
      </h2>
      <div className="rounded-lg border border-primary-100 bg-white divide-y divide-primary-100">
        {FAQS.map((faq, i) => (
          <details
            key={i}
            open={open === i}
            onToggle={e =>
              setOpen((e.target as HTMLDetailsElement).open ? i : null)}
            className="group"
          >
            <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none">
              <span className="font-medium text-primary-900">{faq.q}</span>
              <span className="text-primary-400 group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="px-5 pb-4 text-sm text-primary-600 leading-relaxed">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
