"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { requestOtp } from "@/lib/queries";
import { apiError } from "@/lib/errors";
import { Spinner } from "@/components/ui";

export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/cabinet";
  const { login, loginWithOtp } = useAuth();

  const [mode, setMode] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestOtp(email);
      setOtpSent(true);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithOtp(email, code);
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold tracking-tight">Вход</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-medium text-zinc-900 underline">
          Зарегистрироваться
        </Link>
      </p>

      <div className="mt-5 flex rounded-lg bg-zinc-100 p-1">
        {(["password", "otp"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === m ? "bg-white shadow-sm" : "text-zinc-600"
            }`}
          >
            {m === "password" ? "По паролю" : "По коду (OTP)"}
          </button>
        ))}
      </div>

      {mode === "password" ? (
        <form onSubmit={handlePassword} className="mt-5 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-600">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-600">Пароль</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
            />
          </label>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading ? "Вход…" : "Войти"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
          className="mt-5 flex flex-col gap-3"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-600">Email</span>
            <input
              type="email"
              required
              value={email}
              disabled={otpSent}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500 disabled:bg-zinc-100"
            />
          </label>

          {otpSent ? (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-600">Код</span>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6 цифр"
                className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              />
              <span className="text-xs text-zinc-400">
                В dev-режиме (DEBUG=true) код печатается в консоль бэкенда.
              </span>
            </label>
          ) : null}

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading
              ? "Отправка…"
              : otpSent
                ? "Подтвердить"
                : "Отправить код"}
          </button>
        </form>
      )}
    </div>
  );
}
