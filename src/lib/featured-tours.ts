import type { components } from "@/lib/api/schema";

type Difficulty = components["schemas"]["Difficulty"];

/**
 * Кураторский набор «6 популярных туров СКФО» для витрины.
 * Фото лежат в public/images/ (пришли с дизайн-прототипом).
 * Пока бэкенд не отдаёт признак популярности — набор хардкожен.
 */
export type FeaturedTour = {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  /** Длительность в днях. */
  days: number;
  /** Максимальная высота, м. */
  altitude: number;
  /** Цена числом-строкой (для formatPrice). */
  price: string;
  photos: string[];
};

export const FEATURED_TOURS: FeaturedTour[] = [
  {
    id: "elbrus-ascent",
    title: "Восхождение на Эльбрус",
    description: "Классический маршрут на высочайшую вершину Европы — 5 642 м.",
    difficulty: "hard",
    days: 8,
    altitude: 5642,
    price: "42000",
    photos: ["/images/elbrus.jpg"],
  },
  {
    id: "bezengi-wall",
    title: "Безенгийская стена",
    description: "13-километровая стена пятитысячников Безенги.",
    difficulty: "extreme",
    days: 10,
    altitude: 5204,
    price: "38000",
    photos: ["/images/bezengi.jpg"],
  },
  {
    id: "elbrus-cablecar",
    title: "Канатка на Эльбрус",
    description: "Подъём на канатной дороге к склонам Эльбруса.",
    difficulty: "easy",
    days: 1,
    altitude: 3800,
    price: "9000",
    photos: ["/images/cablecar.jpg"],
  },
  {
    id: "chegem-waterfalls",
    title: "Чегемские водопады",
    description: "Каскад водопадов в Чегемском ущелье.",
    difficulty: "easy",
    days: 1,
    altitude: 1900,
    price: "6000",
    photos: ["/images/chegem.jpg"],
  },
  {
    id: "narzan-valley",
    title: "Долина Нарзанов",
    description: "Минеральные источники и горные луга Кавказских Минеральных Вод.",
    difficulty: "medium",
    days: 2,
    altitude: 1400,
    price: "8500",
    photos: ["/images/narzan.jpg"],
  },
  {
    id: "blue-lakes",
    title: "Голубые озёра",
    description: "Карстовые озёра необычного цвета в Кабардино-Балкарии.",
    difficulty: "easy",
    days: 1,
    altitude: 809,
    price: "5500",
    photos: ["/images/lakes.jpg"],
  },
];
