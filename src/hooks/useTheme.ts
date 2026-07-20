import { useEffect, useState } from "react";

export type SMTheme = "terminal" | "aurora";

const STORAGE_KEY = "moneta_sm_theme";

function readInitial(): SMTheme {
  if (typeof window === "undefined") return "aurora";

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "aurora" || raw === "terminal") return raw;
  } catch {
    // ignore
  }

  return "aurora";
}

export function useTheme(): [SMTheme, (t: SMTheme) => void, () => void] {
  const [theme, setThemeState] = useState<SMTheme>("aurora");

  useEffect(() => {
    const initial = readInitial();
    setThemeState(initial);

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", initial);
    }
  }, []);

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

  const toggle = () =>
    setThemeState((t) => (t === "terminal" ? "aurora" : "terminal"));

  return [theme, setTheme, toggle];
}
