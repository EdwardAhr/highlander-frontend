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

/**
 * Флаг «скролл-тема активна». На лендинге палитрой владеет ScrollTheme,
 * поэтому ThemeProvider не должен перезаписывать data-theme.
 */
export const journeyActive = { current: false };

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
  mounted: boolean;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState(false);

  // После гидрации восстанавливаем сохранённый режим.
  useEffect(() => {
    setModeState(getStoredMode());
    setMounted(true);
  }, []);

  // Применяем тему к <html> (если скролл-тема лендинга не владеет палитрой).
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (journeyActive.current) return;
    document.documentElement.dataset.theme = resolveTheme(mode);
  }, [mode]);

  // Синхронизация с системной темой в режиме "system".
  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (journeyActive.current) return;
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
    const current = resolveTheme(getStoredMode());
    setMode(current === "dark" ? "light" : "dark");
  }, [setMode]);

  // До монтирования отдаём стабильную "light" — совпадает с SSR и не ломает гидрацию.
  const theme = useMemo<Theme>(
    () => (mounted ? resolveTheme(mode) : "light"),
    [mounted, mode],
  );

  const value = useMemo(
    () => ({ mode, theme, mounted, setMode, toggle }),
    [mode, theme, mounted, setMode, toggle],
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
