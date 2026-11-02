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

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ru-RU");
}

export function formatDateWindow(dw: { start: string; end: string }): string {
  return `${formatDate(dw.start)} — ${formatDate(dw.end)}`;
}
