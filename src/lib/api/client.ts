import createClient from "openapi-fetch";
import type { paths, components } from "./schema";
import { tokenStore } from "@/lib/auth/token-store";

export type TokenPair = components["schemas"]["TokenPair"];

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

/**
 * Единый экземпляр openapi-fetch клиента с типизацией из docs/openapi.json.
 * Автоматически подставляет `Authorization: Bearer <access_token>` и
 * выполняет refresh на 401 (access живёт 30 минут, refresh — 30 дней).
 */
export const api = createClient<paths>({
  baseUrl,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        tokenStore.clear();
        return false;
      }
      const data = (await res.json()) as TokenPair;
      tokenStore.setTokens(data.access_token, data.refresh_token);
      return true;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

// Храним клоны запросов (сделанные до отправки), чтобы повторить их после refresh.
const pendingClones = new WeakMap<Request, Request>();

api.use({
  onRequest: ({ request }) => {
    const token = tokenStore.getAccess();
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    pendingClones.set(request, request.clone());
    return request;
  },
  onResponse: async ({ request, response }) => {
    const isAuthRoute = request.url.includes("/auth/");

    if (response.status === 401 && !isAuthRoute) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        const clone = pendingClones.get(request);
        pendingClones.delete(request);
        if (clone) {
          clone.headers.set(
            "Authorization",
            `Bearer ${tokenStore.getAccess()}`,
          );
          return fetch(clone);
        }
      } else if (typeof window !== "undefined") {
        // refresh не удался — завершаем сессию на клиенте.
        window.dispatchEvent(new Event("highlander:unauthorized"));
      }
    }

    pendingClones.delete(request);
    return response;
  },
});
