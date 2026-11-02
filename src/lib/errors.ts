type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

/** Извлекает человекочитаемое сообщение из единого формата ошибок бэкенда. */
export function apiError(err: unknown, fallback = "Что-то пошло не так"): string {
  const body = err as ApiErrorBody | undefined;
  return body?.error?.message ?? body?.error?.code ?? fallback;
}
