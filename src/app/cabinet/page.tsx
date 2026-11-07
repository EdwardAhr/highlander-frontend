"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
import {
  fetchActiveBookings,
  fetchCabinet,
  fetchDocuments,
  fetchHistory,
  payInvoice,
  type CabinetBooking,
  type BookingDocuments,
} from "@/lib/queries";
import { DIFFICULTY_LABELS, formatDateWindow, formatPrice } from "@/lib/labels";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import { apiError } from "@/lib/errors";

type Tab = "active" | "history" | "documents";

export default function CabinetPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [tab, setTab] = useState<Tab>("active");

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/cabinet");
  }, [ready, user, router]);

  if (!ready || !user) return <Spinner />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Личный кабинет
          </h1>
          <p className="mt-1 text-muted">{user.email}</p>
        </div>
        <div className="flex gap-1 rounded-control bg-fog p-1">
          {(
            [
              ["active", "Активные"],
              ["history", "История"],
              ["documents", "Документы"],
            ] as [Tab, string][]
          ).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t ? "bg-surface shadow-card" : "text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Summary />

      {tab === "active" && <ActiveBookings />}
      {tab === "history" && <History />}
      {tab === "documents" && <Documents />}
    </div>
  );
}

function Summary() {
  const { data, isPending, error } = useQuery({
    queryKey: ["cabinet"],
    queryFn: fetchCabinet,
  });

  if (isPending) return null;
  if (error) return <ErrorState message={apiError(error)} />;

  const cards = [
    { label: "Активные брони", value: data.active_count },
    { label: "В истории", value: data.history_count },
    { label: "Документы", value: data.documents_count },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-card border border-border bg-surface p-4 shadow-card"
        >
          <div className="font-display text-2xl font-semibold">{c.value}</div>
          <div className="text-sm text-muted">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function BookingRow({
  booking,
  invoice,
}: {
  booking: CabinetBooking;
  invoice?: BookingDocuments;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold">
            {booking.tour_title}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {booking.difficulty
              ? `${DIFFICULTY_LABELS[booking.difficulty]} · `
              : ""}
            {booking.region_name ?? "Регион не указан"}
            {booking.dates?.length
              ? ` · ${booking.dates.map((d) => formatDateWindow(d)).join(", ")}`
              : ""}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono font-medium">
          {formatPrice(booking.total_price)}
        </span>

        {booking.status === "confirmed" && invoice?.invoice ? (
          <PayButton invoiceId={invoice.invoice.id} />
        ) : null}
      </div>

      {booking.status === "rejected" && booking.reject_reason ? (
        <p className="mt-2 text-sm text-danger">
          Причина отказа: {booking.reject_reason}
        </p>
      ) : null}
    </div>
  );
}

function PayButton({ invoiceId }: { invoiceId: string }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const pay = useMutation({
    mutationFn: () => payInvoice(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet"] });
      queryClient.invalidateQueries({ queryKey: ["active-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err) => setError(apiError(err)),
  });

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => pay.mutate()}
        disabled={pay.isPending}
        className="rounded-control bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {pay.isPending ? "Оплата…" : "Оплатить"}
      </button>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}

function ActiveBookings() {
  const bookingsQ = useQuery({
    queryKey: ["active-bookings"],
    queryFn: fetchActiveBookings,
  });
  const docsQ = useQuery({ queryKey: ["documents"], queryFn: fetchDocuments });

  if (bookingsQ.isPending) return <Spinner />;
  if (bookingsQ.error) return <ErrorState message={apiError(bookingsQ.error)} />;

  const docsByBooking = useMemo(() => {
    const m = new Map<string, BookingDocuments>();
    for (const d of docsQ.data ?? []) m.set(d.booking_id, d);
    return m;
  }, [docsQ.data]);

  if (!bookingsQ.data || bookingsQ.data.length === 0)
    return (
      <EmptyState
        title="Нет активных броней"
        hint="Запишитесь на тур из витрины"
      />
    );

  return (
    <div className="flex flex-col gap-3">
      {bookingsQ.data.map((b) => (
        <BookingRow key={b.id} booking={b} invoice={docsByBooking.get(b.id)} />
      ))}
    </div>
  );
}

function History() {
  const { data, isPending, error } = useQuery({
    queryKey: ["history"],
    queryFn: fetchHistory,
  });

  if (isPending) return <Spinner />;
  if (error) return <ErrorState message={apiError(error)} />;
  if (!data || data.length === 0) return <EmptyState title="История пуста" />;

  return (
    <div className="flex flex-col gap-3">
      {data.map((b) => (
        <BookingRow key={b.id} booking={b} />
      ))}
    </div>
  );
}

function Documents() {
  const { data, isPending, error } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
  });

  if (isPending) return <Spinner />;
  if (error) return <ErrorState message={apiError(error)} />;
  if (!data || data.length === 0)
    return <EmptyState title="Документов пока нет" />;

  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => (
        <div
          key={d.booking_id}
          className="rounded-card border border-border bg-surface p-4 shadow-card"
        >
          <h3 className="font-display text-lg font-semibold">{d.tour_title}</h3>

          <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            {d.invoice ? (
              <DocItem
                title="Инвойс"
                lines={[
                  `Сумма: ${formatPrice(d.invoice.amount)}`,
                  `Статус: ${d.invoice.status}`,
                ]}
              />
            ) : null}
            {d.insurance_policy ? (
              <DocItem
                title="Страховой полис"
                lines={[
                  `№ ${d.insurance_policy.policy_number}`,
                  `Статус: ${d.insurance_policy.status}`,
                ]}
              />
            ) : null}
            {d.mchs_registration ? (
              <DocItem
                title="Регистрация МЧС"
                lines={[
                  `№ ${d.mchs_registration.reg_number}`,
                  `Статус: ${d.mchs_registration.status}`,
                ]}
              />
            ) : null}
          </dl>
        </div>
      ))}
    </div>
  );
}

function DocItem({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-control bg-fog p-3">
      <div className="font-medium text-foreground">{title}</div>
      {lines.map((l, i) => (
        <div key={i} className="text-muted">
          {l}
        </div>
      ))}
    </div>
  );
}
