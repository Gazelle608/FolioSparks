// ============================================================
// FolioSparks — Reading Time
// Estimate how long a piece of text takes to read.
// Also: audio duration estimation for the browser TTS player.
// ============================================================

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Average adult reading speed on screen (words per minute) */
export const READING_WPM = 220;

/** Average speech synthesis rate (words per minute) — slower than reading */
export const SPEECH_WPM = 180;

/** Minimum displayed time (seconds) — avoids "0 min" */
export const MIN_READING_SECONDS = 30;

// ---------------------------------------------------------------------------
// Word counting
// ---------------------------------------------------------------------------

/** Count words in a string. Handles multiple whitespace types. */
export function countWords(text: string): number {
  if (!text)
    return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Count characters, ignoring whitespace */
export function countCharacters(text: string): number {
  return text.replace(/\s/g, "").length;
}

/** Count paragraphs (blocks separated by blank lines) */
export function countParagraphs(text: string): number {
  if (!text)
    return 0;
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .length;
}

// ---------------------------------------------------------------------------
// Reading time
// ---------------------------------------------------------------------------

/** Returns seconds needed to read the given text */
export function readingSeconds(text: string, wpm = READING_WPM): number {
  const words = countWords(text);
  if (words === 0)
    return 0;
  return Math.max(MIN_READING_SECONDS, Math.round((words / wpm) * 60));
}

/** Returns minutes needed to read the given text */
export function readingMinutes(text: string, wpm = READING_WPM): number {
  const seconds = readingSeconds(text, wpm);
  return Math.max(1, Math.ceil(seconds / 60));
}

/**
 * Human-friendly reading time.
 * Short text → "less than a minute"
 * 3 min → "3 min read"
 * 75 min → "1h 15m read"
 */
export function readingTimeLabel(
  text: string,
  wpm = READING_WPM,
): string {
  const seconds = readingSeconds(text, wpm);

  if (seconds < 60)
    return "less than a minute";
  if (seconds < 3600)
    return `${Math.ceil(seconds / 60)} min read`;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (minutes === 0)
    return `${hours}h read`;
  return `${hours}h ${minutes}m read`;
}

/** "12 min left" — remaining reading time given progress 0–1 */
export function remainingTimeLabel(
  totalText: string,
  progress: number,
  wpm = READING_WPM,
): string {
  const total = readingSeconds(totalText, wpm);
  const remaining = Math.max(0, total * (1 - progress));

  if (remaining < 30)
    return "almost done";
  if (remaining < 60)
    return "less than a minute left";
  return `${Math.ceil(remaining / 60)} min left`;
}

// ---------------------------------------------------------------------------
// Audio duration
// ---------------------------------------------------------------------------

/** Seconds needed to speak the given text via TTS */
export function speechSeconds(text: string, wpm = SPEECH_WPM): number {
  const words = countWords(text);
  if (words === 0)
    return 0;
  return Math.max(30, Math.round((words / wpm) * 60));
}

/**
 * Friendly audio duration for the SparkModal / AudioPlayer.
 * "12:15" for < 1 hour, "1:02:30" for longer.
 */
export function audioDurationLabel(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
  }
  return `${m}:${r.toString().padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Progress helpers
// ---------------------------------------------------------------------------

/** Given scroll percent 0–100, return a pretty "X% complete" string */
export function progressLabel(percent: number): string {
  const rounded = Math.round(percent);
  if (rounded <= 0)
    return "just started";
  if (rounded >= 100)
    return "finished";
  return `${rounded}% complete`;
}

/** Clamp a progress value to [0, 1] */
export function clampProgress(p: number): number {
  return Math.max(0, Math.min(1, p));
}

// ---------------------------------------------------------------------------
// Composite — one call for the reader header
// ---------------------------------------------------------------------------
export interface TextStats {
  words: number;
  characters: number;
  paragraphs: number;
  readingSeconds: number;
  readingLabel: string;
  speechSeconds: number;
}

export function analyzeText(text: string): TextStats {
  return {
    words: countWords(text),
    characters: countCharacters(text),
    paragraphs: countParagraphs(text),
    readingSeconds: readingSeconds(text),
    readingLabel: readingTimeLabel(text),
    speechSeconds: speechSeconds(text),
  };
}
