import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type CursorShape = "classic" | "quill" | "spark" | "moon" | "flower" | "book" | "star" | "heart" | "comet" | "glass";
export type TrailStyle = "off" | "glow" | "sparkles" | "ink" | "ribbon" | "bubbles" | "shapes";
export type MotionLevel = "calm" | "balanced" | "lively";

export interface CursorPreferences {
  enabled: boolean;
  shape: CursorShape;
  trail: TrailStyle;
  color: string;
  size: number;
  motion: MotionLevel;
}

const DEFAULT_PREFERENCES: CursorPreferences = {
  enabled: true,
  shape: "spark",
  trail: "sparkles",
  color: "#d9a552",
  size: 1,
  motion: "balanced",
};
const STORAGE_KEY = "foliosparks:cursor-preferences";
const GLYPHS: Record<CursorShape, string> = {
  classic: "➤", quill: "✒", spark: "✦", moon: "☾", flower: "✿",
  book: "▤", star: "✧", heart: "♥", comet: "☄", glass: "◉",
};
const TRAIL_GLYPHS: Record<TrailStyle, string[]> = {
  off: [], glow: [""], sparkles: ["✦", "✧", "·"], ink: ["●", "●", "·"],
  ribbon: ["✧", "✦", "✧"], bubbles: ["○", "◦", "○"],
  shapes: ["○", "□", "△", "×"],
};

interface CursorContextValue {
  preferences: CursorPreferences;
  update: <K extends keyof CursorPreferences>(key: K, value: CursorPreferences[K]) => void;
  reset: () => void;
}

const CursorContext = createContext<CursorContextValue | null>(null);

function readPreferences(): CursorPreferences {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<CursorPreferences> | null;
    if (!stored) return DEFAULT_PREFERENCES;
    return {
      ...DEFAULT_PREFERENCES,
      ...stored,
      size: typeof stored.size === "number" ? Math.min(1.5, Math.max(0.8, stored.size)) : DEFAULT_PREFERENCES.size,
      color: typeof stored.color === "string" && /^#[0-9a-f]{6}$/i.test(stored.color) ? stored.color : DEFAULT_PREFERENCES.color,
    };
  }
  catch { return DEFAULT_PREFERENCES; }
}

export function CursorProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const trailRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef(0);
  const pointRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const finePointerRef = useRef(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); }
    catch { /* Preferences remain active for this session. */ }
    document.documentElement.dataset.cursorEnabled = String(preferences.enabled);
    document.documentElement.style.setProperty("--cursor-color", preferences.color);
  }, [preferences]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => {
      reducedMotionRef.current = motion.matches;
      finePointerRef.current = pointer.matches;
      if (!pointer.matches || motion.matches || !preferences.enabled) setVisible(false);
    };
    sync();
    motion.addEventListener("change", sync);
    pointer.addEventListener("change", sync);
    const move = (event: PointerEvent) => {
      if (!finePointerRef.current || reducedMotionRef.current || !preferences.enabled) return;
      setPosition({ x: event.clientX, y: event.clientY });
      setVisible(true);
      if (preferences.trail === "off") return;
      const layer = trailRef.current;
      if (!layer || layer.childElementCount >= 42) return;
      const now = performance.now();
      const delay = preferences.motion === "lively" ? 24 : preferences.motion === "calm" ? 70 : 42;
      if (now - pointRef.current < delay) return;
      pointRef.current = now;
      const glyphs = TRAIL_GLYPHS[preferences.trail];
      const glyph = glyphs[sequenceRef.current++ % glyphs.length];
      const node = document.createElement("span");
      node.className = `cursor-trail-particle cursor-trail-${preferences.trail}`;
      node.textContent = glyph;
      node.style.left = `${event.clientX}px`;
      node.style.top = `${event.clientY}px`;
      node.style.setProperty("--particle-color", preferences.color);
      node.style.setProperty("--particle-scale", String(preferences.size));
      node.style.setProperty("--particle-drift", `${Math.round((Math.random() - 0.5) * (preferences.trail === "ribbon" ? 22 : 10))}px`);
      node.style.setProperty("--particle-delay", `${Math.round(Math.random() * 130)}ms`);
      if (preferences.trail === "ribbon") {
        const dustSize = 2 + Math.random() * 4;
        node.style.width = `${dustSize}px`;
        node.style.height = `${dustSize}px`;
        node.style.margin = `${-dustSize / 2}px 0 0 ${-dustSize / 2}px`;
        node.style.opacity = String(0.4 + Math.random() * 0.5);
      }
      node.addEventListener("animationend", () => node.remove(), { once: true });
      layer.append(node);
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      motion.removeEventListener("change", sync);
      pointer.removeEventListener("change", sync);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [preferences]);

  const update = useCallback(<K extends keyof CursorPreferences>(key: K, value: CursorPreferences[K]) => {
    setPreferences(current => ({ ...current, [key]: value }));
  }, []);
  const reset = useCallback(() => setPreferences(DEFAULT_PREFERENCES), []);
  const value = useMemo(() => ({ preferences, update, reset }), [preferences, update, reset]);

  return (
    <CursorContext.Provider value={value}>
      {children}
      <div ref={trailRef} className="cursor-trail-layer" aria-hidden="true" />
      {preferences.enabled && (
        <span
        className={`custom-cursor cursor-motion-${preferences.motion}${visible ? " is-visible" : ""}`}
          style={{ left: position.x, top: position.y, color: preferences.color, fontSize: `${28 * preferences.size}px` }}
          aria-hidden="true"
        >
          {GLYPHS[preferences.shape]}
        </span>
      )}
    </CursorContext.Provider>
  );
}

export function useCursorPreferences() {
  const value = useContext(CursorContext);
  if (!value) throw new Error("useCursorPreferences must be used inside CursorProvider");
  return value;
}

export const CURSOR_SHAPES = Object.keys(GLYPHS) as CursorShape[];
export const TRAIL_STYLES = Object.keys(TRAIL_GLYPHS) as TrailStyle[];
