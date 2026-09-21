import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { completeOnboarding } from "../../../api/auth";
import { SparkFilledIcon } from "../../../assets/icons";
import { useAuth } from "../../../hooks/useauth";
import { Button, Card } from "../../ui";

export function ReaderOnboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    navigate("/library", { replace: true });
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-spark/20 flex items-center justify-center">
            <SparkFilledIcon size={28} className="text-spark" />
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-primary-900">
          You"ve got Sparks
        </h1>
        <p className="mt-2 text-sm text-primary-500 max-w-sm mx-auto">
          Every month you get a fresh allowance of Sparks. Send them to the
          chapters that hit hardest — authors see every one.
        </p>

        <ul className="mt-6 space-y-2 text-left max-w-sm mx-auto">
          <Feature>Read chapters 1–3 free, no account needed. All chapters once you"re in.</Feature>
          <Feature>Send Sparks to specific chapters, with a note the author reads.</Feature>
          <Feature>Vote in chapter-ending polls that decide what happens next.</Feature>
        </ul>

        {error && (
          <p className="mt-4 text-xs text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            onClick={handleFinish}
          >
            Start reading
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-primary-700">
      <span className="text-primary-500 mt-0.5" aria-hidden="true">✓</span>
      <span>{children}</span>
    </li>
  );
}
