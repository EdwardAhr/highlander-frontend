import type { components } from "@/lib/api/schema";

type Difficulty = components["schemas"]["Difficulty"];
type BookingStatus = components["schemas"]["BookingStatus"];
type Role = components["schemas"]["Role"];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Лёгкий",
  medium: "Средний",
  hard: "Сложный",
  extreme: "Экстремальный",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Ожидает подтверждения",
  confirmed: "Подтверждено",
  paid: "Оплачено",
  active: "Активно",
  rejected: "Отклонено",
};

export const ROLE_LABELS: Record<Role, string> = {
  client: "Клиент",
  guide: "Гид",
  superadmin: "Суперадмин",
};

export function formatPrice(price: string | null | undefined): string {
  if (price == null || price === "") return "—";
  const n = Number(price);
  if (Number.isNaN(n)) return price;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Высота в метрах: «5 642 м». */
export function formatAltitude(m: number): string {
  return `${m.toLocaleString("ru-RU")} м`;
}

/** «8 дней», «1 день», «2 дня». */
export function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} день`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} дня`;
  return `${n} дней`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ru-RU");
}

export function formatDateWindow(dw: { start: string; end: string }): string {
  return `${formatDate(dw.start)} — ${formatDate(dw.end)}`;
}
