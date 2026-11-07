"use client";

import Link from "next/link";
import { DIFFICULTY_LABELS, formatDateWindow, formatPrice } from "@/lib/labels";
import type { Tour } from "@/lib/queries";

export function TourCard({ tour }: { tour: Tour }) {
  const photo = tour.photos?.[0];

  return (
    <Link
      href={`/tours/${tour.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card transition-shadow hover:shadow-elevated"
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-fog">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={tour.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <svg width="44" height="44" viewBox="0 0 28 28" fill="currentColor" aria-hidden>
              <path d="M2 22 L9 8 L13 15 L16 4 L23 18 L26 12 L26 22 Z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-snug">
            {tour.title}
          </h3>
          {tour.difficulty ? (
            <span className="shrink-0 rounded-full bg-fog px-2 py-0.5 text-xs font-medium text-muted">
              {DIFFICULTY_LABELS[tour.difficulty]}
            </span>
          ) : null}
        </div>

        {tour.dates?.length ? (
          <p className="font-mono text-xs text-faint">
            {tour.dates.map((d) => formatDateWindow(d)).join(" · ")}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-mono text-lg font-medium">
            {formatPrice(tour.price)}
          </span>
          <span className="text-sm font-medium text-accent">
            Записаться →
          </span>
        </div>
      </div>
    </Link>
  );
}
