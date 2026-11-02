# Design System — Highlander (frontend)

Единые конвенции дизайна и архитектуры фронтенда. Читай перед любыми визуальными
или структурными изменениями.

## Стек

- **Next.js 16** (App Router, Turbopack), React 19, TypeScript (strict)
- **Tailwind CSS v4** (утилиты), TanStack Query, `openapi-fetch`
- Шрифт: **Geist** (`--font-geist-sans`) — основной, Geist Mono для кода

## Цветовая палитра

- Нейтральные — **Tailwind `zinc`** (`zinc-50`…`zinc-900`)
  - Фон страницы `zinc-50`, карточки `bg-white` с `border-zinc-200`
  - Текст основной `zinc-900`, вторичный `zinc-500`/`zinc-600`
- Акцент — **`emerald`** (`emerald-600`/`emerald-500`) — только для действий успеха
  и ключевых CTA (например, «Оплатить»)
- Основная кнопка — `bg-zinc-900 text-white` (тёмная), hover `zinc-700`
- Статусы брони — см. `src/lib/labels.ts` (`BOOKING_STATUS_STYLES`)

Не вводи новые оттенки без причины. Тёмная тема не используется (MVP — светлая).

## Отступы и размеры

- Сетка отступов — кратно **4px** (основной шаг 8px: `p-4`, `gap-5`, `py-8`)
- Радиус скруглений: карточки `rounded-xl`, контролы `rounded-lg`
- Ширина контента — `max-w-6xl` с `px-4` (см. `src/app/layout.tsx`)

## Компоненты и слои

| Слой | Путь | Что там |
|---|---|---|
| Типы и клиент API | `src/lib/api/` | `schema.d.ts` (генерируется из `docs/openapi.json`), `client.ts` |
| Данные | `src/lib/queries.ts` | функции-запросы (TanStack Query) |
| Логика | `src/lib/` | `auth/`, `labels.ts`, `errors.ts`, `providers.tsx` |
| Примитивы UI | `src/components/ui.tsx` | `Spinner`, `EmptyState`, `ErrorState` |
| Компоненты | `src/components/` | `header.tsx`, `tour-card.tsx`, `booking-status-badge.tsx` |
| Страницы | `src/app/` | маршруты и компоновка |

Правила:
- Примитивы — в `ui.tsx`; конкретные компоненты — в `src/components/`; страницы — в `src/app/`.
- Не дублируй разметку — переиспользуй/расширяй существующее.
- Типы бери из `src/lib/api/schema.d.ts`, не описывай руками.

## Состояния интерфейса (обязательно)

Каждый экран прорабатывает: **loading** (`Spinner`), **пусто** (`EmptyState`),
**ошибка** (`ErrorState` + `apiError()`), а кнопки/инпуты — `hover`/`focus`/`disabled`.

## Единый формат ошибок

Бэкенд возвращает `{ error: { code, message, details } }`. Маппинг — через
`apiError()` из `src/lib/errors.ts`.

## Архитектурные принципы

- Композиция поверх конфигурации (см. скилл `vercel-composition-patterns`).
- Изменения типов/контракта приходят только из `docs/openapi.json` (бэкенд).
- Авторизация: JWT в `localStorage`, авто-refresh на 401 — в `src/lib/api/client.ts`.
