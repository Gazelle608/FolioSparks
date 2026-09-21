// ============================================================
// FolioSparks — Validators
// Every function returns null if valid, or a string error message.
// ============================================================

import { TEXT_LIMITS, UPLOAD_LIMITS, VALID_GENRES } from "./constants";
// ---------------------------------------------------------------------------
// File validation
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------
export function isEmail(value: string): boolean {
  // Deliberately permissive — the real validation happens on signup.
  return /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(value.trim());
}

export function isUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  }
  catch {
    return false;
  }
}

export function isUsername(value: string): boolean {
  const { min, max } = TEXT_LIMITS.username;
  return new RegExp(`^[a-z0-9_]{${min},${max}}$`).test(value);
}

export function isSlug(value: string): boolean {
  return /^[a-z0-9-]{3,120}$/.test(value);
}

export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

// ---------------------------------------------------------------------------
// Field validators — return null if OK, string if error
// ---------------------------------------------------------------------------
export function validateEmail(value: string): string | null {
  if (isEmpty(value))
    return "Email is required";
  if (!isEmail(value))
    return "Enter a valid email";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value)
    return "Password is required";
  if (value.length < 8)
    return "At least 8 characters";
  if (value.length > 128)
    return "Password is too long";
  return null;
}

export function validateUsername(value: string): string | null {
  if (isEmpty(value))
    return "Choose a username";
  if (!isUsername(value)) {
    const { min, max } = TEXT_LIMITS.username;
    return `Lowercase letters, numbers, underscores. ${min}–${max} characters.`;
  }
  return null;
}

export function validateDisplayName(value: string): string | null {
  if (isEmpty(value))
    return "Display name is required";
  const { min, max } = TEXT_LIMITS.displayName;
  if (value.trim().length < min)
    return `At least ${min} characters`;
  if (value.trim().length > max)
    return `At most ${max} characters`;
  return null;
}

export function validateBio(value: string): string | null {
  if (value.length > TEXT_LIMITS.bio.max) {
    return `At most ${TEXT_LIMITS.bio.max} characters`;
  }
  return null;
}

export function validateStoryTitle(value: string): string | null {
  if (isEmpty(value))
    return "Give your story a title";
  const { min, max } = TEXT_LIMITS.storyTitle;
  const trimmed = value.trim();
  if (trimmed.length < min)
    return `At least ${min} characters`;
  if (trimmed.length > max)
    return `At most ${max} characters`;
  return null;
}

export function validateStorySynopsis(value: string): string | null {
  if (value.length > TEXT_LIMITS.storySynopsis.max) {
    return `At most ${TEXT_LIMITS.storySynopsis.max} characters`;
  }
  return null;
}

export function validateGenre(value: string): string | null {
  if (isEmpty(value))
    return "Pick a genre";
  if (!VALID_GENRES.includes(value as (typeof VALID_GENRES)[number])) {
    return "Pick a valid genre";
  }
  return null;
}

export function validateChapterTitle(value: string): string | null {
  if (value.length > TEXT_LIMITS.chapterTitle.max) {
    return `At most ${TEXT_LIMITS.chapterTitle.max} characters`;
  }
  return null;
}

export function validateChapterContent(value: string): string | null {
  if (isEmpty(value))
    return "Chapter content cannot be empty";
  return null;
}

// ---------------------------------------------------------------------------
// Poll validation
// ---------------------------------------------------------------------------
export function validatePollQuestion(value: string): string | null {
  if (isEmpty(value))
    return "Ask a question";
  if (value.length > TEXT_LIMITS.pollQuestion.max) {
    return `At most ${TEXT_LIMITS.pollQuestion.max} characters`;
  }
  return null;
}

export function validatePollOptions(options: string[]): string | null {
  const { min, max } = TEXT_LIMITS.pollOptions;
  const filled = options.filter(o => !isEmpty(o));

  if (filled.length < min)
    return `Add at least ${min} options`;
  if (filled.length > max)
    return `At most ${max} options`;

  if (filled.some(o => o.length > TEXT_LIMITS.pollOption.max)) {
    return `Each option max ${TEXT_LIMITS.pollOption.max} characters`;
  }

  // Check for duplicates (case-insensitive)
  const lower = filled.map(o => o.trim().toLowerCase());
  if (new Set(lower).size !== lower.length) {
    return "Options must be unique";
  }

  return null;
}

// ---------------------------------------------------------------------------
// Donation URL validator — checks against the platform"s expected prefix
// ---------------------------------------------------------------------------
export function validateDonationUrl(
  platform: string,
  url: string,
  expectedPrefix?: string,
): string | null {
  if (isEmpty(url))
    return "URL is required";
  if (!isUrl(url))
    return "Enter a valid URL starting with http:// or https://";

  if (expectedPrefix && !url.toLowerCase().startsWith(expectedPrefix.toLowerCase())) {
    return `URL should start with ${expectedPrefix}`;
  }

  return null;
}

export function validateImageUpload(file: File): string | null {
  if (!UPLOAD_LIMITS.imageMimeTypes.includes(file.type as never)) {
    return "Only JPG, PNG, or WebP allowed";
  }
  if (file.size > UPLOAD_LIMITS.coverMaxBytes) {
    const mb = UPLOAD_LIMITS.coverMaxBytes / 1024 / 1024;
    return `File must be under ${mb} MB`;
  }
  return null;
}

export function validateManuscriptUpload(file: File): string | null {
  if (file.size > UPLOAD_LIMITS.manuscriptMaxBytes) {
    const mb = UPLOAD_LIMITS.manuscriptMaxBytes / 1024 / 1024;
    return `Manuscript must be under ${mb} MB`;
  }
  const name = file.name.toLowerCase();
  const ok = file.type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md");
  if (!ok) {
    return "Only .txt or .md files supported — or paste the text";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Composite — validate a whole object, return a map of errors
// ---------------------------------------------------------------------------
export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export function validateSignup(input: {
  email: string;
  password: string;
  username: string;
  displayName: string;
}): ValidationErrors<typeof input> {
  const errors: ValidationErrors<typeof input> = {};

  const emailError = validateEmail(input.email);
  if (emailError)
    errors.email = emailError;

  const passwordError = validatePassword(input.password);
  if (passwordError)
    errors.password = passwordError;

  const usernameError = validateUsername(input.username);
  if (usernameError)
    errors.username = usernameError;

  const displayNameError = validateDisplayName(input.displayName);
  if (displayNameError)
    errors.displayName = displayNameError;

  return errors;
}

export function validateSignin(input: {
  email: string;
  password: string;
}): ValidationErrors<typeof input> {
  const errors: ValidationErrors<typeof input> = {};

  const emailError = validateEmail(input.email);
  if (emailError)
    errors.email = emailError;

  if (!input.password)
    errors.password = "Password is required";

  return errors;
}
