"use client";

import { useEffect } from "react";

/** Регистрирует service worker только в production (в dev кэш мешает HMR). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Игнорируем ошибки регистрации — PWA-фича не критична.
      });
    }
  }, []);

  return null;
}
