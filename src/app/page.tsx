import { FEATURED_TOURS } from "@/lib/featured-tours";
import { ScrollTheme } from "@/components/scroll-theme";
import { AltimeterRail } from "@/components/altimeter-rail";
import { TourCarousel } from "@/components/tour-carousel";

function toursCount(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} тур`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} тура`;
  return `${n} туров`;
}

export default function Storefront() {
  return (
    <div className="flex flex-col">
      <ScrollTheme />
      <AltimeterRail />

      {/* Hero — вершина */}
      <section className="flex min-h-screen flex-col justify-center">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
          43°21′ N · 42°27′ E — 5 642 м
        </p>
        <h1 className="mt-4 font-display text-[clamp(40px,7vw,88px)] leading-[1.02]">
          Эльбрус.
        </h1>
        <p className="mt-5 max-w-[520px] text-lg leading-relaxed text-muted">
          От снежной шапки 5 642 м — вниз, к зелёным лесам. Выбирай маршрут,
          видно куда едёшь.
        </p>
      </section>

      {/* Туры */}
      <section className="flex flex-col gap-4 py-10">
        <div>
          <h2 className="font-display text-[clamp(28px,4.4vw,46px)] leading-[1.1]">
            Туры
          </h2>
          <p className="font-mono text-xs text-faint">
            {toursCount(FEATURED_TOURS.length)}
          </p>
        </div>

        <TourCarousel tours={FEATURED_TOURS} />
      </section>

      {/* Спуск */}
      <section className="flex flex-col gap-3 py-24">
        <h2 className="font-display text-[clamp(28px,4.4vw,46px)] leading-[1.1]">
          Спуск продолжается.
        </h2>
        <p className="max-w-[560px] text-muted">
          Ниже — хвойный лес, тропы и подножие. Цвет страницы идёт вместе с тобой.
        </p>
      </section>

      {/* Футер — подножие */}
      <footer className="flex flex-wrap items-end justify-between gap-6 border-t border-border py-16">
        <p className="font-display text-[clamp(24px,3vw,34px)] leading-[1.15]">
          Спускайся.
          <br />
          Путь — это тоже вершина.
        </p>
        <p className="font-mono text-xs text-muted">Highlander · горные туры Кавказа</p>
      </footer>
    </div>
  );
}
