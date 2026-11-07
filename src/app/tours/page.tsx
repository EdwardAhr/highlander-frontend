"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchTours, type TourFilters } from "@/lib/queries";
import { TourCard } from "@/components/tour-card";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import { apiError } from "@/lib/errors";
import type { components } from "@/lib/api/schema";

type TourSort = components["schemas"]["TourSort"];

const SORT_OPTIONS: { value: TourSort; label: string }[] = [
  { value: "-created_at", label: "Сначала новые" },
  { value: "created_at", label: "Сначала старые" },
  { value: "price", label: "Цена ↑" },
  { value: "-price", label: "Цена ↓" },
];

const PAGE_SIZE = 20;

const inputCls =
  "rounded-control border border-border bg-surface px-3 py-2 outline-none focus:border-accent focus:shadow-glow";

function CatalogInner() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("query") ?? "";

  const [query, setQuery] = useState(urlQuery);
  const [sort, setSort] = useState<TourSort>("-created_at");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [offset, setOffset] = useState(0);

  // Синхронизация с URL (поиск из шапки → /tours?query=…).
  useEffect(() => {
    setQuery(urlQuery);
    setOffset(0);
  }, [urlQuery]);

  const filters: TourFilters = {
    query: query || undefined,
    sort,
    limit: PAGE_SIZE,
    offset,
    price_min: priceMin ? Number(priceMin) : undefined,
    price_max: priceMax ? Number(priceMax) : undefined,
  };

  const { data: tours, isPending, error, isFetching } = useQuery({
    queryKey: ["tours", filters],
    queryFn: () => fetchTours(filters),
  });

  const hasMore = (tours?.length ?? 0) === PAGE_SIZE;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[clamp(28px,4.4vw,46px)] font-normal leading-[1.1]">
          Каталог туров
        </h1>
        <p className="mt-2 text-muted">
          Найдите маршрут по названию, бюджету или дате публикации.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card md:flex-row md:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="font-medium text-muted">Поиск</span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOffset(0);
            }}
            placeholder="Название тура…"
            className={inputCls}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-muted">Цена от</span>
          <input
            type="number"
            min={0}
            value={priceMin}
            onChange={(e) => {
              setPriceMin(e.target.value);
              setOffset(0);
            }}
            placeholder="0"
            className={`w-28 ${inputCls}`}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-muted">до</span>
          <input
            type="number"
            min={0}
            value={priceMax}
            onChange={(e) => {
              setPriceMax(e.target.value);
              setOffset(0);
            }}
            placeholder="∞"
            className={`w-28 ${inputCls}`}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-muted">Сортировка</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as TourSort);
              setOffset(0);
            }}
            className={inputCls}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isPending ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={apiError(error)} />
      ) : tours && tours.length === 0 && offset === 0 ? (
        <EmptyState
          title="Ничего не найдено"
          hint="Попробуйте изменить условия поиска"
        />
      ) : tours && tours.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          Вы просмотрели все туры
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tours?.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>

          {hasMore ? (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
                disabled={isFetching}
                className="rounded-control border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-fog disabled:opacity-50"
              >
                Показать ещё
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default function Catalog() {
  return (
    <Suspense fallback={<Spinner />}>
      <CatalogInner />
    </Suspense>
  );
}
