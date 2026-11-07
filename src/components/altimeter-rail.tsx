"use client";

import { useEffect, useRef } from "react";
import { altitudeAt, progressOf, TOP_ALT_M } from "@/lib/journey";

/**
 * Полоска-высотомер справа: цифра текущей «высоты» + трек-прогресс.
 * Драг = скролл страницы (instant), клавиатура = role="slider".
 */
export function AltimeterRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const num = numRef.current;
    const fill = fillRef.current;
    if (!rail || !num || !fill) return;

    const update = () => {
      const p = progressOf();
      const alt = altitudeAt(p);
      num.textContent = alt.toLocaleString("ru-RU");
      fill.style.height = `${(p * 100).toFixed(2)}%`;
      rail.setAttribute("aria-valuenow", String(alt));
      rail.setAttribute("aria-valuetext", `${alt.toLocaleString("ru-RU")} метров`);
    };

    update();
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    const maxScroll = () =>
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollToProgress = (p: number) => {
      const pp = Math.min(1, Math.max(0, p));
      window.scrollTo({ top: pp * maxScroll(), behavior: "instant" });
    };

    // Драг-скраб.
    let dragging = false;
    const jump = (clientY: number) => {
      const rect = rail.getBoundingClientRect();
      const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
      scrollToProgress(y);
    };
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      rail.setPointerCapture(e.pointerId);
      jump(e.clientY);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (dragging) jump(e.clientY);
    };
    const onPointerUp = () => {
      dragging = false;
    };

    // Клавиатура.
    const onKeyDown = (e: KeyboardEvent) => {
      const cur = progressOf();
      let next: number | null = null;
      if (e.key === "ArrowUp") next = cur - 0.05;
      else if (e.key === "ArrowDown") next = cur + 0.05;
      else if (e.key === "PageUp") next = cur - 0.25;
      else if (e.key === "PageDown") next = cur + 0.25;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = 1;
      if (next != null) {
        e.preventDefault();
        scrollToProgress(next);
      }
    };

    rail.addEventListener("pointerdown", onPointerDown);
    rail.addEventListener("pointermove", onPointerMove);
    rail.addEventListener("pointerup", onPointerUp);
    rail.addEventListener("pointercancel", onPointerUp);
    rail.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      rail.removeEventListener("pointerdown", onPointerDown);
      rail.removeEventListener("pointermove", onPointerMove);
      rail.removeEventListener("pointerup", onPointerUp);
      rail.removeEventListener("pointercancel", onPointerUp);
      rail.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div
      ref={railRef}
      role="slider"
      aria-label="Высота на странице"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={TOP_ALT_M}
      aria-valuenow={TOP_ALT_M}
      aria-valuetext="5 642 метров"
      tabIndex={0}
      className="fixed right-[18px] top-1/2 z-30 hidden -translate-y-1/2 cursor-grab touch-none flex-col items-center gap-2.5 focus:outline-none focus-visible:shadow-glow active:cursor-grabbing md:flex"
      style={{ width: 48, height: "clamp(120px, 24vh, 220px)" }}
    >
      <div ref={numRef} className="font-mono text-[13px] font-semibold tracking-[0.02em] text-accent">
        {TOP_ALT_M.toLocaleString("ru-RU")}
      </div>
      <div className="relative w-1 flex-1 overflow-hidden rounded-full bg-border">
        <div
          ref={fillRef}
          className="absolute left-0 top-0 w-full rounded-full bg-accent"
          style={{ height: "0%" }}
        />
      </div>
    </div>
  );
}
