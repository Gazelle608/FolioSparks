import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { signIn } from "../../api/auth";
import { Button, Input } from "../ui";
import { GoogleAuthButton } from "./GoogleAuthButton";

interface LoginFormProps {
  /** Where to redirect after successful login */
  redirectTo?: string;
  /** Fired after a successful sign-in (for parent-side side effects) */
  onSuccess?: () => void;
}

export function LoginForm({ redirectTo = "/", onSuccess }: LoginFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic client-side checks (backend will still validate)
    if (!email.trim())
      return setError("Please enter your email");
    if (!password)
      return setError("Please enter your password");

    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSuccess?.();
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-primary-100 p-6 sm:p-8">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold text-primary-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-primary-500">
            Sign in to keep reading and sending Sparks.
          </p>
        </header>

        <GoogleAuthButton redirectTo={redirectTo} />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-primary-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-xs uppercase tracking-wider text-primary-400">
              or
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-primary-500 hover:text-primary-900"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <div
              role="alert"
              className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-danger"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-primary-500">
          New here?
          {" "}
          <Link
            to="/signup"
            className="font-medium text-primary-700 hover:text-primary-900"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
