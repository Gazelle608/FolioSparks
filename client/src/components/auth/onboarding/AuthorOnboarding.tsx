import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { completeOnboarding, updateProfile } from "../../../api/auth";
import { createAuthor } from "../../../api/authors";
import { createDonationLink } from "../../../api/donations";
import { SparkOutlineIcon } from "../../../assets/icons";
import { useAuth } from "../../../hooks/useauth";
import { Button, Card, Input } from "../../ui";
import {
  type DonationLinkDraft,
  DonationPlatformPicker,
} from "./donationplatformpicker";

type Step = "profile" | "donations" | "confirm";

export function AuthorOnboarding() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  const [step, setStep] = useState<Step>("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");

  // Step 2
  const [donations, setDonations] = useState<DonationLinkDraft[]>([]);

  // -------------------------------------------------------------------------
  // Step 1 → Step 2
  // -------------------------------------------------------------------------
  const handleProfileNext = async () => {
    if (!user)
      return;
    if (!displayName.trim())
      return setError("Display name is required");

    setLoading(true);
    setError(null);

    // Update profile first
    const profileResult = await updateProfile(user.id, {
      display_name: displayName.trim(),
      bio: bio.trim() || undefined,
    });

    if (profileResult.error) {
      setError(profileResult.error);
      setLoading(false);
      return;
    }

    // Create the author row
    const authorResult = await createAuthor({
      id: user.id,
      pen_name: displayName.trim(),
      tagline: tagline.trim() || undefined,
    });

    if (authorResult.error) {
      setError(authorResult.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("donations");
  };

  // -------------------------------------------------------------------------
  // Step 2 → Step 3
  // -------------------------------------------------------------------------
  const handleDonationsNext = async () => {
    if (!user)
      return;

    setLoading(true);
    setError(null);

    // Save each donation link
    for (const link of donations) {
      const result = await createDonationLink({
        author_id: user.id,
        platform: link.platform,
        url: link.url,
        label: link.label,
        is_primary: donations[0]?.platform === link.platform,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setStep("confirm");
  };

  // -------------------------------------------------------------------------
  // Finish
  // -------------------------------------------------------------------------
  const handleFinish = async () => {
    if (!user)
      return;

    setLoading(true);
    setError(null);

    const result = await completeOnboarding(user.id);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    await refreshProfile();
    navigate("/studio", { replace: true });
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="p-6 sm:p-8">
        <Progress step={step} />

        {step === "profile" && (
          <section className="space-y-5">
            <header>
              <h1 className="font-display text-2xl font-bold text-primary-900">
                Set up your author profile
              </h1>
              <p className="mt-1 text-sm text-primary-500">
                This is what readers see on your stories and profile page.
              </p>
            </header>

            <Input
              label="Display name"
              placeholder="The name you write under"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              disabled={loading}
              required
            />

            <Input
              label="Tagline"
              placeholder="One line about your stories"
              hint="Optional. Shows under your name."
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              disabled={loading}
              maxLength={80}
            />

            <div>
              <label className="block mb-1.5 text-sm font-medium text-primary-900">
                Bio
              </label>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-md border border-primary-200 bg-white text-sm text-primary-900 placeholder:text-primary-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-y"
                placeholder="What do you write? What should readers know?"
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={500}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-primary-400 text-right">
                {bio.length}
                /500
              </p>
            </div>

            {error && <ErrorBox message={error} />}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              onClick={handleProfileNext}
            >
              Continue to donations
            </Button>
          </section>
        )}

        {step === "donations" && (
          <section className="space-y-5">
            <header>
              <h1 className="font-display text-2xl font-bold text-primary-900">
                Where should readers support you?
              </h1>
              <p className="mt-1 text-sm text-primary-500">
                Pick any platforms you already use. Your link appears on every
                chapter you publish.
              </p>
            </header>

            <DonationPlatformPicker value={donations} onChange={setDonations} />

            {error && <ErrorBox message={error} />}

            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setStep("profile")}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                onClick={handleDonationsNext}
              >
                {donations.length === 0 ? "Skip for now" : "Save links"}
              </Button>
            </div>
          </section>
        )}

        {step === "confirm" && (
          <section className="space-y-5 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center">
                <SparkOutlineIcon size={28} className="text-spark" />
              </div>
            </div>

            <header>
              <h1 className="font-display text-2xl font-bold text-primary-900">
                You"re ready to publish
              </h1>
              <p className="mt-2 text-sm text-primary-500 max-w-sm mx-auto">
                Your studio is set up. Start a draft, or upload a finished
                manuscript — you choose how to publish.
              </p>
            </header>

            <div className="text-left bg-primary-50 rounded-lg p-4 max-w-sm mx-auto">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-primary-500">
                Your donation links
              </h2>
              {donations.length === 0
                ? (
                    <p className="mt-2 text-sm text-primary-500">
                      None yet. You can add them later from Settings.
                    </p>
                  )
                : (
                    <ul className="mt-2 space-y-1.5">
                      {donations.map(d => (
                        <li key={d.platform} className="flex items-center gap-2 text-sm">
                          <span className="text-primary-500">✦</span>
                          <span className="font-medium text-primary-900 capitalize">
                            {d.platform.replace("_", " ")}
                          </span>
                          <span className="text-primary-400 truncate">{d.url}</span>
                        </li>
                      ))}
                    </ul>
                  )}
            </div>

            {error && <ErrorBox message={error} />}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              onClick={handleFinish}
            >
              Enter your studio
            </Button>
          </section>
        )}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Progress({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "donations", label: "Donations" },
    { id: "confirm", label: "Ready" },
  ];

  const currentIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  "transition-colors",
                  done
                    ? "bg-primary-500 text-white"
                    : active
                      ? "bg-primary-900 text-white"
                      : "bg-primary-100 text-primary-400",
                ].join(" ")}
              >
                {done ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={[
                    "flex-1 h-0.5 mx-2",
                    done ? "bg-primary-500" : "bg-primary-100",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        {steps.map((s, i) => (
          <span
            key={s.id}
            className={[
              "text-xs",
              i <= currentIndex
                ? "text-primary-700 font-medium"
                : "text-primary-400",
            ].join(" ")}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-danger"
    >
      {message}
    </div>
  );
}
