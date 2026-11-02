// Минимальный service worker для офлайн-оболочки приложения.
// Кэширует статику Next.js и оболочку навигации (network-first).
// API-запросы (cross-origin, localhost:8000) не перехватываются.

const VERSION = "highlander-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(["/"])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Не трогаем cross-origin (API на :8000).
  if (url.origin !== location.origin) return;

  // Навигация по страницам — network-first, при офлайне отдаём оболочку "/".
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(VERSION).then((cache) => cache.put("/", clone));
          return res;
        })
        .catch(() => caches.match("/")),
    );
    return;
  }

  // Неизменяемые статические ассеты — cache-first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(VERSION).then((cache) => cache.put(request, clone));
          }
          return res;
        });
      }),
    );
  }
});
