import { useEffect, useState } from "react";

export type SMTheme = "terminal" | "apple";

const STORAGE_KEY = "moneta_sm_theme";

function readInitial(): SMTheme {
  if (typeof window === "undefined") return "terminal";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "apple" || raw === "terminal") return raw;
  } catch {
    // ignore
  }
  return "terminal";
}

/**
 * Reads and writes the app-wide theme.
 * Persists to localStorage and sets `data-theme` on <html> so the CSS variables
 * defined in styles.css swap the entire palette instantly.
 */
export function useTheme(): [SMTheme, (t: SMTheme) => void, () => void] {
  const [theme, setThemeState] = useState<SMTheme>("terminal");

  // Hydrate on mount (client only).
  useEffect(() => {
    const initial = readInitial();
    setThemeState(initial);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", initial);
    }
  }, []);

  // Apply + persist on change.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const setTheme = (t: SMTheme) => setThemeState(t);
  const toggle = () => setThemeState((t) => (t === "terminal" ? "apple" : "terminal"));

  return [theme, setTheme, toggle];
}
