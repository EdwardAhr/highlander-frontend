# Design System — Highlander (frontend)

Единые конвенции дизайна и архитектуры фронтенда. Читай перед любыми визуальными
или структурными изменениями.

## Система двух тем

Один набор **семантических CSS-токенов**, две темы:
- **Светлая** («Утренний воздух») — значения по умолчанию в `:root`.
- **Тёмная** («Перевал») — переопределение в `:root[data-theme="dark"]`.

Переключение — кнопкой в шапке. Атрибут `data-theme` на `<html>`, значение в
`localStorage["highlander-theme"]`, по умолчанию — `prefers-color-scheme`.
Токены описаны в `src/app/globals.css`, логика — `src/lib/theme.tsx` (`useTheme`).

## Стек

- **Next.js 16** (App Router, Turbopack), React 19, TypeScript (strict)
- **Tailwind CSS v4** (`@theme inline` маппит токены на утилиты), TanStack Query, `openapi-fetch`
- Шрифты (next/font/google, все с кириллицей):
  - **Inter** — body/UI (обе темы)
  - **Playfair Display** — display-заголовки в тёмной теме
  - **Manrope** — display-заголовки в светлой теме
  - **IBM Plex Mono** — цены, даты, данные
  - **Unbounded** — логотип

## Токены (утилиты Tailwind)

| Токен | Утилиты | Светлая | Тёмная |
|---|---|---|---|
| фон | `bg-background` | `#F4F8F9` | `#0B1017` |
| поверхность | `bg-surface` | `#FFFFFF` | `#141C26` |
| текст | `text-foreground` | `#172530` | `#E9E4D8` |
| вторичный | `text-muted` | `#63757F` | `#8FA0AE` |
| третичный | `text-faint` | `#8A9BA5` | `#5A6B78` |
| акцент | `bg-accent` / `text-accent` | `#3E7C8C` | `#E0A458` |
| акцент hover | `bg-accent-hover` | `#356A78` | `#E8B373` |
| текст на акценте | `text-accent-contrast` | `#FFFFFF` | `#1A1205` |
| граница | `border-border` | `#DFEAEE` | `#2A3644` |
| подложка | `bg-fog` | `#E7F0F3` | `#101A24` |
| ошибка | `text-danger` | `#C0392B` | `#E07A6B` |

Радиусы: `rounded-card` (16px светлая / 12px тёмная), `rounded-control` (10/8).
Тени: `shadow-card`, `shadow-elevated` (светлая — мягкие; тёмная — 1px-рамка).
Фокус: `focus:shadow-glow`.

Статусы брони — пары переменных `--status-*-bg`/`--status-*-text` (см. `globals.css`,
используются в `booking-status-badge.tsx`).

## Правила

- Компоненты пишутся **один раз** на семантических токенах — тема меняется только через CSS-переменные.
- Заголовки — `font-display`, цены/даты — `font-mono`, текст — Inter (по умолчанию).
- Примитивы — в `src/components/ui.tsx`; конкретные компоненты — в `src/components/`; страницы — в `src/app/`.
- Типы бери из `src/lib/api/schema.d.ts` (генерируются из `docs/openapi.json`).
- Состояния интерфейса обязательны: loading (`Spinner`), пусто (`EmptyState`), ошибка (`ErrorState` + `apiError()`).
- Опенер (`src/components/opener.tsx`) играет один раз за сессию, цвета — из токенов темы.

## Слои

`src/lib/api` (типы/клиент) → `src/lib/queries.ts` (данные) → `src/lib/*` (auth/theme/labels) →
`src/components` (UI) → `src/app` (маршруты).
