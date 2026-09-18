import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Preference shape
// ---------------------------------------------------------------------------
export interface ReaderPrefs {
  fontSize: number; // px, 16–24
  lineHeight: number; // 1.4 – 2.0
  fontFamily: "serif" | "sans";
  theme: "light" | "sepia" | "dark";
}

const DEFAULT_PREFS: ReaderPrefs = {
  fontSize: 18,
  lineHeight: 1.75,
  fontFamily: "serif",
  theme: "light",
};

const STORAGE_KEY = "foliosparks:reader-prefs";

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------
export function loadReaderPrefs(): ReaderPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed };
  }
  catch {
    return DEFAULT_PREFS;
  }
}

export function saveReaderPrefs(prefs: ReaderPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }
  catch {
    /* ignore quota errors */
  }
}

// ---------------------------------------------------------------------------
// Theme tokens
// ---------------------------------------------------------------------------
export const THEME_CLASSES: Record<ReaderPrefs["theme"], {
  page: string;
  text: string;
  muted: string;
  panel: string;
  border: string;
}> = {
  light: {
    page: "bg-white",
    text: "text-primary-900",
    muted: "text-primary-500",
    panel: "bg-white",
    border: "border-primary-100",
  },
  sepia: {
    page: "bg-[#F4ECD8]",
    text: "text-[#3E2F1C]",
    muted: "text-[#8A7654]",
    panel: "bg-[#F4ECD8]",
    border: "border-[#D8C9A8]",
  },
  dark: {
    page: "bg-primary-900",
    text: "text-primary-50",
    muted: "text-primary-300",
    panel: "bg-primary-800",
    border: "border-primary-700",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface ReaderControlsProps {
  prefs: ReaderPrefs;
  onChange: (next: ReaderPrefs) => void;
}

export function ReaderControls({ prefs, onChange }: ReaderControlsProps) {
  const [open, setOpen] = useState(false);

  const update = <K extends keyof ReaderPrefs>(key: K, value: ReaderPrefs[K]) =>
    onChange({ ...prefs, [key]: value });

  // Close on Escape
  useEffect(() => {
    if (!open)
      return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Reading settings"
        aria-expanded={open}
        className="p-2 rounded-md text-primary-500 hover:text-primary-900 hover:bg-primary-50 transition-colors"
      >
        <SettingsGlyph className="w-5 h-5" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white rounded-lg shadow-lg border border-primary-100 p-4 animate-slideUp">
            <h3 className="font-display text-sm font-bold text-primary-900 mb-4">
              Reading settings
            </h3>

            {/* Theme */}
            <ControlRow label="Theme">
              <div className="flex gap-1.5">
                {(["light", "sepia", "dark"] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update("theme", t)}
                    aria-pressed={prefs.theme === t}
                    className={[
                      "w-9 h-9 rounded-md border-2 transition-all",
                      prefs.theme === t
                        ? "border-primary-500 ring-2 ring-primary-200"
                        : "border-primary-100 hover:border-primary-300",
                      t === "light" && "bg-white",
                      t === "sepia" && "bg-[#F4ECD8]",
                      t === "dark" && "bg-primary-900",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-label={t}
                  />
                ))}
              </div>
            </ControlRow>

            {/* Font family */}
            <ControlRow label="Typeface">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => update("fontFamily", "serif")}
                  aria-pressed={prefs.fontFamily === "serif"}
                  className={[
                    "h-9 px-3 rounded-md border text-sm font-serif",
                    prefs.fontFamily === "serif"
                      ? "border-primary-500 bg-primary-50 text-primary-900"
                      : "border-primary-100 text-primary-500 hover:border-primary-300",
                  ].join(" ")}
                >
                  Serif
                </button>
                <button
                  type="button"
                  onClick={() => update("fontFamily", "sans")}
                  aria-pressed={prefs.fontFamily === "sans"}
                  className={[
                    "h-9 px-3 rounded-md border text-sm font-sans",
                    prefs.fontFamily === "sans"
                      ? "border-primary-500 bg-primary-50 text-primary-900"
                      : "border-primary-100 text-primary-500 hover:border-primary-300",
                  ].join(" ")}
                >
                  Sans
                </button>
              </div>
            </ControlRow>

            {/* Font size */}
            <ControlRow label={`Font size — ${prefs.fontSize}px`}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => update("fontSize", Math.max(14, prefs.fontSize - 1))}
                  disabled={prefs.fontSize <= 14}
                  className="w-9 h-9 rounded-md border border-primary-100 text-primary-700 hover:bg-primary-50 disabled:opacity-40"
                  aria-label="Decrease font size"
                >
                  A−
                </button>
                <input
                  type="range"
                  min={14}
                  max={24}
                  step={1}
                  value={prefs.fontSize}
                  onChange={e => update("fontSize", Number(e.target.value))}
                  className="flex-1 accent-primary-500"
                  aria-label="Font size"
                />
                <button
                  type="button"
                  onClick={() => update("fontSize", Math.min(24, prefs.fontSize + 1))}
                  disabled={prefs.fontSize >= 24}
                  className="w-9 h-9 rounded-md border border-primary-100 text-primary-700 hover:bg-primary-50 disabled:opacity-40"
                  aria-label="Increase font size"
                >
                  A+
                </button>
              </div>
            </ControlRow>

            {/* Line height */}
            <ControlRow label={`Line spacing — ${prefs.lineHeight.toFixed(1)}`}>
              <input
                type="range"
                min={1.4}
                max={2.0}
                step={0.05}
                value={prefs.lineHeight}
                onChange={e => update("lineHeight", Number(e.target.value))}
                className="w-full accent-primary-500"
                aria-label="Line height"
              />
            </ControlRow>

            {/* Reset */}
            <button
              type="button"
              onClick={() => onChange(DEFAULT_PREFS)}
              className="mt-2 text-xs text-primary-400 hover:text-primary-700"
            >
              Reset to defaults
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 text-xs font-medium text-primary-500">{label}</div>
      {children}
    </div>
  );
}

function SettingsGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}
