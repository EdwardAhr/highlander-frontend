"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
import { fetchTours } from "@/lib/queries";
import { formatPrice } from "@/lib/labels";
import { Logo } from "@/components/logo";

/**
 * Поиск в шапке. Десктоп (lg+): постоянная строка в центре. Мобильный (<lg):
 * лупа-тайл справа, поле разворачивается влево. Ввод → живой список туров →
 * переход на /tours/[id].
 */
function SearchField() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Дебаунс ввода.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  // Закрытие по клику вне.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  const query = debounced.length >= 2 ? debounced : "";

  const { data: results = [], isPending, error } = useQuery({
    queryKey: ["tour-search", query],
    queryFn: () => fetchTours({ query, limit: 5 }),
    enabled: query.length > 0,
    staleTime: 30_000,
  });

  const goToTour = (id: string) => {
    router.push("/tours/" + id);
    setOpen(false);
    setQ("");
    setActive(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (q) {
        setQ("");
        inputRef.current?.focus();
      } else {
        setOpen(false);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && results[active]) {
        goToTour(results[active].id);
      }
    }
  };

  const showDropdown = query.length > 0;

  const fieldWrap = [
    // мобайл: оверлей, растёт влево от лупы
    "absolute right-[calc(100%+10px)] top-1/2 z-20 -translate-y-1/2",
    "w-[min(calc(100vw-82px),480px)]",
    open
      ? "opacity-100 [clip-path:inset(0_0_0_0_round_999px)]"
      : "opacity-0 [clip-path:inset(0_0_0_100%_round_999px)] pointer-events-none",
    "transition-[clip-path,opacity] duration-[240ms] ease-soft",
    // десктоп: постоянное поле в потоке, центрируется ячейкой
    "lg:relative lg:right-auto lg:top-auto lg:z-auto lg:translate-y-0",
    "lg:w-full lg:opacity-100 lg:pointer-events-auto lg:[clip-path:none]",
    "motion-reduce:transition-none",
  ].join(" ");

  return (
    <div
      ref={wrapRef}
      className="flex min-w-0 w-full items-center justify-end lg:justify-center"
    >
      <div className="relative flex items-center lg:w-full lg:max-w-[420px]">
        {/* Мобильная лупа (кроссфейд в крест) */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Поиск"
          aria-expanded={open}
          aria-controls="header-search"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-fog text-muted transition-colors duration-150 hover:text-accent focus-visible:outline-none focus-visible:shadow-glow lg:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`h-[18px] w-[18px] transition-opacity duration-150 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`absolute inset-0 m-auto h-[18px] w-[18px] transition-opacity duration-150 ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* Поле + дропдаун */}
        <div id="header-search" className={`group ${fieldWrap}`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors duration-200 group-hover:text-foreground group-focus-within:text-accent"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
            placeholder="Гора, маршрут, регион…"
            className="h-10 w-full rounded-full border border-transparent bg-fog pl-10 pr-4 text-sm text-foreground caret-accent placeholder:text-faint outline-none transition-[background-color,border-color,box-shadow] duration-200 ease-out hover:border-border hover:bg-surface/60 focus:border-accent focus:bg-surface focus:shadow-glow motion-reduce:transition-none"
          />

          <div
            className={`absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-control border border-border bg-surface shadow-elevated transition-[opacity,clip-path] ease-out motion-reduce:transition-none ${
              showDropdown
                ? "opacity-100 [clip-path:inset(0_0_0_0_round_10px)] duration-[180ms]"
                : "pointer-events-none opacity-0 [clip-path:inset(0_0_100%_0_round_10px)] duration-[120ms] ease-in"
            }`}
          >
            {isPending ? (
              <p className="flex min-h-11 items-center px-4 text-sm text-muted">Поиск…</p>
            ) : error ? (
              <p className="flex min-h-11 items-center px-4 text-sm text-danger">Не удалось найти</p>
            ) : results.length === 0 ? (
              <p className="flex min-h-11 items-center px-4 text-sm text-muted">Ничего не найдено</p>
            ) : (
              <ul role="listbox" className="max-h-72 overflow-auto">
                {results.map((tour, i) => (
                  <li key={tour.id} role="option" aria-selected={i === active}>
                    <button
                      type="button"
                      onClick={() => goToTour(tour.id)}
                      onMouseEnter={() => setActive(i)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        i === active ? "bg-fog" : ""
                      }`}
                    >
                      <span className="truncate text-foreground">{tour.title}</span>
                      <span className="shrink-0 font-mono text-xs text-muted">
                        {formatPrice(tour.price)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [hidden, setHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setHidden(false);
  }, []);

  const scheduleHide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (headerRef.current?.contains(document.activeElement)) return;
      setHidden(true);
    }, 180);
  }, []);

  // Auto-hide только на лендинге и только на hover-устройствах.
  useEffect(() => {
    if (!isLanding) {
      setHidden(false);
      return;
    }
    if (window.matchMedia("(hover: none)").matches) return;

    const onScroll = () => {
      if (window.scrollY <= 140) show();
      else scheduleHide();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLanding, show, scheduleHide]);

  const headerClass = isLanding
    ? `fixed inset-x-0 top-0 z-10 border-b border-border bg-background/90 backdrop-blur transition-transform duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`
    : "sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur";

  return (
    <>
      {isLanding ? (
        <div
          aria-hidden
          className="fixed left-0 right-0 top-0 z-[11] h-[18px]"
          onMouseEnter={show}
          onMouseLeave={() => {
            if (window.scrollY > 140) scheduleHide();
          }}
        />
      ) : null}
      <header
        ref={headerRef}
        onMouseEnter={isLanding ? show : undefined}
        onMouseLeave={
          isLanding ? () => {
            if (window.scrollY > 140) scheduleHide();
          } : undefined
        }
        className={headerClass}
      >
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 px-4 lg:h-[72px] lg:gap-x-6">
          {/* Левый гребень: лого + кабинет */}
          <div className="flex min-w-0 items-center gap-5">
            <Link href="/" className="flex shrink-0 items-center">
              <Logo />
            </Link>
            {user ? (
              <Link
                href="/cabinet"
                className="hidden h-10 items-center rounded-control px-3 text-sm text-muted transition-colors duration-200 hover:text-foreground lg:inline-flex"
              >
                Личный кабинет
              </Link>
            ) : null}
          </div>

          {/* Седловина: поиск */}
          <SearchField />

          {/* Правый гребень: действия */}
          <div className="flex items-center justify-end gap-2">
            {user ? (
              <>
                <span className="hidden max-w-[180px] truncate font-mono text-xs text-faint xl:inline-block">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="inline-flex h-10 items-center rounded-control px-3 text-sm font-medium text-muted transition-colors duration-200 hover:text-foreground"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="relative hidden h-10 items-center rounded-control px-3 text-sm font-medium text-muted transition-colors duration-200 hover:text-foreground after:absolute after:inset-x-3 after:bottom-[9px] after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:outline-none focus-visible:shadow-glow motion-reduce:after:transition-none sm:inline-flex"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-10 items-center rounded-control bg-accent px-4 text-sm font-medium text-accent-contrast transition-colors duration-200 hover:bg-accent-hover focus-visible:outline-none focus-visible:shadow-glow"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
