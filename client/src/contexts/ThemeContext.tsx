import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  mode: ThemeMode;
  /** Resolved theme — "light" or "dark" after resolving "system" */
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "foliosparks:theme";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined")
    return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined")
    return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system")
    return stored;
  return "system";
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme);

  // Listen to OS theme changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolved: "light" | "dark" = mode === "system" ? systemTheme : mode;

  // Apply to <html> so CSS variables cascade
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    }
    catch {
      /* ignore */
    }
  };

  const toggle = () => {
    setMode(resolved === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
