import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, SparkFilledIcon } from "../assets/icons";
import { PageWrapper } from "../components/layout";
import { Button } from "../components/ui";
import { useCursorPreferences, CURSOR_SHAPES, TRAIL_STYLES, type CursorShape, type TrailStyle, type MotionLevel } from "../contexts/cursorcontext";

const CURSOR_META: Record<CursorShape, { label: string; description: string }> = {
  classic: { label: "Pointer", description: "A crisp editorial arrow" },
  quill: { label: "Quill", description: "For the writer at heart" },
  spark: { label: "Spark", description: "The FolioSparks signature" },
  moon: { label: "Moon", description: "A quiet crescent" },
  flower: { label: "Bloom", description: "A little flourish" },
  book: { label: "Open book", description: "A reader's marker" },
  star: { label: "Starlight", description: "A fine four-point star" },
  heart: { label: "Heart", description: "A warm reading companion" },
  comet: { label: "Comet", description: "A streak across the page" },
  glass: { label: "Lens", description: "A reader's magnifier" },
};
const TRAIL_META: Record<TrailStyle, { label: string; description: string }> = {
  off: { label: "No trail", description: "Keep the page still" },
  glow: { label: "Soft glow", description: "A fading halo" },
  sparkles: { label: "Sparks", description: "Tiny literary glints" },
  ink: { label: "Ink drops", description: "A trail of inky dots" },
  ribbon: { label: "Stardust", description: "A quiet constellation" },
  bubbles: { label: "Bubbles", description: "Light outlined circles" },
  shapes: { label: "Shape combo", description: "Circle, square, triangle & cross" },
};
const COLORS = [
  { name: "Gilded", value: "#d9a552" }, { name: "Midnight", value: "#2a3566" },
  { name: "Wisteria", value: "#8b7ba5" }, { name: "Rose", value: "#c35f78" },
  { name: "Teal", value: "#287f7a" }, { name: "Ink", value: "#30343b" },
];

export function SettingsPage() {
  const { preferences, update, reset } = useCursorPreferences();
  const [showSaved, setShowSaved] = useState(false);
  const change = <K extends keyof typeof preferences>(key: K, value: typeof preferences[K]) => {
    update(key, value);
    setShowSaved(true);
    window.setTimeout(() => setShowSaved(false), 1800);
  };

  return (
    <PageWrapper title="Cursor & motion" subtitle="Make this reading space feel like yours." size="lg">
      <div className="space-y-8">
        <section className="settings-intro flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm text-primary-600">Choose a pointer and a little movement to accompany your time in FolioSparks.</p>
            <p className="mt-2 text-xs text-primary-500">Your choices save automatically on this device. Motion pauses when reduced motion is enabled or a touch screen is in use.</p>
          </div>
          <Link to="/">
            <Button variant="secondary" rightIcon={<ArrowRightIcon size={15} />}>Back to stories</Button>
          </Link>
        </section>

        <section aria-labelledby="cursor-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><p className="settings-kicker">01 / Your pointer</p><h2 id="cursor-heading" className="mt-1 font-display text-xl font-bold text-primary-900">Choose your mark</h2></div>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-primary-700">
              <input type="checkbox" className="h-4 w-4 accent-primary-700" checked={preferences.enabled} onChange={e => change("enabled", e.target.checked)} />
              Custom cursor
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CURSOR_SHAPES.map(shape => (
              <button key={shape} type="button" aria-pressed={preferences.shape === shape} onClick={() => change("shape", shape)} className={`cursor-choice${preferences.shape === shape ? " is-selected" : ""}`}>
                <span className="cursor-choice-glyph" style={{ color: preferences.color }}>{({classic:"➤",quill:"✒",spark:"✦",moon:"☾",flower:"✿",book:"▤",star:"✧",heart:"♥",comet:"☄",glass:"◉"})[shape]}</span>
                <span className="font-semibold text-primary-900">{CURSOR_META[shape].label}</span>
                <span className="mt-1 text-xs leading-snug text-primary-500">{CURSOR_META[shape].description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-7 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="settings-kicker">02 / The wake</p>
            <h2 className="mt-1 font-display text-xl font-bold text-primary-900">Trail style</h2>
            <p className="mt-1 mb-4 text-sm text-primary-500">A brief flourish that fades as you move.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TRAIL_STYLES.map(trail => (
                <button type="button" key={trail} aria-pressed={preferences.trail === trail} onClick={() => change("trail", trail)} className={`trail-choice${preferences.trail === trail ? " is-selected" : ""}`}>
                  <span aria-hidden="true" className={`trail-sample trail-sample-${trail}`} style={{ color: preferences.color }}>{trail === "shapes" ? "○ □ △ ×" : "✦ · ✧"}</span>
                  <span className="block text-sm font-semibold text-primary-900">{TRAIL_META[trail].label}</span>
                  <span className="mt-0.5 block text-xs text-primary-500">{TRAIL_META[trail].description}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="settings-kicker">03 / Your palette</p>
            <h2 className="mt-1 font-display text-xl font-bold text-primary-900">Pick an ink</h2>
            <p className="mt-1 text-sm text-primary-500">Color applies to your pointer and every trail effect.</p>
            <div className="mt-4 flex flex-wrap gap-3" role="group" aria-label="Cursor colors">
              {COLORS.map(color => <button key={color.value} type="button" aria-label={color.name} aria-pressed={preferences.color === color.value} title={color.name} onClick={() => change("color", color.value)} className={`color-swatch${preferences.color === color.value ? " is-selected" : ""}`} style={{ backgroundColor: color.value }} />)}
              <label className="color-custom" title="Choose custom color">
                <input aria-label="Custom cursor color" type="color" value={preferences.color} onChange={e => change("color", e.target.value)} />
                <span>Custom</span>
              </label>
            </div>
            <label className="mt-6 block text-sm font-semibold text-primary-800" htmlFor="cursor-size">Pointer size <span className="ml-1 font-normal text-primary-500">{Math.round(preferences.size * 100)}%</span></label>
            <input id="cursor-size" className="mt-3 w-full accent-primary-700" type="range" min="0.8" max="1.5" step="0.05" value={preferences.size} onChange={e => change("size", Number(e.target.value))} />
          </div>
        </section>

        <section>
          <p className="settings-kicker">04 / A little movement</p>
          <h2 className="mt-1 font-display text-xl font-bold text-primary-900">Motion character</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {([ ["calm", "Still waters", "Long, gentle fades."], ["balanced", "Storybook", "A soft, lively response."], ["lively", "Extra sparkle", "More frequent trail details."] ] as [MotionLevel, string, string][]).map(([value, title, text]) => (
              <button type="button" key={value} aria-pressed={preferences.motion === value} onClick={() => change("motion", value)} className={`motion-choice${preferences.motion === value ? " is-selected" : ""}`}>
                <span className="block font-semibold text-primary-900">{title}</span><span className="mt-1 block text-sm text-primary-500">{text}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary-100 pt-5">
          <p aria-live="polite" className="text-xs text-primary-500"><SparkFilledIcon size={13} className="mr-1 inline text-spark-dark" />{showSaved ? "Saved on this device" : "Fine pointer only. Your system cursor stays available when motion is reduced."}</p>
          <Button variant="ghost" size="sm" onClick={reset}>Restore defaults</Button>
        </div>
      </div>
    </PageWrapper>
  );
}
