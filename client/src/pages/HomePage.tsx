import { Link } from "react-router-dom";

import type { StoryCardData } from "../types/story";

import {
  ArrowRightIcon,
  CheckCircleIcon,
  HeartIcon,
  MegaphoneIcon,
  SparkFilledIcon,
  UsersIcon,
} from "../assets/icons";
import { Container } from "../components/layout";
import { StoryGrid } from "../components/stories";
import { Button, Card } from "../components/ui";
import { useBurningNow } from "../hooks/useStories";

export function HomePage() {
  const { stories, loading } = useBurningNow(6);

  return (
    <>
      <Hero />
      <HowItWorks />
      <BurningNow stories={stories as unknown as StoryCardData[]} loading={loading} />
      <DonationPromise />
      <MembershipPitch />
    </>
  );
}

// ---------------------------------------------------------------------------
// HERO
// ---------------------------------------------------------------------------
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
      {/* Decorative sparks */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <SparkFilledIcon
          size={240}
          className="absolute -top-12 -right-12 text-spark opacity-[0.06]"
        />
        <SparkFilledIcon
          size={120}
          className="absolute bottom-10 left-10 text-spark opacity-[0.08]"
        />
      </div>

      <Container size="xl" className="relative py-20 lg:py-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur mb-6">
            <SparkFilledIcon size={12} className="text-spark" />
            <span className="text-xs font-semibold text-primary-50 uppercase tracking-wider">
              Serialized fiction that pays its authors directly
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-primary-50">
            Stories worth staying up for.
            <span className="block text-spark mt-2">
              Authors who actually get paid.
            </span>
          </h1>

          <p className="mt-6 text-lg text-primary-200 leading-relaxed max-w-xl">
            Readers spend Sparks on the chapters that hit hardest, vote on what
            happens next, and donate straight to the author"s own Ko-fi or
            Patreon.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/library">
              <Button variant="spark" size="lg" rightIcon={<ArrowRightIcon size={16} />}>
                Start reading
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/10 border-white/30 text-primary-50 hover:bg-white/20"
              >
                Start writing
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-primary-300">
            Free account · 100 Sparks a month · 0% platform cut on donations
          </p>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// HOW IT WORKS
// ---------------------------------------------------------------------------
function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <HeartIcon size={24} />,
      title: "Pick your payout",
      body: "Authors name their donation platform at sign-up. That link lives on every chapter they publish.",
    },
    {
      num: "02",
      icon: <SparkFilledIcon size={24} className="text-spark" />,
      title: "Readers spend Sparks",
      body: "Members get a monthly Sparks allowance. Sparks land on chapters, not vague profiles.",
    },
    {
      num: "03",
      icon: <MegaphoneIcon size={24} />,
      title: "Readers steer the plot",
      body: "Chapter polls and open desks turn a serial into something the audience helped build.",
    },
  ];

  return (
    <section className="bg-primary-50 py-16 lg:py-20">
      <Container size="xl">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-3">
            How it works
          </p>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary-900">
            Three moves. No middlemen.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map(step => (
            <Card key={step.num} className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-full bg-primary-900 text-primary-50 flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="font-display text-3xl font-bold text-primary-100">
                  {step.num}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-primary-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-primary-500 leading-relaxed">
                {step.body}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// BURNING NOW
// ---------------------------------------------------------------------------
function BurningNow({
  stories,
  loading,
}: {
  stories: StoryCardData[];
  loading: boolean;
}) {
  return (
    <section className="bg-white py-16 lg:py-20">
      <Container size="xl">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-spark-dark mb-2">
              Burning right now
            </p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary-900">
              Freshly sparked
            </h2>
          </div>
          <Link to="/library" className="text-sm font-semibold text-primary-600 hover:text-primary-900 inline-flex items-center gap-1.5">
            Browse all
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        <StoryGrid
          stories={stories}
          loading={loading}
          columns={3}
          emptyTitle="Nothing burning yet"
          emptyDescription="The first stories will show up here."
        />
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// DONATION PROMISE
// ---------------------------------------------------------------------------
function DonationPromise() {
  return (
    <section className="bg-primary-900 py-16 lg:py-20">
      <Container size="lg">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-spark/15 mb-6">
            <SparkFilledIcon size={12} className="text-spark" />
            <span className="text-xs font-bold uppercase tracking-wider text-spark">
              0% platform cut
            </span>
          </div>

          <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary-50">
            Your donation link, not ours
          </h2>
          <p className="mt-4 text-primary-200 leading-relaxed">
            Authors pick Ko-fi, Patreon, Buy Me a Coffee, or any link at sign-up.
            Readers pay the writer directly — FolioSparks never sits between
            them.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              "Direct donations to the author",
              "No fees on the transfer",
              "Supports any platform they choose",
            ].map(line => (
              <div key={line} className="flex items-start gap-3">
                <CheckCircleIcon size={20} className="text-spark shrink-0 mt-0.5" />
                <span className="text-sm text-primary-100">{line}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// MEMBERSHIP PITCH
// ---------------------------------------------------------------------------
function MembershipPitch() {
  const perks = [
    { icon: <SparkFilledIcon size={18} className="text-spark" />, label: "1,200 Sparks a month" },
    { icon: <UsersIcon size={18} className="text-primary-600" />, label: "Audio with offline chapters" },
    { icon: <MegaphoneIcon size={18} className="text-primary-600" />, label: "Early access to new chapters" },
  ];

  return (
    <section className="bg-primary-50 py-16 lg:py-20">
      <Container size="lg">
        <Card className="p-8 lg:p-12 border-2 border-primary-500">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-3">
                Membership
              </p>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary-900">
                Membership funds the shelf
              </h2>
              <p className="mt-4 text-primary-600 leading-relaxed">
                Free readers get a small monthly Sparks allowance. Spark and
                Spark Pro members get much more — and most of that money ends up
                in an author"s hands.
              </p>

              <ul className="mt-6 space-y-3">
                {perks.map(perk => (
                  <li key={perk.label} className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      {perk.icon}
                    </span>
                    <span className="text-sm font-medium text-primary-800">
                      {perk.label}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link to="/membership">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRightIcon size={16} />}>
                    See membership tiers
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-lg bg-gradient-to-br from-primary-700 to-primary-900 p-8 flex flex-col justify-between overflow-hidden">
                <SparkFilledIcon
                  size={140}
                  className="absolute -top-8 -right-8 text-spark opacity-20"
                />
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary-300">
                    Spark tier
                  </p>
                  <p className="mt-3 font-display text-5xl font-bold text-primary-50">
                    $5
                  </p>
                  <p className="text-sm text-primary-300">per month</p>
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <SparkFilledIcon size={16} className="text-spark" />
                    <span className="text-sm font-semibold text-primary-50">
                      1,200 Sparks / month
                    </span>
                  </div>
                  <p className="text-xs text-primary-300 leading-relaxed">
                    Audio on every chapter. Early access. A supporter badge.
                    Cancel anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
}
