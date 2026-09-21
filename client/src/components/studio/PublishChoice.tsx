import { useState } from "react";

import { Button, Card } from "../ui";

interface PublishChoiceProps {
  onChoose: (mode: "full_manuscript" | "chapter_by_chapter") => void;
  onCancel?: () => void;
  storyTitle: string;
}

export function PublishChoice({
  onChoose,
  onCancel,
  storyTitle,
}: PublishChoiceProps) {
  const [selected, setSelected] = useState<"full_manuscript" | "chapter_by_chapter" | null>(null);

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="font-display text-2xl font-bold text-primary-900">
          How do you want to publish?
        </h1>
        <p className="mt-2 text-sm text-primary-500">
          You can switch later, but you"ll want to pick what fits
          {" "}
          <em>{storyTitle}</em>
          best.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <ChoiceCard
          active={selected === "full_manuscript"}
          onClick={() => setSelected("full_manuscript")}
          icon={<ManuscriptGlyph />}
          title="Full manuscript"
          tagline="Best for finished novels"
          description="Upload your whole book at once. It goes live as a single drop — perfect for readers who want to binge."
          bullets={[
            "Upload a Word doc or paste your text",
            "We split it into chapters automatically",
            "One publish button, whole book live",
          ]}
        />

        <ChoiceCard
          active={selected === "chapter_by_chapter"}
          onClick={() => setSelected("chapter_by_chapter")}
          icon={<ChaptersGlyph />}
          title="Chapter by chapter"
          tagline="Best for serials"
          description="Draft, schedule, and publish on your own rhythm. Readers get Sparks on each chapter as it drops."
          bullets={[
            "Publish as you write",
            "Schedule chapters ahead of time",
            "Attach reader polls to any chapter",
          ]}
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-primary-100">
        {onCancel
          ? (
              <Button variant="ghost" onClick={onCancel}>
                Back to story
              </Button>
            )
          : (
              <span />
            )}
        <Button
          variant="primary"
          size="lg"
          disabled={!selected}
          onClick={() => selected && onChoose(selected)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function ChoiceCard({
  active,
  onClick,
  icon,
  title,
  tagline,
  description,
  bullets,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "group text-left p-5 rounded-lg border-2 transition-all",
        active
          ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
          : "border-primary-100 bg-white hover:border-primary-300 hover:bg-primary-50/50",
      ].join(" ")}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={[
            "w-11 h-11 rounded-full flex items-center justify-center transition-colors",
            active
              ? "bg-primary-500 text-white"
              : "bg-primary-100 text-primary-600 group-hover:bg-primary-200",
          ].join(" ")}
        >
          {icon}
        </div>
        <span
          className={[
            "w-5 h-5 rounded-full border-2 transition-all",
            active
              ? "border-primary-500 bg-primary-500 flex items-center justify-center"
              : "border-primary-200",
          ].join(" ")}
        >
          {active && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </div>

      <h3 className="font-display text-lg font-bold text-primary-900">
        {title}
      </h3>
      <p className="text-xs uppercase tracking-wider font-semibold text-primary-500 mt-0.5">
        {tagline}
      </p>
      <p className="mt-3 text-sm text-primary-600 leading-relaxed">
        {description}
      </p>
      <ul className="mt-4 space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-primary-700">
            <span className="text-primary-500 mt-0.5 shrink-0" aria-hidden="true">✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

function ManuscriptGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h11a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChaptersGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="3" width="12" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 8h4M8 12h4M8 16h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19 7v11a3 3 0 01-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
