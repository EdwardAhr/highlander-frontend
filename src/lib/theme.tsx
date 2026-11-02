"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark";
export type ThemeMode = Theme | "system";

const STORAGE_KEY = "highlander-theme";

function getStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const s = window.localStorage.getItem(STORAGE_KEY);
  return s === "light" || s === "dark" || s === "system" ? s : "system";
}

function resolveTheme(mode: ThemeMode): Theme {
  if (typeof window === "undefined") return "light";
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

type ThemeContextValue = {
  mode: ThemeMode;
  theme: Theme;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");

  // Восстанавливаем сохранённый режим после гидрации.
  useEffect(() => {
    setModeState(getStoredMode());
  }, []);

  // Применяем тему к <html>.
  useEffect(() => {
    document.documentElement.dataset.theme = resolveTheme(mode);
  }, [mode]);

  // Синхронизация с системной темой в режиме "system".
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      document.documentElement.dataset.theme = mq.matches ? "dark" : "light";
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    try {
      window.localStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    const current = resolveTheme(
      typeof window !== "undefined" ? getStoredMode() : "system",
    );
    setMode(current === "dark" ? "light" : "dark");
  }, [setMode]);

  const theme = useMemo(() => resolveTheme(mode), [mode]);

  const value = useMemo(
    () => ({ mode, theme, setMode, toggle }),
    [mode, theme, setMode, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme должен использоваться внутри ThemeProvider");
  return ctx;
}
