"use client";

import { useEffect } from "react";
import { terrainAt, fgAt, progressOf, toHex, type FgTokenKey } from "@/lib/journey";

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

/** «Вершинная» палитра из :root — в неё плавно возвращаемся при уходе с витрины. */
const PEAK: Record<string, string> = {
  "--bg": "#F4F8F9",
  "--surface": "#FFFFFF",
  "--border": "#DFEAEE",
  "--text": "#172530",
  "--text-secondary": "#63757F",
  "--text-muted": "#8A9BA5",
  "--accent": "#0EA5E9",
  "--accent-hover": "#0284C7",
  "--accent-contrast": "#FFFFFF",
  "--fog": "#E7F0F3",
  "--border-strong": "#C7DEE3",
};

/**
 * Контроллер скролл-темы витрины («вершина → глубокий изумрудный лес + золото»).
 * Монтируется только на `/`. Пишет terrain- и FG-токены инлайн на <html>.
 * Тема одна, непрерывная (никаких светлой/тёмной). Маршруты приложения — «вершина».
 *
 * При уходе с витрины (навигация) включает класс .theme-fade и ставит «вершинные»
 * токены — фон плавно перетекает в бело-голубое, без резкой вспышки белым.
 * На монтировании класс снимается — скролл снова мгновенный.
 */
export function ScrollTheme() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("theme-fade");

    const writeVar = (name: string, value: string) => {
      if (html.style.getPropertyValue(name) !== value) {
        html.style.setProperty(name, value);
      }
    };

    const apply = () => {
      const p = progressOf();
      const t = terrainAt(p);
      writeVar("--bg", toHex(t.bg));
      writeVar("--surface", toHex(t.surface));
      writeVar("--border", toHex(t.border));
      const fg = fgAt(p);
      for (const key of Object.keys(FG_VARS) as FgTokenKey[]) {
        writeVar(FG_VARS[key], toHex(fg[key]));
      }
    };

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

      // Плавно возвращаемся к «вершинной» палитре (переход с задержкой).
      html.classList.add("theme-fade");
      for (const [name, value] of Object.entries(PEAK)) {
        html.style.setProperty(name, value);
      }
    };
  }, []);

  return null;
}
