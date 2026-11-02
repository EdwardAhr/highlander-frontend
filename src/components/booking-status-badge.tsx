import type { components } from "@/lib/api/schema";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_STYLES } from "@/lib/labels";

type BookingStatus = components["schemas"]["BookingStatus"];

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BOOKING_STATUS_STYLES[status]}`}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}
