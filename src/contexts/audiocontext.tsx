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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface NowPlaying {
  chapterId: string;
  chapterTitle: string;
  storyId: string;
  storyTitle: string;
  /** "browser" = live TTS, "mp3" = server-generated file */
  mode: "browser" | "mp3";
  /** Audio element src for mp3 mode */
  src?: string;
}

export interface AudioState {
  nowPlaying: NowPlaying | null;
  playing: boolean;
  paused: boolean;
  /** 0–1 */
  progress: number;
  /** 0–1 */
  volume: number;
  rate: number;
}

interface AudioContextValue extends AudioState {
  /** Start playback of a chapter. Stops any existing playback first. */
  play: (item: NowPlaying) => void;
  /** Pause current playback */
  pause: () => void;
  /** Resume current playback */
  resume: () => void;
  /** Stop and clear now-playing */
  stop: () => void;
  /** Set volume (persists) */
  setVolume: (v: number) => void;
  /** Set playback rate (persists) */
  setRate: (r: number) => void;

  /** Internal — used by AudioPlayer to sync state */
  _setProgress: (p: number) => void;
  _setPlaying: (playing: boolean, paused: boolean) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

const VOLUME_KEY = "foliosparks:audio-volume";
const RATE_KEY = "foliosparks:audio-rate";

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AudioProvider({ children }: { children: ReactNode }) {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(() => readNumber(VOLUME_KEY, 1));
  const [rate, setRateState] = useState(() => readNumber(RATE_KEY, 1));

  // Ref so we can stop the previous audio without re-rendering the tree
  const stopRef = useRef<(() => void) | null>(null);

  // ---------------------------------------------------------------------------
  // Global stop on chapter change — consumers register their stop function
  // ---------------------------------------------------------------------------
  const play = useCallback((item: NowPlaying) => {
    // Ask the current player to stop cleanly
    stopRef.current?.();
    setNowPlaying(item);
    setProgress(0);
    setPlaying(true);
    setPaused(false);
  }, []);

  const pause = useCallback(() => {
    setPlaying(false);
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    setPlaying(true);
    setPaused(false);
  }, []);

  const stop = useCallback(() => {
    stopRef.current?.();
    setNowPlaying(null);
    setPlaying(false);
    setPaused(false);
    setProgress(0);
  }, []);

  // ---------------------------------------------------------------------------
  // Preferences
  // ---------------------------------------------------------------------------
  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    writeNumber(VOLUME_KEY, clamped);
  }, []);

  const setRate = useCallback((r: number) => {
    const clamped = Math.max(0.5, Math.min(3, r));
    setRateState(clamped);
    writeNumber(RATE_KEY, clamped);
  }, []);

  // ---------------------------------------------------------------------------
  // Internal setters (only AudioPlayer uses these)
  // ---------------------------------------------------------------------------
  const _setProgress = useCallback((p: number) => {
    setProgress(Math.max(0, Math.min(1, p)));
  }, []);

  const _setPlaying = useCallback((isPlaying: boolean, isPaused: boolean) => {
    setPlaying(isPlaying);
    setPaused(isPaused);
  }, []);

  // ---------------------------------------------------------------------------
  // Stop audio on unmount / hard navigation
  // ---------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      stopRef.current?.();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Value
  // ---------------------------------------------------------------------------
  const value = useMemo<AudioContextValue>(
    () => ({
      nowPlaying,
      playing,
      paused,
      progress,
      volume,
      rate,
      play,
      pause,
      resume,
      stop,
      setVolume,
      setRate,
      _setProgress,
      _setPlaying,
    }),
    [
      nowPlaying,
      playing,
      paused,
      progress,
      volume,
      rate,
      play,
      pause,
      resume,
      stop,
      setVolume,
      setRate,
      _setProgress,
      _setPlaying,
    ],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx)
    throw new Error("useAudio must be used inside <AudioProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------
function readNumber(key: string, fallback: number): number {
  if (typeof window === "undefined")
    return fallback;
  const raw = localStorage.getItem(key);
  if (!raw)
    return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function writeNumber(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value));
  }
  catch {
    /* ignore */
  }
}
