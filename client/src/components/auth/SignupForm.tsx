import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { signUp } from "../../api/auth";
import { Button, Input } from "../ui";
import { POST_AUTH_PATH, VERIFY_EMAIL_PATH } from "../../utils/postauth";
import { GoogleAuthButton } from "./googleauthbutton";

interface SignupFormProps {
  /** Where to send users after signup (defaults to the dashboard resolver) */
  redirectTo?: string;
}

const USERNAME_REGEX = /^[a-z0-9_]{3,24}$/;

export function SignupForm({ redirectTo = POST_AUTH_PATH }: SignupFormProps) {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Live-normalize username as the user types
  const handleUsernameChange = (value: string) => {
    setUsername(value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!displayName.trim()) {
      next.displayName = "Pick a display name";
    }
    else if (displayName.trim().length < 2) {
      next.displayName = "At least 2 characters";
    }

    if (!username) {
      next.username = "Choose a username";
    }
    else if (!USERNAME_REGEX.test(username)) {
      next.username = "Lowercase letters, numbers, underscores. 3–24 chars.";
    }

    if (!email.trim()) {
      next.email = "Email is required";
    }
    // eslint-disable-next-line regexp/no-super-linear-backtracking
    else if (!/^\S+@\S[^\s.]*\.\S+$/.test(email.trim())) {
      next.email = "Enter a valid email";
    }

    if (!password) {
      next.password = "Password is required";
    }
    else if (password.length < 8) {
      next.password = "At least 8 characters";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate())
      return;

    setLoading(true);
    const result = await signUp({
      email: email.trim(),
      password,
      username,
      displayName: displayName.trim(),
    });
    setLoading(false);

    if (result.error) {
      setErrors({ form: result.error });
      return;
    }

    // If email confirmation is required, session is null — hand the address
    // to the "check your inbox" page instead of dead-ending.
    if (!result.data?.session) {
      const params = new URLSearchParams({ email: email.trim() });
      navigate(`${VERIFY_EMAIL_PATH}?${params.toString()}`, { replace: true });
      return;
    }

    // Otherwise we"re signed in — go to onboarding
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-primary-100 p-6 sm:p-8">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold text-primary-900">
            Join FolioSparks
          </h1>
          <p className="mt-1 text-sm text-primary-500">
            Readers get a Sparks allowance. Authors choose their own donation
            platform in the next step.
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
            label="Display name"
            placeholder="How readers see you"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            error={errors.displayName}
            disabled={loading}
            autoComplete="name"
          />

          <Input
            label="Username"
            placeholder="yourhandle"
            value={username}
            onChange={e => handleUsernameChange(e.target.value)}
            error={errors.username}
            hint={`foliosparks.com/@${username || "yourhandle"}`}
            disabled={loading}
            autoComplete="username"
          />

          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={errors.email}
            disabled={loading}
            autoComplete="email"
          />

          <Input
            type="password"
            label="Password"
            placeholder="At least 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            disabled={loading}
            autoComplete="new-password"
          />

          {errors.form && (
            <div
              role="alert"
              className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-danger"
            >
              {errors.form}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Create account
          </Button>

          <p className="text-xs text-primary-400 text-center leading-relaxed">
            By creating an account you agree to our
            {" "}
            <Link to="/terms" className="underline hover:text-primary-700">
              Terms
            </Link>
            {" "}
            and
            {" "}
            <Link to="/privacy" className="underline hover:text-primary-700">
              Privacy Policy
            </Link>
            .
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-primary-500">
          Already have an account?
          {" "}
          <Link
            to="/signin"
            className="font-medium text-primary-700 hover:text-primary-900"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
