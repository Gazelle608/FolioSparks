import { useSearchParams } from "react-router-dom";

import { SparkFilledIcon } from "../assets/icons";
import { SignupForm } from "../components/auth";
import { Container } from "../components/layout";
import { POST_AUTH_PATH, safeNextPath } from "../utils/postauth";

export function SignUpPage() {
  const [params] = useSearchParams();
  const next = safeNextPath(params.get("next")) ?? POST_AUTH_PATH;

  return (
    <div className="min-h-screen flex flex-col bg-primary-50">
      <header className="py-5 px-6">
        <a href="/" className="inline-flex items-center gap-2">
          <SparkFilledIcon size={22} className="text-spark" />
          <span className="font-display text-lg font-bold text-primary-900">
            Folio
            <span className="text-primary-500">Sparks</span>
          </span>
        </a>
      </header>

      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <Container size="sm">
          <SignupForm redirectTo={next} />
        </Container>
      </div>
    </div>
  );
}
