"use client";

import Link from "next/link";
import {
  DIFFICULTY_LABELS,
  formatAltitude,
  formatDateWindow,
  formatPrice,
  pluralDays,
} from "@/lib/labels";
import type { Tour } from "@/lib/queries";
import type { FeaturedTour } from "@/lib/featured-tours";

export type CardTour = Tour | FeaturedTour;

function isFeatured(t: CardTour): t is FeaturedTour {
  return "days" in t;
}

export function TourCard({ tour }: { tour: CardTour }) {
  const photo = tour.photos?.[0];
  const featured = isFeatured(tour) ? tour : null;
  const real = isFeatured(tour) ? null : tour;

  return (
    <Link
      href={featured ? "/tours" : `/tours/${tour.id}`}
      draggable={false}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card transition-shadow hover:shadow-elevated"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-fog">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={tour.title}
            draggable={false}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <svg width="44" height="44" viewBox="0 0 28 28" fill="currentColor" aria-hidden>
              <path d="M2 22 L9 8 L13 15 L16 4 L23 18 L26 12 L26 22 Z" />
            </svg>
          </div>
        )}
        {featured ? (
          <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-[#06120D]/70 px-2.5 py-1 font-mono text-[11px] font-semibold text-[#F4F8F4] backdrop-blur">
            {formatAltitude(featured.altitude)}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl font-normal leading-[1.15]">
            {tour.title}
          </h3>
          {real?.difficulty ? (
            <span className="shrink-0 rounded-full bg-fog px-2 py-0.5 text-xs font-medium text-muted">
              {DIFFICULTY_LABELS[real.difficulty]}
            </span>
          ) : null}
        </div>

        {featured ? (
          <p className="text-sm text-muted">
            {pluralDays(featured.days)} · {DIFFICULTY_LABELS[featured.difficulty]}
          </p>
        ) : real && real.dates?.length ? (
          <p className="font-mono text-xs text-faint">
            {real.dates.map((d) => formatDateWindow(d)).join(" · ")}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-mono text-lg font-medium">
            {formatPrice(tour.price)}
          </span>
          <span className="text-sm font-medium text-accent">
            Подробнее →
          </span>
        </div>
      </div>
    </Link>
  );
}
