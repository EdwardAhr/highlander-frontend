import type { components } from "@/lib/api/schema";
import { BOOKING_STATUS_LABELS } from "@/lib/labels";

type BookingStatus = components["schemas"]["BookingStatus"];

const STATUS_VARS: Record<BookingStatus, { bg: string; text: string }> = {
  pending: {
    bg: "var(--status-pending-bg)",
    text: "var(--status-pending-text)",
  },
  confirmed: {
    bg: "var(--status-confirmed-bg)",
    text: "var(--status-confirmed-text)",
  },
  paid: {
    bg: "var(--status-paid-bg)",
    text: "var(--status-paid-text)",
  },
  active: {
    bg: "var(--status-active-bg)",
    text: "var(--status-active-text)",
  },
  rejected: {
    bg: "var(--status-rejected-bg)",
    text: "var(--status-rejected-text)",
  },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const vars = STATUS_VARS[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: vars.bg, color: vars.text }}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}
