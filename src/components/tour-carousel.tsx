"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { TourCard, type CardTour } from "@/components/tour-card";

const GAP = 20; // = gap-5

type Metrics = { slideW: number; step: number };

/**
 * Конечная карусель-«спуск»: левое выравнивание (snap-start), ослабленный
 * эффект фокуса (лёгкий масштаб + вейл соседей), счётчик и стрелки.
 * Drag мышью (ЛКМ) по всей карточке, включая фото.
 */
export function TourCarousel({ tours }: { tours: CardTour[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const veilRefs = useRef<(HTMLDivElement | null)[]>([]);
  const metricsRef = useRef<Metrics | null>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);

  const count = tours.length;

  const measure = useCallback(() => {
    const vp = viewportRef.current;
    const first = slideRefs.current[0];
    if (!vp || !first) return;
    metricsRef.current = { slideW: first.offsetWidth, step: first.offsetWidth + GAP };
  }, []);

  // Эффект-слой: ослабленный масштаб/вейл по удалению от левого края.
  const render = useCallback(() => {
    const vp = viewportRef.current;
    const m = metricsRef.current;
    if (!vp || !m) return;
    const x = vp.scrollLeft;
    for (let i = 0; i < slideRefs.current.length; i++) {
      const slide = slideRefs.current[i];
      if (!slide) continue;
      const o = (i * m.step - x) / m.slideW;
      const ao = Math.min(1, Math.abs(o));
      slide.style.transform = `scale(${(1 - 0.03 * ao).toFixed(4)})`;
      slide.style.zIndex = ao < 0.5 ? "2" : "1";
      const veil = veilRefs.current[i];
      if (veil) veil.style.opacity = (0.3 * Math.pow(ao, 0.75)).toFixed(3);
    }
  }, []);

  const updateIndex = useCallback(() => {
    const vp = viewportRef.current;
    const m = metricsRef.current;
    if (!vp || !m) return;
    const idx = Math.round(vp.scrollLeft / m.step);
    const clamped = Math.max(0, Math.min(count - 1, idx));
    if (clamped !== indexRef.current) {
      indexRef.current = clamped;
      setIndex(clamped);
    }
  }, [count]);

  const frame = useCallback(() => {
    render();
    updateIndex();
  }, [render, updateIndex]);

  useLayoutEffect(() => {
    measure();
    frame();
  }, [measure, frame, tours]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        frame();
      });
    };
    vp.addEventListener("scroll", schedule, { passive: true });

    const ro = new ResizeObserver(() => {
      measure();
      frame();
    });
    ro.observe(vp);

    let cancelled = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) {
          measure();
          frame();
        }
      });
    }

    return () => {
      cancelled = true;
      vp.removeEventListener("scroll", schedule);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [measure, frame]);

  const goTo = useCallback(
    (i: number) => {
      const vp = viewportRef.current;
      const m = metricsRef.current;
      if (!vp || !m) return;
      const clamped = Math.max(0, Math.min(count - 1, i));
      vp.scrollTo({ left: clamped * m.step, behavior: "smooth" });
      indexRef.current = clamped;
      setIndex(clamped);
    },
    [count],
  );

  // Drag мышью (ЛКМ) — нативные слушатели, чтобы pointer-capture работал надёжно.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let moved = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dragging = true;
      startX = e.clientX;
      startScroll = vp.scrollLeft;
      moved = 0;
      vp.style.scrollSnapType = "none";
      vp.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      vp.scrollLeft = startScroll - dx;
    };

    const onPointerEnd = () => {
      if (!dragging) return;
      dragging = false;
      vp.style.scrollSnapType = "";
      if (moved > 6 && metricsRef.current) {
        goTo(Math.round(vp.scrollLeft / metricsRef.current.step));
      }
    };

    // Подавляем переход по ссылке, если был драг (клик по <a>).
    const onClickCapture = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
      moved = 0;
    };

    const onDragStart = (e: DragEvent) => e.preventDefault();

    vp.addEventListener("pointerdown", onPointerDown);
    vp.addEventListener("pointermove", onPointerMove);
    vp.addEventListener("pointerup", onPointerEnd);
    vp.addEventListener("pointercancel", onPointerEnd);
    vp.addEventListener("click", onClickCapture, true);
    vp.addEventListener("dragstart", onDragStart);

    return () => {
      vp.removeEventListener("pointerdown", onPointerDown);
      vp.removeEventListener("pointermove", onPointerMove);
      vp.removeEventListener("pointerup", onPointerEnd);
      vp.removeEventListener("pointercancel", onPointerEnd);
      vp.removeEventListener("click", onClickCapture, true);
      vp.removeEventListener("dragstart", onDragStart);
    };
  }, [goTo]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goTo(indexRef.current - 1);
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        goTo(indexRef.current + 1);
        e.preventDefault();
      } else if (e.key === "Home") {
        goTo(0);
        e.preventDefault();
      } else if (e.key === "End") {
        goTo(count - 1);
        e.preventDefault();
      }
    },
    [goTo, count],
  );

  if (count === 0) return null;
  if (count === 1) {
    return (
      <div className="mx-auto w-full max-w-[380px]">
        <TourCard tour={tours[0]} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Туры"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain py-4 select-none focus:outline-none focus-visible:shadow-glow active:cursor-grabbing"
      >
        {tours.map((tour, i) => (
          <div
            key={tour.id}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} из ${count}`}
            className="relative w-[84vw] shrink-0 snap-start sm:w-[380px] lg:w-[440px]"
          >
            <TourCard tour={tour} />
            <div
              ref={(el) => {
                veilRefs.current[i] = el;
              }}
              className="pointer-events-none absolute inset-0 rounded-card bg-[#05140F]/55"
              style={{ opacity: 0 }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="font-mono text-[13px] text-accent">
          {String(index + 1).padStart(2, "0")}{" "}
          <span className="text-muted">/ {String(count).padStart(2, "0")}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Предыдущий тур"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-25 disabled:hover:border-border disabled:hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => goTo(index + 1)}
            disabled={index === count - 1}
            aria-label="Следующий тур"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-25 disabled:hover:border-border disabled:hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
