"use client";

import { useEffect, useRef } from "react";
import {
  terrainAt,
  phaseAt,
  fgAt,
  nightAt,
  progressOf,
  toHex,
  type FgTokenKey,
} from "@/lib/journey";
import { journeyActive } from "@/lib/theme";

const TERRAIN_VARS = ["--bg", "--surface", "--border"] as const;

const FG_VARS: Record<FgTokenKey, string> = {
  text: "--text",
  muted: "--text-secondary",
  faint: "--text-muted",
  accent: "--accent",
  accentHover: "--accent-hover",
  accentContrast: "--accent-contrast",
  fog: "--fog",
  borderStrong: "--border-strong",
};

/**
 * Контроллер скролл-темы лендинга. Монтируется только на витрине («спуск»).
 * Пишет terrain-токены (--bg/--surface/--border) и FG-токены (текст/акцент/…)
 * инлайн — только при изменении. data-theme переключает по фазе (тени/радиусы/
 * статусы). На unmount возвращает data-theme сохранённому режиму пользователя.
 */
export function ScrollTheme() {
  const lastPhaseRef = useRef<"light" | "dark">("light");
  const lastValsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const html = document.documentElement;

    const apply = () => {
      const p = progressOf();

      const t = terrainAt(p);
      const terrain: Record<string, string> = {
        "--bg": toHex(t.bg),
        "--surface": toHex(t.surface),
        "--border": toHex(t.border),
      };
      for (const [key, value] of Object.entries(terrain)) {
        if (lastValsRef.current[key] !== value) {
          html.style.setProperty(key, value);
          lastValsRef.current[key] = value;
        }
      }

      const fg = fgAt(p);
      for (const [key, value] of Object.entries(fg)) {
        const varName = FG_VARS[key as FgTokenKey];
        const hex = toHex(value);
        if (lastValsRef.current[varName] !== hex) {
          html.style.setProperty(varName, hex);
          lastValsRef.current[varName] = hex;
        }
      }

      // Скаляр «ночь» — тени/радиусы интерполируются через calc(var(--night)).
      const night = nightAt(p).toFixed(4);
      if (lastValsRef.current["--night"] !== night) {
        html.style.setProperty("--night", night);
        lastValsRef.current["--night"] = night;
      }

      const phase = phaseAt(p, lastPhaseRef.current);
      if (phase !== lastPhaseRef.current) {
        lastPhaseRef.current = phase;
        html.dataset.theme = phase;
      }
    };

    // Захватываем владение палитрой до того, как ThemeProvider запишет data-theme.
    journeyActive.current = true;
    apply();

    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        apply();
      });
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);

      journeyActive.current = false;

      // Сначала вернуть data-theme (иначе при снятии inline-переменных
      // мелькнёт fallback светлой темы), затем убрать inline-токены.
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem("highlander-theme");
      } catch {
        /* ignore */
      }
      const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      html.dataset.theme =
        stored === "light" || stored === "dark"
          ? stored
          : sysDark
            ? "dark"
            : "light";

      for (const key of TERRAIN_VARS) html.style.removeProperty(key);
      for (const key of Object.values(FG_VARS)) html.style.removeProperty(key);
      html.style.removeProperty("--night");
    };
  }, []);

  return null;
}
