import { useState } from "react";
import { Navigate } from "react-router-dom";

import { BookOpenIcon, QuillIcon, SparkFilledIcon } from "../assets/icons";
import { AuthorOnboarding, ReaderOnboarding } from "../components/auth";
import { FullPageSpinner } from "../components/ui";
import { useAuth } from "../hooks/useauth";

type Path = "choose" | "reader" | "author";

export function OnboardingPage() {
  const { user, profile, loading } = useAuth();
  const [path, setPath] = useState<Path>("choose");

  if (loading)
    return <FullPageSpinner />;
  if (!user)
    return <Navigate to="/signin?next=/onboarding" replace />;

  // Already onboarded → send them home
  if (profile?.onboarded_at) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-primary-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {path === "choose" && <ChoosePath onChoose={setPath} />}
        {path === "reader" && <ReaderOnboarding />}
        {path === "author" && <AuthorOnboarding />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function ChoosePath({ onChoose }: { onChoose: (path: Path) => void }) {
  return (
    <div className="bg-white rounded-lg border border-primary-100 shadow-sm p-6 sm:p-8">
      <header className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <SparkFilledIcon size={32} className="text-spark" />
        </div>
        <h1 className="font-display text-2xl font-bold text-primary-900">
          What brings you to FolioSparks?
        </h1>
        <p className="mt-2 text-sm text-primary-500">
          You can do both later — pick where you want to start.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <PathCard
          icon={<BookOpenIcon size={32} className="text-primary-600" />}
          title="I want to read"
          description="Get a monthly Sparks allowance and send them to the chapters that hit hardest."
          onClick={() => onChoose("reader")}
        />
        <PathCard
          icon={<QuillIcon size={32} className="text-primary-600" />}
          title="I want to write"
          description="Publish serials and connect your own Ko-fi, Patreon, or any donation link."
          onClick={() => onChoose("author")}
        />
      </div>
    </div>
  );
}

function PathCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left p-5 rounded-lg border-2 border-primary-100 bg-white hover:border-primary-400 hover:bg-primary-50 transition-colors"
    >
      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h2 className="font-display text-lg font-bold text-primary-900">
        {title}
      </h2>
      <p className="mt-1 text-sm text-primary-500">{description}</p>
    </button>
  );
}
