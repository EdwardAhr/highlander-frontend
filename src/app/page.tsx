"use client";

import { useState } from "react";
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

export default function Storefront() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<TourSort>("-created_at");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [offset, setOffset] = useState(0);

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
        <h1 className="text-2xl font-bold tracking-tight">
          Горные туры Северного Кавказа
        </h1>
        <p className="mt-1 text-zinc-500">
          Бронируйте проверенные маршруты с гидами, страховкой и регистрацией в МЧС.
        </p>
      </div>

      {/* Фильтры */}
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 md:flex-row md:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-600">Поиск</span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOffset(0);
            }}
            placeholder="Название тура…"
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-600">Цена от</span>
          <input
            type="number"
            min={0}
            value={priceMin}
            onChange={(e) => {
              setPriceMin(e.target.value);
              setOffset(0);
            }}
            placeholder="0"
            className="w-28 rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-600">до</span>
          <input
            type="number"
            min={0}
            value={priceMax}
            onChange={(e) => {
              setPriceMax(e.target.value);
              setOffset(0);
            }}
            placeholder="∞"
            className="w-28 rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-600">Сортировка</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as TourSort);
              setOffset(0);
            }}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Результаты */}
      {isPending ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={apiError(error)} />
      ) : tours && tours.length === 0 ? (
        <EmptyState
          title="Ничего не найдено"
          hint="Попробуйте изменить условия поиска"
        />
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
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50"
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
