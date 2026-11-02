"use client";

import { useEffect, useState } from "react";

/**
 * Вступительная анимация («опенер»). Проигрывается один раз за сессию.
 * Цвета берутся из CSS-переменных текущей темы, поэтому код не зависит от темы.
 */
export function Opener() {
  const [phase, setPhase] = useState<"hidden" | "playing" | "gone">("hidden");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem("highlander-opener-played")) return;

    setPhase("playing");
    const t1 = setTimeout(() => {
      setPhase("gone");
      sessionStorage.setItem("highlander-opener-played", "1");
    }, 2800);
    const t2 = setTimeout(() => setPhase("hidden"), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div className={`opener ${phase === "gone" ? "gone" : ""}`}>
      <div className="opener-fog a" />
      <div className="opener-fog b" />
      <div className="opener-mark">
        <svg viewBox="0 0 96 96" aria-hidden>
          <path
            className="ridge"
            d="M14 80 L36 30 L46 46 L60 18 L84 80"
          />
        </svg>
        <div className="opener-word">Highlander</div>
      </div>
    </div>
  );
}
