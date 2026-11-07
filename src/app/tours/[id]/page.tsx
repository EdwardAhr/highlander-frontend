"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createBooking, fetchTour } from "@/lib/queries";
import { useAuth } from "@/lib/auth/auth-context";
import { DIFFICULTY_LABELS, formatDateWindow, formatPrice } from "@/lib/labels";
import { apiError } from "@/lib/errors";
import { ErrorState, Spinner } from "@/components/ui";

type Participant = { name: string; age: string };

const inputCls =
  "rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:shadow-glow";

export default function TourPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id;

  const { data: tour, isPending, error } = useQuery({
    queryKey: ["tour", id],
    queryFn: () => fetchTour(id),
    enabled: !!id,
  });

  const [participants, setParticipants] = useState<Participant[]>([
    { name: "", age: "" },
  ]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  const book = useMutation({
    mutationFn: () =>
      createBooking({
        tour_id: id,
        participant_data: {
          participants: participants
            .filter((p) => p.name.trim())
            .map((p) => ({ name: p.name.trim(), age: Number(p.age) || null })),
        },
      }),
    onSuccess: (booking) => setCreatedBookingId(booking.id),
    onError: (err) => setSubmitError(apiError(err)),
  });

  if (isPending) return <Spinner />;
  if (error || !tour)
    return <ErrorState message={error ? apiError(error) : "Тур не найден"} />;

  const setParticipant = (i: number, patch: Partial<Participant>) => {
    setParticipants((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/"
        className="text-sm font-medium text-muted hover:text-foreground"
      >
        ← К витрине
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
            {tour.photos?.length ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tour.photos[0]}
                alt={tour.title}
                className="aspect-[16/9] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/9] w-full items-center justify-center bg-fog text-muted">
                <svg width="80" height="80" viewBox="0 0 28 28" fill="currentColor" aria-hidden>
                  <path d="M2 22 L9 8 L13 15 L16 4 L23 18 L26 12 L26 22 Z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-normal tracking-tight">
                {tour.title}
              </h1>
              {tour.difficulty ? (
                <span className="rounded-full bg-fog px-2.5 py-1 text-sm font-medium text-muted">
                  {DIFFICULTY_LABELS[tour.difficulty]}
                </span>
              ) : null}
            </div>

            {tour.description ? (
              <p className="whitespace-pre-line text-muted">{tour.description}</p>
            ) : null}

            {tour.dates?.length ? (
              <div className="rounded-control bg-fog p-3 text-sm">
                <span className="font-medium text-foreground">Даты: </span>
                <span className="font-mono">
                  {tour.dates.map((d) => formatDateWindow(d)).join(" · ")}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="h-fit rounded-card border border-border bg-surface p-5 shadow-card">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-normal">
              {formatPrice(tour.price)}
            </span>
            {tour.max_slots ? (
              <span className="text-xs text-faint">мест: {tour.max_slots}</span>
            ) : null}
          </div>

          <div className="mt-5">
            {createdBookingId ? (
              <div className="rounded-control bg-accent/10 p-4 text-sm text-accent">
                Заявка отправлена! Статус — «Ожидает подтверждения».
                <div className="mt-3">
                  <Link
                    href="/cabinet"
                    className="font-medium underline underline-offset-2"
                  >
                    Перейти в личный кабинет →
                  </Link>
                </div>
              </div>
            ) : !user ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted">
                  Чтобы записаться, войдите или зарегистрируйтесь.
                </p>
                <Link
                  href={`/login?next=/tours/${id}`}
                  className="rounded-control bg-accent px-4 py-2.5 text-center text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
                >
                  Войти и записаться
                </Link>
              </div>
            ) : (
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitError(null);
                  book.mutate();
                }}
              >
                <p className="text-sm font-medium text-foreground">Участники</p>

                {participants.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={p.name}
                      onChange={(e) => setParticipant(i, { name: e.target.value })}
                      placeholder="Имя"
                      className={`flex-1 ${inputCls}`}
                    />
                    <input
                      value={p.age}
                      onChange={(e) => setParticipant(i, { age: e.target.value })}
                      placeholder="Возраст"
                      type="number"
                      min={0}
                      className={`w-24 ${inputCls}`}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setParticipants((prev) => [...prev, { name: "", age: "" }])
                  }
                  className="self-start text-sm font-medium text-accent hover:text-accent-hover"
                >
                  + Добавить участника
                </button>

                {submitError ? (
                  <p className="text-sm text-danger">{submitError}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={
                    book.isPending || !participants.some((p) => p.name.trim())
                  }
                  className="rounded-control bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-50"
                >
                  {book.isPending ? "Отправка…" : "Записаться"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
