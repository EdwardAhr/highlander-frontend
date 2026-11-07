"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useTheme } from "@/lib/theme";
import { Logo } from "@/components/logo";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`rounded-control px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "text-muted hover:bg-fog hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Включить светлую тему" : "Включить тёмную тему"}
      title={dark ? "Светлая тема" : "Тёмная тема"}
      className="flex h-9 w-9 items-center justify-center rounded-control border border-border text-muted transition-colors hover:text-foreground hover:border-border-strong"
    >
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}

/** Поиск в шапке: кнопка-лупа раскрывает поле-пилюлю, Enter → /tours?query=… */
function SearchField() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

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

  const submit = () => {
    const value = q.trim();
    if (!value) return;
    router.push("/tours?query=" + encodeURIComponent(value));
    setOpen(false);
    setQ("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      if (q) {
        setQ("");
        inputRef.current?.focus();
      } else {
        setOpen(false);
      }
    }
  };

  return (
    <div ref={wrapRef} className="relative ml-auto flex items-center">
      <button
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            setOpen(true);
            requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
          }
        }}
        aria-label="Поиск"
        aria-expanded={open}
        aria-controls="header-search"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-accent hover:text-accent"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-[18px] w-[18px]"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </>
          )}
        </svg>
      </button>
      <div
        id="header-search"
        className={`pointer-events-none absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 transition-[clip-path,opacity] duration-300 ${
          open
            ? "pointer-events-auto opacity-100 [clip-path:inset(-8px_0_-8px_0)]"
            : "opacity-0 [clip-path:inset(-8px_100%_-8px_0)]"
        }`}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Гора, маршрут, регион…"
          className="w-[clamp(220px,28vw,360px)] rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none focus:border-accent focus:shadow-glow"
        />
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
    ? `fixed inset-x-0 top-0 z-10 border-b border-border bg-surface/90 backdrop-blur transition-transform duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`
    : "sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur";

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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex shrink-0 items-center">
              <Logo />
            </Link>
            <nav className="flex items-center gap-1">
              <NavLink href="/">Витрина</NavLink>
              <NavLink href="/tours">Каталог</NavLink>
              {user ? <NavLink href="/cabinet">Личный кабинет</NavLink> : null}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <SearchField />
            {isLanding ? null : <ThemeToggle />}
            {user ? (
              <>
                <span className="hidden text-sm text-muted sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="rounded-control border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-fog hover:text-foreground"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-control px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-fog hover:text-foreground"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="rounded-control bg-accent px-3 py-2 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
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
