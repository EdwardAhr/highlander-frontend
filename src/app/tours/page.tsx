import { redirect } from "next/navigation";

/**
 * Каталог-листинг убран: витрина `/` — единственная точка входа к турам,
 * а поиск ведёт напрямую на страницу тура. `/tours` → на витрину.
 */
export default function ToursIndex() {
  redirect("/");
}
