import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { SparkFilledIcon } from "../assets/icons";
import { resendVerificationEmail } from "../api/auth";
import { Container } from "../components/layout";
import { Button, Card, Input } from "../components/ui";
import { SIGN_IN_PATH } from "../utils/postauth";

/**
 * Shown right after sign-up when Supabase requires email confirmation
 * (i.e. `signUp()` returned no session). The address travels in the URL so
 * there's no hidden state to get out of sync.
 */
export function VerifyEmailPage() {
  const [params] = useSearchParams();

  const [email, setEmail] = useState(params.get("email") ?? "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email.trim())
      return setError("Enter the email you signed up with");

    setSending(true);
    setError(null);

    const result = await resendVerificationEmail(email.trim());

    setSending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary-50">
      <header className="py-5 px-6">
        <Link to="/" className="inline-flex items-center gap-2">
          <SparkFilledIcon size={22} className="text-spark" />
          <span className="font-display text-lg font-bold text-primary-900">
            Folio
            <span className="text-primary-500">Sparks</span>
          </span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <Container size="sm">
          <Card className="p-6 sm:p-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-spark/20 flex items-center justify-center">
                <SparkFilledIcon size={28} className="text-spark" />
              </div>
            </div>

            <h1 className="font-display text-2xl font-bold text-primary-900">
              Check your inbox
            </h1>
            <p className="mt-2 text-sm text-primary-500">
              We sent a confirmation link
              {email ? (
                <>
                  {" to "}
                  <span className="font-medium text-primary-700">{email}</span>
                </>
              ) : null}
              . Click it to activate your account — then you'll be taken
              straight to your dashboard.
            </p>

            <p className="mt-4 text-xs text-primary-400">
              Nothing yet? Give it a minute, and check your spam folder.
            </p>

            <div className="mt-6 space-y-3 text-left">
              {!params.get("email") && (
                <Input
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={sending}
                  autoComplete="email"
                />
              )}

              {error && (
                <div
                  role="alert"
                  className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-danger"
                >
                  {error}
                </div>
              )}

              {sent && !error && (
                <p className="text-sm text-primary-700">
                  Sent — check your inbox again.
                </p>
              )}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={sending}
                onClick={handleResend}
              >
                Resend confirmation email
              </Button>

              <Link to={SIGN_IN_PATH} className="block">
                <Button variant="ghost" size="lg" fullWidth>
                  Back to sign in
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </div>
    </div>
  );
}
