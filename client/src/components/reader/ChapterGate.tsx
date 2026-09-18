import { Link, useLocation } from "react-router-dom";

import { SparkFilledIcon } from "../../assets/icons";
import { Button, Card } from "../ui";

interface ChapterGateProps {
  storyTitle: string;
  chapterNumber: number;
  /** Preview of the chapter — first few lines shown above the gate */
  preview: string;
  /** Optional next path — the reader resumes here after signing up */
  nextPath?: string;
}

export function ChapterGate({
  storyTitle,
  chapterNumber,
  preview,
  nextPath,
}: ChapterGateProps) {
  const location = useLocation();
  const next = nextPath ?? location.pathname;
  const signupHref = `/signup?next=${encodeURIComponent(next)}`;

  return (
    <div className="relative">
      {/* Preview — blurred + faded */}
      <div className="relative pointer-events-none select-none">
        <div className="reading-text blur-[3px] opacity-40 max-h-40 overflow-hidden">
          {preview.split("\n").slice(0, 3).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary-50 to-transparent" />
      </div>

      {/* Gate */}
      <Card className="mt-2 p-8 text-center max-w-md mx-auto">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-spark/20 flex items-center justify-center">
            <SparkFilledIcon size={26} className="text-spark" />
          </div>
        </div>

        <h2 className="font-display text-xl font-bold text-primary-900">
          Keep reading
          {storyTitle}
        </h2>

        <p className="mt-2 text-sm text-primary-500 max-w-xs mx-auto">
          Chapter
          {chapterNumber}
          is for members. Sign up free to keep
          reading — and get a monthly Sparks allowance to send to the
          chapters you love most.
        </p>

        <ul className="mt-5 space-y-1.5 text-sm text-primary-700 text-left max-w-xs mx-auto">
          <Bullet>Unlimited chapters from every author</Bullet>
          <Bullet>100 Sparks a month, free</Bullet>
          <Bullet>Vote in polls that decide what happens next</Bullet>
        </ul>

        <div className="mt-6 flex flex-col gap-2">
          <Link to={signupHref} className="w-full">
            <Button variant="primary" size="lg" fullWidth>
              Create your free account
            </Button>
          </Link>

          <Link
            to={`/signin?next=${encodeURIComponent(next)}`}
            className="text-sm text-primary-500 hover:text-primary-900"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-primary-500 mt-0.5" aria-hidden="true">✓</span>
      <span>{children}</span>
    </li>
  );
}
