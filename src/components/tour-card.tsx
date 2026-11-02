"use client";

import Link from "next/link";
import { DIFFICULTY_LABELS, formatDateWindow, formatPrice } from "@/lib/labels";
import type { Tour } from "@/lib/queries";

export function TourCard({ tour }: { tour: Tour }) {
  const photo = tour.photos?.[0];

  return (
    <Link
      href={`/tours/${tour.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-100">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={tour.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            ⛰
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold leading-snug">
            {tour.title}
          </h3>
          {tour.difficulty ? (
            <span className="shrink-0 rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
              {DIFFICULTY_LABELS[tour.difficulty]}
            </span>
          ) : null}
        </div>

        {tour.dates?.length ? (
          <p className="text-xs text-zinc-500">
            {tour.dates.map((d) => formatDateWindow(d)).join(" · ")}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold">{formatPrice(tour.price)}</span>
          <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">
            Записаться →
          </span>
        </div>
      </div>
    </Link>
  );
}
