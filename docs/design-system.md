# Design System — Highlander (frontend)

Единые конвенции дизайна и архитектуры фронтенда. Читай перед любыми визуальными
или структурными изменениями.

## Система тем

Тема **одна — монолитная** «вершина → глубокий изумрудный лес» (без светлой/тёмной и тумблера). Единый набор семантических CSS-токенов:

- **Маршруты приложения** (`/tours`, `/cabinet`, `/login`, `/register`) — фиксированная
  «вершинная» палитра из `:root`: голубо-белое (снег/лёд/небо), акцент голубой `#0EA5E9`.

- **Витрина `/`** — единственная со скролл-градиентом: поэтапно (поясами высоты) палитра
  течёт голубо-белое → тёмный насыщенный изумруд + золото. Контроллер
  `src/components/scroll-theme.tsx` пишет terrain-токены (`--bg/--surface/--border`) и
  FG-токены (`--text`, `--accent` — голубой → золото, …) инлайн по прогрессу
  скролла. Модель и стопы — `src/lib/journey.ts`. Текст к низу светлеет холодным тоном.

Токены описаны в `src/app/globals.css`.

## Стек

- **Next.js 16** (App Router, Turbopack), React 19, TypeScript (strict)
- **Tailwind CSS v4** (`@theme inline` маппит токены на утилиты), TanStack Query, `openapi-fetch`
- Шрифты (next/font/google, все с кириллицей):
  - **Prata** — display-заголовки (единственный голос, вес 400)
  - **Golos Text** — body/UI (по умолчанию)
  - **JetBrains Mono** — цены, даты, высоты, данные

## Токены (утилиты Tailwind)

| Токен | Утилиты | Значение (вершина) |
|---|---|---|
| фон | `bg-background` | `#F4F8F9` |
| поверхность | `bg-surface` | `#FFFFFF` |
| текст | `text-foreground` | `#172530` |
| вторичный | `text-muted` | `#63757F` |
| третичный | `text-faint` | `#8A9BA5` |
| акцент | `bg-accent` / `text-accent` | `#0EA5E9` (на витрине → `#E0A458` золото) |
| акцент hover | `bg-accent-hover` | `#0284C7` (на витрине → `#E8B373`) |
| текст на акценте | `text-accent-contrast` | `#FFFFFF` (на золоте → `#1A1205`) |
| граница | `border-border` | `#DFEAEE` |
| подложка | `bg-fog` | `#E7F0F3` |
| ошибка | `text-danger` | `#C0392B` |

Радиусы: `rounded-card` (16px), `rounded-control` (10px), `rounded-pill`.
Тени: `shadow-card`, `shadow-elevated` (мягкие). Фокус: `focus:shadow-glow`.

Статусы брони — пары переменных `--status-*-bg`/`--status-*-text` (см. `globals.css`,
используются в `booking-status-badge.tsx`).

## Правила

- Компоненты пишутся **один раз** на семантических токенах — тема меняется только через CSS-переменные.
- Заголовки — `font-display` (Prata, вес 400), цены/даты/высоты — `font-mono`, текст — Golos Text (по умолчанию).
- Примитивы — в `src/components/ui.tsx`; конкретные компоненты — в `src/components/`; страницы — в `src/app/`.
- Типы бери из `src/lib/api/schema.d.ts` (генерируются из `docs/openapi.json`).
- Состояния интерфейса обязательны: loading (`Spinner`), пусто (`EmptyState`), ошибка (`ErrorState` + `apiError()`).
- Опенер (`src/components/opener.tsx`) играет один раз за сессию, цвета — из токенов темы.

## Слои

`src/lib/api` (типы/клиент) → `src/lib/queries.ts` (данные) → `src/lib/*` (auth/theme/labels) →
`src/components` (UI) → `src/app` (маршруты).
