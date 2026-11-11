"use client";

import { useRef, useState } from "react";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center py-12 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-card border border-dashed border-border-strong bg-surface p-10 text-center">
      <p className="text-base font-medium text-foreground">{title}</p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-card border border-danger/40 bg-danger/10 p-6 text-center text-sm text-danger">
      {message}
    </div>
  );
}

type Ripple = { key: number; x: number; y: number };

/** Туманный импульс из точки нажатия (декор «Природа/Кавказ»). */
export function useFogRipples<T extends HTMLElement = HTMLElement>() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextKey = useRef(0);

  const onPointerDown = (e: React.PointerEvent<T>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const key = nextKey.current++;
    setRipples((list) => [
      ...list,
      { key, x: e.clientX - rect.left, y: e.clientY - rect.top },
    ]);
  };

  const ripplesNode = ripples.map((r) => (
    <span
      key={r.key}
      className="btn-fog"
      style={{ left: r.x, top: r.y }}
      onAnimationEnd={() =>
        setRipples((list) => list.filter((x) => x.key !== r.key))
      }
    />
  ));

  return { onPointerDown, ripplesNode };
}

/**
 * Акцентная кнопка с полным motion-циклом: press (туман) → loading (спиннер)
 * → success (галочка-гребень) / error (сдвиг). Цвета — из токенов темы.
 */
export function Button({
  type = "button",
  loading = false,
  success = false,
  error = false,
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  success?: boolean;
  error?: boolean;
}) {
  const { onPointerDown, ripplesNode } = useFogRipples<HTMLButtonElement>();
  const busy = loading || success;

  return (
    <button
      type={type}
      {...rest}
      onPointerDown={(e) => {
        onPointerDown(e);
        rest.onPointerDown?.(e);
      }}
      className={`relative overflow-hidden rounded-control bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast transition-[background-color,scale] duration-150 hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50 ${
        error ? "btn-shake" : ""
      } ${className}`}
    >
      {ripplesNode}
      <span className={`btn-label ${busy ? "is-leaving" : ""}`}>{children}</span>
      {loading ? <span className="btn-spinner" aria-hidden /> : null}
      {success ? (
        <svg viewBox="0 0 24 24" className="btn-tick" aria-hidden>
          <path d="M4.5 12.5l5 5L19.5 7" />
        </svg>
      ) : null}
    </button>
  );
}
